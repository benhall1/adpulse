import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DailyMetric {
  date: Date;
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  cpm: number;
  cpc: number;
  conversions: number;
  frequency: number;
  costPerResult: number | null;
}

export function MetricsTable({ metrics }: { metrics: DailyMetric[] }) {
  const sorted = [...metrics].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Impressions</TableHead>
          <TableHead className="text-right">Clicks</TableHead>
          <TableHead className="text-right">CTR</TableHead>
          <TableHead className="text-right">CPM</TableHead>
          <TableHead className="text-right">CPC</TableHead>
          <TableHead className="text-right">Spend</TableHead>
          <TableHead className="text-right">Conv.</TableHead>
          <TableHead className="text-right">CPA</TableHead>
          <TableHead className="text-right">Freq.</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((metric) => (
          <TableRow key={new Date(metric.date).toISOString()}>
            <TableCell className="font-medium">
              {new Date(metric.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {metric.impressions.toLocaleString()}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {metric.clicks.toLocaleString()}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {metric.ctr.toFixed(2)}%
            </TableCell>
            <TableCell className="text-right tabular-nums">
              ${metric.cpm.toFixed(2)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              ${metric.cpc.toFixed(2)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              ${metric.spend.toFixed(2)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {metric.conversions}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {metric.costPerResult ? `$${metric.costPerResult.toFixed(2)}` : "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {metric.frequency.toFixed(1)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
