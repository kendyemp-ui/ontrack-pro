import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeroMockup } from "./HeroMockup";
import { GroveRingsDecor } from "@/components/GroveRingsDecor";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-24 pb-12 md:pt-36 md:pb-24">
      {/* Background grid */}
      <div aria-hidden className="absolute inset-0 grid-bg" />
      {/* Anéis de crescimento — decoração de fundo */}
      <GroveRingsDecor
        rings={5}
        className="pointer-events-none absolute -left-24 top-0 w-[480px] opacity-50"
      />
      {/* Accent glow */}
      <div
        aria-hidden
        className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
      />

      <div className="landing-container relative">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col items-start text-left">
            <span className="landing-eyebrow">
              <Sparkles size={12} className="text-accent" />
              Contagem de calorias sem complicação
            </span>

            <h1 className="landing-h1 mt-6">
              Você sabe o que come.{" "}
              <span className="text-gradient-mono">Mas sabe quantas calorias</span>{" "}
              foram?
            </h1>

            <p className="landing-lead mt-6 max-w-xl">
              Grove conta calorias, proteínas e carboidratos automaticamente. Mande uma foto da refeição pelo WhatsApp ou registre em segundos no app — e acompanhe sua meta em tempo real.
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-12 px-7 text-sm font-semibold">
                <a href="#planos">
                  Começar agora <ArrowRight size={16} />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 text-sm">
                <a href="#planos">Ver planos</a>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Cancele quando quiser
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Sem fidelidade
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Acesso imediato
              </span>
            </div>
          </div>

          <div className="relative hidden md:block">
            <HeroMockup />
          </div>
        </div>

        {/* Press / trust strip */}
        <div className="mt-10 border-t border-border/60 pt-8 md:mt-16 md:pt-10">
          <p className="text-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Construído para quem leva a evolução a sério
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-medium text-muted-foreground/80">
            <span>+12k registros diários</span>
            <span className="hidden h-1 w-1 rounded-full bg-border md:block" />
            <span>4.9 ★ avaliação média</span>
            <span className="hidden h-1 w-1 rounded-full bg-border md:block" />
            <span>92% mantêm consistência no 1º mês</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
