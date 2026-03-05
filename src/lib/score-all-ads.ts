import { db } from "@/lib/db";
import { calculateFatigue } from "@/lib/fatigue";

/**
 * Score all active ads for a given ad account.
 * Creates FatigueScore records for today.
 */
export async function scoreAllAds(adAccountId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all active ads with their metrics
  const ads = await db.ad.findMany({
    where: {
      adSet: {
        campaign: {
          adAccountId,
        },
      },
      status: "ACTIVE",
    },
    include: {
      dailyMetrics: {
        orderBy: { date: "asc" },
        take: 30, // Last 30 days max
      },
    },
  });

  const results = [];

  for (const ad of ads) {
    const fatigueResult = calculateFatigue(
      ad.dailyMetrics.map((m) => ({
        date: m.date,
        ctr: m.ctr,
        cpm: m.cpm,
        frequency: m.frequency,
        conversions: m.conversions,
        impressions: m.impressions,
      })),
      ad.launchedAt
    );

    if (!fatigueResult) continue;

    await db.fatigueScore.upsert({
      where: {
        adId_date: { adId: ad.id, date: today },
      },
      update: {
        overallScore: fatigueResult.overallScore,
        status: fatigueResult.status,
        ctrDecline: fatigueResult.signals.ctrDecline,
        cpmIncrease: fatigueResult.signals.cpmIncrease,
        frequencySat: fatigueResult.signals.frequencySat,
        conversionDrop: fatigueResult.signals.conversionDrop,
      },
      create: {
        adId: ad.id,
        date: today,
        overallScore: fatigueResult.overallScore,
        status: fatigueResult.status,
        ctrDecline: fatigueResult.signals.ctrDecline,
        cpmIncrease: fatigueResult.signals.cpmIncrease,
        frequencySat: fatigueResult.signals.frequencySat,
        conversionDrop: fatigueResult.signals.conversionDrop,
      },
    });

    results.push({
      adId: ad.id,
      adName: ad.name,
      score: fatigueResult.overallScore,
      status: fatigueResult.status,
    });
  }

  return results;
}
