import { Eye, Target, Repeat, TrendingUp, Layout, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: Eye,
    title: "Clareza sobre sua alimentação",
    desc: "Veja exatamente o que comeu, quando comeu e o impacto disso no seu dia.",
  },
  {
    icon: Target,
    title: "Visualização simples da meta",
    desc: "Anel de progresso e gráficos limpos mostram em segundos onde você está.",
  },
  {
    icon: Repeat,
    title: "Mais constância na rotina",
    desc: "Pequenos lembretes e feedback diário pra você não perder o ritmo.",
  },
  {
    icon: TrendingUp,
    title: "Acompanhamento real da evolução",
    desc: "Acompanhe seu progresso por semana, mês e ano — sem achismo.",
  },
  {
    icon: Layout,
    title: "Experiência organizada",
    desc: "Interface intuitiva, sem ruído. Tudo onde você espera encontrar.",
  },
  {
    icon: Sparkles,
    title: "Sensação de progresso contínuo",
    desc: "Cada refeição registrada é um passo visível. Motivação que se constrói sozinha.",
  },
];

export const Benefits = () => {
  return (
    <section id="beneficios" className="landing-section">
      <div className="landing-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">Benefícios</span>
          <h2 className="landing-h2 mt-5">
            Tudo o que você precisa pra <br className="hidden sm:block" />
            <span className="accent-text">manter o foco no longo prazo</span>.
          </h2>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="landing-card group p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-secondary/40 transition-colors group-hover:border-accent/40 group-hover:bg-accent/5">
                <b.icon size={18} className="text-foreground/80 transition-colors group-hover:text-accent" />
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
