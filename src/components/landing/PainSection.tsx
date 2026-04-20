import { Frown, TrendingDown, EyeOff, Repeat, BarChart3 } from "lucide-react";

const pains = [
  {
    icon: EyeOff,
    title: "Você não sabe exatamente como está se alimentando",
    desc: "Comer no automático, sem registro, sem clareza. No fim do dia, fica a dúvida: comi bem ou não?",
  },
  {
    icon: Repeat,
    title: "Começa firme na segunda e perde o ritmo na quinta",
    desc: "A motivação some, o foco se dispersa e a rotina volta ao caos. Sem ferramenta, é fácil largar.",
  },
  {
    icon: BarChart3,
    title: "Sem ideia de calorias, proteína ou carboidratos",
    desc: "Você sabe que precisa controlar, mas calcular cada refeição parece um trabalho que ninguém aguenta.",
  },
  {
    icon: TrendingDown,
    title: "Não consegue enxergar a sua evolução",
    desc: "Sem acompanhamento real, parece que nada muda. E quando não vemos progresso, desistimos.",
  },
];

export const PainSection = () => {
  return (
    <section className="landing-section relative">
      <div className="landing-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">
            <Frown size={12} />
            Soa familiar?
          </span>
          <h2 className="landing-h2 mt-5">
            Você não está sozinho. <br className="hidden sm:block" />
            <span className="text-muted-foreground">Manter constância é o mais difícil.</span>
          </h2>
          <p className="landing-lead mt-5">
            A maioria das pessoas falha não por falta de vontade — mas por falta de uma
            ferramenta que torne o acompanhamento simples o suficiente para ser sustentável.
          </p>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2">
          {pains.map((p) => (
            <div key={p.title} className="landing-card p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-secondary/40">
                  <p.icon size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold leading-snug">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainSection;
