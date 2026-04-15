import { useApp } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';
import ProgressBar from '@/components/ProgressBar';
import { MessageCircle, Flame, TrendingUp, Utensils, Zap, Activity, Heart } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, ReferenceLine, Cell } from 'recharts';
import { weeklyData, monthlyData } from '@/data/mockData';

const motivationalQuotes = [
  "Cada refeição é uma oportunidade de evoluir.",
  "Consistência é o caminho. Continue firme.",
  "Seu corpo agradece cada escolha consciente.",
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

  const totalBurn = burn.total + bioimpedance.basalRate;
  const caloriesExceeded = caloriesRemaining < 0;
  const proteinExceeded = proteinRemaining < 0;
  const carbsExceeded = carbsRemaining < 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-4">
        {/* Header */}
        <div className="animate-fade-in pt-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">moveon health</p>
          <h1 className="text-3xl font-heading font-bold text-foreground mt-1">Olá, {userName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            15 de abril de 2026 — Quarta-feira
          </p>
          <p className="text-xs text-accent mt-2 font-medium tracking-wide">{quote}</p>
        </div>

        {/* Main Stats - Hero Cards */}
        <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Utensils size={13} strokeWidth={1.5} />
              <span className="text-[10px] font-medium uppercase tracking-wider">Consumidas</span>
            </div>
            <p className="text-3xl font-heading font-bold text-foreground tracking-tight">{totalCalories}</p>
            <p className="text-[10px] text-muted-foreground tracking-wide">kcal</p>
          </div>

          <div className="glass-card rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Flame size={13} strokeWidth={1.5} />
              <span className="text-[10px] font-medium uppercase tracking-wider">Gasto Total</span>
            </div>
            <p className="text-3xl font-heading font-bold text-foreground tracking-tight">{totalBurn}</p>
            <p className="text-[10px] text-muted-foreground tracking-wide">kcal (TMB + ativ.)</p>
          </div>

          <div className="glass-card rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp size={13} strokeWidth={1.5} />
              <span className="text-[10px] font-medium uppercase tracking-wider">Meta</span>
            </div>
            <p className="text-3xl font-heading font-bold text-foreground tracking-tight">{goal.caloriesTarget}</p>
            <p className="text-[10px] text-muted-foreground tracking-wide">kcal</p>
          </div>

          <div className="glass-card rounded-2xl p-4 space-y-1 stat-glow">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Zap size={13} strokeWidth={1.5} />
              <span className="text-[10px] font-medium uppercase tracking-wider">Saldo Líquido</span>
            </div>
            <p className={`text-3xl font-heading font-bold tracking-tight ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {netBalance > 0 ? '+' : ''}{netBalance}
            </p>
            <p className="text-[10px] text-muted-foreground tracking-wide">
              {netBalance < 0 ? 'déficit' : 'superávit'}
            </p>
          </div>
        </div>

        {/* Basal Info */}
        <div className="flex items-center justify-between px-1 animate-slide-up" style={{ animationDelay: '0.12s' }}>
          <div className="flex items-center gap-2">
            <Heart size={12} className="text-accent" />
            <span className="text-[10px] text-muted-foreground">TMB: <span className="text-foreground font-semibold">{bioimpedance.basalRate} kcal</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-accent" />
            <span className="text-[10px] text-muted-foreground">Atividade: <span className="text-foreground font-semibold">{burn.total} kcal</span></span>
          </div>
        </div>

        {/* Macro Progress */}
        <div className="glass-card rounded-2xl p-5 space-y-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">Progresso do Dia</h2>
          <ProgressBar value={totalCalories} max={goal.caloriesTarget} label="Calorias" unit=" kcal" />
          <ProgressBar value={totalProtein} max={goal.proteinTarget} label="Proteína" unit="g" />
          <ProgressBar value={totalCarbs} max={goal.carbsTarget} label="Carboidratos" unit="g" />
        </div>

        {/* Activity Card */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-accent" strokeWidth={1.5} />
            <h2 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">Atividade do Dia</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{burn.activity} — {burn.activityDuration}</p>
              <p className="text-sm text-muted-foreground">{burn.steps.toLocaleString()} passos</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-heading font-bold text-foreground">{burn.total}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">kcal atividade</p>
            </div>
          </div>
        </div>

        {/* Meals info */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">Refeições do Dia</h2>
            <span className="text-[10px] bg-foreground/10 text-foreground px-2.5 py-1 rounded-full font-medium">
              {todaysMeals.length} registros
            </span>
          </div>
          {lastMeal && (
            <p className="text-xs text-muted-foreground mb-3">
              Última refeição: {lastMeal.time} via {lastMeal.origin}
            </p>
          )}
          <div className="space-y-1">
            {todaysMeals.map(meal => (
              <div key={meal.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{meal.image}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{meal.typeLabel}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{meal.time} • {meal.origin}</p>
                  </div>
                </div>
                <p className="text-sm font-heading font-semibold text-foreground">{meal.calories} kcal</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 h-11 rounded-xl bg-[#25D366] text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]">
            <MessageCircle size={16} />
            Ver conversa no WhatsApp
          </button>
        </div>

        {/* Day Summary */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <h2 className="text-xs font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">Resumo do Dia</h2>
          <div className="space-y-2">
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
            <SummaryItem text={`TMB: ${bioimpedance.basalRate} kcal + Atividade: ${burn.total} kcal = ${totalBurn} kcal`} isNegative={false} />
            <SummaryItem
              text={`Saldo: ${netBalance > 0 ? '+' : ''}${netBalance} kcal (${netBalance < 0 ? 'déficit' : 'superávit'})`}
              isNegative={netBalance < 0}
            />
          </div>
        </div>

        {/* Evolution Section */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-xs font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">Evolução</h2>
          <div className="flex gap-2 mb-5">
            {(['week', 'month', 'year'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-wider transition-all ${
                  period === p
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Ano'}
              </button>
            ))}
          </div>

          {period === 'week' && (() => {
            const weeklyWithBalance = weeklyData.map(d => ({
              ...d,
              basal: bioimpedance.basalRate,
              balance: d.calories - (d.burned + bioimpedance.basalRate),
            }));
            return (
              <>
                <div className="h-48 mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyWithBalance}>
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(0 0% 55%)' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', background: 'hsl(0 0% 12%)', color: 'hsl(0 0% 90%)' }}
                        labelStyle={{ color: 'hsl(0 0% 70%)' }}
                      />
                      <Bar dataKey="calories" fill="hsl(0 0% 100%)" radius={[4, 4, 0, 0]} name="Consumidas" opacity={0.9} />
                      <Bar dataKey="burned" fill="hsl(0 0% 45%)" radius={[4, 4, 0, 0]} name="Atividade" />
                      <Bar dataKey="basal" fill="hsl(25 95% 53%)" radius={[4, 4, 0, 0]} name="TMB" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground mb-1 mt-4 uppercase tracking-wider">
                  Déficit / Superávit (TMB: {bioimpedance.basalRate} kcal)
                </p>
                <div className="h-32 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyWithBalance}>
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(0 0% 55%)' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', background: 'hsl(0 0% 12%)', color: 'hsl(0 0% 90%)' }}
                        formatter={(value: number) => [`${value > 0 ? '+' : ''}${value} kcal`, 'Saldo']}
                      />
                      <ReferenceLine y={0} stroke="hsl(0 0% 30%)" strokeDasharray="3 3" />
                      <Bar dataKey="balance" name="Saldo" radius={[4, 4, 4, 4]}>
                        {weeklyWithBalance.map((entry, index) => (
                          <Cell key={index} fill={entry.balance < 0 ? 'hsl(0 62% 55%)' : 'hsl(142 70% 45%)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(0 62% 55%)' }}></span> Déficit
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(142 70% 45%)' }}></span> Superávit
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(25 95% 53%)' }}></span> TMB
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <MiniStat label="Média Calorias" value="1.993 kcal" />
                  <MiniStat label="Média Gastas" value="499 kcal" />
                  <MiniStat label="Média Proteína" value="150g" />
                  <MiniStat label="Média Carboidratos" value="179g" />
                  <MiniStat label="Dias em Déficit" value={`${weeklyWithBalance.filter(d => d.balance < 0).length} dias`} />
                  <MiniStat label="Dias em Superávit" value={`${weeklyWithBalance.filter(d => d.balance >= 0).length} dias`} />
                </div>
              </>
            );
          })()}

          {period === 'month' && (() => {
            const monthlyWithBalance = monthlyData.map(d => ({
              ...d,
              basal: bioimpedance.basalRate,
              balance: d.avgCalories - (d.avgBurned + bioimpedance.basalRate),
            }));
            return (
              <>
                <div className="h-48 mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyWithBalance}>
                      <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(0 0% 55%)' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', background: 'hsl(0 0% 12%)', color: 'hsl(0 0% 90%)' }}
                      />
                      <Line type="monotone" dataKey="avgCalories" stroke="hsl(0 0% 100%)" strokeWidth={2} dot={{ r: 3, fill: 'hsl(0 0% 100%)' }} name="Calorias" />
                      <Line type="monotone" dataKey="avgBurned" stroke="hsl(0 0% 45%)" strokeWidth={2} dot={{ r: 3, fill: 'hsl(0 0% 45%)' }} name="Atividade" />
                      <Line type="monotone" dataKey="basal" stroke="hsl(25 95% 53%)" strokeWidth={2} dot={{ r: 3, fill: 'hsl(25 95% 53%)' }} name="TMB" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground mb-1 mt-4 uppercase tracking-wider">
                  Saldo Semanal (TMB: {bioimpedance.basalRate} kcal)
                </p>
                <div className="h-32 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyWithBalance}>
                      <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(0 0% 55%)' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', background: 'hsl(0 0% 12%)', color: 'hsl(0 0% 90%)' }}
                        formatter={(value: number) => [`${value > 0 ? '+' : ''}${value} kcal`, 'Saldo']}
                      />
                      <ReferenceLine y={0} stroke="hsl(0 0% 30%)" strokeDasharray="3 3" />
                      <Bar dataKey="balance" name="Saldo" radius={[4, 4, 4, 4]}>
                        {monthlyWithBalance.map((entry, index) => (
                          <Cell key={index} fill={entry.balance < 0 ? 'hsl(0 62% 55%)' : 'hsl(142 70% 45%)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {monthlyWithBalance.map(w => (
                    <div key={w.week} className="bg-secondary/50 rounded-xl p-3">
                      <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">{w.week}</p>
                      <p className="text-sm font-heading font-semibold text-foreground">{w.avgCalories} kcal</p>
                      <p className={`text-xs font-medium ${w.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {w.balance >= 0 ? `+${w.balance}` : w.balance} kcal
                      </p>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}

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
  <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm ${
    isNegative ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'
  }`}>
    <span className="text-xs">{isNegative ? '▲' : '▼'}</span>
    <span className="font-medium text-xs">{text}</span>
  </div>
);

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-secondary/50 rounded-xl p-3">
    <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-semibold font-heading text-foreground">{value}</p>
  </div>
);

export default Dashboard;
