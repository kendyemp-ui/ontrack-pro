import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ProFinalCTA = () => {
  return (
    <section className="landing-section">
      <div className="landing-container">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-10 text-center backdrop-blur sm:p-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(ellipse at top, hsl(174 72% 56% / 0.25), transparent 60%)",
            }}
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 pro-grid-bg opacity-60" aria-hidden />
          <div className="relative">
            <span className="landing-eyebrow">Pronto para começar?</span>
            <h2 className="landing-h2 mx-auto mt-5 max-w-3xl">
              Pare de depender só de novas consultas.
              <br className="hidden sm:block" />
              <span className="pro-gradient-text">Aumente retenção com presença real.</span>
            </h2>
            <p className="landing-lead mx-auto mt-6 max-w-2xl">
              Acompanhamento mais inteligente, contínuo e organizado. Comece grátis com até 5
              pacientes — sem cartão, sem fidelidade.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="pro-bg-accent h-12 px-7 text-black hover:opacity-90">
                <Link to="/pro/cadastro">
                  Testar OnTrack Pro
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-7">
                <a href="#planos">Ver planos</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProFinalCTA;
