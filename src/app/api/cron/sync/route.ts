export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncAdAccount } from "@/lib/sync";
import { scoreAllAds } from "@/lib/score-all-ads";
import { sendDailyDigest } from "@/lib/email";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = [];

  try {
    // Get all ad accounts
    const accounts = await db.adAccount.findMany({
      include: {
        user: true,
      },
    });

    for (const account of accounts) {
      try {
        // Sync data from Meta
        const syncResult = await syncAdAccount(account.id);

        // Score all ads
        const scores = await scoreAllAds(account.id);

        // Send alerts if enabled
        if (account.alertsEnabled && account.user.email) {
          const threshold = account.alertThreshold;
          const alertScores = scores.filter((s) => {
            if (threshold === "CRITICAL") return s.status === "CRITICAL";
            return s.status === "WATCH" || s.status === "CRITICAL";
          });

          if (alertScores.length > 0) {
            // Get full fatigue data for email
            const fatigueData = await db.fatigueScore.findMany({
              where: {
                adId: { in: alertScores.map((s) => s.adId) },
                date: new Date(new Date().toISOString().split("T")[0]),
              },
            });

            await sendDailyDigest(
              account.user.email,
              account.user.name || "there",
              fatigueData.map((f) => ({
                adName:
                  alertScores.find((s) => s.adId === f.adId)?.adName || "Unknown",
                status: f.status as "WATCH" | "CRITICAL",
                score: f.overallScore,
                ctrDecline: f.ctrDecline,
                cpmIncrease: f.cpmIncrease,
                frequencySat: f.frequencySat,
                conversionDrop: f.conversionDrop,
              })),
              process.env.NEXT_PUBLIC_APP_URL || "https://adpulse.app"
            );

            // Record alert history
            for (const score of alertScores) {
              await db.alertHistory.create({
                data: {
                  userId: account.userId,
                  adId: score.adId,
                  adName: score.adName,
                  status: score.status,
                  score: score.score,
                },
              });
            }
          }
        }

        results.push({
          accountId: account.id,
          accountName: account.name,
          sync: syncResult,
          scored: scores.length,
        });
      } catch (err) {
        results.push({
          accountId: account.id,
          accountName: account.name,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({ results, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Cron sync error:", err);
    return NextResponse.json(
      { error: "Cron sync failed" },
      { status: 500 }
    );
  }
}
