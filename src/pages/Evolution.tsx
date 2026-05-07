import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';
import HistoryChart from '@/components/HistoryChart';
import {
  TrendingUp, Sparkles, Scale, CheckCircle2, AlertCircle, Info,
  Flame, Drumstick, Wheat, Zap, Droplets, Activity,
} from 'lucide-react';
import { getCalorieStatus } from '@/lib/goalStatus';

const toLocalISODate = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

// ── Insight helpers ──────────────────────────────────────────────────────────
type InsightType = 'success' | 'warning' | 'info';
interface Insight { type: InsightType; text: string }

function buildInsights(
  totalCalories: number,
  caloriesTarget: number,
  totalProtein: number,
  proteinTarget: number,
  totalCarbs: number,
  carbsTarget: number,
  netBalance: number,
  objective: string,
  mealCount: number,
): Insight[] {
  const insights: Insight[] = [];
  const calPct = caloriesTarget > 0 ? Math.round((totalCalories / caloriesTarget) * 100) : 0;
  const protPct = proteinTarget > 0 ? Math.round((totalProtein / proteinTarget) * 100) : 0;

  // Calorias
  if (mealCount === 0) {
    insights.push({ type: 'info', text: 'Nenhuma refeição registrada hoje ainda. Registre via WhatsApp ou pelo botão + no dashboard.' });
  } else if (calPct >= 90 && calPct <= 110) {
    insights.push({ type: 'success', text: `Ingestão calórica dentro da meta (${calPct}%). Consistência é o que gera resultado! 🎯` });
  } else if (calPct < 70) {
    const rem = caloriesTarget - totalCalories;
    insights.push({ type: 'warning', text: `Você consumiu apenas ${calPct}% da meta calórica. Faltam ${rem} kcal — não pule refeições.` });
  } else if (calPct > 115) {
    const extra = totalCalories - caloriesTarget;
    insights.push({ type: 'warning', text: `Ultrapassou a meta em ${extra} kcal hoje. Ajuste o jantar para equilibrar.` });
  }

  // Proteína
  if (mealCount > 0) {
    if (protPct >= 100) {
      insights.push({ type: 'success', text: `Meta de proteína atingida (${totalProtein}g). Ótimo para preservação de massa muscular! 💪` });
    } else if (protPct < 60) {
      insights.push({ type: 'warning', text: `Proteína baixa: ${totalProtein}g de ${proteinTarget}g. Adicione frango, ovo ou whey nas próximas refeições.` });
    } else {
      const rem = proteinTarget - totalProtein;
      insights.push({ type: 'info', text: `Faltam ${rem}g de proteína para atingir sua meta do dia.` });
    }
  }

  // Objetivo
  if (mealCount > 0) {
    if (objective === 'lose' && netBalance > 0) {
      insights.push({ type: 'info', text: `Seu objetivo é emagrecimento mas hoje está em superávit de ${netBalance} kcal. Tente manter déficit entre 200-700 kcal.` });
    } else if (objective === 'gain' && netBalance < 0) {
      insights.push({ type: 'info', text: `Seu objetivo é hipertrofia mas hoje está em déficit de ${Math.abs(netBalance)} kcal. Adicione calorias extras para ganho muscular.` });
    }
  }

  return insights.slice(0, 3); // máximo 3 insights
}

