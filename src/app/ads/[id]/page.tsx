import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { HealthBadge } from "@/components/health-badge";
import { FatigueBreakdown } from "@/components/fatigue-breakdown";
import { PerformanceChart } from "@/components/performance-chart";
import { MetricsTable } from "@/components/metrics-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Eye, DollarSign, MousePointerClick } from "lucide-react";
import type { FatigueStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) notFound();

  const { id } = await params;

  const ad = await db.ad.findUnique({
    where: { id },
    include: {
      adSet: {
        include: {
          campaign: {
            include: {
              adAccount: { select: { userId: true, name: true } },
            },
          },
        },
      },
      dailyMetrics: {
        orderBy: { date: "asc" },
      },
      fatigueScores: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!ad || ad.adSet.campaign.adAccount.userId !== session.user.id) {
    notFound();
  }

  const latestScore = ad.fatigueScores[0] ?? null;

  // Prepare chart data
  const chartData = ad.dailyMetrics.map((m) => ({
    date: new Date(m.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    ctr: m.ctr,
    cpm: m.cpm,
    spend: m.spend,
    frequency: m.frequency,
  }));

  // Fatigue score over time for chart
  const fatigueChartData = ad.fatigueScores
    .slice()
    .reverse()
    .map((s) => ({
      date: new Date(s.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      fatigueScore: Math.round(s.overallScore * 100),
    }));

  // Latest metrics summary
  const latest = ad.dailyMetrics[ad.dailyMetrics.length - 1];

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{ad.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {ad.adSet.campaign.adAccount.name} &middot; {ad.adSet.campaign.name} &middot; {ad.adSet.name}
            </p>
          </div>
          {latestScore && (
            <HealthBadge status={latestScore.status as FatigueStatus} />
          )}
        </div>

        {/* Quick stats */}
        {latest && (
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <QuickStat
              icon={Eye}
              label="CTR"
              value={`${latest.ctr.toFixed(2)}%`}
            />
            <QuickStat
              icon={DollarSign}
              label="CPM"
              value={`$${latest.cpm.toFixed(2)}`}
            />
            <QuickStat
              icon={MousePointerClick}
              label="Conversions"
              value={latest.conversions.toString()}
            />
            <QuickStat
              icon={Calendar}
              label="Frequency"
              value={latest.frequency.toFixed(1)}
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column — Charts */}
          <div className="space-y-6 lg:col-span-2">
            {/* Performance chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <PerformanceChart
                    data={chartData}
                    lines={["ctr", "cpm", "frequency"]}
                  />
                ) : (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    No metric data available yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Fatigue score chart */}
            {fatigueChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Fatigue Score Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <PerformanceChart
                    data={fatigueChartData}
                    lines={["fatigueScore"]}
                  />
                </CardContent>
              </Card>
            )}

            {/* Metrics table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {ad.dailyMetrics.length > 0 ? (
                  <MetricsTable metrics={ad.dailyMetrics} />
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No daily metrics recorded yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column — Fatigue breakdown */}
          <div className="space-y-6">
            {latestScore ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Fatigue Breakdown</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Overall score: {Math.round(latestScore.overallScore * 100)}%
                  </p>
                </CardHeader>
                <CardContent>
                  <FatigueBreakdown
                    ctrDecline={latestScore.ctrDecline}
                    cpmIncrease={latestScore.cpmIncrease}
                    frequencySat={latestScore.frequencySat}
                    conversionDrop={latestScore.conversionDrop}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Fatigue Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Not enough data to calculate fatigue yet. Scores require at
                    least 4 days of metrics and the ad must be older than 72 hours.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Ad info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ad Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="Status" value={ad.status} />
                <InfoRow label="Campaign" value={ad.adSet.campaign.name} />
                <InfoRow label="Ad Set" value={ad.adSet.name} />
                <InfoRow
                  label="Launched"
                  value={
                    ad.launchedAt
                      ? new Date(ad.launchedAt).toLocaleDateString()
                      : "Unknown"
                  }
                />
                <InfoRow label="Meta ID" value={ad.metaAdId} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div className="rounded-lg bg-muted p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
