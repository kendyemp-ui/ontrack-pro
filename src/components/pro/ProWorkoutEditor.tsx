import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Plus, Trash2, Save, Loader2, ChevronDown, ChevronUp,
  Dumbbell, X, Moon, Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string;
  order_index: number;
}

interface WorkoutDay {
  id?: string;
  day_of_week: number;    // 0=Dom … 6=Sáb
  day_label: string;
  focus: string;
  is_rest: boolean;
  order_index: number;
  exercises: Exercise[];
  expanded: boolean;
}

interface WorkoutPlan {
  id?: string;
  name: string;
  notes: string;
  days: WorkoutDay[];
}

// ── Constantes ────────────────────────────────────────────────────────────────
const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const FOCUS_SUGGESTIONS = [
  'Peito + Tríceps', 'Costas + Bíceps', 'Pernas', 'Ombro + Trapézio',
  'Peito + Bíceps', 'Pernas + Panturrilha', 'Core + Abdômen',
  'Cardio', 'Cardio HIIT', 'Fullbody', 'Descanso ativo',
];

const REST_OPTIONS = [
  { label: '30s', value: 30 }, { label: '45s', value: 45 },
  { label: '60s', value: 60 }, { label: '90s', value: 90 },
  { label: '2min', value: 120 }, { label: '3min', value: 180 },
];

const EMPTY_EXERCISE = (): Exercise => ({
  name: '', sets: 3, reps: '10-12', rest_seconds: 60, notes: '', order_index: 0,
});

const EMPTY_PLAN = (): WorkoutPlan => ({
  name: 'Plano de Treino',
  notes: '',
  days: DAY_LABELS.map((label, i) => ({
    day_of_week: i,
    day_label: label,
    focus: i === 0 || i === 4 ? 'Descanso' : '',
    is_rest: i === 0 || i === 4,
    order_index: i,
    exercises: [],
    expanded: i !== 0 && i !== 4,
  })),
});

