export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { getAdAccounts } from "@/lib/meta-client";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/settings?error=meta_auth_failed", request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenUrl = new URL(
      "https://graph.facebook.com/v21.0/oauth/access_token"
    );
    tokenUrl.searchParams.set("client_id", process.env.META_APP_ID!);
    tokenUrl.searchParams.set("client_secret", process.env.META_APP_SECRET!);
    tokenUrl.searchParams.set(
      "redirect_uri",
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`
    );
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(
        new URL("/settings?error=meta_token_failed", request.url)
      );
    }

    // Exchange for long-lived token
    const longLivedUrl = new URL(
      "https://graph.facebook.com/v21.0/oauth/access_token"
    );
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", process.env.META_APP_ID!);
    longLivedUrl.searchParams.set(
      "client_secret",
      process.env.META_APP_SECRET!
    );
    longLivedUrl.searchParams.set("fb_exchange_token", tokenData.access_token);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedResponse.json();

    const accessToken = longLivedData.access_token || tokenData.access_token;

    // Fetch ad accounts
    const adAccounts = await getAdAccounts(accessToken);

    // Store each ad account with encrypted token
    for (const account of adAccounts) {
      const { encrypted, iv, authTag } = encrypt(accessToken);

      await db.adAccount.upsert({
        where: { metaAccountId: account.id },
        update: {
          name: account.name,
          encryptedToken: encrypted,
          tokenIv: iv,
          tokenAuthTag: authTag,
        },
        create: {
          userId: session.user.id!,
          metaAccountId: account.id,
          name: account.name,
          encryptedToken: encrypted,
          tokenIv: iv,
          tokenAuthTag: authTag,
        },
      });
    }

    return NextResponse.redirect(
      new URL(
        `/settings?success=meta_connected&accounts=${adAccounts.length}`,
        request.url
      )
    );
  } catch (err) {
    console.error("Meta OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/settings?error=meta_callback_error", request.url)
    );
  }
}
