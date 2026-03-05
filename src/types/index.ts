// ─── Meta API Types ──────────────────────────────────────────────

export interface MetaAdAccount {
  id: string;
  name: string;
  account_id: string;
  account_status: number;
  currency: string;
}

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
}

export interface MetaAdSet {
  id: string;
  name: string;
  status: string;
  campaign_id: string;
}

export interface MetaAd {
  id: string;
  name: string;
  status: string;
  adset_id: string;
  creative?: {
    id: string;
    thumbnail_url?: string;
    effective_object_story_id?: string;
  };
}

export interface MetaInsight {
  date_start: string;
  date_stop: string;
  impressions: string;
  clicks: string;
  spend: string;
  ctr: string;
  cpm: string;
  cpc: string;
  actions?: Array<{
    action_type: string;
    value: string;
  }>;
  frequency: string;
  cost_per_action_type?: Array<{
    action_type: string;
    value: string;
  }>;
}

// ─── Internal Types ──────────────────────────────────────────────

export type FatigueStatus = "HEALTHY" | "WATCH" | "CRITICAL";

export interface FatigueSignals {
  ctrDecline: number;
  cpmIncrease: number;
  frequencySat: number;
  conversionDrop: number;
}

export interface FatigueResult {
  overallScore: number;
  status: FatigueStatus;
  signals: FatigueSignals;
}

export interface AdWithMetrics {
  id: string;
  name: string;
  status: string;
  creativeUrl: string | null;
  thumbnailUrl: string | null;
  launchedAt: Date | null;
  latestScore: {
    overallScore: number;
    status: FatigueStatus;
    ctrDecline: number;
    cpmIncrease: number;
    frequencySat: number;
    conversionDrop: number;
    date: Date;
  } | null;
  latestMetrics: {
    impressions: number;
    clicks: number;
    spend: number;
    ctr: number;
    cpm: number;
    cpc: number;
    conversions: number;
    frequency: number;
    date: Date;
  } | null;
}

export interface SyncResult {
  accountId: string;
  campaigns: number;
  adSets: number;
  ads: number;
  metrics: number;
  errors: string[];
}

export interface DashboardSummary {
  totalAds: number;
  healthy: number;
  watch: number;
  critical: number;
  unscored: number;
}
