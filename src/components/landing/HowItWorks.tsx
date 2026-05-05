import { Camera, Activity, LineChart, Bell } from "lucide-react";

const steps = [
  {
    icon: Camera,
    step: "01",
    title: "Registre sua alimentação",
    desc: "Adicione refeições em segundos. Texto, foto ou direto pelo WhatsApp, o que for mais rápido pra você.",
  },
  {
    icon: Activity,
    step: "02",
    title: "Acompanhe calorias e macros",
    desc: "Veja em tempo real quantas calorias, proteínas e carboidratos você consumiu, sem planilha, sem complicação.",
  },
  {
    icon: LineChart,
    step: "03",
    title: "Visualize sua evolução",
    desc: "Gráficos claros de semana, mês e ano mostram o que está funcionando e onde você precisa ajustar.",
  },
  {
    icon: Bell,
    step: "04",
    title: "Receba feedbacks inteligentes",
    desc: "Alertas e dicas personalizadas pra você corrigir a rota antes de sair dela.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="como-funciona" className="landing-section relative bg-card/30">
      <div className="landing-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">Como funciona</span>
          <h2 className="landing-h2 mt-5">
            Simples assim. <span className="text-muted-foreground">Em 4 passos.</span>
          </h2>
          <p className="landing-lead mt-5">
            Sem planilhas, sem cálculos, sem fricção. Você registra, o app cuida do resto.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-12 md:grid-cols-2 lg:grid-cols-4">
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
                  className="absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-border lg:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
