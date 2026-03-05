export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { syncAdAccount } from "@/lib/sync";
import { scoreAllAds } from "@/lib/score-all-ads";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { accountId } = body;

  // Verify account belongs to user
  const account = await db.adAccount.findFirst({
    where: { id: accountId, userId: session.user.id },
  });

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  try {
    const syncResult = await syncAdAccount(accountId);
    const scores = await scoreAllAds(accountId);

    return NextResponse.json({
      sync: syncResult,
      scores: scores.length,
    });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
