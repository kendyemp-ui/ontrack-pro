import { UserPlus, MessageCircle, Database, LineChart } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: UserPlus,
    title: "Você cadastra os pacientes",
    text: "Importa sua carteira em minutos. Cada paciente recebe acesso ao canal automatizado de WhatsApp.",
  },
  {
    n: "02",
    icon: MessageCircle,
    title: "Eles interagem pelo WhatsApp",
    text: "Refeições, fotos, peso, sintomas. O paciente continua usando o canal que ele já abre 100 vezes por dia.",
  },
  {
    n: "03",
    icon: Database,
    title: "A plataforma organiza tudo",
    text: "IA estrutura cada mensagem em dados nutricionais, calcula adesão e cria o histórico do paciente.",
  },
  {
    n: "04",
    icon: LineChart,
    title: "Você acompanha no dashboard",
    text: "Carteira inteira em uma tela. Alertas de risco, evolução individual e prontuário sempre atualizado.",
  },
];

export const ProHowItWorks = () => {
  return (
    <section id="como-funciona" className="landing-section">
      <div className="landing-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">Como funciona</span>
          <h2 className="landing-h2 mt-5">Da consulta ao dashboard, em 4 passos.</h2>
          <p className="landing-lead mt-5">
            Você cuida do paciente. O OnTrack Pro cuida do acompanhamento entre as consultas.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, idx) => (
            <div key={s.n} className="relative pro-card p-6">
              <div className="flex items-center justify-between">
                <span className="font-heading text-3xl font-semibold text-muted-foreground/30">
                  {s.n}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border pro-border-accent bg-accent/5 pro-accent">
                  <s.icon size={18} strokeWidth={2.2} />
                </div>
              </div>
              <h3 className="mt-6 font-heading text-base font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              {idx < steps.length - 1 && (
                <div
                  className="pointer-events-none absolute right-[-10px] top-1/2 hidden h-px w-5 -translate-y-1/2 lg:block"
                  style={{ background: "hsl(174 72% 56% / 0.4)" }}
                  aria-hidden
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProHowItWorks;
