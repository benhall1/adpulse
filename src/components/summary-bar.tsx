import { Activity, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { DashboardSummary } from "@/types";

export function SummaryBar({ summary }: { summary: DashboardSummary }) {
  const stats = [
    {
      label: "Total Ads",
      value: summary.totalAds,
      icon: Activity,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Healthy",
      value: summary.healthy,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Watch",
      value: summary.watch,
      icon: AlertTriangle,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Critical",
      value: summary.critical,
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
        >
          <div className={`rounded-lg ${stat.bg} p-2.5`}>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
