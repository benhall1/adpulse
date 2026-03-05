import type { FatigueResult, FatigueStatus } from "@/types";

interface DailyMetric {
  date: Date;
  ctr: number;
  cpm: number;
  frequency: number;
  conversions: number;
  impressions: number;
}

// Weights for the 4-factor scoring
const WEIGHTS = {
  ctrDecline: 0.35,
  cpmIncrease: 0.25,
  frequencySat: 0.25,
  conversionDrop: 0.15,
};

// Thresholds
const MIN_DAYS_DATA = 4;
const MIN_AGE_HOURS = 72;

/**
 * Calculate fatigue score for an ad based on its daily metrics.
 * Returns null if not enough data (< 4 days or ad < 72hrs old).
 */
export function calculateFatigue(
  metrics: DailyMetric[],
  launchedAt: Date | null
): FatigueResult | null {
  // Skip ads younger than 72 hours
  if (launchedAt) {
    const ageHours = (Date.now() - launchedAt.getTime()) / (1000 * 60 * 60);
    if (ageHours < MIN_AGE_HOURS) return null;
  }

  // Need at least 4 days of data
  if (metrics.length < MIN_DAYS_DATA) return null;

  // Sort by date ascending
  const sorted = [...metrics].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Split into first half and second half for comparison
  const midpoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midpoint);
  const secondHalf = sorted.slice(midpoint);

  const ctrDecline = measureDecline(
    avg(firstHalf.map((m) => m.ctr)),
    avg(secondHalf.map((m) => m.ctr))
  );

  const cpmIncrease = measureIncrease(
    avg(firstHalf.map((m) => m.cpm)),
    avg(secondHalf.map((m) => m.cpm))
  );

  const frequencySat = measureFrequencySaturation(
    avg(secondHalf.map((m) => m.frequency))
  );

  const conversionDrop = measureDecline(
    avg(firstHalf.map((m) => m.conversions)),
    avg(secondHalf.map((m) => m.conversions))
  );

  const overallScore =
    ctrDecline * WEIGHTS.ctrDecline +
    cpmIncrease * WEIGHTS.cpmIncrease +
    frequencySat * WEIGHTS.frequencySat +
    conversionDrop * WEIGHTS.conversionDrop;

  const status = scoreToStatus(overallScore);

  return {
    overallScore: round(overallScore),
    status,
    signals: {
      ctrDecline: round(ctrDecline),
      cpmIncrease: round(cpmIncrease),
      frequencySat: round(frequencySat),
      conversionDrop: round(conversionDrop),
    },
  };
}

/**
 * Measure how much a metric has declined (0 = no decline, 1 = complete decline).
 */
function measureDecline(earlier: number, later: number): number {
  if (earlier <= 0) return 0;
  const decline = (earlier - later) / earlier;
  return clamp(decline, 0, 1);
}

/**
 * Measure how much a metric has increased (0 = no increase, 1 = doubled or more).
 */
function measureIncrease(earlier: number, later: number): number {
  if (earlier <= 0) return 0;
  const increase = (later - earlier) / earlier;
  return clamp(increase, 0, 1);
}

/**
 * Frequency saturation: maps frequency to a 0-1 score.
 * < 2.0 = low concern, 2.0-4.0 = moderate, > 4.0 = high.
 */
function measureFrequencySaturation(frequency: number): number {
  if (frequency <= 1.5) return 0;
  if (frequency >= 5.0) return 1;
  return clamp((frequency - 1.5) / 3.5, 0, 1);
}

function scoreToStatus(score: number): FatigueStatus {
  if (score < 0.4) return "HEALTHY";
  if (score < 0.7) return "WATCH";
  return "CRITICAL";
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, decimals = 3): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}
