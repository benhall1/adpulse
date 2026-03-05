import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Bell,
  Zap,
  ArrowRight,
  BarChart3,
  Link2,
  ShieldCheck,
  TrendingDown,
  ChevronRight,
} from "lucide-react";

/* ─────────────────────────────────────────────
   AdPulse Landing Page
   Aesthetic: Precision data-viz / dark fintech
   ───────────────────────────────────────────── */

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* ── Ambient grid background ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* ── Radial glow ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-0 z-0 -translate-x-1/2"
        style={{
          width: "120vw",
          height: "60vh",
          background:
            "radial-gradient(ellipse 50% 60% at 50% 0%, rgba(59,130,246,.08) 0%, transparent 70%)",
        }}
      />

      {/* ── Nav ── */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Ad<span className="text-blue-500">Pulse</span>
          </span>
        </div>
        <Link href="/login">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
            Sign in <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </nav>

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-20 md:pt-32">
        <div className="flex flex-col items-center text-center">
          {/* Pill badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-xs backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            <span className="text-muted-foreground">
              Now monitoring <span className="font-semibold text-foreground">$2.4M+</span> in ad spend
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">
            Ad fatigue is{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-red-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
                killing
              </span>
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 right-0 h-3 bg-red-500/10 blur-sm"
              />
            </span>{" "}
            your ROAS.
            <br />
            <span className="text-muted-foreground">We catch it early.</span>
          </h1>

          {/* Sub */}
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            AdPulse continuously scores your Meta ad creatives for fatigue signals —
            CTR decline, CPM spikes, frequency saturation — and alerts you{" "}
            <span className="font-medium text-foreground">before</span> performance craters.
          </p>

          {/* CTA */}
          <div className="mt-10 flex items-center gap-4">
            <Link href="/login">
              <Button
                size="lg"
                className="h-12 rounded-xl bg-blue-600 px-8 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
              >
                Start monitoring
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <span className="text-xs text-muted-foreground">Free while in beta</span>
          </div>
        </div>

        {/* ── Dashboard preview ── */}
        <div className="relative mx-auto mt-20 max-w-4xl">
          {/* Glow behind card */}
          <div
            aria-hidden
            className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-blue-600/10 via-transparent to-transparent blur-2xl"
          />
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur">
            {/* Mock title bar */}
            <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-amber-500/60" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
              <div className="ml-4 h-5 w-48 rounded bg-muted/50" />
            </div>
            {/* Mock content grid */}
            <div className="grid grid-cols-4 gap-4 p-6">
              {[
                { label: "Total Ads", val: "127", color: "text-blue-400" },
                { label: "Healthy", val: "89", color: "text-emerald-400" },
                { label: "Watch", val: "31", color: "text-amber-400" },
                { label: "Critical", val: "7", color: "text-red-400" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border/40 bg-background/60 p-4">
                  <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.val}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            {/* Mock chart area */}
            <div className="mx-6 mb-6 flex h-36 items-end gap-[3px] rounded-xl border border-border/40 bg-background/60 p-4">
              {Array.from({ length: 28 }).map((_, i) => {
                const h = 20 + Math.sin(i * 0.4) * 15 + Math.cos(i * 0.7) * 20 + (i > 18 ? (i - 18) * 4 : 0);
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${Math.min(100, Math.max(8, h))}%`,
                      backgroundColor:
                        i > 22
                          ? "rgba(239,68,68,0.5)"
                          : i > 18
                            ? "rgba(245,158,11,0.4)"
                            : "rgba(59,130,246,0.35)",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">
            Core capabilities
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to stay ahead of fatigue
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: BarChart3,
              title: "Real-time fatigue scoring",
              description:
                "4-factor weighted algorithm analyzes CTR trends, CPM shifts, frequency saturation, and conversion drops to produce a single fatigue score for every creative.",
              accent: "from-blue-600 to-cyan-500",
              glow: "rgba(59,130,246,0.08)",
            },
            {
              icon: Bell,
              title: "Smart threshold alerts",
              description:
                "Get daily digest emails the moment any ad crosses your chosen threshold — WATCH or CRITICAL — so you can rotate creatives before budget bleeds out.",
              accent: "from-amber-500 to-orange-400",
              glow: "rgba(245,158,11,0.08)",
            },
            {
              icon: Link2,
              title: "Native Meta integration",
              description:
                "One-click OAuth connect to your Meta ad accounts. We pull campaigns, ad sets, ads, and daily metrics automatically via the Graph API v21.0.",
              accent: "from-emerald-500 to-teal-400",
              glow: "rgba(34,197,94,0.08)",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border/60 bg-card/50 p-8 backdrop-blur transition-colors hover:border-border"
            >
              {/* Hover glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100"
                style={{ background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${feature.glow}, transparent 40%)` }}
              />
              <div
                className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent} shadow-lg`}
              >
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Three steps. Zero guesswork.
          </h2>
        </div>

        <div className="relative grid gap-12 md:grid-cols-3 md:gap-8">
          {/* Connecting line (desktop) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-10 z-0 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
          />

          {[
            {
              step: "01",
              icon: Zap,
              title: "Connect your Meta account",
              description:
                "Authorize AdPulse via OAuth. We discover all your ad accounts, campaigns, and active creatives automatically.",
            },
            {
              step: "02",
              icon: TrendingDown,
              title: "We score every creative",
              description:
                "Our algorithm ingests 30 days of daily metrics and computes a fatigue score across four weighted signals. Updated daily.",
            },
            {
              step: "03",
              icon: ShieldCheck,
              title: "Act before performance dips",
              description:
                "Get alerts by email when any ad crosses your threshold. Open the dashboard for signal breakdowns, trend charts, and full history.",
            },
          ].map((step, i) => (
            <div key={step.step} className="relative z-10 flex flex-col items-center text-center">
              {/* Step number circle */}
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-border/60 bg-card" />
                <div className="absolute inset-2 rounded-full border border-blue-500/20 bg-background" />
                <step.icon className="relative h-7 w-7 text-blue-400" />
                {/* Step label */}
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-lg shadow-blue-600/30">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ BOTTOM CTA ════════════════ */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-32 pt-12">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/50 p-12 text-center backdrop-blur md:p-20">
          {/* BG pulse */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 120%, rgba(59,130,246,0.12) 0%, transparent 60%)",
            }}
          />
          <h2 className="relative text-3xl font-bold tracking-tight md:text-4xl">
            Stop guessing.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Start knowing.
            </span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-muted-foreground">
            Join teams who refresh creatives at the right time — not too early, not too late.
          </p>
          <div className="relative mt-8">
            <Link href="/login">
              <Button
                size="lg"
                className="h-12 rounded-xl bg-blue-600 px-10 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AdPulse. Built for performance marketers.</p>
      </footer>
    </div>
  );
}
