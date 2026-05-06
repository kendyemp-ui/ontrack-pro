import { Camera, Activity, LineChart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Camera,
    step: "01",
    title: "Registre em segundos",
    desc: "Foto pelo WhatsApp, texto ou busca rápida no app. Sem tabela nutricional, sem digitação manual.",
  },
  {
    icon: Activity,
    step: "02",
    title: "Veja calorias e macros na hora",
    desc: "O app calcula tudo automaticamente: calorias, proteínas e carboidratos do dia em tempo real.",
  },
  {
    icon: LineChart,
    step: "03",
    title: "Acompanhe sua meta e evolução",
    desc: "Anel de progresso diário e gráficos de semana, mês e ano — você sempre sabe onde está.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="como-funciona" className="landing-section relative bg-card/30">
      <div className="landing-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">Como funciona</span>
          <h2 className="landing-h2 mt-5">
            Três passos. <span className="text-muted-foreground">Zero planilha.</span>
          </h2>
          <p className="landing-lead mt-5">
            Você registra, o Grove calcula. Simples assim.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-12 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.step} className="landing-card-elevated relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <s.icon size={20} />
                </div>
                <span className="font-heading text-3xl font-bold text-foreground/10">{s.step}</span>
              </div>
              <h3 className="landing-h3 mt-6 text-lg">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  className="absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-border md:block"
                />
              )}
            </div>
          ))}
        </div>

        {/* Mid-page CTA */}
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <Button asChild size="lg" className="h-12 px-8 text-sm font-semibold">
            <a href="#planos">
              Começar a contar calorias agora <ArrowRight size={16} />
            </a>
          </Button>
          <p className="text-xs text-muted-foreground">Sem fidelidade · Cancele quando quiser</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
