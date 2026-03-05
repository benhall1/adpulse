import { cn } from "@/lib/utils";
import type { FatigueStatus } from "@/types";

const statusConfig: Record<FatigueStatus, { label: string; className: string }> = {
  HEALTHY: {
    label: "Healthy",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  },
  WATCH: {
    label: "Watch",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  },
  CRITICAL: {
    label: "Critical",
    className: "bg-red-500/15 text-red-400 border-red-500/25",
  },
};

export function HealthBadge({
  status,
  className,
}: {
  status: FatigueStatus;
  className?: string;
}) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", {
          "bg-emerald-400": status === "HEALTHY",
          "bg-amber-400": status === "WATCH",
          "bg-red-400": status === "CRITICAL",
        })}
      />
      {config.label}
    </span>
  );
}
