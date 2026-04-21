import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { Trash2, Utensils, Activity } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface MealRow {
  id: string;
  estimated_kcal: number | null;
  estimated_protein: number | null;
  estimated_carbs: number | null;
  original_text: string | null;
  media_url: string | null;
  source: string | null;
  status: string | null;
  created_at: string;
}

interface ActivityRow {
  id: string;
  activity_type: string | null;
  activity_duration: string | null;
  activity_distance: string | null;
  activity_steps: number | null;
  estimated_burn_kcal: number | null;
  status: string | null;
  created_at: string;
}

type Tab = 'meals' | 'activities';

const MealHistory = () => {
  const { clientId, deleteMeal, deleteActivity } = useApp();
  const [tab, setTab] = useState<Tab>('meals');
  const [meals, setMeals] = useState<MealRow[]>([]);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!clientId) {
      setMeals([]); setActivities([]); setLoading(false);
      return;
    }
    setLoading(true);
    const [{ data: m }, { data: a }] = await Promise.all([
      supabase.from('meal_logs').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(200),
      supabase.from('activity_logs').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(200),
    ]);
    setMeals((m ?? []) as MealRow[]);
    setActivities((a ?? []) as ActivityRow[]);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    if (!clientId) return;
    const ch = supabase
      .channel(`history_${clientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_logs', filter: `client_id=eq.${clientId}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs', filter: `client_id=eq.${clientId}` }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const handleDeleteMeal = async (id: string) => {
    try {
      await deleteMeal(id);
      toast.success('Refeição excluída');
    } catch {
      toast.error('Não foi possível excluir');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      await deleteActivity(id);
      toast.success('Atividade excluída');
    } catch {
      toast.error('Não foi possível excluir');
    }
  };

  const groupByDate = <T extends { created_at: string }>(rows: T[]) =>
    rows.reduce((acc, r) => {
      const date = new Date(r.created_at).toISOString().slice(0, 10);
      (acc[date] ||= []).push(r);
      return acc;
    }, {} as Record<string, T[]>);

  const formatDate = (d: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yesterday = y.toISOString().slice(0, 10);
    if (d === today) return 'Hoje';
    if (d === yesterday) return 'Ontem';
    const [yr, m, day] = d.split('-');
    return `${day}/${m}/${yr}`;
  };

  const groupedMeals = groupByDate(meals);
  const groupedActivities = groupByDate(activities);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-heading font-bold text-foreground">Histórico</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tab === 'meals' ? `${meals.length} refeições registradas` : `${activities.length} atividades registradas`}
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/50 rounded-xl">
          <button
            onClick={() => setTab('meals')}
            className={`h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              tab === 'meals' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <Utensils size={14} /> Refeições
          </button>
          <button
            onClick={() => setTab('activities')}
            className={`h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              tab === 'activities' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <Activity size={14} /> Atividades
          </button>
        </div>

        {loading && <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>}

        {!loading && tab === 'meals' && meals.length === 0 && (
          <EmptyState text="Nenhuma refeição registrada ainda" hint="Envie uma foto ou descrição pelo WhatsApp." />
        )}

        {!loading && tab === 'activities' && activities.length === 0 && (
          <EmptyState text="Nenhuma atividade registrada ainda" hint="Envie uma descrição ou print de smartwatch pelo WhatsApp." />
        )}

        {!loading && tab === 'meals' && meals.length > 0 && (
          <div className="space-y-4">
            {Object.entries(groupedMeals).map(([date, rows]) => (
              <div key={date}>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">{formatDate(date)}</p>
                <div className="space-y-2">
                  {rows.map(meal => {
                    const time = new Date(meal.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={meal.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-xl">
                          {meal.media_url ? '📷' : '🍽️'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {meal.original_text?.slice(0, 40) || 'Refeição'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {time} • {meal.source === 'whatsapp' ? 'WhatsApp' : 'App'}
                            {meal.status === 'pending' && ' • analisando...'}
                            {meal.status === 'error' && ' • erro'}
                          </p>
                        </div>
                        <div className="text-right mr-1">
                          <p className="text-sm font-semibold text-foreground">{Math.round(Number(meal.estimated_kcal ?? 0))} kcal</p>
                          <p className="text-[10px] text-muted-foreground">
                            {Math.round(Number(meal.estimated_protein ?? 0))}g P • {Math.round(Number(meal.estimated_carbs ?? 0))}g C
                          </p>
                        </div>
                        <DeleteButton onConfirm={() => handleDeleteMeal(meal.id)} label="esta refeição" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 'activities' && activities.length > 0 && (
          <div className="space-y-4">
            {Object.entries(groupedActivities).map(([date, rows]) => (
              <div key={date}>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">{formatDate(date)}</p>
                <div className="space-y-2">
                  {rows.map(act => {
                    const time = new Date(act.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    const details = [
                      act.activity_duration,
                      act.activity_distance,
                      act.activity_steps ? `${act.activity_steps.toLocaleString('pt-BR')} passos` : null,
                    ].filter(Boolean).join(' • ');
                    return (
                      <div key={act.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                          <Activity size={20} className="text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{act.activity_type || 'Atividade'}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {time} {details && `• ${details}`}
                            {act.status === 'pending' && ' • analisando...'}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-foreground mr-1">
                          {Math.round(Number(act.estimated_burn_kcal ?? 0))} kcal
                        </p>
                        <DeleteButton onConfirm={() => handleDeleteActivity(act.id)} label="esta atividade" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

const DeleteButton = ({ onConfirm, label }: { onConfirm: () => void; label: string }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <button
        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        aria-label={`Excluir ${label}`}
      >
        <Trash2 size={14} />
      </button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Excluir {label}?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta ação não pode ser desfeita e o total do dia será atualizado automaticamente.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Excluir</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const EmptyState = ({ text, hint }: { text: string; hint: string }) => (
  <div className="glass-card rounded-2xl p-8 text-center space-y-2">
    <p className="text-sm font-medium text-foreground">{text}</p>
    <p className="text-xs text-muted-foreground">{hint}</p>
  </div>
);

export default MealHistory;
