import { auth } from "@/auth";
import { db } from "@/lib/db";
import { LandingPage } from "@/components/landing-page";
import { AppShell } from "@/components/app-shell";
import { SummaryBar } from "@/components/summary-bar";
import { AdCard } from "@/components/ad-card";
import { AccountSelector } from "@/components/account-selector";
import type { AdWithMetrics, DashboardSummary, FatigueStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    return <LandingPage />;
  }

  const params = await searchParams;
  const accountFilter = params.account;

  // Get user's ad accounts
  const adAccounts = await db.adAccount.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });

  // Build ad query filter
  const adWhere = {
    adSet: {
      campaign: {
        adAccount: {
          userId: session.user.id,
          ...(accountFilter ? { id: accountFilter } : {}),
        },
      },
    },
  };

  // Get all ads with latest score and metrics
  const ads = await db.ad.findMany({
    where: adWhere,
    include: {
      fatigueScores: {
        orderBy: { date: "desc" as const },
        take: 1,
      },
      dailyMetrics: {
        orderBy: { date: "desc" as const },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Map to AdWithMetrics
  const adsWithMetrics: AdWithMetrics[] = ads.map((ad) => ({
    id: ad.id,
    name: ad.name,
    status: ad.status,
    creativeUrl: ad.creativeUrl,
    thumbnailUrl: ad.thumbnailUrl,
    launchedAt: ad.launchedAt,
    latestScore: ad.fatigueScores[0]
      ? {
          overallScore: ad.fatigueScores[0].overallScore,
          status: ad.fatigueScores[0].status as FatigueStatus,
          ctrDecline: ad.fatigueScores[0].ctrDecline,
          cpmIncrease: ad.fatigueScores[0].cpmIncrease,
          frequencySat: ad.fatigueScores[0].frequencySat,
          conversionDrop: ad.fatigueScores[0].conversionDrop,
          date: ad.fatigueScores[0].date,
        }
      : null,
    latestMetrics: ad.dailyMetrics[0]
      ? {
          impressions: ad.dailyMetrics[0].impressions,
          clicks: ad.dailyMetrics[0].clicks,
          spend: ad.dailyMetrics[0].spend,
          ctr: ad.dailyMetrics[0].ctr,
          cpm: ad.dailyMetrics[0].cpm,
          cpc: ad.dailyMetrics[0].cpc,
          conversions: ad.dailyMetrics[0].conversions,
          frequency: ad.dailyMetrics[0].frequency,
          date: ad.dailyMetrics[0].date,
        }
      : null,
  }));

  // Build summary
  const summary: DashboardSummary = {
    totalAds: adsWithMetrics.length,
    healthy: adsWithMetrics.filter((a) => a.latestScore?.status === "HEALTHY").length,
    watch: adsWithMetrics.filter((a) => a.latestScore?.status === "WATCH").length,
    critical: adsWithMetrics.filter((a) => a.latestScore?.status === "CRITICAL").length,
    unscored: adsWithMetrics.filter((a) => !a.latestScore).length,
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor ad creative fatigue across your accounts
            </p>
          </div>
          {adAccounts.length >= 2 && <AccountSelector accounts={adAccounts} />}
        </div>

        {/* Summary stats */}
        <SummaryBar summary={summary} />

        {/* Ads grid */}
        {adsWithMetrics.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {adsWithMetrics.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-lg font-medium">No ads found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect your Meta ad account in{" "}
              <a href="/settings" className="text-blue-500 hover:underline">
                Settings
              </a>{" "}
              to start monitoring.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
