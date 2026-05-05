import { Check, Circle, AlertTriangle, MessageCircle, TrendingUp, Image as ImageIcon } from "lucide-react";

/* CSS-only "real component" mockups, sharp, no AI text artifacts */

const PatientRow = ({
  name,
  goal,
  status,
  adherence,
  meals,
}: {
  name: string;
  goal: string;
  status: "ok" | "atencao" | "risco";
  adherence: number;
  meals: string;
}) => {
  const dot = {
    ok: "bg-emerald-400",
    atencao: "bg-amber-400",
    risco: "bg-red-400",
  }[status];
  const initial = name[0];
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-border/60 px-4 py-3 text-sm last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="truncate font-medium text-foreground">{name}</div>
          <div className="truncate text-[11px] text-muted-foreground">{goal}</div>
        </div>
      </div>
      <div className="hidden text-[11px] text-muted-foreground sm:block">{meals}</div>
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <span className="text-xs font-semibold text-foreground tabular-nums">{adherence}%</span>
      </div>
    </div>
  );
};

const PatientsCard = () => (
  <div className="pro-card overflow-hidden">
    <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background pro-accent">
          <Circle size={13} strokeWidth={2.2} />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Carteira</div>
          <div className="text-sm font-semibold">Pacientes ativos</div>
        </div>
      </div>
      <span className="pro-pill">28 ativos</span>
    </div>
    <div>
      <PatientRow name="Marina Costa" goal="Emagrecimento" status="ok" adherence={92} meals="4/4 hoje" />
      <PatientRow name="Lucas Alves" goal="Hipertrofia" status="ok" adherence={88} meals="5/6 hoje" />
      <PatientRow name="Beatriz Lima" goal="Reeducação" status="atencao" adherence={61} meals="2/4 hoje" />
      <PatientRow name="Pedro Souza" goal="Emagrecimento" status="risco" adherence={34} meals="0/4 hoje" />
      <PatientRow name="Ana Ribeiro" goal="Performance" status="ok" adherence={95} meals="6/6 hoje" />
    </div>
  </div>
);

const KpiCard = ({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) => (
  <div className="pro-card p-4">
    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="mt-2 flex items-baseline justify-between">
      <span className="font-heading text-2xl font-semibold text-foreground tabular-nums">{value}</span>
      <span
        className={`text-[11px] font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}
      >
        {delta}
      </span>
    </div>
  </div>
);

const AlertsCard = () => (
  <div className="pro-card overflow-hidden">
    <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background text-amber-400">
          <AlertTriangle size={13} strokeWidth={2.2} />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Alertas</div>
          <div className="text-sm font-semibold">Risco de abandono</div>
        </div>
      </div>
      <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
        3 hoje
      </span>
    </div>
    {[
      { name: "Pedro Souza", reason: "Sem registros há 4 dias", severity: "risco" },
      { name: "Carla Mendes", reason: "Adesão caiu de 84% → 52%", severity: "atencao" },
      { name: "Rafael Dias", reason: "Pulou jantar 5 dias seguidos", severity: "atencao" },
    ].map((a) => {
      const color = a.severity === "risco" ? "text-red-400 border-red-400/30 bg-red-400/10" : "text-amber-300 border-amber-400/30 bg-amber-400/10";
      return (
        <div key={a.name} className="flex items-center justify-between border-b border-border/60 px-4 py-3 last:border-b-0">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">{a.name}</div>
            <div className="truncate text-[11px] text-muted-foreground">{a.reason}</div>
          </div>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${color}`}>
            {a.severity === "risco" ? "Alto" : "Médio"}
          </span>
        </div>
      );
    })}
  </div>
);

const WhatsAppCard = () => (
  <div className="pro-card overflow-hidden">
    <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
          <MessageCircle size={13} strokeWidth={2.4} />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Canal</div>
          <div className="text-sm font-semibold">WhatsApp · Marina Costa</div>
        </div>
      </div>
      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
        Online
      </span>
    </div>
    <div className="space-y-3 bg-background/40 px-4 py-4">
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-emerald-500/15 px-3 py-2 text-xs text-foreground">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] text-emerald-300">
            <ImageIcon size={11} /> Foto enviada
          </div>
          <div className="h-16 w-44 rounded-md bg-gradient-to-br from-amber-300/40 via-emerald-400/30 to-orange-400/40" />
          <div className="mt-1.5 text-[10px] text-muted-foreground">almoço de hoje 🍽️</div>
        </div>
      </div>
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-card px-3 py-2 text-xs text-foreground">
          <div className="mb-1 text-[10px] uppercase tracking-wider pro-accent">IA · análise</div>
          <div className="leading-relaxed">
            Frango grelhado · arroz integral · brócolis<br />
            <span className="text-muted-foreground">≈ 540 kcal · P 42g · C 48g · G 14g</span>
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] pro-accent">
            <Check size={11} /> Registrado no histórico
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProgressCard = () => (
  <div className="pro-card p-5">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Evolução</div>
        <div className="text-sm font-semibold">Marina Costa · 30 dias</div>
      </div>
      <div className="inline-flex items-center gap-1 text-xs pro-accent">
        <TrendingUp size={13} /> +12% adesão
      </div>
    </div>
    <div className="mt-5 flex h-32 items-end gap-1.5">
      {[28, 35, 42, 38, 50, 58, 55, 64, 70, 68, 75, 80, 78, 85, 92].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all"
          style={{
            height: `${h}%`,
            background: `linear-gradient(180deg, hsl(174 72% 56%) 0%, hsl(174 72% 56% / 0.2) 100%)`,
          }}
        />
      ))}
    </div>
    <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
      <span>Há 30 dias</span>
      <span>Hoje</span>
    </div>
  </div>
);

export const ProMockups = () => {
  return (
    <section className="landing-section">
      <div className="landing-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">Demonstração</span>
          <h2 className="landing-h2 mt-5">A interface que faltava no seu consultório.</h2>
          <p className="landing-lead mt-5">
            Componentes reais da plataforma. Dashboard limpo, dados claros, ação imediata.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-12 lg:grid-cols-3">
          <KpiCard label="Pacientes ativos" value="28" delta="+4 mês" positive />
          <KpiCard label="Adesão média" value="87%" delta="+12%" positive />
          <KpiCard label="Em risco" value="3" delta="−2" positive />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <PatientsCard />
          <AlertsCard />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <WhatsAppCard />
          <ProgressCard />
        </div>
      </div>
    </section>
  );
};

export default ProMockups;