// ── Componente principal ──────────────────────────────────────────────────────
export default function ProWorkoutEditor({ clientId }: { clientId: string }) {
  const [plan, setPlan] = useState<WorkoutPlan>(EMPTY_PLAN());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasPlan, setHasPlan] = useState(false);

  // ── Carrega plano existente ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: planRow } = await supabase
        .from('workout_plans')
        .select('id,name,source')
        .eq('client_id', clientId)
        .eq('source', 'pro')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!planRow) { setLoading(false); return; }

      const { data: dayRows } = await supabase
        .from('workout_days')
        .select('id,day_of_week,day_label,focus,is_rest,order_index')
        .eq('plan_id', planRow.id)
        .order('order_index');

      const days: WorkoutDay[] = await Promise.all(
        (dayRows ?? []).map(async (d: any) => {
          const { data: exRows } = await supabase
            .from('workout_exercises')
            .select('id,name,sets,reps,rest_seconds,notes,order_index')
            .eq('day_id', d.id)
            .order('order_index');
          return {
            ...d,
            exercises: (exRows ?? []) as Exercise[],
            expanded: !d.is_rest,
          };
        })
      );

      // Preenche dias faltando (garante sempre 7)
      const filled = DAY_LABELS.map((label, i) => {
        const found = days.find(d => d.day_of_week === i);
        return found ?? {
          day_of_week: i, day_label: label, focus: '', is_rest: false,
          order_index: i, exercises: [], expanded: true,
        };
      });

      setPlan({ id: planRow.id, name: planRow.name, notes: '', days: filled });
      setHasPlan(true);
      setLoading(false);
    };
    load();
  }, [clientId]);

  // ── Helpers de edição ───────────────────────────────────────────────────────
  const updateDay = (dayIdx: number, patch: Partial<WorkoutDay>) =>
    setPlan(p => ({ ...p, days: p.days.map((d, i) => i === dayIdx ? { ...d, ...patch } : d) }));

  const toggleRest = (dayIdx: number) => {
    const d = plan.days[dayIdx];
    updateDay(dayIdx, {
      is_rest: !d.is_rest,
      focus: !d.is_rest ? 'Descanso' : '',
      exercises: !d.is_rest ? [] : d.exercises,
      expanded: d.is_rest,
    });
  };

  const addExercise = (dayIdx: number) =>
    updateDay(dayIdx, { exercises: [...plan.days[dayIdx].exercises, EMPTY_EXERCISE()] });

  const removeExercise = (dayIdx: number, exIdx: number) =>
    updateDay(dayIdx, { exercises: plan.days[dayIdx].exercises.filter((_, i) => i !== exIdx) });

  const updateExercise = (dayIdx: number, exIdx: number, patch: Partial<Exercise>) =>
    updateDay(dayIdx, {
      exercises: plan.days[dayIdx].exercises.map((e, i) => i === exIdx ? { ...e, ...patch } : e),
    });

  // ── Salvar ──────────────────────────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // 1) Upsert plan
      let planId = plan.id;
      if (planId) {
        await supabase.from('workout_plans').update({ name: plan.name }).eq('id', planId);
        // Limpa dias antigos (cascade nos exercises)
        await supabase.from('workout_days').delete().eq('plan_id', planId);
      } else {
        const { data: newPlan, error: planErr } = await supabase
          .from('workout_plans')
          .insert({ client_id: clientId, user_id: user.id, name: plan.name, source: 'pro', is_active: true })
          .select('id').single();
        if (planErr) throw planErr;
        planId = newPlan.id;
      }

      // 2) Inserir dias + exercícios
      for (const day of plan.days) {
        const { data: newDay, error: dayErr } = await supabase
          .from('workout_days')
          .insert({
            plan_id: planId,
            day_of_week: day.day_of_week,
            day_label: day.day_label,
            focus: day.focus || (day.is_rest ? 'Descanso' : ''),
            is_rest: day.is_rest,
            order_index: day.order_index,
          })
          .select('id').single();
        if (dayErr) throw dayErr;

        if (!day.is_rest && day.exercises.length > 0) {
          const exRows = day.exercises.map((ex, i) => ({
            day_id: newDay.id,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            rest_seconds: ex.rest_seconds,
            notes: ex.notes,
            order_index: i,
          }));
          const { error: exErr } = await supabase.from('workout_exercises').insert(exRows);
          if (exErr) throw exErr;
        }
      }

      setPlan(p => ({ ...p, id: planId }));
      setHasPlan(true);
      toast.success('Plano de treino salvo! O aluno verá na aba Treino do app.');
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-muted-foreground" size={24} />
    </div>
  );

  const trainingDays = plan.days.filter(d => !d.is_rest).length;

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase mb-1 block">
                Nome do plano
              </label>
              <input
                className="w-full text-sm font-semibold bg-secondary/40 rounded-lg px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={plan.name}
                onChange={e => setPlan(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Plano de Hipertrofia — 5x"
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Dumbbell size={12} />
                <strong className="text-foreground">{trainingDays}</strong> dias de treino
              </span>
              <span>•</span>
              <span><strong className="text-foreground">{7 - trainingDays}</strong> dias de descanso</span>
              {hasPlan && (
                <>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Plano ativo no app
                  </span>
                </>
              )}
            </div>
          </div>
          <Button onClick={save} disabled={saving} className="shrink-0">
            {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
            {saving ? 'Salvando...' : 'Salvar plano'}
          </Button>
        </div>
      </Card>

      {/* Dias da semana */}
      {plan.days.map((day, dayIdx) => (
        <Card
          key={dayIdx}
          className={cn(
            'overflow-hidden transition-all',
            day.is_rest && 'opacity-60'
          )}
        >
          {/* Header do dia */}
          <div
            className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-secondary/30 transition-colors"
            onClick={() => !day.is_rest && updateDay(dayIdx, { expanded: !day.expanded })}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold',
              day.is_rest ? 'bg-secondary text-muted-foreground' : 'bg-primary/10 text-primary'
            )}>
              {day.day_label}
            </div>

            <div className="flex-1 min-w-0">
              {day.is_rest ? (
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Moon size={13} /> Descanso
                </span>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Input de foco muscular inline */}
                  <input
                    className="text-sm font-semibold bg-transparent border-b border-dashed border-border focus:outline-none focus:border-primary w-48"
                    placeholder="Foco muscular (ex: Peito + Tríceps)"
                    value={day.focus}
                    onChange={e => { e.stopPropagation(); updateDay(dayIdx, { focus: e.target.value }); }}
                    onClick={e => e.stopPropagation()}
                  />
                  {/* Sugestões rápidas */}
                  {!day.focus && (
                    <div className="flex gap-1 flex-wrap" onClick={e => e.stopPropagation()}>
                      {FOCUS_SUGGESTIONS.slice(0, 4).map(s => (
                        <button
                          key={s}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => updateDay(dayIdx, { focus: s })}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
              {!day.is_rest && (
                <span className="text-[10px] text-muted-foreground">
                  {day.exercises.length} exercício{day.exercises.length !== 1 ? 's' : ''}
                </span>
              )}
              <button
                className={cn(
                  'text-[10px] px-2.5 py-1 rounded-lg font-medium transition-colors',
                  day.is_rest
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                )}
                onClick={() => toggleRest(dayIdx)}
              >
                {day.is_rest ? '+ Adicionar treino' : 'Marcar descanso'}
              </button>
              {!day.is_rest && (
                <button className="text-muted-foreground hover:text-foreground">
                  {day.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
            </div>
          </div>

          {/* Lista de exercícios */}
          {!day.is_rest && day.expanded && (
            <div className="px-5 pb-4 pt-1 border-t border-border/50 space-y-2">

              {day.exercises.length === 0 && (
                <p className="text-xs text-muted-foreground py-3 text-center">
                  Nenhum exercício ainda. Clique em "+ Adicionar exercício" abaixo.
                </p>
              )}

              {day.exercises.map((ex, exIdx) => (
                <div key={exIdx} className="flex gap-2 items-start bg-secondary/30 rounded-xl p-3">
                  {/* Número */}
                  <div className="w-6 h-6 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {exIdx + 1}
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2">
                    {/* Nome */}
                    <input
                      className="text-sm bg-background rounded-lg px-3 py-1.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
                      placeholder="Nome do exercício"
                      value={ex.name}
                      onChange={e => updateExercise(dayIdx, exIdx, { name: e.target.value })}
                    />
                    {/* Séries */}
                    <div className="flex items-center gap-1">
                      <label className="text-[10px] text-muted-foreground whitespace-nowrap">Séries</label>
                      <input
                        type="number"
                        className="w-12 text-center text-sm bg-background rounded-lg px-2 py-1.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                        value={ex.sets}
                        min={1} max={10}
                        onChange={e => updateExercise(dayIdx, exIdx, { sets: Number(e.target.value) })}
                      />
                    </div>
                    {/* Reps */}
                    <div className="flex items-center gap-1">
                      <label className="text-[10px] text-muted-foreground whitespace-nowrap">Reps</label>
                      <input
                        className="w-20 text-center text-sm bg-background rounded-lg px-2 py-1.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="10-12"
                        value={ex.reps}
                        onChange={e => updateExercise(dayIdx, exIdx, { reps: e.target.value })}
                      />
                    </div>
                    {/* Descanso */}
                    <div className="flex items-center gap-1">
                      <label className="text-[10px] text-muted-foreground whitespace-nowrap">Descanso</label>
                      <select
                        className="text-sm bg-background rounded-lg px-2 py-1.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                        value={ex.rest_seconds}
                        onChange={e => updateExercise(dayIdx, exIdx, { rest_seconds: Number(e.target.value) })}
                      >
                        {REST_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Observação */}
                  <div className="w-full sm:hidden" />
                  <input
                    className="col-span-full text-xs bg-background rounded-lg px-3 py-1.5 border border-border focus:outline-none text-muted-foreground hidden"
                    placeholder="Observação (opcional)"
                    value={ex.notes}
                    onChange={e => updateExercise(dayIdx, exIdx, { notes: e.target.value })}
                  />

                  <button
                    className="text-muted-foreground hover:text-destructive transition-colors mt-0.5 shrink-0"
                    onClick={() => removeExercise(dayIdx, exIdx)}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}

              <button
                className="w-full flex items-center justify-center gap-1.5 text-xs text-primary hover:text-primary/80 border border-dashed border-primary/30 hover:border-primary/60 rounded-xl py-2.5 transition-colors"
                onClick={() => addExercise(dayIdx)}
              >
                <Plus size={13} />
                Adicionar exercício
              </button>
            </div>
          )}
        </Card>
      ))}

      {/* Botão salvar bottom */}
      <div className="flex justify-end pt-2">
        <Button onClick={save} disabled={saving} size="lg">
          {saving ? <Loader2 size={15} className="animate-spin mr-2" /> : <Save size={15} className="mr-2" />}
          {saving ? 'Salvando...' : 'Salvar plano de treino'}
        </Button>
      </div>

      {/* Banner futuro */}
      <Card className="p-4 bg-secondary/30 border-dashed">
        <p className="text-xs text-muted-foreground text-center">
          🔒 Em breve: biblioteca de exercícios, templates salvos e acompanhamento de cargas
        </p>
      </Card>
    </div>
  );
}
