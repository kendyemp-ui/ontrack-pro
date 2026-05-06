import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Marina S.",
    role: "Usuária há 6 meses",
    quote:
      "Pela primeira vez consegui manter o registro por mais de 30 dias seguidos. A clareza visual faz toda a diferença.",
    rating: 5,
  },
  {
    name: "Rafael C.",
    role: "Usuário há 4 meses",
    quote:
      "Eu testei vários apps e desisti de todos. O Grove é o único que não me cansa, em 30 segundos eu registro tudo.",
    rating: 5,
  },
  {
    name: "Juliana M.",
    role: "Usuária há 8 meses",
    quote:
      "Os gráficos de evolução são o que me mantém motivada. Ver o progresso real mudou minha relação com a alimentação.",
    rating: 5,
  },
  {
    name: "Pedro L.",
    role: "Usuário há 3 meses",
    quote:
      "Simples, bonito e direto ao ponto. Sem firula, sem coach chato. Só o que eu preciso pra acompanhar.",
    rating: 5,
  },
  {
    name: "Camila R.",
    role: "Usuária há 5 meses",
    quote:
      "Os alertas inteligentes me ajudam a corrigir o curso antes do fim do dia. Resultado: muito mais consistência.",
    rating: 5,
  },
  {
    name: "Bruno T.",
    role: "Usuário há 7 meses",
    quote:
      "Perdi 9kg em 5 meses só por ter clareza do que eu comia. Não tem segredo, é constância, e o app entrega isso.",
    rating: 5,
  },
];

export const SocialProof = () => {
  return (
    <section className="landing-section relative bg-card/30">
      <div className="landing-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">Quem usa, recomenda</span>
          <h2 className="landing-h2 mt-5">
            Histórias reais de <br className="hidden sm:block" />
            <span className="accent-text">evolução real</span>.
          </h2>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-accent text-accent" />
              ))}
            </div>
            <span className="font-semibold">4.9</span>
            <span className="text-muted-foreground">média de avaliações</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-12 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className={`landing-card p-5 sm:p-7 ${i >= 3 ? "hidden md:flex md:flex-col" : "flex flex-col"}`}
            >
              <Quote size={20} className="text-accent/60" />
              <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-foreground/90">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 flex items-center justify-between border-t border-border/40 pt-5">
                <div>
                  <p className="font-heading text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <div className="flex">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={12} className="fill-accent text-accent" />
                  ))}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
