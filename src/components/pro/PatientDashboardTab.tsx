import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { usePatientDashboard } from '@/hooks/usePatientDashboard';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine,
  CartesianGrid, Cell,
} from 'recharts';
import { Loader2, Flame, Beef, Wheat, Droplets, Activity, Camera, UtensilsCrossed, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const fmt = (d: string) => {
  const date = new Date(d + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

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
  const val = payload[0]?.value ?? 0;
  const isDeficit = val < 0;
  const objectiveLabel = objective === 'lose' ? 'Perder peso' : objective === 'gain' ? 'Ganhar massa' : 'Manutenção';
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium mb-0.5">{label}</p>
      <p className={cn('tabular-nums font-semibold', isDeficit ? 'text-sky-400' : 'text-amber-400')}>
        {val > 0 ? '+' : ''}{Math.round(val)} kcal
      </p>
      <p className="text-muted-foreground mt-0.5">{isDeficit ? 'Déficit' : 'Superávit'}</p>
      <p className="text-muted-foreground">Objetivo: {objectiveLabel}</p>
    </div>
  );
}

export default function PatientDashboardTab({ clientId }: { clientId: string }) {
  const { loading, weeklySummary, todaySummary, mealHistory, activityHistory, goals, refresh } = usePatientDashboard(clientId);
  const [historyTab, setHistoryTab] = useState<'refeicoes' | 'atividades'>('refeicoes');
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

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
  const balanceColor = goals.objective === 'lose'
    ? (isDeficit && Math.abs(calorieBalance) <= 700 ? 'text-emerald-400' : isDeficit ? 'text-amber-400' : 'text-destructive')
    : goals.objective === 'gain'
    ? (!isDeficit && calorieBalance <= 700 ? 'text-emerald-400' : !isDeficit ? 'text-amber-400' : 'text-destructive')
    : (Math.abs(calorieBalance) <= 200 ? 'text-emerald-400' : Math.abs(calorieBalance) <= 500 ? 'text-amber-400' : 'text-destructive');

  // Aderência semanal últimos 7 dias
  const last7 = weeklySummary.slice(-7);
  const adherenceDays = last7.filter(d => d.meal_count > 0).length;
  const adherencePct = Math.round((adherenceDays / 7) * 100);

  // Chart data: últimos 14 dias
  const chartData = weeklySummary.map(d => ({
    date: fmt(d.summary_date),
    balance: d.calorie_balance,
    hasData: d.meal_count > 0,
  }));

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Refresh */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Atualizar
        </Button>
      </div>

      {/* ── VISÃO DE HOJE ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Saldo calórico */}
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

        {/* Consumo vs meta */}
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

        {/* Gasto total */}
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

        {/* Adesão semanal */}
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

      {/* ── MACROS DE HOJE ── */}
      <Card className="p-5 glass-card">
        <h3 className="text-sm font-semibold mb-4">Macronutrientes de hoje</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MacroBar
            label="Proteína"
            current={today?.protein_consumed ?? 0}
            target={goals.protein_target}
            color="bg-red-400"
          />
          <MacroBar
            label="Carboidrato"
            current={today?.carbs_consumed ?? 0}
            target={goals.carbs_target}
            color="bg-amber-400"
          />
          <MacroBar
            label="Gordura"
            current={today?.fat_consumed ?? 0}
            target={Math.round((goals.calories_target * 0.25) / 9)}
            color="bg-purple-400"
          />
        </div>
      </Card>

      {/* ── GRÁFICO DE BALANÇO CALÓRICO — 14 DIAS ── */}
      <Card className="p-5 glass-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Déficit / Superávit calórico — últimos 14 dias</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Objetivo: {goals.objective === 'lose' ? 'Perder peso (déficit ideal: -200 a -700)' : goals.objective === 'gain' ? 'Ganhar massa (superávit ideal: +200 a +500)' : 'Manutenção (próximo de zero)'}
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
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
            <Bar dataKey="balance" radius={[6, 6, 6, 6]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    !entry.hasData
                      ? 'hsl(var(--muted))'
                      : entry.balance < 0
                      ? 'hsl(199 89% 60%)'
                      : 'hsl(38 92% 60%)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground mt-3">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-sky-400" /> Déficit</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-amber-400" /> Superávit</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-muted" /> Sem dado</span>
        </div>
      </Card>

      {/* ── HISTÓRICO ── */}
      <Card className="glass-card overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { id: 'refeicoes', label: `Refeições (${mealHistory.length})` },
            { id: 'atividades', label: `Atividades (${activityHistory.length})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setHistoryTab(t.id as any)}
              className={cn('flex-1 py-3 text-xs font-medium transition-colors',
                historyTab === t.id ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {historyTab === 'refeicoes' && (
          <div className="divide-y divide-border">
            {mealHistory.length === 0 && (
              <p className="text-sm text-muted-foreground p-6 text-center">Nenhuma refeição registrada.</p>
            )}
            {mealHistory.map(meal => {
              const hasPhoto = !!(meal.media_url || meal.image_path) && !imgErrors[meal.id];
              const photoUrl = meal.media_url || meal.image_path || '';
              const isToday = meal.created_at.startsWith(todayStr);
              const isExpanded = expandedMeal === meal.id;

              return (
                <div key={meal.id} className="p-4">
                  <div
                    className="flex gap-3 cursor-pointer"
                    onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}
                  >
                    {/* Foto ou placeholder */}
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
                        <span className={cn('text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full',
                          meal.status === 'processed' ? 'bg-emerald-500/10 text-emerald-400' :
                          meal.status === 'error' ? 'bg-destructive/10 text-destructive' :
                          'bg-amber-500/10 text-amber-400'
                        )}>
                          {meal.status === 'processed' ? 'processado' : meal.status === 'error' ? 'erro' : 'pendente'}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate mb-1">
                        {meal.original_text || '(sem descrição)'}
                      </p>
                      {meal.estimated_kcal != null && (
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground tabular-nums">
                          <span className="text-foreground font-medium">{Math.round(meal.estimated_kcal)} kcal</span>
                          {meal.estimated_protein != null && <span>{Math.round(meal.estimated_protein)}g prot</span>}
                          {meal.estimated_carbs != null && <span>{Math.round(meal.estimated_carbs)}g carb</span>}
                          {meal.estimated_fat != null && <span>{Math.round(meal.estimated_fat)}g gord</span>}
                        </div>
                      )}
                    </div>

                    {hasPhoto && (
                      <Camera className="h-4 w-4 text-muted-foreground shrink-0 self-start mt-0.5" />
                    )}
                  </div>

                  {/* Foto expandida */}
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
