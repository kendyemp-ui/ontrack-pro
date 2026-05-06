import { Flame, Drumstick, Wheat, Droplet } from "lucide-react";
import { GroveIcon } from "@/components/GroveIcon";

/**
 * Pure CSS phone mockup that matches the real app dashboard.
 * Used in the hero so it loads instantly without an image roundtrip.
 */
export const HeroMockup = () => {
  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      {/* Glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 translate-y-10 scale-110 rounded-full bg-accent/20 blur-3xl"
      />

      <div className="phone-frame">
        <div className="phone-frame-inner aspect-[9/19.5]">
          {/* status bar */}
          <div className="flex items-center justify-between px-6 pt-4 text-[10px] font-semibold text-foreground/70">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-3 rounded-sm bg-foreground/60" />
              <span className="h-2 w-4 rounded-sm border border-foreground/40" />
            </span>
          </div>

          {/* grove header */}
          <div className="px-5 pt-3">
            <GroveIcon size={20} wordmark wordmarkSize={13} />
          </div>

          {/* greeting */}
          <div className="px-6 pt-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Hoje, Quinta</p>
            <h3 className="mt-1 font-heading text-lg font-semibold">Olá, Marina</h3>
          </div>

          {/* ring */}
          <div className="mt-4 flex flex-col items-center">
            <div className="relative h-44 w-44">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="7"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.74)}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Flame className="mb-1 text-accent" size={16} />
                <span className="font-heading text-3xl font-bold">1.840</span>
                <span className="text-[10px] text-muted-foreground">de 2.480 kcal</span>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">74% da meta diária</p>
          </div>

          {/* macro cards */}
          <div className="mt-5 grid grid-cols-3 gap-2 px-5">
            {[
              { icon: Drumstick, label: "Proteína", value: "98", goal: "140g", pct: 70 },
              { icon: Wheat, label: "Carbs", value: "210", goal: "260g", pct: 81 },
              { icon: Droplet, label: "Gordura", value: "52", goal: "70g", pct: 74 },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-border/60 bg-card/80 p-2.5">
                <m.icon size={12} className="text-accent" />
                <p className="mt-1.5 text-[9px] uppercase tracking-wide text-muted-foreground">
                  {m.label}
                </p>
                <p className="mt-0.5 font-heading text-sm font-semibold">
                  {m.value}
                  <span className="text-[9px] font-normal text-muted-foreground">/{m.goal}</span>
                </p>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* recent meal */}
          <div className="mx-5 mt-4 rounded-xl border border-border/60 bg-card/80 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                  Última refeição
                </p>
                <p className="mt-0.5 text-xs font-medium">Frango grelhado · arroz · brócolis</p>
              </div>
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                +520 kcal
              </span>
            </div>
          </div>

          {/* tab bar */}
          <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-border/60 bg-background/90 px-4 py-2 backdrop-blur">
            <div className="flex items-center justify-around text-[10px] text-muted-foreground">
              <span className="flex flex-col items-center gap-0.5 text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Hoje
              </span>
              <span>Refeições</span>
              <span>Evolução</span>
              <span>Perfil</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
