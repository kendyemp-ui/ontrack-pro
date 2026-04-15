import { useApp } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';
import ProgressBar from '@/components/ProgressBar';
import { MessageCircle, Flame, TrendingUp, Utensils, Zap, Activity } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, ReferenceLine, Cell } from 'recharts';
import { weeklyData, monthlyData } from '@/data/mockData';

const motivationalQuotes = [
  "Cada refeição é uma oportunidade de evoluir. 💪",
  "Consistência é o caminho. Continue firme! 🔥",
  "Seu corpo agradece cada escolha consciente. 🌱",
];

const Dashboard = () => {
  const {
    userName, totalCalories, totalProtein, totalCarbs,
    goal, burn, caloriesRemaining, proteinRemaining, carbsRemaining, netBalance, meals, bioimpedance,
  } = useApp();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  const todaysMeals = meals.filter(m => m.date === '2026-04-15');
  const lastMeal = todaysMeals[todaysMeals.length - 1];
  const quote = motivationalQuotes[0];

  const caloriesExceeded = caloriesRemaining < 0;
  const proteinExceeded = proteinRemaining < 0;
  const carbsExceeded = carbsRemaining < 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-heading font-bold text-foreground">Olá, {userName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            15 de abril de 2026 — Quarta-feira
          </p>
          <p className="text-xs text-primary mt-2 italic">{quote}</p>
        </div>

        {/* Calorie Summary Cards */}
        <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Utensils size={14} />
              <span className="text-xs font-medium">Consumidas</span>
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{totalCalories}</p>
            <p className="text-xs text-muted-foreground">kcal</p>
          </div>

          <div className="glass-card rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Flame size={14} />
              <span className="text-xs font-medium">Gastas</span>
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{burn.total}</p>
            <p className="text-xs text-muted-foreground">kcal</p>
          </div>

          <div className="glass-card rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp size={14} />
              <span className="text-xs font-medium">Meta</span>
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{goal.caloriesTarget}</p>
            <p className="text-xs text-muted-foreground">kcal</p>
          </div>

          <div className="glass-card rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Zap size={14} />
              <span className="text-xs font-medium">Saldo Líquido</span>
            </div>
            <p className={`text-2xl font-heading font-bold ${netBalance > goal.caloriesTarget ? 'text-destructive' : 'text-primary'}`}>
              {netBalance}
            </p>
            <p className="text-xs text-muted-foreground">kcal</p>
          </div>
        </div>

        {/* Macro Progress */}
        <div className="glass-card rounded-2xl p-5 space-y-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-base font-heading font-semibold text-foreground">Progresso do Dia</h2>
          <ProgressBar value={totalCalories} max={goal.caloriesTarget} label="Calorias" unit=" kcal" />
          <ProgressBar value={totalProtein} max={goal.proteinTarget} label="Proteína" unit="g" />
          <ProgressBar value={totalCarbs} max={goal.carbsTarget} label="Carboidratos" unit="g" />
        </div>

        {/* Activity Card */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-primary" />
            <h2 className="text-base font-heading font-semibold text-foreground">Atividade do Dia</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{burn.activity} — {burn.activityDuration}</p>
              <p className="text-sm text-muted-foreground">{burn.steps.toLocaleString()} passos</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-heading font-bold text-foreground">{burn.total}</p>
              <p className="text-xs text-muted-foreground">kcal gastas</p>
            </div>
          </div>
        </div>

        {/* Meals info */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-heading font-semibold text-foreground">Refeições do Dia</h2>
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
              {todaysMeals.length} registros
            </span>
          </div>
          {lastMeal && (
            <p className="text-xs text-muted-foreground mb-3">
              Última refeição: {lastMeal.time} via {lastMeal.origin}
            </p>
          )}
          <div className="space-y-2">
            {todaysMeals.map(meal => (
              <div key={meal.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{meal.image}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{meal.typeLabel}</p>
                    <p className="text-xs text-muted-foreground">{meal.time} • {meal.origin}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">{meal.calories} kcal</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 h-11 rounded-xl bg-[#25D366] text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]">
            <MessageCircle size={16} />
            Ver conversa no WhatsApp
          </button>
        </div>

        {/* Day Summary */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <h2 className="text-base font-heading font-semibold text-foreground mb-4">Resumo do Fechamento do Dia</h2>
          <div className="space-y-2.5">
            <SummaryItem
              text={caloriesExceeded ? `Excedeu ${Math.abs(caloriesRemaining)} kcal da meta` : `Faltam ${caloriesRemaining} kcal para sua meta`}
              isNegative={caloriesExceeded}
            />
            <SummaryItem
              text={proteinExceeded ? `Excedeu ${Math.abs(proteinRemaining)}g de proteína` : `Faltam ${proteinRemaining}g de proteína`}
              isNegative={proteinExceeded}
            />
            <SummaryItem
              text={carbsExceeded ? `Excedeu ${Math.abs(carbsRemaining)}g de carboidrato` : `Faltam ${carbsRemaining}g de carboidrato`}
              isNegative={carbsExceeded}
            />
            <SummaryItem text={`Você gastou ${burn.total} kcal em atividades hoje`} isNegative={false} />
            <SummaryItem
              text={`Saldo calórico do dia: ${netBalance > 0 ? '+' : ''}${netBalance} kcal`}
              isNegative={netBalance > goal.caloriesTarget}
            />
          </div>
        </div>

        {/* Evolution Section */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-base font-heading font-semibold text-foreground mb-4">Evolução por Período</h2>
          <div className="flex gap-2 mb-5">
            {(['week', 'month', 'year'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  period === p
                    ? 'gradient-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Ano'}
              </button>
            ))}
          </div>

          {period === 'week' && (
            <>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    />
                    <Bar dataKey="calories" fill="hsl(160, 84%, 39%)" radius={[6, 6, 0, 0]} name="Consumidas" />
                    <Bar dataKey="burned" fill="hsl(200, 80%, 50%)" radius={[6, 6, 0, 0]} name="Gastas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MiniStat label="Média Calorias" value="1993 kcal" />
                <MiniStat label="Média Gastas" value="499 kcal" />
                <MiniStat label="Média Proteína" value="150g" />
                <MiniStat label="Média Carboidratos" value="179g" />
                <MiniStat label="Dias na Meta" value="4 dias" />
                <MiniStat label="Dias Acima" value="3 dias" />
              </div>
            </>
          )}

          {period === 'month' && (
            <>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    />
                    <Line type="monotone" dataKey="avgCalories" stroke="hsl(160, 84%, 39%)" strokeWidth={2} dot={{ r: 4 }} name="Calorias" />
                    <Line type="monotone" dataKey="avgBurned" stroke="hsl(200, 80%, 50%)" strokeWidth={2} dot={{ r: 4 }} name="Gastas" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {monthlyData.map(w => (
                  <div key={w.week} className="bg-secondary/50 rounded-xl p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{w.week}</p>
                    <p className="text-sm font-semibold text-foreground">{w.avgCalories} kcal</p>
                    <p className="text-xs text-muted-foreground">{w.daysOnTarget} dias na meta</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {period === 'year' && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Dados anuais disponíveis em breve</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Continue registrando para acompanhar sua evolução</p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

const SummaryItem = ({ text, isNegative }: { text: string; isNegative: boolean }) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
    isNegative ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
  }`}>
    <span>{isNegative ? '⚠️' : '✅'}</span>
    <span className="font-medium">{text}</span>
  </div>
);

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-secondary/50 rounded-xl p-3">
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="text-sm font-semibold font-heading text-foreground">{value}</p>
  </div>
);

export default Dashboard;
