import { Flame, Drumstick, Wheat, Droplet } from "lucide-react";
import { cn } from "@/lib/utils";

interface NutritionRingProps {
  consumed: number;
  goal: number;
  protein: { current: number; goal: number };
  carbs: { current: number; goal: number };
  fats?: { current: number; goal: number };
  size?: "md" | "lg";
}

/**
 * Ring + macros visualization shared between landing hero and dashboard.
 * Shows a big circular ring with calories consumed vs goal, plus three macro cards below.
 */
export const NutritionRing = ({
  consumed,
  goal,
  protein,
  carbs,
  fats,
  size = "lg",
}: NutritionRingProps) => {
  const pct = Math.min(consumed / Math.max(goal, 1), 1);
  const remaining = Math.max(goal - consumed, 0);
  const exceeded = consumed > goal;

  const ringSize = size === "lg" ? "h-56 w-56 sm:h-64 sm:w-64" : "h-44 w-44";
  const strokeW = 7;
  const r = 42;
  const circ = 2 * Math.PI * r;

  const macros = [
    {
      icon: Drumstick,
      label: "Proteína",
      current: protein.current,
      goalVal: protein.goal,
      unit: "g",
    },
    {
      icon: Wheat,
      label: "Carbs",
      current: carbs.current,
      goalVal: carbs.goal,
      unit: "g",
    },
    ...(fats
      ? [
          {
            icon: Droplet,
            label: "Gordura",
            current: fats.current,
            goalVal: fats.goal,
            unit: "g",
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Ring */}
      <div className={cn("relative", ringSize)}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth={strokeW}
          />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={exceeded ? "hsl(var(--destructive))" : "hsl(var(--accent))"}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Flame size={18} className="mb-1 text-accent" />
          <span className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            {consumed.toLocaleString("pt-BR")}
          </span>
          <span className="text-[11px] text-muted-foreground">
            de {goal.toLocaleString("pt-BR")} kcal
          </span>
        </div>
      </div>

      {/* Remaining */}
      <p className="mt-3 text-xs text-muted-foreground">
        {exceeded ? (
          <>
            <span className="font-semibold text-destructive">
              +{(consumed - goal).toLocaleString("pt-BR")} kcal
            </span>{" "}
            acima da meta
          </>
        ) : (
          <>
            Faltam{" "}
            <span className="font-semibold text-foreground">
              {remaining.toLocaleString("pt-BR")} kcal
            </span>{" "}
            para sua meta
          </>
        )}
      </p>

      {/* Macros */}
      <div className="mt-6 grid w-full grid-cols-3 gap-2.5">
        {macros.map((m) => {
          const macroPct = Math.min(m.current / Math.max(m.goalVal, 1), 1) * 100;
          const macroRemaining = Math.max(m.goalVal - m.current, 0);
          const macroExceeded = m.current > m.goalVal;
          return (
            <div
              key={m.label}
              className="rounded-xl border border-border/60 bg-card/80 p-3"
            >
              <div className="flex items-center gap-1.5">
                <m.icon size={12} className="text-accent" />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </p>
              </div>
              <p className="mt-1.5 font-heading text-base font-semibold leading-none">
                {m.current}
                <span className="text-[10px] font-normal text-muted-foreground">
                  /{m.goalVal}
                  {m.unit}
                </span>
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    macroExceeded ? "bg-destructive" : "bg-accent"
                  )}
                  style={{ width: `${macroPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-[9px] text-muted-foreground">
                {macroExceeded
                  ? `+${m.current - m.goalVal}${m.unit} excedido`
                  : `Faltam ${macroRemaining}${m.unit}`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NutritionRing;