// ── BioMetric card ───────────────────────────────────────────────────────────
const BioMetric = ({ label, value, sub, icon: Icon, highlight = false }: {
  label: string; value: string; sub?: string; icon: React.ElementType; highlight?: boolean;
}) => (
  <div className={`rounded-xl p-3 space-y-1 ${highlight ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/50'}`}>
    <Icon size={14} className={highlight ? 'text-primary' : 'text-accent'} />
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className={`text-base font-heading font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
    {sub && <p className="text-[9px] text-muted-foreground">{sub}</p>}
  </div>
);

// ── MacroBar ─────────────────────────────────────────────────────────────────
const MacroBar = ({ label, current, target, color, icon: Icon }: {
  label: string; current: number; target: number; color: string; icon: React.ElementType;
}) => {
  const pct = Math.min(100, target > 0 ? Math.round((current / target) * 100) : 0);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Icon size={12} className="text-muted-foreground" />
          <span className="text-muted-foreground">{label}</span>
        </div>
        <span className="font-medium text-foreground">{current}g <span className="text-muted-foreground font-normal">/ {target}g</span></span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ── Main page ────────────────────────────────────────────────────────────────
const Evolution = () => {
  const {
    totalCalories, totalProtein, totalCarbs,
    goal, totalBurn, netBalance, bioimpedance,
    meals, activities, clientId,
  } = useApp();

  const todayIso = toLocalISODate(new Date());
  const mealCount = meals.length;
  const activityCount = activities.length;

  // Fats estimate
  const fatsTarget = Math.round((goal.caloriesTarget * 0.25) / 9);
  const totalFats = meals.reduce((s, m) => s + Math.round((m.calories * 0.3) / 9), 0);

  const insights = useMemo(() => buildInsights(
    totalCalories, goal.caloriesTarget,
    totalProtein, goal.proteinTarget,
    totalCarbs, goal.carbsTarget,
    netBalance, goal.objective,
    mealCount,
  ), [totalCalories, totalProtein, totalCarbs, netBalance, goal, mealCount]);

  const balanceStatus = getCalorieStatus(netBalance, goal.objective);

  const hasBio = bioimpedance.weight > 0 || bioimpedance.bodyFat > 0 || bioimpedance.muscleMass > 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">

        {/* Header */}
        <div className="animate-fade-in flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" strokeWidth={2} />
              <h1 className="text-2xl font-heading font-bold text-foreground">Evolução</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">Sua jornada em números</p>
          </div>
        </div>

        {/* ── AI Insights ─────────────────────────────────────────────── */}
        <div className="glass-card rounded-2xl p-5 space-y-3 animate-slide-up">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-primary" />
            <h2 className="text-sm font-heading font-semibold text-foreground">Insights de hoje</h2>
          </div>

          {insights.length === 0 ? (
            <p className="text-xs text-muted-foreground">Registre suas refeições para receber insights personalizados.</p>
          ) : (
            insights.map((ins, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-xl p-3 ${
                  ins.type === 'success' ? 'bg-success/10' :
                  ins.type === 'warning' ? 'bg-warning/10' :
                  'bg-muted/60'
                }`}
              >
                {ins.type === 'success'
                  ? <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
                  : ins.type === 'warning'
                  ? <AlertCircle size={14} className="text-warning shrink-0 mt-0.5" />
                  : <Info size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                }
                <p className="text-xs text-foreground leading-relaxed">{ins.text}</p>
              </div>
            ))
          )}
        </div>

        {/* ── Macros do dia ───────────────────────────────────────────── */}
        <div className="glass-card rounded-2xl p-5 space-y-4 animate-slide-up" style={{ animationDelay: '0.08s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={15} className="text-primary" />
              <h2 className="text-sm font-heading font-semibold text-foreground">Macros de hoje</h2>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${balanceStatus.bgClass} ${balanceStatus.textClass}`}>
              {netBalance > 0 ? '+' : ''}{netBalance} kcal
            </span>
          </div>

          {/* Calorie summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-secondary/50 rounded-xl py-2.5">
              <p className="text-base font-heading font-bold text-foreground">{totalCalories}</p>
              <p className="text-[10px] text-muted-foreground">consumidas</p>
            </div>
            <div className="bg-secondary/50 rounded-xl py-2.5">
              <p className="text-base font-heading font-bold text-foreground">{goal.caloriesTarget}</p>
              <p className="text-[10px] text-muted-foreground">meta</p>
            </div>
            <div className="bg-secondary/50 rounded-xl py-2.5">
              <p className={`text-base font-heading font-bold ${balanceStatus.textClass}`}>
                {totalBurn + bioimpedance.basalRate}
              </p>
              <p className="text-[10px] text-muted-foreground">gastas</p>
            </div>
          </div>

          {/* Macro bars */}
          <div className="space-y-3 pt-1">
            <MacroBar label="Proteína" current={totalProtein} target={goal.proteinTarget} color="bg-primary" icon={Drumstick} />
            <MacroBar label="Carboidratos" current={totalCarbs} target={goal.carbsTarget} color="bg-accent" icon={Wheat} />
            <MacroBar label="Gorduras" current={totalFats} target={fatsTarget} color="bg-warning" icon={Flame} />
          </div>
        </div>

        {/* ── Histórico (gráfico de evolução) ─────────────────────────── */}
        <HistoryChart
          clientId={clientId}
          basalFallback={bioimpedance.basalRate}
          objective={goal.objective}
          currentDay={{
            date: todayIso,
            consumed: totalCalories,
            activity: totalBurn,
            basal: bioimpedance.basalRate,
            mealCount,
            activityCount,
          }}
        />

        {/* ── Composição corporal ──────────────────────────────────────── */}
        {hasBio && (
          <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.18s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Scale size={15} className="text-primary" />
              <h2 className="text-sm font-heading font-semibold text-foreground">Composição corporal</h2>
              <span className="ml-auto text-[10px] text-muted-foreground">Da bioimpedância</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {bioimpedance.basalRate > 0 && (
                <BioMetric label="TMB" value={`${bioimpedance.basalRate} kcal`} sub="gasto basal" icon={Zap} highlight />
              )}
              {bioimpedance.weight > 0 && (
                <BioMetric label="Peso" value={`${bioimpedance.weight} kg`} icon={Scale} />
              )}
              {bioimpedance.muscleMass > 0 && (
                <BioMetric label="Massa muscular" value={`${bioimpedance.muscleMass} kg`} icon={Activity} />
              )}
              {bioimpedance.bodyFat > 0 && (
                <BioMetric label="Gordura corporal" value={`${bioimpedance.bodyFat}%`} icon={Flame} />
              )}
              {bioimpedance.bodyWater > 0 && (
                <BioMetric label="Água corporal" value={`${bioimpedance.bodyWater}%`} icon={Droplets} />
              )}
              {bioimpedance.metabolicAge > 0 && (
                <BioMetric label="Idade metabólica" value={`${bioimpedance.metabolicAge} anos`} icon={TrendingUp} />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">
              Atualize seus dados em Perfil → Bioimpedância para manter os insights precisos.
            </p>
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  );
};

export default Evolution;
