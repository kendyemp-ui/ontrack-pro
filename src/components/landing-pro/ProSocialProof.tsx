import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Dra. Helena Vieira",
    role: "Nutricionista clínica · São Paulo",
    initial: "H",
    text: "Em 3 meses minha taxa de renovação subiu de 41% para 73%. Os pacientes se sentem acompanhados de verdade — e eu não trabalho a mais por isso.",
  },
  {
    name: "Carolina Mendes",
    role: "Nutri esportiva · Curitiba",
    initial: "C",
    text: "O dashboard me mostra quem está deslizando antes do paciente sumir. Já recuperei 8 clientes que teriam abandonado em silêncio.",
  },
  {
    name: "Rafael Tavares",
    role: "Nutri funcional · Rio de Janeiro",
    initial: "R",
    text: "Saí do caderno e do WhatsApp pessoal. Agora minha operação tem cara de software de verdade — e meu ticket subiu 40%.",
  },
];

const metrics = [
  { value: "+38%", label: "Retenção média em 90 dias" },
  { value: "3.2×", label: "Mais interações/paciente" },
  { value: "+40%", label: "Aumento médio de ticket" },
  { value: "−62%", label: "Tempo gasto manualmente" },
];

export const ProSocialProof = () => {
  return (
    <section className="landing-section relative border-y border-border/60 bg-card/20">
      <div className="landing-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">Resultados</span>
          <h2 className="landing-h2 mt-5">
            Profissionais que já operam com{" "}
            <span className="pro-gradient-text">presença ativa.</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="pro-card p-6 text-center">
              <div className="font-heading text-3xl font-semibold pro-accent">{m.value}</div>
              <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="pro-card relative p-6">
              <Quote className="absolute right-5 top-5 h-6 w-6 pro-accent opacity-30" />
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground/90">"{t.text}"</p>
              <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {t.initial}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProSocialProof;
