import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { usePatientDashboard, DailySummaryPoint } from '@/hooks/usePatientDashboard';
import { supabase } from '@/integrations/supabase/client';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine,
  CartesianGrid, Cell,
} from 'recharts';
import {
  Loader2, Flame, Beef, Wheat, Droplets, Activity, Camera,
  UtensilsCrossed, RefreshCw, X, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmtDay = (d: string) => {
  const date = new Date(d + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
const fmtFull = (d: string) =>
  new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  });
const fmtMonth = (ym: string) =>
  new Date(ym + '-15T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

// ── chart point types ─────────────────────────────────────────────────────────
type PeriodType = '14d' | '30d' | '3m' | '12m';

interface ChartPoint {
  label: string;
  rawDate: string;    // YYYY-MM-DD (day/week start) or YYYY-MM (month)
  balance: number;
  consumed: number;
  gasto: number;
  hasData: boolean;
  mealCount: number;
  type: 'day' | 'week' | 'month';
  weekEnd?: string;   // for week type
}

// ── aggregation helpers ───────────────────────────────────────────────────────
function aggregateByWeek(days: DailySummaryPoint[]): ChartPoint[] {
  const chunks: ChartPoint[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const chunk = days.slice(i, i + 7);
    if (!chunk.length) continue;
    chunks.push({
      label: fmtDay(chunk[0].summary_date),
      rawDate: chunk[0].summary_date,
      weekEnd: chunk[chunk.length - 1].summary_date,
      balance: chunk.reduce((s, d) => s + d.calorie_balance, 0),
      consumed: chunk.reduce((s, d) => s + d.kcal_consumed, 0),
      gasto: chunk.reduce((s, d) => s + d.total_expenditure_kcal, 0),
      hasData: chunk.some(d => d.meal_count > 0),
      mealCount: chunk.reduce((s, d) => s + d.meal_count, 0),
      type: 'week',
    });
  }
  return chunks;
}

function aggregateByMonth(days: DailySummaryPoint[]): ChartPoint[] {
  const monthMap: Record<string, DailySummaryPoint[]> = {};
  days.forEach(d => {
    const key = d.summary_date.substring(0, 7);
    (monthMap[key] ??= []).push(d);
  });
  return Object.entries(monthMap).map(([key, ds]) => ({
    label: new Date(key + '-15T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }),
    rawDate: key,
    balance: ds.reduce((s, d) => s + d.calorie_balance, 0),
    consumed: ds.reduce((s, d) => s + d.kcal_consumed, 0),
    gasto: ds.reduce((s, d) => s + d.total_expenditure_kcal, 0),
    hasData: ds.some(d => d.meal_count > 0),
    mealCount: ds.reduce((s, d) => s + d.meal_count, 0),
    type: 'month' as const,
  }));
}

// ── sub-components ────────────────────────────────────────────────────────────
function MacroBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const over = target > 0 && current > target;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn('tabular-nums font-medium', over ? 'text-amber-400' : 'text-foreground')}>
          {Math.round(current)}/{Math.round(target)}g
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label, objective }: any) {
  if (!active || !payload?.length) return null;
  const val: number = payload[0]?.value ?? 0;
  const isDeficit = val < 0;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium mb-0.5">{label}</p>
      <p className={cn('tabular-nums font-semibold', isDeficit ? 'text-sky-400' : 'text-amber-400')}>
        {val > 0 ? '+' : ''}{Math.round(val)} kcal
      </p>
      <p className="text-muted-foreground mt-0.5">{isDeficit ? 'Déficit' : 'Superávit'}</p>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function PatientDashboardTab({ clientId }: { clientId: string }) {
  const { loading, weeklySummary, todaySummary, mealHistory, activityHistory, goals, refresh } =
    usePatientDashboard(clientId);

  // period & extended history
  const [chartPeriod, setChartPeriod] = useState<PeriodType>('14d');
  const [extHistory, setExtHistory] = useState<DailySummaryPoint[]>([]);
  const [extLoading, setExtLoading] = useState(false);
  const [extLoaded, setExtLoaded] = useState(false);

  // bar selection
  const [selectedBar, setSelectedBar] = useState<ChartPoint | null>(null);

  // history tabs
  const [historyTab, setHistoryTab] = useState<'refeicoes' | 'atividades'>('refeicoes');
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [mealsDateFilter, setMealsDateFilter] = useState<'7d' | '14d' | '30d' | 'all'>('7d');
  const [mealsLimit, setMealsLimit] = useState(15);

  // load extended history (365 days) when needed
  useEffect(() => {
    if (chartPeriod !== '14d' && !extLoaded) loadExtHistory();
  }, [chartPeriod, clientId]);

  // reset selected bar on period change
  useEffect(() => { setSelectedBar(null); }, [chartPeriod]);

  const loadExtHistory = async () => {
    setExtLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const start = new Date();
    start.setDate(start.getDate() - 364);
    const startDate = start.toISOString().split('T')[0];

    const { data } = await supabase
      .from('daily_summary')
      .select(
        'summary_date,kcal_consumed,kcal_burned,basal_kcal,total_expenditure_kcal,calorie_balance,protein_consumed,carbs_consumed,fat_consumed,meal_count,activity_count'
      )
      .eq('client_id', clientId)
      .gte('summary_date', startDate)
      .lte('summary_date', today)
      .order('summary_date');

    // Fill gaps for full 365 days
    const map: Record<string, DailySummaryPoint> = {};
    (data || []).forEach(d => { map[d.summary_date] = d as DailySummaryPoint; });
    const full: DailySummaryPoint[] = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      full.push(map[ds] ?? {
        summary_date: ds, kcal_consumed: 0, kcal_burned: 0, basal_kcal: 0,
        total_expenditure_kcal: 0, calorie_balance: 0, protein_consumed: 0,
        carbs_consumed: 0, fat_consumed: 0, meal_count: 0, activity_count: 0,
      });
    }
    setExtHistory(full);
    setExtLoaded(true);
    setExtLoading(false);
  };

  // ── chart data based on period ──────────────────────────────────────────────
  const getChartData = (): ChartPoint[] => {
    const src = chartPeriod === '14d' ? weeklySummary : extHistory;
    if (!src.length) return [];

    if (chartPeriod === '14d') {
      return src.map(d => ({
        label: fmtDay(d.summary_date), rawDate: d.summary_date,
        balance: d.calorie_balance, consumed: d.kcal_consumed, gasto: d.total_expenditure_kcal,
        hasData: d.meal_count > 0, mealCount: d.meal_count, type: 'day',
      }));
    }
    if (chartPeriod === '30d') {
      return src.slice(-30).map(d => ({
        label: fmtDay(d.summary_date), rawDate: d.summary_date,
        balance: d.calorie_balance, consumed: d.kcal_consumed, gasto: d.total_expenditure_kcal,
        hasData: d.meal_count > 0, mealCount: d.meal_count, type: 'day',
      }));
    }
    if (chartPeriod === '3m') return aggregateByWeek(src.slice(-91));
    if (chartPeriod === '12m') return aggregateByMonth(src);
    return [];
  };

  // Bar component onClick receives (data, index) where data IS the ChartPoint directly
  const handleBarClick = (data: ChartPoint) => {
    setSelectedBar(prev => prev?.rawDate === data.rawDate ? null : data);
  };

  // meals for selected day — compare using local date to handle timezone offsets
  const selectedDayMeals =
    selectedBar?.type === 'day'
      ? mealHistory.filter(m => {
          const d = new Date(m.created_at);
          const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          return localDate === selectedBar.rawDate;
        })
      : [];

  // ── loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-12 justify-center">
        <Loader2 className="animate-spin h-4 w-4" /> Carregando dados do paciente...
      </div>
    );
  }

  const today = todaySummary;
  const calorieBalance = today?.calorie_balance ?? 0;
  const isDeficit = calorieBalance < 0;
  const balanceColor =
    goals.objective === 'lose'
      ? isDeficit && Math.abs(calorieBalance) <= 700 ? 'text-emerald-400' : isDeficit ? 'text-amber-400' : 'text-destructive'
      : goals.objective === 'gain'
      ? !isDeficit && calorieBalance <= 700 ? 'text-emerald-400' : !isDeficit ? 'text-amber-400' : 'text-destructive'
      : Math.abs(calorieBalance) <= 200 ? 'text-emerald-400' : Math.abs(calorieBalance) <= 500 ? 'text-amber-400' : 'text-destructive';

  const last7 = weeklySummary.slice(-7);
  const adherenceDays = last7.filter(d => d.meal_count > 0).length;
  const adherencePct = Math.round((adherenceDays / 7) * 100);

  const chartData = getChartData();
  const showLoader = (chartPeriod !== '14d') && extLoading;

  // ── filtered meal history ─────────────────────────────────────────────────
  const filteredMeals = (() => {
    if (mealsDateFilter === 'all') return mealHistory;
    const days = mealsDateFilter === '7d' ? 7 : mealsDateFilter === '14d' ? 14 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return mealHistory.filter(m => new Date(m.created_at) >= cutoff);
  })();
  const visibleMeals = filteredMeals.slice(0, mealsLimit);
  const hasMoreMeals = filteredMeals.length > mealsLimit;

  const PERIOD_LABELS: Record<PeriodType, string> = {
    '14d': '14 dias', '30d': '30 dias', '3m': '3 meses', '12m': '12 meses',
  };

  return (
    <div className="space-y-6">
      {/* Refresh */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Atualizar
        </Button>
      </div>

      {/* ── HOJE ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 glass-card">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            <Flame className="h-3 w-3" /> Saldo de hoje
          </div>
          <p className={cn('text-2xl font-semibold tabular-nums', balanceColor)}>
            {calorieBalance > 0 ? '+' : ''}{Math.round(calorieBalance)}
            <span className="text-xs text-muted-foreground font-normal ml-1">kcal</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {isDeficit ? '🔵 Déficit' : '🟠 Superávit'} · {today?.meal_count ?? 0} refeições
          </p>
        </Card>

        <Card className="p-4 glass-card">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            <UtensilsCrossed className="h-3 w-3" /> Consumido
          </div>
          <p className="text-2xl font-semibold tabular-nums">
            {Math.round(today?.kcal_consumed ?? 0)}
            <span className="text-xs text-muted-foreground font-normal ml-1">kcal</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Meta: {goals.calories_target} kcal</p>
        </Card>

        <Card className="p-4 glass-card">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            <Activity className="h-3 w-3" /> Gasto total
          </div>
          <p className="text-2xl font-semibold tabular-nums">
            {Math.round(today?.total_expenditure_kcal ?? 0)}
            <span className="text-xs text-muted-foreground font-normal ml-1">kcal</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            TMB {Math.round(today?.basal_kcal ?? 0)} + ex. {Math.round(today?.kcal_burned ?? 0)}
          </p>
        </Card>

        <Card className="p-4 glass-card">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Adesão 7 dias</p>
          <p className={cn(
            'text-2xl font-semibold tabular-nums',
            adherencePct >= 75 ? 'text-emerald-400' : adherencePct >= 40 ? 'text-amber-400' : 'text-destructive'
          )}>
            {adherencePct}%
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">{adherenceDays} de 7 dias</p>
        </Card>
      </div>

      {/* ── MACROS ── */}
      <Card className="p-5 glass-card">
        <h3 className="text-sm font-semibold mb-4">Macronutrientes de hoje</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MacroBar label="Proteína"    current={today?.protein_consumed ?? 0} target={goals.protein_target} color="bg-red-400" />
          <MacroBar label="Carboidrato" current={today?.carbs_consumed ?? 0}   target={goals.carbs_target}   color="bg-amber-400" />
          <MacroBar label="Gordura"     current={today?.fat_consumed ?? 0}     target={Math.round((goals.calories_target * 0.25) / 9)} color="bg-purple-400" />
        </div>
      </Card>

      {/* ── GRÁFICO ── */}
      <Card className="p-5 glass-card">
        {/* Header + period selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
          <div>
            <h3 className="text-sm font-semibold">Déficit / Superávit calórico</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Objetivo: {goals.objective === 'lose' ? 'Perder peso (déficit ideal: −200 a −700)' : goals.objective === 'gain' ? 'Ganhar massa (superávit ideal: +200 a +500)' : 'Manutenção (próximo de zero)'}
            </p>
          </div>

          {/* Period tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-secondary/40 border border-border shrink-0">
            {(['14d', '30d', '3m', '12m'] as PeriodType[]).map(p => (
              <button
                key={p}
                onClick={() => setChartPeriod(p)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  chartPeriod === p ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        {showLoader ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm h-[260px]">
            <Loader2 className="animate-spin h-4 w-4" /> Carregando histórico...
          </div>
        ) : (
          <>
            <p className="text-[11px] text-muted-foreground mb-3 mt-2">
              {chartPeriod === '3m' && '📊 Valores por semana (soma de 7 dias)'}
              {chartPeriod === '12m' && '📊 Valores por mês (soma do período)'}
              {(chartPeriod === '14d' || chartPeriod === '30d') && '👆 Clique em uma barra para ver as refeições do dia'}
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval={chartPeriod === '30d' ? 4 : 0}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip objective={goals.objective} />} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" />
                {goals.objective === 'lose' && (
                  <>
                    <ReferenceLine y={-200} stroke="hsl(var(--accent))" strokeDasharray="3 3" />
                    <ReferenceLine y={-700} stroke="hsl(var(--accent))" strokeDasharray="3 3" />
                  </>
                )}
                {goals.objective === 'gain' && (
                  <>
                    <ReferenceLine y={200} stroke="hsl(var(--accent))" strokeDasharray="3 3" />
                    <ReferenceLine y={500} stroke="hsl(var(--accent))" strokeDasharray="3 3" />
                  </>
                )}
                <Bar
                  dataKey="balance"
                  radius={[6, 6, 6, 6]}
                  onClick={handleBarClick}
                  cursor={chartPeriod === '14d' || chartPeriod === '30d' ? 'pointer' : 'default'}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        !entry.hasData
                          ? 'hsl(var(--muted))'
                          : selectedBar?.rawDate === entry.rawDate
                          ? 'hsl(var(--foreground))'
                          : entry.balance < 0
                          ? 'hsl(199 89% 60%)'
                          : 'hsl(38 92% 60%)'
                      }
                      opacity={selectedBar && selectedBar.rawDate !== entry.rawDate ? 0.35 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground mt-2">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-sky-400" /> Déficit</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-amber-400" /> Superávit</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-muted" /> Sem dado</span>
            </div>
          </>
        )}

        {/* ── DAY / WEEK / MONTH DETAIL ── */}
        {selectedBar && (
          <div className="mt-4 border border-border rounded-xl overflow-hidden bg-secondary/10">
            {/* Detail header */}
            <div className="flex items-start justify-between px-4 py-3 border-b border-border">
              <div>
                <p className="text-sm font-semibold">
                  {selectedBar.type === 'day' &&
                    fmtFull(selectedBar.rawDate)}
                  {selectedBar.type === 'week' &&
                    `Semana de ${fmtDay(selectedBar.rawDate)}${selectedBar.weekEnd ? ' a ' + fmtDay(selectedBar.weekEnd) : ''}`}
                  {selectedBar.type === 'month' &&
                    fmtMonth(selectedBar.rawDate)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedBar.mealCount} refeição{selectedBar.mealCount !== 1 ? 'ões' : ''} registrada{selectedBar.mealCount !== 1 ? 's' : ''}
                  {(selectedBar.type === 'week' || selectedBar.type === 'month') && ' no período'}
                </p>
              </div>
              <button
                onClick={() => setSelectedBar(null)}
                className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
              {[
                { label: 'Consumido', val: selectedBar.consumed, color: 'text-foreground' },
                { label: 'Gasto', val: selectedBar.gasto, color: 'text-orange-400' },
                {
                  label: 'Saldo',
                  val: selectedBar.balance,
                  color: selectedBar.balance < 0 ? 'text-sky-400' : 'text-amber-400',
                  signed: true,
                },
              ].map(s => (
                <div key={s.label} className="p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                  <p className={cn('text-lg font-semibold tabular-nums mt-0.5', s.color)}>
                    {s.signed && s.val > 0 && '+'}{Math.round(s.val)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">kcal</p>
                </div>
              ))}
            </div>

            {/* Meals list (day view only) */}
            {selectedBar.type === 'day' && (
              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {selectedDayMeals.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-5 text-center">
                    {mealHistory.some(m => new Date(m.created_at) < new Date(new Date().setDate(new Date().getDate() - 28)))
                      ? 'Dados de refeições disponíveis apenas nos últimos 30 dias.'
                      : 'Nenhuma refeição registrada neste dia.'}
                  </p>
                ) : (
                  selectedDayMeals.map(meal => {
                    const hasPhoto = !!(meal.media_url || meal.image_path) && !imgErrors[meal.id];
                    const photoUrl = meal.media_url || meal.image_path || '';
                    return (
                      <div key={meal.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-secondary overflow-hidden flex items-center justify-center">
                          {hasPhoto ? (
                            <img
                              src={photoUrl}
                              alt="Refeição"
                              className="h-full w-full object-cover"
                              onError={() => setImgErrors(prev => ({ ...prev, [meal.id]: true }))}
                            />
                          ) : (
                            <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{meal.original_text || '(sem descrição)'}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            <span>{fmtTime(meal.created_at)}</span>
                            {meal.estimated_kcal != null && (
                              <span className="text-foreground font-medium">{Math.round(meal.estimated_kcal)} kcal</span>
                            )}
                            {meal.estimated_protein != null && <span>{Math.round(meal.estimated_protein)}g P</span>}
                            {meal.estimated_carbs != null && <span>{Math.round(meal.estimated_carbs)}g C</span>}
                          </div>
                        </div>
                        {hasPhoto && <Camera className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Week/month: info note */}
            {selectedBar.type !== 'day' && (
              <p className="text-xs text-muted-foreground px-4 py-3 flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                Mude para 14 ou 30 dias para ver as refeições individualmente.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* ── HISTÓRICO ── */}
      <Card className="glass-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 border-b border-border">
          {/* Tab switcher */}
          <div className="flex flex-1">
            {[
              { id: 'refeicoes', label: `Refeições (${mealHistory.length})` },
              { id: 'atividades', label: `Atividades (${activityHistory.length})` },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setHistoryTab(t.id as any)}
                className={cn(
                  'flex-1 py-2 text-xs font-medium transition-colors rounded-lg',
                  historyTab === t.id
                    ? 'text-foreground bg-secondary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          {/* Date filter */}
          {historyTab === 'refeicoes' && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Período:</span>
              <div className="flex gap-1 p-0.5 rounded-lg bg-secondary/40 border border-border">
                {([['7d','7 dias'],['14d','14 dias'],['30d','30 dias'],['all','Todos']] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => { setMealsDateFilter(val); setMealsLimit(15); }}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all',
                      mealsDateFilter === val ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {historyTab === 'refeicoes' && (
          <div className="divide-y divide-border">
            {filteredMeals.length === 0 && (
              <p className="text-sm text-muted-foreground p-6 text-center">
                {mealHistory.length === 0 ? 'Nenhuma refeição registrada.' : `Nenhuma refeição nos últimos ${mealsDateFilter === '7d' ? '7' : mealsDateFilter === '14d' ? '14' : '30'} dias.`}
              </p>
            )}
            {visibleMeals.map(meal => {
              const todayStr = new Date().toISOString().split('T')[0];
              const hasPhoto = !!(meal.media_url || meal.image_path) && !imgErrors[meal.id];
              const photoUrl = meal.media_url || meal.image_path || '';
              const isToday = meal.created_at.startsWith(todayStr);
              const isExpanded = expandedMeal === meal.id;

              return (
                <div key={meal.id} className="p-4">
                  <div className="flex gap-3 cursor-pointer" onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}>
                    <div className="h-16 w-16 shrink-0 rounded-lg bg-secondary overflow-hidden flex items-center justify-center">
                      {hasPhoto ? (
                        <img
                          src={photoUrl}
                          alt="Refeição"
                          className="h-full w-full object-cover"
                          onError={() => setImgErrors(prev => ({ ...prev, [meal.id]: true }))}
                        />
                      ) : (
                        <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-xs text-muted-foreground">
                          {fmtDate(meal.created_at)} às {fmtTime(meal.created_at)}
                          {isToday && <span className="ml-1 text-emerald-400">· hoje</span>}
                        </p>
                        <span className={cn(
                          'text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full',
                          meal.status === 'processed' ? 'bg-emerald-500/10 text-emerald-400'
                            : meal.status === 'error' ? 'bg-destructive/10 text-destructive'
                            : 'bg-amber-500/10 text-amber-400'
                        )}>
                          {meal.status === 'processed' ? 'processado' : meal.status === 'error' ? 'erro' : 'pendente'}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate mb-1">{meal.original_text || '(sem descrição)'}</p>
                      {meal.estimated_kcal != null && (
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground tabular-nums">
                          <span className="text-foreground font-medium">{Math.round(meal.estimated_kcal)} kcal</span>
                          {meal.estimated_protein != null && <span>{Math.round(meal.estimated_protein)}g prot</span>}
                          {meal.estimated_carbs != null && <span>{Math.round(meal.estimated_carbs)}g carb</span>}
                          {meal.estimated_fat != null && <span>{Math.round(meal.estimated_fat)}g gord</span>}
                        </div>
                      )}
                    </div>
                    {hasPhoto && <Camera className="h-4 w-4 text-muted-foreground shrink-0 self-start mt-0.5" />}
                  </div>
                  {isExpanded && hasPhoto && (
                    <div className="mt-3 rounded-lg overflow-hidden bg-secondary">
                      <img
                        src={photoUrl}
                        alt="Refeição ampliada"
                        className="w-full max-h-96 object-contain"
                        onError={() => setImgErrors(prev => ({ ...prev, [meal.id]: true }))}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {/* Ver mais / ver menos */}
            {(hasMoreMeals || mealsLimit > 15) && (
              <div className="flex items-center justify-center gap-3 p-4 border-t border-border">
                {hasMoreMeals && (
                  <button
                    onClick={() => setMealsLimit(l => l + 15)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    Ver mais {Math.min(filteredMeals.length - mealsLimit, 15)} refeições ↓
                  </button>
                )}
                {mealsLimit > 15 && (
                  <button
                    onClick={() => setMealsLimit(15)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ↑ Recolher
                  </button>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {visibleMeals.length} de {filteredMeals.length}
                </span>
              </div>
            )}
          </div>
        )}

        {historyTab === 'atividades' && (
          <div className="divide-y divide-border">
            {activityHistory.length === 0 && (
              <p className="text-sm text-muted-foreground p-6 text-center">Nenhuma atividade registrada.</p>
            )}
            {activityHistory.map(act => (
              <div key={act.id} className="p-4">
                <div className="flex gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs text-muted-foreground">
                        {fmtDate(act.created_at)} às {fmtTime(act.created_at)}
                      </p>
                      {act.estimated_burn_kcal != null && (
                        <span className="text-xs font-semibold text-orange-400 tabular-nums">
                          {Math.round(act.estimated_burn_kcal)} kcal
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium mb-1">{act.original_text || '(sem descrição)'}</p>
                    <div className="flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
                      {act.activity_type && <span>{act.activity_type}</span>}
                      {act.activity_duration && <span>{act.activity_duration}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
