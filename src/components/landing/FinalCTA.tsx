import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FinalCTA = () => {
  return (
    <section className="landing-section">
      <div className="landing-container">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-background to-card p-10 sm:p-16 lg:p-20">
          {/* Glow */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 -z-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
          />
          <div
            aria-hidden
            className="absolute -right-20 -top-20 -z-10 h-80 w-80 rounded-full bg-accent/15 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-32 -left-20 -z-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <span className="landing-eyebrow">Sua evolução começa aqui</span>
            <h2 className="landing-h2 mt-6">
              Comece hoje a acompanhar <br className="hidden sm:block" />
              sua evolução com <span className="accent-text">mais clareza</span>.
            </h2>
            <p className="landing-lead mt-6">
              Junte-se a milhares de pessoas que estão construindo consistência,
              um registro de cada vez.
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-12 px-8 text-sm font-semibold">
                <a href="#planos">
                  Assinar o OnTrack App <ArrowRight size={16} />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-sm">
                <a href="#planos">Ver planos novamente</a>
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Sem fidelidade · Cancele quando quiser · Acesso imediato
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
