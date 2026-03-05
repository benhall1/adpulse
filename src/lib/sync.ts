import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import {
  getCampaigns,
  getAdSets,
  getAds,
  getAdInsights,
} from "@/lib/meta-client";
import type { SyncResult } from "@/types";

/**
 * Sync all data for an ad account from Meta API.
 * Pulls campaigns → ad sets → ads → daily metrics.
 */
export async function syncAdAccount(adAccountId: string): Promise<SyncResult> {
  const result: SyncResult = {
    accountId: adAccountId,
    campaigns: 0,
    adSets: 0,
    ads: 0,
    metrics: 0,
    errors: [],
  };

  // Get account with encrypted token
  const account = await db.adAccount.findUnique({
    where: { id: adAccountId },
  });

  if (!account) {
    result.errors.push("Ad account not found");
    return result;
  }

  // Mark as syncing
  await db.adAccount.update({
    where: { id: adAccountId },
    data: { syncStatus: "syncing" },
  });

  try {
    // Decrypt the access token
    const accessToken = decrypt(
      account.encryptedToken,
      account.tokenIv,
      account.tokenAuthTag
    );

    // Sync campaigns
    const campaigns = await getCampaigns(account.metaAccountId, accessToken);
    for (const campaign of campaigns) {
      await db.campaign.upsert({
        where: { metaCampaignId: campaign.id },
        update: { name: campaign.name, status: campaign.status },
        create: {
          adAccountId: account.id,
          metaCampaignId: campaign.id,
          name: campaign.name,
          status: campaign.status,
          objective: campaign.objective,
        },
      });
      result.campaigns++;

      // Sync ad sets
      const adSets = await getAdSets(campaign.id, accessToken);
      for (const adSet of adSets) {
        await db.adSet.upsert({
          where: { metaAdSetId: adSet.id },
          update: { name: adSet.name, status: adSet.status },
          create: {
            campaignId: (
              await db.campaign.findUnique({
                where: { metaCampaignId: campaign.id },
              })
            )!.id,
            metaAdSetId: adSet.id,
            name: adSet.name,
            status: adSet.status,
          },
        });
        result.adSets++;

        // Sync ads
        const ads = await getAds(adSet.id, accessToken);
        for (const ad of ads) {
          const dbAdSet = await db.adSet.findUnique({
            where: { metaAdSetId: adSet.id },
          });

          await db.ad.upsert({
            where: { metaAdId: ad.id },
            update: {
              name: ad.name,
              status: ad.status,
              thumbnailUrl: ad.creative?.thumbnail_url ?? null,
            },
            create: {
              adSetId: dbAdSet!.id,
              metaAdId: ad.id,
              name: ad.name,
              status: ad.status,
              thumbnailUrl: ad.creative?.thumbnail_url ?? null,
              launchedAt: new Date(),
            },
          });
          result.ads++;

          // Sync daily metrics (last 30 days)
          try {
            const dateTo = new Date().toISOString().split("T")[0];
            const dateFrom = new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0];

            const insights = await getAdInsights(
              ad.id,
              accessToken,
              dateFrom,
              dateTo
            );

            const dbAd = await db.ad.findUnique({
              where: { metaAdId: ad.id },
            });

            for (const insight of insights) {
              const date = new Date(insight.date_start);
              date.setHours(0, 0, 0, 0);

              const conversions =
                insight.actions?.find(
                  (a) =>
                    a.action_type === "offsite_conversion" ||
                    a.action_type === "purchase"
                )?.value ?? "0";

              const costPerResult =
                insight.cost_per_action_type?.find(
                  (a) =>
                    a.action_type === "offsite_conversion" ||
                    a.action_type === "purchase"
                )?.value ?? null;

              await db.adDailyMetric.upsert({
                where: { adId_date: { adId: dbAd!.id, date } },
                update: {
                  impressions: parseInt(insight.impressions),
                  clicks: parseInt(insight.clicks),
                  spend: parseFloat(insight.spend),
                  ctr: parseFloat(insight.ctr),
                  cpm: parseFloat(insight.cpm),
                  cpc: parseFloat(insight.cpc || "0"),
                  conversions: parseInt(conversions),
                  costPerResult: costPerResult
                    ? parseFloat(costPerResult)
                    : null,
                  frequency: parseFloat(insight.frequency || "0"),
                },
                create: {
                  adId: dbAd!.id,
                  date,
                  impressions: parseInt(insight.impressions),
                  clicks: parseInt(insight.clicks),
                  spend: parseFloat(insight.spend),
                  ctr: parseFloat(insight.ctr),
                  cpm: parseFloat(insight.cpm),
                  cpc: parseFloat(insight.cpc || "0"),
                  conversions: parseInt(conversions),
                  costPerResult: costPerResult
                    ? parseFloat(costPerResult)
                    : null,
                  frequency: parseFloat(insight.frequency || "0"),
                },
              });
              result.metrics++;
            }
          } catch (err) {
            result.errors.push(
              `Failed to sync metrics for ad ${ad.id}: ${err instanceof Error ? err.message : "Unknown error"}`
            );
          }
        }
      }
    }

    // Update sync status
    await db.adAccount.update({
      where: { id: adAccountId },
      data: { syncStatus: "idle", lastSyncAt: new Date() },
    });
  } catch (err) {
    await db.adAccount.update({
      where: { id: adAccountId },
      data: { syncStatus: "error" },
    });
    result.errors.push(
      err instanceof Error ? err.message : "Unknown sync error"
    );
  }

  return result;
}
