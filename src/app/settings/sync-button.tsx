"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function SyncButton({ accountId }: { accountId: string }) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setResult(null);

    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setResult(`Error: ${data.error || "Sync failed"}`);
        return;
      }

      const data = await res.json();
      setResult(
        `Synced ${data.sync.campaigns} campaigns, ${data.sync.ads} ads, ${data.sync.metrics} metrics. Scored ${data.scores} ads.`
      );
    } catch {
      setResult("Error: Network request failed");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={syncing}
        className="gap-1.5"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Syncing..." : "Sync now"}
      </Button>
      {result && (
        <p className={`text-xs ${result.startsWith("Error") ? "text-red-400" : "text-emerald-400"}`}>
          {result}
        </p>
      )}
    </div>
  );
}
