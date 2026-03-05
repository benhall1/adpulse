import type {
  MetaAdAccount,
  MetaCampaign,
  MetaAdSet,
  MetaAd,
  MetaInsight,
} from "@/types";

const API_VERSION = "v21.0";
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

class MetaApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: number
  ) {
    super(message);
    this.name = "MetaApiError";
  }
}

async function metaFetch<T>(
  endpoint: string,
  accessToken: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("access_token", accessToken);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new MetaApiError(
      error?.error?.message || `Meta API error: ${response.status}`,
      response.status,
      error?.error?.code
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Fetch all ad accounts for a user.
 */
export async function getAdAccounts(
  accessToken: string
): Promise<MetaAdAccount[]> {
  const result = await metaFetch<{ data: MetaAdAccount[] }>(
    "/me/adaccounts",
    accessToken,
    {
      fields: "id,name,account_id,account_status,currency",
      limit: "100",
    }
  );
  return result.data;
}

/**
 * Fetch all active campaigns for an ad account.
 */
export async function getCampaigns(
  accountId: string,
  accessToken: string
): Promise<MetaCampaign[]> {
  const result = await metaFetch<{ data: MetaCampaign[] }>(
    `/${accountId}/campaigns`,
    accessToken,
    {
      fields: "id,name,status,objective",
      filtering: JSON.stringify([
        { field: "effective_status", operator: "IN", value: ["ACTIVE"] },
      ]),
      limit: "500",
    }
  );
  return result.data;
}

/**
 * Fetch all ad sets for a campaign.
 */
export async function getAdSets(
  campaignId: string,
  accessToken: string
): Promise<MetaAdSet[]> {
  const result = await metaFetch<{ data: MetaAdSet[] }>(
    `/${campaignId}/adsets`,
    accessToken,
    {
      fields: "id,name,status",
      limit: "500",
    }
  );
  return result.data;
}

/**
 * Fetch all ads for an ad set.
 */
export async function getAds(
  adSetId: string,
  accessToken: string
): Promise<MetaAd[]> {
  const result = await metaFetch<{ data: MetaAd[] }>(
    `/${adSetId}/ads`,
    accessToken,
    {
      fields: "id,name,status,creative{id,thumbnail_url,effective_object_story_id}",
      limit: "500",
    }
  );
  return result.data;
}

/**
 * Fetch daily insights for an ad over a date range.
 */
export async function getAdInsights(
  adId: string,
  accessToken: string,
  dateFrom: string,
  dateTo: string
): Promise<MetaInsight[]> {
  const result = await metaFetch<{ data: MetaInsight[] }>(
    `/${adId}/insights`,
    accessToken,
    {
      fields:
        "impressions,clicks,spend,ctr,cpm,cpc,actions,frequency,cost_per_action_type",
      time_range: JSON.stringify({ since: dateFrom, until: dateTo }),
      time_increment: "1",
      limit: "90",
    }
  );
  return result.data;
}

export { MetaApiError };
