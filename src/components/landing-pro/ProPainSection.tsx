import { Flame, TrendingDown, AlarmClock, Repeat, EyeOff, Calendar } from "lucide-react";

const pains = [
  {
    icon: Flame,
    title: "O paciente sai motivado, mas esfria em 7 dias",
    text: "Sem presença ativa entre consultas, a empolgação some, e o resultado também.",
  },
  {
    icon: TrendingDown,
    title: "Sem acompanhamento, a adesão despenca",
    text: "O plano fica no papel. Você só descobre que ele abandonou na próxima consulta, se ela acontecer.",
  },
  {
    icon: AlarmClock,
    title: "Quando você nota, já é tarde demais",
    text: "Sem visibilidade do dia a dia, não dá para corrigir a rota antes do paciente sumir.",
  },
  {
    icon: EyeOff,
    title: "Você não vê o que acontece entre consultas",
    text: "Refeições, pesos, sintomas, dúvidas, tudo se perde em conversas soltas no WhatsApp pessoal.",
  },
  {
    icon: Repeat,
    title: "Você vira refém de repor agenda",
    text: "Sem retenção, todo mês começa do zero. Mais esforço comercial, menos previsibilidade.",
  },
  {
    icon: Calendar,
    title: "Sua agenda não escala",
    text: "Atender mais pacientes vira sinônimo de trabalhar mais horas, não de operar melhor.",
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

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pains.map((p) => (
            <div key={p.title} className="pro-card p-6">
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

        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-border/60 bg-card/60 p-6 text-center backdrop-blur sm:p-8">
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
