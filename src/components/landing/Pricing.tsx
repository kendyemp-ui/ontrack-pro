import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// TODO: Substituir pelas URLs reais do checkout Kiwify
const KIWIFY_URLS = {
  monthly: "https://pay.kiwify.com.br/Zb94IHu",
  semestral: "https://pay.kiwify.com.br/KhI5ohM",
  annual: "https://pay.kiwify.com.br/ICu9X66",
};

const plans = [
  {
    id: "monthly",
    name: "Mensal",
    badge: null,
    price: "R$ 29,90",
    period: "/mês",
    equivalent: "Cobrado mensalmente",
    cta: "Assinar plano mensal",
    href: KIWIFY_URLS.monthly,
    highlight: false,
    features: [
      "Acesso completo ao Grove App",
      "Dashboard nutricional diário",
      "Histórico ilimitado de refeições",
      "Metas personalizadas",
      "Cancele quando quiser",
    ],
  },
  {
    id: "semestral",
    name: "Semestral",
    badge: "Intermediário",
    price: "R$ 149,90",
    period: "/6 meses",
    equivalent: "Equivalente a R$ 24,98/mês",
    cta: "Assinar plano semestral",
    href: KIWIFY_URLS.semestral,
    highlight: false,
    features: [
      "Tudo do plano Mensal",
      "16% de economia",
      "Acompanhamento contínuo de 6 meses",
      "Acesso prioritário a novidades",
    ],
  },
  {
    id: "annual",
    name: "Anual",
    badge: "Melhor custo-benefício",
    price: "R$ 249,90",
    period: "/ano",
    equivalent: "Equivalente a R$ 20,82/mês",
    cta: "Assinar plano anual",
    href: KIWIFY_URLS.annual,
    highlight: true,
    features: [
      "Tudo do plano Semestral",
      "30% de economia",
      "1 ano completo de evolução",
      "Acesso antecipado a integrações WhatsApp e wearables",
      "Suporte prioritário",
    ],
  },
];

export const Pricing = () => {
  return (
    <section id="planos" className="landing-section">
      <div className="landing-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">Planos</span>
          <h2 className="landing-h2 mt-5">
            Comece hoje. <br className="hidden sm:block" />
            <span className="text-muted-foreground">Escolha o ritmo da sua evolução.</span>
          </h2>
          <p className="landing-lead mt-5">
            Sem fidelidade. Cancele quando quiser. Acesso imediato após o pagamento.
          </p>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8 transition-all",
                plan.highlight
                  ? "border-accent/60 bg-gradient-to-b from-accent/[0.08] to-card shadow-[0_0_60px_-20px_hsl(var(--accent)/0.4)] lg:scale-[1.03]"
                  : "border-border/60 bg-card/60"
              )}
            >
              {plan.badge && (
                <span
                  className={cn(
                    "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest",
                    plan.highlight
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {plan.highlight && <Sparkles size={10} className="-mt-px mr-1 inline" />}
                  {plan.badge}
                </span>
              )}

              <h3 className="font-heading text-xl font-semibold">{plan.name}</h3>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-heading text-5xl font-bold tracking-tight">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{plan.equivalent}</p>

              <ul className="mt-7 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                        plan.highlight ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"
                      )}
                    >
                      <Check size={10} strokeWidth={3} />
                    </span>
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                variant={plan.highlight ? "default" : "outline"}
                className="mt-8 h-12 w-full text-sm font-semibold"
              >
                <a href={plan.href} target="_blank" rel="noopener noreferrer">
                  {plan.cta}
                </a>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Pagamento seguro processado pela Kiwify · Cartão, Pix e boleto
        </p>
      </div>
    </section>
  );
};

export default Pricing;
