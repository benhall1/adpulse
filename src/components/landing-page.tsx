import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Bell,
  ArrowRight,
  BarChart3,
  Link2,
  ShieldCheck,
  TrendingDown,
  Zap,
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ── */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <Activity className="h-5 w-5 text-foreground" />
          <span className="text-[15px] font-semibold tracking-tight">
            AdPulse
          </span>
        </div>
        <Link href="/login">
          <Button variant="outline" size="sm">
            Sign in
          </Button>
        </Link>
      </nav>

      {/* ════════ HERO ════════ */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-24 md:pt-36">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            Ad fatigue monitoring for Meta
          </p>
          <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[1.1] tracking-tight">
            Ad fatigue is killing your ROAS.
            <br />
            <span className="text-muted-foreground">We catch it early.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
            AdPulse continuously scores your Meta ad creatives for fatigue
            signals — CTR decline, CPM spikes, frequency saturation — and
            alerts you <span className="text-foreground">before</span>{" "}
            performance craters.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link href="/login">
              <Button size="lg" className="h-11 gap-2 px-6">
                Start monitoring
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground">
              Free while in beta
            </span>
          </div>
        </div>

        {/* ── Dashboard mock ── */}
        <div className="mt-20 rounded-lg border border-border bg-card">
          {/* Title bar */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">Dashboard</span>
              <span className="text-muted-foreground">/</span>
              <span>All accounts</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Last sync: 2 min ago
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 border-b border-border">
            {[
              { label: "Total Ads", val: "127", sub: "across 3 accounts" },
              { label: "Healthy", val: "89", color: "text-emerald-500" },
              { label: "Watch", val: "31", color: "text-amber-500" },
              { label: "Critical", val: "7", color: "text-red-500" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`px-5 py-4 ${i < 3 ? "border-r border-border" : ""}`}
              >
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p
                  className={`mt-1 text-2xl font-semibold tabular-nums ${s.color || "text-foreground"}`}
                >
                  {s.val}
                </p>
                {s.sub && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {s.sub}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Mock ad rows */}
          <div className="divide-y divide-border">
            {[
              {
                name: "Summer Sale — Video 1",
                campaign: "Summer Sale 2025",
                status: "CRITICAL",
                score: 78,
                ctr: "0.82%",
                cpm: "$14.20",
                freq: "4.2",
                statusColor: "bg-red-500",
              },
              {
                name: "Summer Sale — Carousel",
                campaign: "Summer Sale 2025",
                status: "WATCH",
                score: 54,
                ctr: "1.44%",
                cpm: "$11.80",
                freq: "2.8",
                statusColor: "bg-amber-500",
              },
              {
                name: "Retargeting — DPA Feed",
                campaign: "Retargeting Q3",
                status: "HEALTHY",
                score: 22,
                ctr: "2.31%",
                cpm: "$8.40",
                freq: "1.6",
                statusColor: "bg-emerald-500",
              },
            ].map((ad) => (
              <div
                key={ad.name}
                className="flex items-center gap-5 px-5 py-3.5 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{ad.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ad.campaign}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${ad.statusColor}`}
                  />
                  <span className="text-xs font-medium">{ad.status}</span>
                </div>
                <div className="w-20 text-right">
                  <div className="h-1.5 rounded-full bg-muted">
                    <div
                      className={`h-1.5 rounded-full ${ad.statusColor}`}
                      style={{ width: `${ad.score}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
                    {ad.score}%
                  </p>
                </div>
                <div className="hidden w-16 text-right text-xs tabular-nums text-muted-foreground sm:block">
                  {ad.ctr}
                </div>
                <div className="hidden w-16 text-right text-xs tabular-nums text-muted-foreground sm:block">
                  {ad.cpm}
                </div>
                <div className="hidden w-12 text-right text-xs tabular-nums text-muted-foreground sm:block">
                  {ad.freq}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Everything you need to stay ahead of fatigue
          </h2>
          <p className="mt-2 text-muted-foreground">
            Three signals. One score. Zero wasted budget.
          </p>

          <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
            {[
              {
                icon: BarChart3,
                title: "Real-time fatigue scoring",
                description:
                  "4-factor weighted algorithm analyzes CTR trends, CPM shifts, frequency saturation, and conversion drops to produce a single fatigue score for every creative.",
              },
              {
                icon: Bell,
                title: "Smart threshold alerts",
                description:
                  "Get daily digest emails the moment any ad crosses your chosen threshold — WATCH or CRITICAL — so you can rotate creatives before budget bleeds out.",
              },
              {
                icon: Link2,
                title: "Native Meta integration",
                description:
                  "One-click OAuth connect to your Meta ad accounts. We pull campaigns, ad sets, ads, and daily metrics automatically via the Graph API v21.0.",
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-card p-8">
                <feature.icon className="h-5 w-5 text-muted-foreground" />
                <h3 className="mt-4 text-[15px] font-semibold">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Three steps. Zero guesswork.
          </h2>

          <div className="mt-14 space-y-0">
            {[
              {
                icon: Zap,
                num: "1",
                title: "Connect your Meta account",
                description:
                  "Authorize AdPulse via OAuth. We discover all your ad accounts, campaigns, and active creatives automatically.",
              },
              {
                icon: TrendingDown,
                num: "2",
                title: "We score every creative",
                description:
                  "Our algorithm ingests 30 days of daily metrics and computes a fatigue score across four weighted signals. Updated daily.",
              },
              {
                icon: ShieldCheck,
                num: "3",
                title: "Act before performance dips",
                description:
                  "Get alerts by email when any ad crosses your threshold. Open the dashboard for signal breakdowns, trend charts, and full history.",
              },
            ].map((step, i) => (
              <div
                key={step.num}
                className={`flex gap-6 py-8 ${i < 2 ? "border-b border-border" : ""}`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-sm font-semibold tabular-nums">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold">{step.title}</h3>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ BOTTOM CTA ════════ */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
          <div className="max-w-lg">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Stop guessing. Start knowing.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Join teams who refresh creatives at the right time — not too
              early, not too late.
            </p>
            <div className="mt-8">
              <Link href="/login">
                <Button size="lg" className="h-11 gap-2 px-6">
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} AdPulse
          </p>
          <p>Built for performance marketers.</p>
        </div>
      </footer>
    </div>
  );
}
