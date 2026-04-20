import { Link } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  patients: string;
  price: string;
  perPatient: string;
  description: string;
  cta: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
};

const plans: Plan[] = [
  {
    name: "Teste",
    patients: "Até 5 pacientes",
    price: "Grátis",
    perPatient: "Sem custo",
    description: "Para validar a plataforma com sua carteira inicial.",
    cta: "Começar grátis",
    features: [
      "Dashboard completo",
      "Integração WhatsApp",
      "Alertas de risco",
      "Histórico de pacientes",
    ],
  },
  {
    name: "Start",
    patients: "Até 10 pacientes",
    price: "R$ 199,90",
    perPatient: "≈ R$ 19,99 / paciente",
    description: "Para nutricionistas em crescimento estruturando a carteira.",
    cta: "Assinar Start",
    features: [
      "Tudo do Teste",
      "Métricas avançadas",
      "Comparativo por período",
      "Suporte prioritário",
    ],
  },
  {
    name: "Scale",
    patients: "Até 30 pacientes",
    price: "R$ 398,90",
    perPatient: "≈ R$ 13,30 / paciente",
    description: "Para quem já tem carteira consolidada e quer escalar atendimento.",
    cta: "Assinar Scale",
    features: [
      "Tudo do Start",
      "Relatórios em PDF",
      "Tags e segmentação",
      "Exportação de dados",
    ],
  },
  {
    name: "Pro",
    patients: "Até 50 pacientes",
    price: "R$ 499,90",
    perPatient: "≈ R$ 9,98 / paciente",
    description: "Maior carteira, menor custo por paciente. A operação madura.",
    cta: "Assinar Pro",
    features: [
      "Tudo do Scale",
      "Multi-canal WhatsApp",
      "Gestor de conta dedicado",
      "Onboarding assistido",
    ],
    highlighted: true,
    badge: "Melhor custo-benefício",
  },
];

export const ProPricing = () => {
  return (
    <section id="planos" className="landing-section relative">
      <div className="pointer-events-none absolute inset-x-0 top-1/4 h-96 opacity-30 blur-[120px]"
        style={{ background: "radial-gradient(ellipse at center, hsl(174 72% 56% / 0.4), transparent 60%)" }}
        aria-hidden
      />
      <div className="landing-container relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">Planos</span>
          <h2 className="landing-h2 mt-5">
            Quanto maior o plano,{" "}
            <span className="pro-gradient-text">menor o custo por paciente.</span>
          </h2>
          <p className="landing-lead mt-5">
            O OnTrack Pro é uma alavanca de receita, não um custo. Mais retenção paga a assinatura
            várias vezes em qualquer plano.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card/70 p-6 backdrop-blur transition-all",
                plan.highlighted
                  ? "border-accent/60 pro-glow"
                  : "border-border/60 hover:border-border"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full border pro-border-accent pro-bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-black">
                    <Sparkles size={11} /> {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <h3 className="font-heading text-lg font-semibold tracking-tight">{plan.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{plan.patients}</p>
              </div>

              <div className="mt-5">
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-3xl font-semibold tracking-tight">
                    {plan.price}
                  </span>
                  {plan.price !== "Grátis" && (
                    <span className="text-xs text-muted-foreground">/ mês</span>
                  )}
                </div>
                <div className="mt-1 text-[11px] pro-accent">{plan.perPatient}</div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {plan.description}
              </p>

              <ul className="mt-5 space-y-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={15} className="mt-0.5 shrink-0 pro-accent" />
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  "mt-7 h-11",
                  plan.highlighted
                    ? "pro-bg-accent text-black hover:opacity-90"
                    : "bg-foreground text-background hover:bg-foreground/90"
                )}
              >
                <Link to={`/pro/cadastro?plano=${plan.name.toLowerCase()}`}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
          Sem fidelidade · Cancele quando quiser · Pagamento mensal recorrente · Migre de plano a qualquer momento
        </p>
      </div>
    </section>
  );
};

export default ProPricing;
