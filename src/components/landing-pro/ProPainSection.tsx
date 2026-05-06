import { TrendingDown, EyeOff, Repeat } from "lucide-react";

const pains = [
  {
    icon: EyeOff,
    title: "Você não sabe se o paciente está seguindo",
    text: "Sem visibilidade entre as consultas, você só descobre que ele abandonou o plano quando ele some da agenda.",
  },
  {
    icon: TrendingDown,
    title: "Adesão cai, retorno também",
    text: "Paciente que não segue a dieta não vê resultado, não volta. E sem retorno, você repõe agenda o tempo todo.",
  },
  {
    icon: Repeat,
    title: "Todo mês começa do zero",
    text: "Sem retenção, a maior parte do esforço vai para prospecção. Menos tempo para quem já é paciente.",
  },
];

export const ProPainSection = () => {
  return (
    <section id="dor" className="landing-section relative">
      <div className="landing-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">O problema real</span>
          <h2 className="landing-h2 mt-5">
            Acompanhar mal{" "}
            <span className="text-destructive">custa retenção.</span>
          </h2>
          <p className="landing-lead mt-5">
            A consulta é só 1 hora por mês. Os outros 29 dias decidem se o paciente volta, ou some.
            Sem presença nesse intervalo, você está construindo uma operação que precisa repor
            cliente o tempo inteiro.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:mt-12 md:grid-cols-3">
          {pains.map((p) => (
            <div key={p.title} className="pro-card p-5 sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
                <p.icon size={18} strokeWidth={2.2} />
              </div>
              <h3 className="mt-5 font-heading text-base font-semibold tracking-tight">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-border/60 bg-card/60 p-5 text-center backdrop-blur sm:mt-12 sm:p-8">
          <p className="text-base font-medium text-foreground sm:text-lg">
            "Seu maior gargalo não é prospecção. É a quantidade de pacientes que{" "}
            <span className="pro-accent">abandonam silenciosamente</span> entre uma consulta e outra."
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProPainSection;
