import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Sparkles, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroveRingsDecor } from "@/components/GroveRingsDecor";
import { GroveIcon } from "@/components/GroveIcon";

/** CSS-only Pro dashboard mockup — no screenshots needed */
const ProDashboardMockup = () => {
  const patients = [
    { name: "Marina Costa", goal: "Emagrecimento", status: "ok", adherence: 92, meals: "4/4" },
    { name: "Lucas Alves", goal: "Hipertrofia", status: "ok", adherence: 88, meals: "5/6" },
    { name: "Beatriz Lima", goal: "Reeducação", status: "atencao", adherence: 61, meals: "2/4" },
    { name: "Pedro Souza", goal: "Emagrecimento", status: "risco", adherence: 34, meals: "0/4" },
    { name: "Ana Ribeiro", goal: "Performance", status: "ok", adherence: 95, meals: "6/6" },
  ];

  const dotColor = (s: string) =>
    s === "ok" ? "bg-emerald-400" : s === "atencao" ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-2xl backdrop-blur">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/60 bg-background/60 px-5 py-3">
        <GroveIcon size={22} wordmark wordmarkSize={14} />
        <div className="flex items-center gap-1.5">
          <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">Pro</span>
          <div className="h-6 w-6 rounded-full bg-muted text-[9px] font-semibold flex items-center justify-center">HV</div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-2 border-b border-border/60 bg-background/40 px-5 py-3">
        {[
          { label: "Pacientes ativos", value: "28", icon: Users, color: "text-foreground" },
          { label: "Adesão média", value: "87%", icon: TrendingUp, color: "text-emerald-400" },
          { label: "Em risco", value: "3", icon: AlertTriangle, color: "text-red-400" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border/40 bg-card/60 p-2.5">
            <k.icon size={13} className={k.color} />
            <p className="mt-1.5 text-[10px] text-muted-foreground leading-none">{k.label}</p>
            <p className={`mt-1 text-lg font-semibold tabular-nums ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Patient table header */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-border/60 bg-background/20 px-5 py-2">
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Paciente</span>
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Refeições</span>
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Adesão</span>
      </div>

      {/* Patient rows */}
      <div className="divide-y divide-border/40">
        {patients.map((p) => (
          <div key={p.name} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-5 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                {p.name[0]}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium truncate">{p.name}</p>
                <p className="text-[9px] text-muted-foreground truncate">{p.goal}</p>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground">{p.meals}</span>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${dotColor(p.status)}`} />
              <span className="text-[11px] font-semibold tabular-nums">{p.adherence}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProHero = () => {
  return (
    <section className="relative overflow-hidden pt-24 pb-12 sm:pt-36 sm:pb-24">
      <div className="pointer-events-none absolute inset-0 pro-grid-bg" aria-hidden />
      {/* Anéis de crescimento — decoração de fundo */}
      <GroveRingsDecor
        rings={6}
        className="pointer-events-none absolute -right-32 -top-32 w-[520px] opacity-60"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-32 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(ellipse, hsl(141 25% 39% / 0.20), transparent 60%)" }}
        aria-hidden
      />

      <div className="landing-container relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">
            <Sparkles size={12} className="pro-accent" />
            Grove Pro · Plataforma para nutricionistas
          </span>

          <h1 className="landing-h1 mt-6">
            Transforme acompanhamento em{" "}
            <span className="pro-gradient-text">retenção.</span>
          </h1>

          <p className="landing-lead mx-auto mt-6 max-w-2xl">
            O Grove Pro ajuda nutricionistas a manterem presença ativa na rotina dos pacientes,
            aumentando adesão, relacionamento e retorno entre consultas, sem esforço manual.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="pro-bg-accent h-12 px-7 text-white hover:opacity-90">
              <Link to="/pro/cadastro">
                Testar gratuitamente
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-7">
              <a href="#planos">Ver planos</a>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={14} className="pro-accent" /> Plano grátis até 5 pacientes
            </li>
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={14} className="pro-accent" /> Sem cartão de crédito
            </li>
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={14} className="pro-accent" /> Setup em minutos
            </li>
          </ul>
        </div>

        {/* Hero mockup — CSS-only, sem screenshots */}
        <div className="relative mx-auto mt-10 hidden max-w-4xl sm:block sm:mt-16">
          <div className="absolute inset-x-12 -top-6 h-40 rounded-full opacity-50 blur-3xl"
            style={{ background: "radial-gradient(ellipse, hsl(174 72% 56% / 0.5), transparent 70%)" }}
            aria-hidden
          />
          <ProDashboardMockup />

          {/* Floating KPI chips */}
          <div className="absolute -left-4 top-1/3 hidden rounded-xl border border-border bg-card/95 px-3 py-2 text-xs shadow-xl backdrop-blur md:block">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Adesão média</div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-lg font-semibold pro-accent">87%</span>
              <span className="text-[10px] text-emerald-400">+12% mês</span>
            </div>
          </div>
          <div className="absolute -right-4 bottom-1/3 hidden rounded-xl border border-border bg-card/95 px-3 py-2 text-xs shadow-xl backdrop-blur md:block">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Retenção 90d</div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-lg font-semibold text-foreground">+38%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProHero;
