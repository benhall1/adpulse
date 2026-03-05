import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@adpulse.app" },
    update: {},
    create: {
      email: "demo@adpulse.app",
      name: "Demo User",
      emailVerified: new Date(),
    },
  });

  // Create demo ad account
  const adAccount = await prisma.adAccount.upsert({
    where: { metaAccountId: "act_demo_123456" },
    update: {},
    create: {
      userId: user.id,
      metaAccountId: "act_demo_123456",
      name: "Demo Ad Account",
      encryptedToken: "demo-encrypted-token",
      tokenIv: "demo-iv",
      tokenAuthTag: "demo-auth-tag",
      lastSyncAt: new Date(),
      syncStatus: "idle",
    },
  });

  // Create demo campaign
  const campaign = await prisma.campaign.upsert({
    where: { metaCampaignId: "camp_demo_001" },
    update: {},
    create: {
      adAccountId: adAccount.id,
      metaCampaignId: "camp_demo_001",
      name: "Summer Sale 2025",
      status: "ACTIVE",
      objective: "CONVERSIONS",
    },
  });

  // Create demo ad set
  const adSet = await prisma.adSet.upsert({
    where: { metaAdSetId: "adset_demo_001" },
    update: {},
    create: {
      campaignId: campaign.id,
      metaAdSetId: "adset_demo_001",
      name: "Broad Audience 25-45",
      status: "ACTIVE",
    },
  });

  // Create demo ads
  const ads = [
    {
      metaAdId: "ad_demo_001",
      name: "Summer Sale — Video 1",
      status: "ACTIVE",
      launchedAt: new Date("2025-06-01"),
    },
    {
      metaAdId: "ad_demo_002",
      name: "Summer Sale — Carousel",
      status: "ACTIVE",
      launchedAt: new Date("2025-06-05"),
    },
    {
      metaAdId: "ad_demo_003",
      name: "Summer Sale — Static Image",
      status: "ACTIVE",
      launchedAt: new Date("2025-06-10"),
    },
    {
      metaAdId: "ad_demo_004",
      name: "Retargeting — DPA Feed",
      status: "ACTIVE",
      launchedAt: new Date("2025-05-20"),
    },
  ];

  for (const adData of ads) {
    const ad = await prisma.ad.upsert({
      where: { metaAdId: adData.metaAdId },
      update: {},
      create: {
        adSetId: adSet.id,
        ...adData,
      },
    });

    // Generate 14 days of metrics for each ad
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Simulate declining performance over time (fatigue)
      const dayIndex = 14 - i;
      const baseCtr = 2.5 - dayIndex * 0.08;
      const baseCpm = 8 + dayIndex * 0.3;
      const baseFrequency = 1.0 + dayIndex * 0.15;
      const baseConversions = Math.max(1, Math.round(12 - dayIndex * 0.5));

      const impressions = Math.round(5000 + Math.random() * 3000);
      const ctr = Math.max(0.3, baseCtr + (Math.random() - 0.5) * 0.4);
      const clicks = Math.round(impressions * (ctr / 100));
      const cpm = Math.max(3, baseCpm + (Math.random() - 0.5) * 2);
      const spend = (impressions / 1000) * cpm;
      const cpc = clicks > 0 ? spend / clicks : 0;
      const conversions = baseConversions + Math.round((Math.random() - 0.5) * 3);
      const costPerResult = conversions > 0 ? spend / conversions : null;

      await prisma.adDailyMetric.upsert({
        where: { adId_date: { adId: ad.id, date } },
        update: {},
        create: {
          adId: ad.id,
          date,
          impressions,
          clicks,
          spend: Math.round(spend * 100) / 100,
          ctr: Math.round(ctr * 1000) / 1000,
          cpm: Math.round(cpm * 100) / 100,
          cpc: Math.round(cpc * 100) / 100,
          conversions: Math.max(0, conversions),
          costPerResult: costPerResult ? Math.round(costPerResult * 100) / 100 : null,
          frequency: Math.round(baseFrequency * 100) / 100,
        },
      });
    }

    // Generate fatigue scores for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayIndex = 7 - i;
      const ctrDecline = Math.min(1, dayIndex * 0.1 + Math.random() * 0.1);
      const cpmIncrease = Math.min(1, dayIndex * 0.08 + Math.random() * 0.1);
      const frequencySat = Math.min(1, dayIndex * 0.12 + Math.random() * 0.08);
      const conversionDrop = Math.min(1, dayIndex * 0.07 + Math.random() * 0.1);

      const overallScore =
        ctrDecline * 0.35 +
        cpmIncrease * 0.25 +
        frequencySat * 0.25 +
        conversionDrop * 0.15;

      const status =
        overallScore < 0.4 ? "HEALTHY" : overallScore < 0.7 ? "WATCH" : "CRITICAL";

      await prisma.fatigueScore.upsert({
        where: { adId_date: { adId: ad.id, date } },
        update: {},
        create: {
          adId: ad.id,
          date,
          overallScore: Math.round(overallScore * 1000) / 1000,
          status,
          ctrDecline: Math.round(ctrDecline * 1000) / 1000,
          cpmIncrease: Math.round(cpmIncrease * 1000) / 1000,
          frequencySat: Math.round(frequencySat * 1000) / 1000,
          conversionDrop: Math.round(conversionDrop * 1000) / 1000,
        },
      });
    }
  }

  console.log("Seed data created successfully!");
  console.log(`  User: ${user.email}`);
  console.log(`  Ad Account: ${adAccount.name}`);
  console.log(`  Campaign: ${campaign.name}`);
  console.log(`  Ads: ${ads.length}`);
  console.log(`  Metrics: ${ads.length * 14} daily records`);
  console.log(`  Fatigue Scores: ${ads.length * 7} records`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
