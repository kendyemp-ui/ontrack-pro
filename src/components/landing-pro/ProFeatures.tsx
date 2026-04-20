import {
  LayoutDashboard,
  UsersRound,
  Activity,
  AlertTriangle,
  History,
  MessageSquareText,
  MessagesSquare,
  CalendarRange,
  LineChart,
  Watch,
} from "lucide-react";

const features = [
  { icon: LayoutDashboard, title: "Dashboard da carteira", text: "Todos os pacientes em uma tela, com KPIs de adesão, risco e movimento." },
  { icon: UsersRound, title: "Cadastro de pacientes", text: "Importe ou cadastre individualmente, com metas e plano de cada um." },
  { icon: Activity, title: "Visão de adesão", text: "Saiba quem cumpriu, quem deslizou e quem precisa de atenção hoje." },
  { icon: AlertTriangle, title: "Alertas de risco", text: "A plataforma detecta queda de adesão e te avisa antes do abandono." },
  { icon: History, title: "Histórico do paciente", text: "Prontuário sempre atualizado: refeições, pesos, sintomas e interações." },
  { icon: MessageSquareText, title: "Timeline de interações", text: "Linha do tempo de tudo que aconteceu no canal, organizado por data." },
  { icon: MessagesSquare, title: "Integração com WhatsApp", text: "Canal automático para o paciente registrar refeições por mensagem ou foto." },
  { icon: CalendarRange, title: "Acompanhamento por período", text: "Compare semanas e meses para ver evolução real, não só sensação." },
  { icon: LineChart, title: "Evolução individual", text: "Curvas de peso, calorias, macros e adesão para cada paciente." },
  { icon: Watch, title: "Wearables (em breve)", text: "Integração com smartwatches e balanças inteligentes para dados objetivos." },
];

export const ProFeatures = () => {
  return (
    <section id="funcionalidades" className="landing-section relative border-y border-border/60 bg-card/20">
      <div className="landing-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">Funcionalidades</span>
          <h2 className="landing-h2 mt-5">
            Toda a sua carteira em uma{" "}
            <span className="pro-gradient-text">única plataforma.</span>
          </h2>
          <p className="landing-lead mt-5">
            Pensado para nutricionistas que querem operar como SaaS: previsível, escalável e
            visualmente claro.
          </p>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {features.map((f) => (
            <div key={f.title} className="pro-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border pro-border-accent bg-accent/5 pro-accent">
                <f.icon size={17} strokeWidth={2.2} />
              </div>
              <h3 className="mt-5 font-heading text-sm font-semibold tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProFeatures;
