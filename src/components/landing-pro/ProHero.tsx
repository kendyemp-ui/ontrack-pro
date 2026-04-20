import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroDashboard from "@/assets/landing-pro/hero-dashboard.png";

export const ProHero = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="pointer-events-none absolute inset-0 pro-grid-bg" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-32 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(ellipse, hsl(174 72% 56% / 0.45), transparent 60%)" }}
        aria-hidden
      />

      <div className="landing-container relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">
            <Sparkles size={12} className="pro-accent" />
            OnTrack Pro · Plataforma para nutricionistas
          </span>

          <h1 className="landing-h1 mt-6">
            Transforme acompanhamento em{" "}
            <span className="pro-gradient-text">retenção.</span>
          </h1>

          <p className="landing-lead mx-auto mt-6 max-w-2xl">
            O OnTrack Pro ajuda nutricionistas a manterem presença ativa na rotina dos pacientes,
            aumentando adesão, relacionamento e retorno entre consultas, sem esforço manual.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="pro-bg-accent h-12 px-7 text-black hover:opacity-90">
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

        {/* Hero mockup */}
        <div className="relative mx-auto mt-20 max-w-6xl">
          <div className="absolute inset-x-12 -top-6 h-40 rounded-full opacity-50 blur-3xl"
            style={{ background: "radial-gradient(ellipse, hsl(174 72% 56% / 0.5), transparent 70%)" }}
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 p-2 backdrop-blur">
            <img
              src={heroDashboard}
              alt="Dashboard do OnTrack Pro mostrando lista de pacientes com adesão, gráficos e métricas em tempo real"
              className="w-full rounded-2xl"
              width={1600}
              height={1024}
            />
          </div>

          {/* Floating KPI chips */}
          <div className="absolute -left-2 top-1/3 hidden rounded-xl border border-border bg-card/95 px-3 py-2 text-xs shadow-xl backdrop-blur md:block">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Adesão média</div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-lg font-semibold pro-accent">87%</span>
              <span className="text-[10px] text-emerald-400">+12% mês</span>
            </div>
          </div>
          <div className="absolute -right-2 bottom-1/3 hidden rounded-xl border border-border bg-card/95 px-3 py-2 text-xs shadow-xl backdrop-blur md:block">
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
