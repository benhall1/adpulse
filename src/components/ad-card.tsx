import Link from "next/link";
import { HealthBadge } from "./health-badge";
import { TrendingDown, TrendingUp, DollarSign, Eye } from "lucide-react";
import type { AdWithMetrics } from "@/types";

export function AdCard({ ad }: { ad: AdWithMetrics }) {
  return (
    <Link
      href={`/ads/${ad.id}`}
      className="group block rounded-xl border border-border bg-card p-5 transition-all hover:border-border/80 hover:shadow-lg hover:shadow-black/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold group-hover:text-blue-400 transition-colors">
            {ad.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground capitalize">
            {ad.status.toLowerCase()}
          </p>
        </div>
        {ad.latestScore && (
          <HealthBadge status={ad.latestScore.status} />
        )}
      </div>

      {ad.latestScore && (
        <div className="mt-4 flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.round(ad.latestScore.overallScore * 100)}%`,
                backgroundColor:
                  ad.latestScore.status === "HEALTHY"
                    ? "#10b981"
                    : ad.latestScore.status === "WATCH"
                      ? "#f59e0b"
                      : "#ef4444",
              }}
            />
          </div>
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {Math.round(ad.latestScore.overallScore * 100)}%
          </span>
        </div>
      )}

      {ad.latestMetrics && (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
          <MetricItem
            icon={Eye}
            label="CTR"
            value={`${ad.latestMetrics.ctr.toFixed(2)}%`}
          />
          <MetricItem
            icon={DollarSign}
            label="CPM"
            value={`$${ad.latestMetrics.cpm.toFixed(2)}`}
          />
          <MetricItem
            icon={TrendingUp}
            label="Spend"
            value={`$${ad.latestMetrics.spend.toFixed(0)}`}
          />
          <MetricItem
            icon={TrendingDown}
            label="Freq"
            value={ad.latestMetrics.frequency.toFixed(1)}
          />
        </div>
      )}
    </Link>
  );
}

function MetricItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="ml-auto text-xs font-medium tabular-nums">{value}</span>
    </div>
  );
}
