import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';
import NutritionRing from '@/components/NutritionRing';
import HistoryChart from '@/components/HistoryChart';
import { MessageCircle, Flame, Utensils, Zap, Activity, Heart, Send, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCalorieStatus, objectiveLabels } from '@/lib/goalStatus';
import logo from '@/assets/logo.png';

const Dashboard = () => {
  const {
    userName, totalCalories, totalProtein, totalCarbs,
    goal, totalBurn, caloriesRemaining, proteinRemaining, carbsRemaining, netBalance,
    meals, activities, bioimpedance, hasClientRecord, clientId,
  } = useApp();
  const [sendingReport, setSendingReport] = useState(false);

  const handleSendDailyReport = async () => {
    if (!clientId) {
      toast.error('Sua conta ainda não está vinculada a um WhatsApp.');
      return;
    }
    setSendingReport(true);
    try {
      const { data, error } = await supabase.functions.invoke('daily-report', {
        body: { client_id: clientId },
      });
      if (error) throw error;
      const result = data?.results?.[0];
      if (result?.sent) toast.success('Resumo do dia enviado para seu WhatsApp! 📊');
      else if (result?.error) toast.error(`Falha ao enviar: ${result.error}`);
      else toast.info('Resumo gerado, mas envio não confirmado.');
    } catch (e) {
      toast.error('Erro ao gerar resumo do dia.');
    } finally {
      setSendingReport(false);
    }
  };

  const totalExpenditure = totalBurn + bioimpedance.basalRate;
  const balanceStatus = getCalorieStatus(netBalance, goal.objective);
  const todayIso = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  // Estimativa de gordura: 25% das kcal da meta / 9
  const fatsTarget = Math.round((goal.caloriesTarget * 0.25) / 9);
  const totalFats = meals.reduce((sum, m) => sum + Math.round((m.calories * 0.3) / 9), 0);

  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', weekday: 'long',
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-4">
        {/* Header */}
        <div className="animate-fade-in pt-2">
          <img src={logo} alt="OnTrack" className="h-10 object-contain invert dark:invert-0 -ml-1" />
          <h1 className="text-3xl font-heading font-bold text-foreground mt-3">Olá, {userName}</h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{today}</p>
          <Link
            to="/diet"
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 hover:bg-card transition-colors"
          >
            <Target size={12} className="text-accent" strokeWidth={1.8} />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Objetivo</span>
            <span className="text-[11px] font-semibold text-foreground">{objectiveLabels[goal.objective]}</span>
          </Link>
        </div>

        {!hasClientRecord && (
          <div className="rounded-2xl border border-border bg-card/40 p-4 text-sm text-muted-foreground">
            Sua conta ainda não está vinculada a um número de WhatsApp. Peça acesso ao seu nutricionista para começar a registrar refeições e atividades.
          </div>
        )}

        {/* Hero ring — calorias consumidas */}
        <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <NutritionRing
            consumed={totalCalories}
            goal={goal.caloriesTarget}
            protein={{ current: totalProtein, goal: goal.proteinTarget }}
            carbs={{ current: totalCarbs, goal: goal.carbsTarget }}
            fats={{ current: totalFats, goal: fatsTarget }}
          />
        </div>

        {/* Consumido vs Gasto vs Saldo */}
        <div className="grid grid-cols-3 gap-2 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="glass-card rounded-2xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Utensils size={12} strokeWidth={1.5} />
              <span className="text-[10px] font-medium uppercase tracking-wider">Consumidas</span>
            </div>
            <p className="text-xl font-heading font-bold text-foreground tracking-tight">{totalCalories}</p>
            <p className="text-[10px] text-muted-foreground">kcal</p>
          </div>
          <div className="glass-card rounded-2xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Flame size={12} strokeWidth={1.5} />
              <span className="text-[10px] font-medium uppercase tracking-wider">Gastas</span>
            </div>
            <p className="text-xl font-heading font-bold text-foreground tracking-tight">{totalExpenditure}</p>
            <p className="text-[10px] text-muted-foreground">TMB + ativ.</p>
          </div>
          <div className="glass-card rounded-2xl p-3 space-y-1 stat-glow">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Zap size={12} strokeWidth={1.5} />
              <span className="text-[10px] font-medium uppercase tracking-wider">Saldo</span>
            </div>
            <p className={`text-xl font-heading font-bold tracking-tight ${balanceStatus.textClass}`}>
              {netBalance > 0 ? '+' : ''}{netBalance}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {balanceStatus.label.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Status do objetivo */}
        {bioimpedance.basalRate === 0 ? (
          <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 animate-slide-up" style={{ animationDelay: '0.17s' }}>
            <p className="text-xs font-semibold text-warning">Configure sua TMB para ver o saldo calórico</p>
            <p className="text-[11px] mt-1 text-warning/80 leading-snug">
              Acesse o Perfil e informe seu Gasto Basal (TMB) para que o dashboard calcule corretamente seu déficit ou superávit.
            </p>
            <Link to="/profile" className="text-[11px] font-semibold underline text-warning mt-1 inline-block">
              Configurar agora →
            </Link>
          </div>
        ) : (
          <div
            className={`rounded-2xl border px-4 py-3 animate-slide-up ${balanceStatus.bgClass} border-current/20`}
            style={{ animationDelay: '0.17s' }}
          >
            <div className="flex items-start gap-2.5">
              <Target size={14} className="mt-0.5 shrink-0" strokeWidth={2} />
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-tight">{balanceStatus.label}</p>
                <p className="text-[11px] mt-1 leading-snug opacity-90">{balanceStatus.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Basal info */}
        <div className="flex items-center justify-between px-1 animate-slide-up" style={{ animationDelay: '0.18s' }}>
          <div className="flex items-center gap-2">
            <Heart size={12} className="text-accent" />
            <span className="text-[10px] text-muted-foreground">TMB: <span className="text-foreground font-semibold">{bioimpedance.basalRate} kcal</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-accent" />
            <span className="text-[10px] text-muted-foreground">Atividade: <span className="text-foreground font-semibold">{totalBurn} kcal</span></span>
          </div>
        </div>

        {/* Histórico semanal/mensal */}
        <HistoryChart
          clientId={clientId}
          basalFallback={bioimpedance.basalRate}
          objective={goal.objective}
          currentDay={{
            date: todayIso,
            consumed: totalCalories,
            activity: totalBurn,
            basal: bioimpedance.basalRate,
            mealCount: meals.length,
            activityCount: activities.length,
          }}
        />

        {/* Atividades do dia */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-accent" strokeWidth={1.5} />
              <h2 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">Atividades do Dia</h2>
            </div>
            <span className="text-[10px] bg-foreground/10 text-foreground px-2.5 py-1 rounded-full font-medium">
              {activities.length} {activities.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
          {activities.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">Nenhuma atividade registrada ainda. Envie uma mensagem ou print de smartwatch pelo WhatsApp.</p>
          ) : (
            <div className="space-y-1">
              {activities.map(a => (
                <div key={a.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.activity_type || 'Atividade'}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {[a.activity_duration, a.activity_distance, a.activity_steps ? `${a.activity_steps.toLocaleString('pt-BR')} passos` : null]
                        .filter(Boolean).join(' • ') || 'sem detalhes'}
                    </p>
                  </div>
                  <p className="text-sm font-heading font-semibold text-foreground">{Math.round(Number(a.estimated_burn_kcal ?? 0))} kcal</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refeições do dia */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Utensils size={14} className="text-accent" strokeWidth={1.5} />
              <h2 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">Refeições do Dia</h2>
            </div>
            <span className="text-[10px] bg-foreground/10 text-foreground px-2.5 py-1 rounded-full font-medium">
              {meals.length} {meals.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
          {meals.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">Nenhuma refeição registrada ainda. Envie uma foto ou descrição pelo WhatsApp.</p>
          ) : (
            <div className="space-y-1">
              {meals.map(meal => (
                <div key={meal.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg">{meal.image}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{meal.typeLabel}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{meal.time} • {meal.origin}</p>
                    </div>
                  </div>
                  <p className="text-sm font-heading font-semibold text-foreground">{meal.calories} kcal</p>
                </div>
              ))}
            </div>
          )}
          <Link to="/whatsapp" className="w-full mt-4 h-11 rounded-xl bg-[#25D366] text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]">
            <MessageCircle size={16} />
            Ver conversa no WhatsApp
          </Link>
        </div>

        {/* Resumo do dia */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <h2 className="text-xs font-heading font-semibold text-foreground mb-4 uppercase tracking-wider">Resumo do Dia</h2>
          <div className="space-y-2">
            <SummaryItem
              text={caloriesRemaining < 0 ? `Excedeu ${Math.abs(caloriesRemaining)} kcal da meta` : `Faltam ${caloriesRemaining} kcal para sua meta`}
              tone="neutral"
            />
            <SummaryItem
              text={proteinRemaining < 0 ? `Excedeu ${Math.abs(proteinRemaining)}g de proteína` : `Faltam ${proteinRemaining}g de proteína`}
              tone="neutral"
            />
            <SummaryItem
              text={carbsRemaining < 0 ? `Excedeu ${Math.abs(carbsRemaining)}g de carboidrato` : `Faltam ${carbsRemaining}g de carboidrato`}
              tone="neutral"
            />
            <SummaryItem text={`TMB: ${bioimpedance.basalRate} kcal + Atividade: ${totalBurn} kcal = ${totalExpenditure} kcal`} tone="neutral" />
            <SummaryItem
              text={`${balanceStatus.label} — Saldo ${netBalance > 0 ? '+' : ''}${netBalance} kcal`}
              tone={balanceStatus.tone}
            />
          </div>
        </div>

        {/* Enviar resumo no WhatsApp */}
        {hasClientRecord && (
          <button
            onClick={handleSendDailyReport}
            disabled={sendingReport}
            className="w-full glass-card rounded-2xl p-4 flex items-center justify-center gap-2 text-sm font-medium text-foreground hover:bg-accent/5 transition-colors disabled:opacity-50 animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <Send size={16} strokeWidth={1.5} />
            {sendingReport ? 'Enviando resumo...' : 'Enviar resumo do dia no WhatsApp'}
          </button>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

type SummaryTone = 'success' | 'warning' | 'destructive' | 'neutral';

const toneClass: Record<SummaryTone, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  neutral: 'bg-foreground/5 text-foreground',
};

const SummaryItem = ({ text, tone }: { text: string; tone: SummaryTone }) => (
  <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm ${toneClass[tone]}`}>
    <span className="text-xs">•</span>
    <span className="font-medium text-xs">{text}</span>
  </div>
);

export default Dashboard;
