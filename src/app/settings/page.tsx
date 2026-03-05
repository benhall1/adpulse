import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SyncButton } from "./sync-button";
import Link from "next/link";
import { Link2, ExternalLink, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string; accounts?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;

  const adAccounts = await db.adAccount.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your ad accounts, sync schedule, and alert preferences
        </p>

        {/* Status messages */}
        {params.success === "meta_connected" && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Successfully connected {params.accounts} Meta ad account(s)!
          </div>
        )}
        {params.error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4" />
            {params.error === "meta_auth_failed"
              ? "Meta authentication was cancelled or failed."
              : params.error === "meta_token_failed"
                ? "Failed to obtain Meta access token."
                : "An error occurred during Meta connection."}
          </div>
        )}

        <div className="mt-8 space-y-6">
          {/* Connect Meta */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Meta Ad Accounts</CardTitle>
              <CardDescription>
                Connect your Meta Business account to start monitoring ad fatigue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/api/auth/meta">
                <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-500">
                  <Link2 className="h-4 w-4" />
                  Connect Meta Account
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Connected accounts */}
          {adAccounts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Connected Accounts</CardTitle>
                <CardDescription>
                  {adAccounts.length} account{adAccounts.length !== 1 ? "s" : ""} connected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{account.metaAccountId}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {account.lastSyncAt
                              ? `Last sync: ${new Date(account.lastSyncAt).toLocaleString()}`
                              : "Never synced"}
                          </span>
                          <span
                            className={`capitalize ${
                              account.syncStatus === "error"
                                ? "text-red-400"
                                : account.syncStatus === "syncing"
                                  ? "text-blue-400"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {account.syncStatus}
                          </span>
                        </div>
                      </div>
                      <SyncButton accountId={account.id} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alert preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alert Preferences</CardTitle>
              <CardDescription>
                Configure when and how you receive fatigue alerts. Alerts are sent
                daily at 11:00 AM UTC via email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Alert settings are configured per ad account. Connect a Meta
                  account above to manage alert thresholds.
                </p>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="font-medium text-foreground">Default settings:</p>
                  <ul className="mt-2 space-y-1">
                    <li>Alerts: <span className="text-emerald-400">Enabled</span></li>
                    <li>Threshold: <span className="text-amber-400">WATCH</span> (alerts on both WATCH and CRITICAL)</li>
                    <li>Channel: Email</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
