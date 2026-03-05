import { cn } from "@/lib/utils";

interface Signal {
  label: string;
  value: number;
  description: string;
}

export function FatigueBreakdown({
  ctrDecline,
  cpmIncrease,
  frequencySat,
  conversionDrop,
}: {
  ctrDecline: number;
  cpmIncrease: number;
  frequencySat: number;
  conversionDrop: number;
}) {
  const signals: Signal[] = [
    {
      label: "CTR Decline",
      value: ctrDecline,
      description: "Click-through rate declining over time",
    },
    {
      label: "CPM Increase",
      value: cpmIncrease,
      description: "Cost per thousand impressions rising",
    },
    {
      label: "Frequency Saturation",
      value: frequencySat,
      description: "Audience seeing the ad too many times",
    },
    {
      label: "Conversion Drop",
      value: conversionDrop,
      description: "Conversion rate declining",
    },
  ];

  return (
    <div className="space-y-4">
      {signals.map((signal) => (
        <div key={signal.label} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-medium">{signal.label}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                ({signal.description})
              </span>
            </div>
            <span className="font-mono text-sm tabular-nums">
              {Math.round(signal.value * 100)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", {
                "bg-emerald-500": signal.value < 0.4,
                "bg-amber-500": signal.value >= 0.4 && signal.value < 0.7,
                "bg-red-500": signal.value >= 0.7,
              })}
              style={{ width: `${Math.round(signal.value * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
