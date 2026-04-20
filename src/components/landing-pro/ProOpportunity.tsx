import { TrendingUp, Heart, BarChart3, ShieldCheck, Repeat2, Sparkles } from "lucide-react";

const points = [
  { icon: Heart, label: "Mais engajamento", text: "Paciente sente presença diária, não só mensal." },
  { icon: BarChart3, label: "Mais visibilidade", text: "Você vê adesão real, não promessa de consulta." },
  { icon: ShieldCheck, label: "Menos abandono", text: "Corrige desvios antes do paciente desistir." },
  { icon: Repeat2, label: "Mais recorrência", text: "Quem sente acompanhamento, renova o pacote." },
  { icon: TrendingUp, label: "Mais previsibilidade", text: "Sua receita deixa de depender só de agenda nova." },
  { icon: Sparkles, label: "Mais percepção de valor", text: "Atendimento contínuo justifica ticket mais alto." },
];

export const ProOpportunity = () => {
  return (
    <section className="landing-section relative border-y border-border/60 bg-card/20">
      <div className="pointer-events-none absolute inset-0 pro-grid-bg opacity-50" aria-hidden />
      <div className="landing-container relative">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <span className="landing-eyebrow">A virada de chave</span>
            <h2 className="landing-h2 mt-5">
              Retenção é <span className="pro-gradient-text">crescimento.</span>
            </h2>
            <p className="landing-lead mt-5">
              Profissionais que mantêm relacionamento ativo entre consultas têm uma operação
              completamente diferente: clientes que renovam, indicam e percebem o valor do
              acompanhamento — não só do plano alimentar.
            </p>
            <p className="landing-lead mt-4">
              O OnTrack Pro automatiza essa presença para você, transformando dados do dia a dia
              em ação concreta dentro do consultório.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur">
              <div>
                <div className="text-2xl font-semibold pro-accent">+38%</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Retenção 90d
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-foreground">3.2×</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Mais interações
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-foreground">−62%</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Tempo manual
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {points.map((p) => (
              <div key={p.label} className="pro-card p-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-background pro-accent">
                    <p.icon size={15} strokeWidth={2.2} />
                  </div>
                  <h3 className="font-heading text-sm font-semibold">{p.label}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProOpportunity;
