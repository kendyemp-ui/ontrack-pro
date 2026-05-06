import { Flame, Drumstick, Wheat, Droplet, History, LineChart, Target, CheckCircle2 } from "lucide-react";
import { GroveIcon } from "@/components/GroveIcon";

/** Dashboard screen mockup */
const DashboardScreen = () => (
  <div className="phone-frame">
    <div className="phone-frame-inner aspect-[9/19.5]">
      <div className="flex items-center justify-between px-6 pt-4 text-[10px] font-semibold text-foreground/70">
        <span>9:41</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-3 rounded-sm bg-foreground/60" />
          <span className="h-2 w-4 rounded-sm border border-foreground/40" />
        </span>
      </div>
      <div className="px-5 pt-3">
        <GroveIcon size={18} wordmark wordmarkSize={12} />
      </div>
      <div className="px-6 pt-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Hoje, Quinta</p>
        <h3 className="mt-0.5 font-heading text-base font-semibold">Olá, Marina</h3>
      </div>
      <div className="mt-3 flex flex-col items-center">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="7" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--accent))" strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.74)}`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Flame className="mb-0.5 text-accent" size={13} />
            <span className="font-heading text-2xl font-bold">1.840</span>
            <span className="text-[9px] text-muted-foreground">de 2.480 kcal</span>
          </div>
        </div>
        <p className="mt-0.5 text-[10px] text-muted-foreground">74% da meta diária</p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5 px-4">
        {[
          { icon: Drumstick, label: "Proteína", value: "98", goal: "140g", pct: 70 },
          { icon: Wheat, label: "Carbs", value: "210", goal: "260g", pct: 81 },
          { icon: Droplet, label: "Gordura", value: "52", goal: "70g", pct: 74 },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border/60 bg-card/80 p-2">
            <m.icon size={10} className="text-accent" />
            <p className="mt-1 text-[8px] uppercase tracking-wide text-muted-foreground">{m.label}</p>
            <p className="mt-0.5 font-heading text-xs font-semibold">
              {m.value}<span className="text-[8px] font-normal text-muted-foreground">/{m.goal}</span>
            </p>
            <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-accent" style={{ width: `${m.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mx-4 mt-3 rounded-xl border border-border/60 bg-card/80 p-2.5">
        <p className="text-[8px] uppercase tracking-wide text-muted-foreground">Última refeição</p>
        <p className="mt-0.5 text-[10px] font-medium">Frango grelhado · arroz · brócolis</p>
        <span className="mt-1 inline-block rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] font-semibold text-accent">+520 kcal</span>
      </div>
      <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-border/60 bg-background/90 px-4 py-2 backdrop-blur">
        <div className="flex items-center justify-around text-[9px] text-muted-foreground">
          <span className="flex flex-col items-center gap-0.5 text-foreground">
            <span className="h-1 w-1 rounded-full bg-accent" />Hoje
          </span>
          <span>Refeições</span>
          <span>Evolução</span>
          <span>Perfil</span>
        </div>
      </div>
    </div>
  </div>
);

/** History screen mockup */
const HistoryScreen = () => {
  const entries = [
    { emoji: "🍳", label: "Café da manhã", time: "08:14", kcal: 420 },
    { emoji: "🥗", label: "Almoço", time: "12:38", kcal: 640 },
    { emoji: "🍌", label: "Lanche", time: "15:55", kcal: 180 },
    { emoji: "🍗", label: "Jantar", time: "19:22", kcal: 600 },
  ];
  return (
    <div className="phone-frame">
      <div className="phone-frame-inner aspect-[9/19.5]">
        <div className="flex items-center justify-between px-6 pt-4 text-[10px] font-semibold text-foreground/70">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-sm bg-foreground/60" />
            <span className="h-2 w-4 rounded-sm border border-foreground/40" />
          </span>
        </div>
        <div className="px-6 pt-3 flex items-center gap-2">
          <History size={14} className="text-accent" />
          <h3 className="font-heading text-base font-semibold">Histórico</h3>
        </div>
        <div className="px-5 pt-3 space-y-1.5">
          {entries.map((e) => (
            <div key={e.label} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/70 px-3 py-2.5">
              <span className="text-xl">{e.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium truncate">{e.label}</p>
                <p className="text-[9px] text-muted-foreground">{e.time}</p>
              </div>
              <span className="text-[11px] font-semibold tabular-nums">{e.kcal}</span>
            </div>
          ))}
          <div className="rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5 flex items-center justify-between">
            <span className="text-[10px] font-medium text-accent">Total do dia</span>
            <span className="text-[12px] font-bold text-accent">1.840 kcal</span>
          </div>
        </div>
        <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-border/60 bg-background/90 px-4 py-2 backdrop-blur">
          <div className="flex items-center justify-around text-[9px] text-muted-foreground">
            <span>Hoje</span>
            <span className="flex flex-col items-center gap-0.5 text-foreground">
              <span className="h-1 w-1 rounded-full bg-accent" />Refeições
            </span>
            <span>Evolução</span>
            <span>Perfil</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Goals screen mockup */
const GoalsScreen = () => {
  const macros = [
    { label: "Calorias", value: 2480, unit: "kcal", pct: 100 },
    { label: "Proteína", value: 140, unit: "g", pct: 80 },
    { label: "Carboidratos", value: 260, unit: "g", pct: 80 },
    { label: "Gordura", value: 70, unit: "g", pct: 75 },
  ];
  return (
    <div className="phone-frame">
      <div className="phone-frame-inner aspect-[9/19.5]">
        <div className="flex items-center justify-between px-6 pt-4 text-[10px] font-semibold text-foreground/70">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-sm bg-foreground/60" />
            <span className="h-2 w-4 rounded-sm border border-foreground/40" />
          </span>
        </div>
        <div className="px-6 pt-3 flex items-center gap-2">
          <Target size={14} className="text-accent" />
          <h3 className="font-heading text-base font-semibold">Metas</h3>
        </div>
        <div className="mx-5 mt-4 rounded-2xl border border-accent/30 bg-accent/5 p-3 text-center">
          <p className="text-[9px] uppercase tracking-wider text-accent">Objetivo atual</p>
          <p className="mt-1 text-sm font-bold text-foreground">Emagrecimento saudável</p>
          <div className="mt-1 flex items-center justify-center gap-1">
            <CheckCircle2 size={11} className="text-accent" />
            <span className="text-[10px] text-muted-foreground">Déficit de 300–500 kcal/dia</span>
          </div>
        </div>
        <div className="px-5 mt-4 space-y-3">
          {macros.map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">{m.label}</span>
                <span className="text-[11px] font-semibold">{m.value} {m.unit}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-accent" style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-border/60 bg-background/90 px-4 py-2 backdrop-blur">
          <div className="flex items-center justify-around text-[9px] text-muted-foreground">
            <span>Hoje</span>
            <span>Refeições</span>
            <span>Evolução</span>
            <span className="flex flex-col items-center gap-0.5 text-foreground">
              <span className="h-1 w-1 rounded-full bg-accent" />Perfil
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Progress / Evolution screen mockup */
const ProgressScreen = () => {
  const bars = [55, 70, 48, 80, 65, 90, 74];
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  return (
    <div className="phone-frame">
      <div className="phone-frame-inner aspect-[9/19.5]">
        <div className="flex items-center justify-between px-6 pt-4 text-[10px] font-semibold text-foreground/70">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-sm bg-foreground/60" />
            <span className="h-2 w-4 rounded-sm border border-foreground/40" />
          </span>
        </div>
        <div className="px-6 pt-3 flex items-center gap-2">
          <LineChart size={14} className="text-accent" />
          <h3 className="font-heading text-base font-semibold">Evolução</h3>
        </div>
        <div className="mx-5 mt-4 grid grid-cols-2 gap-2">
          {[
            { label: "Consistência", value: "6/7 dias", highlight: true },
            { label: "Média semanal", value: "1.920 kcal", highlight: false },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-2.5 ${s.highlight ? "border-accent/40 bg-accent/5" : "border-border/60 bg-card/60"}`}>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
              <p className={`mt-0.5 text-xs font-bold ${s.highlight ? "text-accent" : "text-foreground"}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="mx-5 mt-4 rounded-2xl border border-border/60 bg-card/60 p-3">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-3">Calorias — esta semana</p>
          <div className="flex items-end gap-1 h-20">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${h}%`,
                    background: i === 6 ? "hsl(var(--accent))" : "hsl(var(--accent) / 0.35)",
                  }}
                />
                <span className="text-[7px] text-muted-foreground">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-border/60 bg-background/90 px-4 py-2 backdrop-blur">
          <div className="flex items-center justify-around text-[9px] text-muted-foreground">
            <span>Hoje</span>
            <span>Refeições</span>
            <span className="flex flex-col items-center gap-0.5 text-foreground">
              <span className="h-1 w-1 rounded-full bg-accent" />Evolução
            </span>
            <span>Perfil</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const screens = [
  {
    component: DashboardScreen,
    title: "Dashboard principal",
    desc: "Veja seu dia inteiro em um olhar — meta, calorias, macros e última refeição.",
  },
  {
    component: HistoryScreen,
    title: "Histórico de refeições",
    desc: "Tudo o que você comeu, organizado por dia, com calorias e horários.",
  },
  {
    component: GoalsScreen,
    title: "Metas nutricionais",
    desc: "Defina objetivos diários de calorias, proteína e carboidratos sob medida.",
  },
  {
    component: ProgressScreen,
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
              <div className="relative w-full max-w-[280px]">
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 translate-y-8 scale-95 rounded-[40px] bg-accent/15 blur-3xl"
                />
                <s.component />
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
