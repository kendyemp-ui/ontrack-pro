import { TrendingUp, Repeat2, Eye, Clock, Briefcase, DollarSign, Sparkles, Users } from "lucide-react";

const benefits = [
  { icon: TrendingUp, title: "Mais retenção de clientes", text: "Acompanhamento contínuo aumenta o ciclo de vida do paciente." },
  { icon: Repeat2, title: "Mais recorrência", text: "Pacientes que sentem presença renovam pacote sem você precisar cobrar." },
  { icon: Users, title: "Relacionamento ativo", text: "Você está presente no dia a dia, não só uma vez por mês." },
  { icon: Eye, title: "Visibilidade real da adesão", text: "Veja quem está cumprindo o plano em tempo real, sem perguntar." },
  { icon: Clock, title: "Menos esforço manual", text: "A IA centraliza, organiza e categoriza. Você só atua onde precisa." },
  { icon: Briefcase, title: "Carteira mais organizada", text: "Tudo em um lugar: histórico, evolução, alertas e contatos." },
  { icon: DollarSign, title: "Mais previsibilidade de receita", text: "Mais retenção significa MRR maior e menos dependência de agenda nova." },
  { icon: Sparkles, title: "Mais percepção de valor", text: "Atendimento contínuo justifica ticket mais alto e diferencia o consultório." },
];

export const ProBenefits = () => {
  return (
    <section id="beneficios" className="landing-section">
      <div className="landing-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">Benefícios</span>
          <h2 className="landing-h2 mt-5">
            O que muda na sua operação com{" "}
            <span className="pro-gradient-text">presença ativa.</span>
          </h2>
        </div>

        <div className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <div key={b.title} className={`pro-card p-4 sm:p-5 ${i >= 4 ? "hidden sm:block" : ""}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-background pro-accent">
                <b.icon size={17} strokeWidth={2.2} />
              </div>
              <h3 className="mt-5 font-heading text-sm font-semibold tracking-tight">
                {b.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProBenefits;
