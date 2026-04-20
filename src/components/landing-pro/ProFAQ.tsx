import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Como funciona o OnTrack Pro?",
    a: "Você cadastra seus pacientes na plataforma. Eles passam a interagir com um canal automatizado de WhatsApp registrando refeições, fotos, peso e sintomas. A plataforma estrutura tudo isso em dados e te entrega no dashboard com alertas, histórico e visão de adesão por paciente.",
  },
  {
    q: "Serve só para nutricionistas?",
    a: "Foi desenhado para nutricionistas, mas funciona para qualquer profissional da saúde que precise acompanhar rotina entre consultas: endocrinologistas, médicos do esporte, personal trainers e profissionais de longevidade.",
  },
  {
    q: "Preciso ter número oficial de WhatsApp Business?",
    a: "Não. O OnTrack Pro fornece o canal automatizado. Você não precisa expor seu número pessoal nem contratar API oficial separadamente, já está incluso na assinatura.",
  },
  {
    q: "Posso testar antes de pagar?",
    a: "Sim. O plano Teste é gratuito para até 5 pacientes, sem cartão de crédito e sem limite de tempo. Use para validar com a sua própria carteira.",
  },
  {
    q: "Como funciona o limite de pacientes do plano?",
    a: "Cada plano tem um teto de pacientes ativos simultâneos. Você pode arquivar pacientes inativos a qualquer momento para abrir espaço no plano, sem perder o histórico deles.",
  },
  {
    q: "Posso migrar de plano depois?",
    a: "Sim, a qualquer momento, sem fidelidade. O upgrade é imediato e o downgrade vale na próxima cobrança. Você só paga proporcional ao uso.",
  },
  {
    q: "O que acontece se eu ultrapassar o limite do plano?",
    a: "Você recebe um aviso ao se aproximar do teto. Se ultrapassar, sugerimos um upgrade. Nenhum paciente é desativado sem o seu consentimento.",
  },
  {
    q: "Como o OnTrack Pro ajuda na retenção dos meus clientes?",
    a: "Aumentando a presença entre consultas. Acompanhamento contínuo eleva percepção de valor, gera engajamento diário e te dá visibilidade para corrigir desvios antes do abandono. Resultado: mais renovação, mais indicação e mais previsibilidade de receita.",
  },
];

export const ProFAQ = () => {
  return (
    <section id="faq" className="landing-section">
      <div className="landing-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">Perguntas frequentes</span>
          <h2 className="landing-h2 mt-5">Tudo que você precisa saber.</h2>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-border/60 bg-card/60 px-5 backdrop-blur data-[state=open]:border-accent/40"
              >
                <AccordionTrigger className="py-4 text-left text-sm font-semibold hover:no-underline sm:text-base">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default ProFAQ;
