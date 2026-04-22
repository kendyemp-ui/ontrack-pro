import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { TrendingDown, TrendingUp, Calendar, Flame, Utensils } from 'lucide-react';

type Period = 'week' | 'month';

interface DailyRow {
  summary_date: string;
  kcal_consumed: number | null;
  kcal_burned: number | null;
  basal_kcal: number | null;
  total_expenditure_kcal: number | null;
  calorie_balance: number | null;
  meal_count: number | null;
  activity_count: number | null;
}

interface Props {
  clientId: string | null;
  basalFallback: number;
}

const formatShortDate = (iso: string) => {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
};

const formatWeekday = (iso: string) => {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
};

export default function HistoryChart({ clientId, basalFallback }: Props) {
  const [period, setPeriod] = useState<Period>('week');
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientId) {
      setRows([]);
      return;
    }
    const days = period === 'week' ? 7 : 30;
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));
    const sinceISO = since.toISOString().slice(0, 10);

    setLoading(true);
    supabase
      .from('daily_summary')
      .select('summary_date, kcal_consumed, kcal_burned, basal_kcal, total_expenditure_kcal, calorie_balance, meal_count, activity_count')
      .eq('client_id', clientId)
      .gte('summary_date', sinceISO)
      .order('summary_date', { ascending: true })
      .then(({ data }) => {
        setRows((data ?? []) as DailyRow[]);
        setLoading(false);
      });
  }, [clientId, period]);

  // Preenche dias faltantes com zeros para um gráfico contínuo
  const chartData = useMemo(() => {
    const days = period === 'week' ? 7 : 30;
    const map = new Map(rows.map((r) => [r.summary_date, r]));
    const out: Array<{
      date: string;
      label: string;
      consumed: number;
      expenditure: number;
      balance: number;
      hasMeals: boolean;
      hasActivity: boolean;
      isTracked: boolean;
    }> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const r = map.get(iso);
      const consumed = Math.round(Number(r?.kcal_consumed ?? 0));
      const hasMeals = Number(r?.meal_count ?? 0) > 0;
      const hasActivity = Number(r?.activity_count ?? 0) > 0;
      const isTracked = hasMeals || hasActivity;
      const expenditure = Math.round(
        isTracked
          ? Number(r?.total_expenditure_kcal ?? (Number(r?.basal_kcal ?? basalFallback) + Number(r?.kcal_burned ?? 0)))
          : 0,
      );
      const balance = Math.round(
        isTracked ? Number(r?.calorie_balance ?? consumed - expenditure) : 0,
      );
      out.push({
        date: iso,
        label: period === 'week' ? formatWeekday(iso) : formatShortDate(iso),
        consumed,
        expenditure,
        balance,
        hasMeals,
        hasActivity,
        isTracked,
      });
    }
    return out;
  }, [rows, period, basalFallback]);

  const stats = useMemo(() => {
    const active = chartData.filter((d) => d.hasMeals);
    const n = active.length || 1;
    const avgConsumed = Math.round(active.reduce((s, d) => s + d.consumed, 0) / n);
    const avgExpenditure = Math.round(active.reduce((s, d) => s + d.expenditure, 0) / n);
    const avgBalance = Math.round(active.reduce((s, d) => s + d.balance, 0) / n);
    const deficitDays = active.filter((d) => d.balance < 0).length;
    const surplusDays = active.filter((d) => d.balance > 0).length;
    const pendingDays = chartData.filter((d) => d.isTracked && !d.hasMeals).length;
    return { avgConsumed, avgExpenditure, avgBalance, deficitDays, surplusDays, daysTracked: active.length, pendingDays };
  }, [chartData]);

  return (
    <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.22s' }}>
      {/* Header com filtro */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-accent" strokeWidth={1.5} />
          <h2 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
            Histórico
          </h2>
        </div>
        <div className="flex items-center gap-1 bg-foreground/5 rounded-full p-0.5">
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full transition-all ${
              period === 'week'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full transition-all ${
              period === 'month'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mês
          </button>
        </div>
      </div>

      {/* Médias diárias */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-foreground/5 rounded-xl p-2.5 space-y-0.5">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Utensils size={10} strokeWidth={1.5} />
            <span className="text-[9px] font-medium uppercase tracking-wider">Média cons.</span>
          </div>
          <p className="text-base font-heading font-bold text-foreground">{stats.avgConsumed}</p>
          <p className="text-[9px] text-muted-foreground">kcal/dia</p>
        </div>
        <div className="bg-foreground/5 rounded-xl p-2.5 space-y-0.5">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Flame size={10} strokeWidth={1.5} />
            <span className="text-[9px] font-medium uppercase tracking-wider">Média gasto</span>
          </div>
          <p className="text-base font-heading font-bold text-foreground">{stats.avgExpenditure}</p>
          <p className="text-[9px] text-muted-foreground">kcal/dia</p>
        </div>
        <div className="bg-foreground/5 rounded-xl p-2.5 space-y-0.5">
          <div className="flex items-center gap-1 text-muted-foreground">
            {stats.avgBalance < 0 ? <TrendingDown size={10} strokeWidth={1.5} /> : <TrendingUp size={10} strokeWidth={1.5} />}
            <span className="text-[9px] font-medium uppercase tracking-wider">Saldo médio</span>
          </div>
          <p className={`text-base font-heading font-bold ${stats.avgBalance < 0 ? 'text-destructive' : 'text-success'}`}>
            {stats.avgBalance > 0 ? '+' : ''}{stats.avgBalance}
          </p>
          <p className="text-[9px] text-muted-foreground">
            {stats.avgBalance < 0 ? 'déficit' : 'superávit'}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-48 -ml-2">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            Carregando…
          </div>
         ) : chartData.every((d) => !d.isTracked) ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground text-center px-4">
            Sem dados ainda. Registre refeições e atividades pelo WhatsApp para ver seu histórico.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.3} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                interval={period === 'month' ? 3 : 0}
              />
              <YAxis
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--foreground) / 0.04)' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 12,
                  fontSize: 11,
                }}
                labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 10, marginBottom: 4 }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    consumed: 'Consumidas',
                    expenditure: 'Gastas',
                    balance: 'Saldo',
                  };
                  return [`${value} kcal`, labels[name] ?? name];
                }}
              />
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
              <Bar dataKey="consumed" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} barSize={period === 'week' ? 14 : 6} />
              <Bar dataKey="expenditure" fill="hsl(var(--muted-foreground) / 0.5)" radius={[4, 4, 0, 0]} barSize={period === 'week' ? 14 : 6} />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--foreground))"
                strokeWidth={1.5}
                dot={{ r: 2, fill: 'hsl(var(--foreground))' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-accent" />
          <span>Consumidas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-muted-foreground/50" />
          <span>Gastas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-px bg-foreground" />
          <span>Saldo</span>
        </div>
      </div>

      {/* Resumo do período */}
      {(stats.daysTracked > 0 || stats.pendingDays > 0) && (
        <div className="mt-4 pt-4 border-t border-border/30 space-y-2 text-[10px]">
          {stats.pendingDays > 0 && (
            <div className="px-3 py-2 rounded-xl bg-muted/60 text-muted-foreground">
              {stats.pendingDays} {stats.pendingDays === 1 ? 'dia com atividade sem refeição registrada ainda' : 'dias com atividade sem refeição registrada ainda'}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/10 text-destructive">
            <TrendingDown size={12} />
            <span className="font-medium">{stats.deficitDays} {stats.deficitDays === 1 ? 'dia' : 'dias'} em déficit</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-success/10 text-success">
            <TrendingUp size={12} />
            <span className="font-medium">{stats.surplusDays} {stats.surplusDays === 1 ? 'dia' : 'dias'} em superávit</span>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
