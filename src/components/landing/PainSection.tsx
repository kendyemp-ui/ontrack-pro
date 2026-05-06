import { BarChart3, Repeat } from "lucide-react";

const pains = [
  {
    icon: BarChart3,
    title: "Calcular caloria por caloria parece impossível",
    desc: "Você sabe que precisa controlar, mas abrir tabela nutricional pra cada refeição não é vida. Então desiste.",
  },
  {
    icon: Repeat,
    title: "Começa na segunda, abandona na quinta",
    desc: "Sem visibilidade do que já consumiu, fica difícil manter o foco. E sem foco, a rotina volta ao caos.",
  },
];

export const PainSection = () => {
  return (
    <section className="landing-section relative">
      <div className="landing-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="landing-h2">
            Sem o número, é chute.{" "}
            <span className="text-muted-foreground">Com o número, é controle.</span>
          </h2>
          <p className="landing-lead mt-5">
            A maioria das pessoas não falha por falta de vontade — falha porque contar caloria de cabeça é inviável.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 max-w-3xl mx-auto">
          {pains.map((p) => (
            <div key={p.title} className="landing-card p-6 sm:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-secondary/40">
                <p.icon size={18} className="text-muted-foreground" />
              </div>
              <h3 className="font-heading text-base font-semibold leading-snug mt-4">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainSection;
