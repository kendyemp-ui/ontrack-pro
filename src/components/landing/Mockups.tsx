import dashboard from "@/assets/landing/mockup-dashboard.png";
import history from "@/assets/landing/mockup-history.png";
import goals from "@/assets/landing/mockup-goals.png";
import progress from "@/assets/landing/mockup-progress.png";

const screens = [
  {
    img: dashboard,
    title: "Dashboard principal",
    desc: "Veja seu dia inteiro em um olhar, meta, calorias, macros e última refeição.",
  },
  {
    img: history,
    title: "Histórico de refeições",
    desc: "Tudo o que você comeu, organizado por dia, com calorias e horários.",
  },
  {
    img: goals,
    title: "Metas nutricionais",
    desc: "Defina objetivos diários de calorias, proteína e carboidratos sob medida.",
  },
  {
    img: progress,
    title: "Tela de evolução",
    desc: "Gráficos semanais e mensais que mostram seu progresso real.",
  },
];

export const Mockups = () => {
  return (
    <section className="landing-section relative overflow-hidden">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[140px]"
      />
      <div className="landing-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">O produto</span>
          <h2 className="landing-h2 mt-5">
            Bonito de ver. <br className="hidden sm:block" />
            <span className="text-muted-foreground">Fácil de usar.</span>
          </h2>
          <p className="landing-lead mt-5">
            Cada tela foi desenhada pra entregar a informação certa no momento certo,
            sem te sobrecarregar.
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:mt-16 md:grid-cols-2 md:gap-12 lg:gap-16">
          {screens.map((s, i) => (
            <div
              key={s.title}
              className={`flex-col items-center text-center ${i >= 2 ? "hidden md:flex" : "flex"}${i % 2 === 1 ? " md:mt-16" : ""}`}
            >
              <div className="relative w-full max-w-[340px]">
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 translate-y-8 scale-95 rounded-[40px] bg-accent/15 blur-3xl"
                />
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  width={1024}
                  height={1280}
                  className="w-full drop-shadow-2xl"
                />
              </div>
              <h3 className="landing-h3 mt-6">{s.title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Mockups;
