import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Como funciona o OnTrack App?",
    a: "Você registra suas refeições no app, ele calcula automaticamente calorias, proteína e carboidratos, e mostra sua evolução em gráficos claros. É como ter um diário inteligente da sua rotina alimentar, sem planilha, sem complicação.",
  },
  {
    q: "Preciso de nutricionista para usar?",
    a: "Não. O OnTrack foi desenhado pra você usar sozinho, com metas e feedback automáticos. Mas se você já trabalha com um profissional, o app facilita o acompanhamento, você pode compartilhar seu histórico facilmente.",
  },
  {
    q: "Consigo acompanhar minha evolução ao longo do tempo?",
    a: "Sim. O app mostra sua evolução por semana, mês e ano, com gráficos de calorias, macros e consistência. Você vê exatamente onde está progredindo e onde precisa ajustar.",
  },
  {
    q: "O app mostra calorias e macros das refeições?",
    a: "Sim. Toda refeição registrada exibe calorias totais, proteína, carboidratos e gordura. Tudo calculado automaticamente, em tempo real.",
  },
  {
    q: "Posso mudar de plano depois?",
    a: "Pode, a qualquer momento. Você pode fazer upgrade do mensal pro anual, ou mudar entre planos quando precisar. Sem multa, sem burocracia.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "O pagamento é processado pela Kiwify, com total segurança. Você pode pagar com cartão de crédito, Pix ou boleto. O acesso é liberado automaticamente após a confirmação.",
  },
  {
    q: "Posso cancelar a assinatura?",
    a: "Sim, sem fidelidade. Você cancela quando quiser direto pelo painel da Kiwify, e mantém o acesso até o fim do período pago.",
  },
  {
    q: "O app funciona em iPhone e Android?",
    a: "Sim. O OnTrack funciona em qualquer celular ou computador, direto pelo navegador. Não precisa instalar nada.",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="landing-section">
      <div className="landing-container">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <span className="landing-eyebrow">Perguntas frequentes</span>
            <h2 className="landing-h2 mt-5">Ainda tem dúvidas?</h2>
            <p className="landing-lead mt-5">
              Reunimos as perguntas mais comuns. Se a sua não estiver aqui, fale com a gente.
            </p>
          </div>

          <Accordion type="single" collapsible className="mt-8 w-full sm:mt-12">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-border/60"
              >
                <AccordionTrigger className="py-5 text-left font-heading text-base font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
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

export default FAQ;
