import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePro } from '@/contexts/ProContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Plus, Trash2, Save, Loader2, ChevronDown, ChevronUp,
  UtensilsCrossed, Sparkles, X, Check, BookmarkPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── types ─────────────────────────────────────────────────────────────────────
interface Food {
  id?: string;
  food_name: string;
  quantity: number;
  unit: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  id?: string;
  name: string;
  time_suggestion: string;
  meal_order: number;
  foods: Food[];
  expanded: boolean;
}

interface Plan {
  id?: string;
  name: string;
  objective: string;
  notes: string;
  meals: Meal[];
}

interface CustomTemplate {
  id: string;
  name: string;
  target_kcal: number | null;
  objective: string;
  meals_json: any[];
  created_at: string;
}

// ── constants ─────────────────────────────────────────────────────────────────
const UNITS = ['g', 'ml', 'unidade', 'fatia', 'colher de sopa', 'xícara'];
const OBJECTIVES = [
  { value: 'lose',     label: 'Perda de gordura' },
  { value: 'maintain', label: 'Manutenção' },
  { value: 'gain',     label: 'Ganho de massa' },
];
const DEFAULT_MEALS = ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar'];
const KCAL_LEVELS = [1500, 1750, 2000, 2500, 3000, 4000] as const;

// ── built-in templates (always visible as suggestions) ────────────────────────
function buildTemplate(targetKcal: number): Plan {
  const s = targetKcal / 2000;
  const sc = (n: number) => Math.max(0, Math.round(n * s));
  return {
    name: `Plano ${targetKcal} kcal`,
    objective: targetKcal <= 1750 ? 'lose' : targetKcal <= 2200 ? 'maintain' : 'gain',
    notes: `Plano base de ${targetKcal} kcal/dia. Ajuste conforme necessidade do paciente.`,
    meals: [
      {
        name: 'Café da manhã', time_suggestion: '07:00', meal_order: 0, expanded: true,
        foods: [
          { food_name: 'Ovos mexidos',    quantity: Math.max(1, sc(2)),  unit: 'unidade', kcal: sc(140), protein: sc(12), carbs: sc(1),  fat: sc(10) },
          { food_name: 'Aveia',           quantity: sc(40),              unit: 'g',       kcal: sc(148), protein: sc(5),  carbs: sc(27), fat: sc(3)  },
          { food_name: 'Leite desnatado', quantity: sc(200),             unit: 'ml',      kcal: sc(70),  protein: sc(7),  carbs: sc(10), fat: 0      },
          { food_name: 'Banana',          quantity: Math.max(0, sc(1)),  unit: 'unidade', kcal: sc(89),  protein: sc(1),  carbs: sc(23), fat: 0      },
        ].filter(f => f.quantity > 0 && f.kcal > 0),
      },
      {
        name: 'Lanche da manhã', time_suggestion: '10:00', meal_order: 1, expanded: false,
        foods: [
          { food_name: 'Iogurte grego',    quantity: sc(170), unit: 'g', kcal: sc(100), protein: sc(17), carbs: sc(6),  fat: 0     },
          { food_name: 'Granola',          quantity: sc(25),  unit: 'g', kcal: sc(100), protein: sc(2),  carbs: sc(17), fat: sc(3) },
          { food_name: 'Frutas vermelhas', quantity: sc(80),  unit: 'g', kcal: sc(40),  protein: sc(1),  carbs: sc(10), fat: 0     },
        ].filter(f => f.quantity > 0 && f.kcal > 0),
      },
      {
        name: 'Almoço', time_suggestion: '12:30', meal_order: 2, expanded: false,
        foods: [
          { food_name: 'Arroz integral',  quantity: sc(150), unit: 'g',  kcal: sc(195), protein: sc(4),  carbs: sc(43), fat: sc(2)  },
          { food_name: 'Feijão carioca',  quantity: sc(100), unit: 'g',  kcal: sc(75),  protein: sc(5),  carbs: sc(14), fat: 0      },
          { food_name: 'Frango grelhado', quantity: sc(160), unit: 'g',  kcal: sc(267), protein: sc(50), carbs: 0,      fat: sc(6)  },
          { food_name: 'Salada verde',    quantity: 100,     unit: 'g',  kcal: 25,      protein: 2,      carbs: 5,      fat: 0      },
          { food_name: 'Azeite de oliva', quantity: sc(10),  unit: 'ml', kcal: sc(90),  protein: 0,      carbs: 0,      fat: sc(10) },
        ].filter(f => f.quantity > 0 && f.kcal > 0),
      },
      {
        name: 'Lanche da tarde', time_suggestion: '16:00', meal_order: 3, expanded: false,
        foods: [
          { food_name: 'Whey protein',      quantity: 30,              unit: 'g',       kcal: sc(120), protein: sc(24), carbs: sc(4),  fat: sc(2)  },
          { food_name: 'Banana',            quantity: Math.max(1, sc(1)), unit: 'unidade', kcal: sc(89),  protein: sc(1),  carbs: sc(23), fat: 0     },
          { food_name: 'Pasta de amendoim', quantity: sc(20),          unit: 'g',       kcal: sc(120), protein: sc(5),  carbs: sc(4),  fat: sc(10) },
        ].filter(f => f.quantity > 0 && f.kcal > 0),
      },
      {
        name: 'Jantar', time_suggestion: '19:30', meal_order: 4, expanded: false,
        foods: [
          { food_name: 'Filé de frango', quantity: sc(160), unit: 'g',  kcal: sc(267), protein: sc(50), carbs: 0,      fat: sc(6)  },
          { food_name: 'Batata doce',    quantity: sc(180), unit: 'g',  kcal: sc(155), protein: sc(3),  carbs: sc(36), fat: 0      },
          { food_name: 'Brócolis',       quantity: sc(100), unit: 'g',  kcal: sc(34),  protein: sc(3),  carbs: sc(7),  fat: 0      },
          { food_name: 'Azeite de oliva',quantity: sc(10),  unit: 'ml', kcal: sc(90),  protein: 0,      carbs: 0,      fat: sc(10) },
        ].filter(f => f.quantity > 0 && f.kcal > 0),
      },
    ],
  };
}

// Pre-compute summaries for picker UI
const SYSTEM_TEMPLATES = KCAL_LEVELS.map(kcal => {
  const t = buildTemplate(kcal);
  const totals = t.meals.reduce(
    (acc, m) => ({
      kcal:    acc.kcal    + m.foods.reduce((s, f) => s + f.kcal,    0),
      protein: acc.protein + m.foods.reduce((s, f) => s + f.protein, 0),
      carbs:   acc.carbs   + m.foods.reduce((s, f) => s + f.carbs,   0),
      fat:     acc.fat     + m.foods.reduce((s, f) => s + f.fat,     0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
  return {
    targetKcal: kcal,
    label: `${kcal} kcal`,
    objective: t.objective,
    objectiveLabel: kcal <= 1750 ? 'Perda de gordura' : kcal <= 2200 ? 'Manutenção' : 'Ganho de massa',
    totalKcal: Math.round(totals.kcal),
    protein:   Math.round(totals.protein),
    carbs:     Math.round(totals.carbs),
    fat:       Math.round(totals.fat),
  };
});

// ── utils ─────────────────────────────────────────────────────────────────────
const emptyFood = (): Food => ({ food_name: '', quantity: 100, unit: 'g', kcal: 0, protein: 0, carbs: 0, fat: 0 });

const sumMacros = (foods: Food[]) => ({
  kcal:    foods.reduce((s, f) => s + (f.kcal    || 0), 0),
  protein: foods.reduce((s, f) => s + (f.protein || 0), 0),
  carbs:   foods.reduce((s, f) => s + (f.carbs   || 0), 0),
  fat:     foods.reduce((s, f) => s + (f.fat     || 0), 0),
});

const computeTotals = (meals: Meal[]) =>
  meals.reduce((acc, m) => {
    const s = sumMacros(m.foods);
    return { kcal: acc.kcal + s.kcal, protein: acc.protein + s.protein, carbs: acc.carbs + s.carbs, fat: acc.fat + s.fat };
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });

// ── component ─────────────────────────────────────────────────────────────────
export default function ProDietPlanEditor({ clientId }: { clientId: string }) {
  const { professionalId } = usePro();

  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [planId, setPlanId]           = useState<string | null>(null);
  const [plan, setPlan]               = useState<Plan>({
    name: 'Plano Alimentar', objective: 'maintain', notes: '',
    meals: DEFAULT_MEALS.map((name, i) => ({ name, time_suggestion: '', meal_order: i, foods: [], expanded: i === 0 })),
  });

  // template modal
  const [showTemplates, setShowTemplates]     = useState(false);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // save-as-template inline
  const [savingTpl, setSavingTpl]       = useState(false);
  const [showSaveAs, setShowSaveAs]     = useState(false);
  const [tplName, setTplName]           = useState('');

  useEffect(() => { loadPlan(); }, [clientId]);

  // Load custom templates when modal opens
  useEffect(() => {
    if (showTemplates && professionalId) loadCustomTemplates();
  }, [showTemplates, professionalId]);

  const loadPlan = async () => {
    setLoading(true);
    const { data: plans } = await supabase
      .from('diet_plans')
      .select('id, name, objective, notes')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (plans && plans.length > 0) {
      const p = plans[0];
      setPlanId(p.id);
      const { data: meals } = await supabase
        .from('diet_plan_meals')
        .select('id, name, time_suggestion, meal_order, diet_plan_foods(id, food_name, quantity, unit, kcal, protein, carbs, fat)')
        .eq('plan_id', p.id)
        .order('meal_order');
      setPlan({
        name: p.name, objective: p.objective || 'maintain', notes: p.notes || '',
        meals: (meals || []).map((m: any, i: number) => ({
          id: m.id, name: m.name, time_suggestion: m.time_suggestion || '',
          meal_order: m.meal_order, expanded: i === 0,
          foods: m.diet_plan_foods || [],
        })),
      });
    }
    setLoading(false);
  };

  const loadCustomTemplates = async () => {
    if (!professionalId) return;
    setTemplatesLoading(true);
    const { data } = await supabase
      .from('pro_diet_templates')
      .select('id, name, target_kcal, objective, meals_json, created_at')
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false });
    setCustomTemplates((data as CustomTemplate[]) || []);
    setTemplatesLoading(false);
  };

  // Apply a built-in template
  const applySystemTemplate = (targetKcal: number) => {
    const t = buildTemplate(targetKcal);
    setPlan(t);
    setPlanId(null);
    setShowTemplates(false);
    toast.success(`Template ${targetKcal} kcal aplicado. Revise e salve o plano.`);
  };

  // Apply a custom saved template
  const applyCustomTemplate = (tpl: CustomTemplate) => {
    const meals: Meal[] = (tpl.meals_json || []).map((m: any, i: number) => ({
      name: m.name,
      time_suggestion: m.time_suggestion || '',
      meal_order: m.meal_order ?? i,
      expanded: i === 0,
      foods: (m.foods || []).map((f: any) => ({
        food_name: f.food_name, quantity: f.quantity, unit: f.unit,
        kcal: f.kcal, protein: f.protein, carbs: f.carbs, fat: f.fat,
      })),
    }));
    setPlan({
      name: tpl.name,
      objective: tpl.objective || 'maintain',
      notes: '',
      meals,
    });
    setPlanId(null);
    setShowTemplates(false);
    toast.success(`Template "${tpl.name}" aplicado. Revise e salve o plano.`);
  };

  // Delete a custom template
  const deleteCustomTemplate = async (id: string) => {
    const { error } = await supabase.from('pro_diet_templates').delete().eq('id', id);
    if (!error) {
      setCustomTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template excluído.');
    }
  };

  // Save current plan as a new template
  const saveAsTemplate = async () => {
    if (!tplName.trim() || !professionalId) return;
    setSavingTpl(true);
    const totals = computeTotals(plan.meals);
    const mealsJson = plan.meals.map(m => ({
      name: m.name,
      time_suggestion: m.time_suggestion,
      meal_order: m.meal_order,
      foods: m.foods.map(f => ({
        food_name: f.food_name, quantity: f.quantity, unit: f.unit,
        kcal: f.kcal, protein: f.protein, carbs: f.carbs, fat: f.fat,
      })),
    }));
    const { error } = await supabase.from('pro_diet_templates').insert({
      professional_id: professionalId,
      name: tplName.trim(),
      target_kcal: Math.round(totals.kcal),
      objective: plan.objective,
      meals_json: mealsJson,
    });
    if (!error) {
      toast.success(`Template "${tplName.trim()}" salvo com sucesso!`);
      setTplName('');
      setShowSaveAs(false);
    } else {
      toast.error('Erro ao salvar template: ' + error.message);
    }
    setSavingTpl(false);
  };

  const savePlan = async () => {
    if (!professionalId) return;
    setSaving(true);
    try {
      const totals = computeTotals(plan.meals);
      let currentPlanId = planId;

      if (currentPlanId) {
        await supabase.from('diet_plans').update({
          name: plan.name, objective: plan.objective, notes: plan.notes,
          total_kcal: totals.kcal, total_protein: totals.protein,
          total_carbs: totals.carbs, total_fat: totals.fat,
        }).eq('id', currentPlanId);
        await supabase.from('diet_plan_meals').delete().eq('plan_id', currentPlanId);
      } else {
        const { data: newPlan, error } = await supabase.from('diet_plans').insert({
          client_id: clientId, professional_id: professionalId,
          name: plan.name, objective: plan.objective, notes: plan.notes,
          total_kcal: totals.kcal, total_protein: totals.protein,
          total_carbs: totals.carbs, total_fat: totals.fat,
        }).select().single();
        if (error) throw error;
        currentPlanId = newPlan.id;
        setPlanId(currentPlanId);
      }

      for (const meal of plan.meals) {
        const mealTotals = sumMacros(meal.foods);
        const { data: insertedMeal } = await supabase.from('diet_plan_meals').insert({
          plan_id: currentPlanId, name: meal.name, meal_order: meal.meal_order,
          time_suggestion: meal.time_suggestion,
          target_kcal: mealTotals.kcal, target_protein: mealTotals.protein,
          target_carbs: mealTotals.carbs, target_fat: mealTotals.fat,
        }).select().single();

        if (insertedMeal && meal.foods.length > 0) {
          await supabase.from('diet_plan_foods').insert(
            meal.foods.map(f => ({
              meal_id: insertedMeal.id, food_name: f.food_name, quantity: f.quantity,
              unit: f.unit, kcal: f.kcal, protein: f.protein, carbs: f.carbs, fat: f.fat,
            }))
          );
        }
      }

      await supabase.from('client_goals').upsert({
        client_id: clientId, professional_id: professionalId,
        calories_target: totals.kcal, protein_target: totals.protein,
        carbs_target: totals.carbs, objective: plan.objective,
      }, { onConflict: 'client_id' });

      toast.success('Plano alimentar salvo!');
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateMeal = (i: number, field: string, value: any) =>
    setPlan(p => ({ ...p, meals: p.meals.map((m, idx) => idx === i ? { ...m, [field]: value } : m) }));
  const addFood = (mealIdx: number) =>
    setPlan(p => ({ ...p, meals: p.meals.map((m, i) => i === mealIdx ? { ...m, foods: [...m.foods, emptyFood()] } : m) }));
  const updateFood = (mealIdx: number, foodIdx: number, field: string, value: any) =>
    setPlan(p => ({ ...p, meals: p.meals.map((m, i) => i === mealIdx ? { ...m, foods: m.foods.map((f, j) => j === foodIdx ? { ...f, [field]: value } : f) } : m) }));
  const removeFood = (mealIdx: number, foodIdx: number) =>
    setPlan(p => ({ ...p, meals: p.meals.map((m, i) => i === mealIdx ? { ...m, foods: m.foods.filter((_, j) => j !== foodIdx) } : m) }));
  const addMeal = () =>
    setPlan(p => ({ ...p, meals: [...p.meals, { name: 'Nova refeição', time_suggestion: '', meal_order: p.meals.length, foods: [], expanded: true }] }));
  const removeMeal = (i: number) =>
    setPlan(p => ({ ...p, meals: p.meals.filter((_, idx) => idx !== i) }));

  const totalDay = computeTotals(plan.meals);

  if (loading) return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
      <Loader2 className="animate-spin h-4 w-4" /> Carregando plano...
    </div>
  );

  return (
    <div className="space-y-4">

      {/* ── TEMPLATE PICKER MODAL ── */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-2xl glass-card p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" /> Templates de Dieta
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Selecione um ponto de partida — depois edite à vontade.
                </p>
              </div>
              <button onClick={() => setShowTemplates(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ─ Sugestões OnTrack ─ */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                ✦ Sugestões OnTrack
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SYSTEM_TEMPLATES.map(t => (
                  <button
                    key={t.targetKcal}
                    onClick={() => applySystemTemplate(t.targetKcal)}
                    className="group text-left p-4 rounded-xl border border-border hover:border-foreground/40 bg-secondary/20 hover:bg-secondary/40 transition-all"
                  >
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xl font-bold tabular-nums text-accent">{t.targetKcal}</span>
                      <span className="text-[10px] text-muted-foreground">kcal/dia</span>
                    </div>
                    <span className={cn(
                      'inline-block text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full mb-3',
                      t.objective === 'lose'   ? 'bg-sky-500/10 text-sky-400'
                      : t.objective === 'gain' ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'
                    )}>
                      {t.objectiveLabel}
                    </span>
                    <div className="space-y-1 text-[11px] text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Proteína</span>
                        <span className="tabular-nums font-medium text-foreground">{t.protein}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carboidrato</span>
                        <span className="tabular-nums font-medium text-foreground">{t.carbs}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gordura</span>
                        <span className="tabular-nums font-medium text-foreground">{t.fat}g</span>
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
                      <Check className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Usar template
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* ─ Meus Templates ─ */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                ★ Meus Templates
              </p>
              {templatesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="animate-spin h-4 w-4" /> Carregando...
                </div>
              ) : customTemplates.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-5 text-center">
                  <BookmarkPlus className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum template salvo ainda.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Monte um plano e clique em <strong>"Salvar como template"</strong> para reutilizá-lo.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {customTemplates.map(tpl => {
                    const totals = computeTotals(
                      (tpl.meals_json || []).map((m: any) => ({ ...m, expanded: false }))
                    );
                    return (
                      <div
                        key={tpl.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/20 hover:bg-secondary/40 transition-all group"
                      >
                        <button
                          onClick={() => applyCustomTemplate(tpl)}
                          className="flex-1 text-left"
                        >
                          <p className="text-sm font-medium">{tpl.name}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground mt-0.5">
                            <span className="font-medium text-foreground">{Math.round(totals.kcal)} kcal</span>
                            <span>{Math.round(totals.protein)}g P</span>
                            <span>{Math.round(totals.carbs)}g C</span>
                            <span>{Math.round(totals.fat)}g G</span>
                            <span className={cn(
                              tpl.objective === 'lose'   ? 'text-sky-400'
                              : tpl.objective === 'gain' ? 'text-emerald-400'
                              : 'text-amber-400'
                            )}>
                              {tpl.objective === 'lose' ? 'Emagrecimento' : tpl.objective === 'gain' ? 'Ganho de massa' : 'Manutenção'}
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={() => deleteCustomTemplate(tpl.id)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                          title="Excluir template"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground border-t border-border pt-3">
              ⚠️ Aplicar um template <strong>substituirá</strong> o plano não salvo atual.
            </p>
          </Card>
        </div>
      )}

      {/* ── PLAN HEADER ── */}
      <Card className="p-5 glass-card space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">Configuração do plano</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Save as template */}
            {showSaveAs ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={tplName}
                  onChange={e => setTplName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveAsTemplate(); if (e.key === 'Escape') { setShowSaveAs(false); setTplName(''); } }}
                  placeholder="Nome do template..."
                  className="h-8 px-3 rounded-lg border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20 w-48"
                />
                <Button size="sm" onClick={saveAsTemplate} disabled={savingTpl || !tplName.trim()}>
                  {savingTpl ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowSaveAs(false); setTplName(''); }}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShowSaveAs(true)}
                className="text-muted-foreground hover:text-foreground">
                <BookmarkPlus className="h-3.5 w-3.5 mr-1.5" />
                Salvar como template
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-accent" />
              Usar template
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nome do plano</label>
            <input value={plan.name} onChange={e => setPlan(p => ({ ...p, name: e.target.value }))}
              className="w-full mt-1 h-9 px-3 rounded-lg border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Objetivo</label>
            <select value={plan.objective} onChange={e => setPlan(p => ({ ...p, objective: e.target.value }))}
              className="w-full mt-1 h-9 px-3 rounded-lg border border-border bg-secondary/30 text-sm focus:outline-none">
              {OBJECTIVES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Observações para o paciente</label>
          <textarea value={plan.notes} onChange={e => setPlan(p => ({ ...p, notes: e.target.value }))} rows={2}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-secondary/30 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20" />
        </div>

        {/* Daily totals */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border">
          {[
            { label: 'Kcal/dia', value: Math.round(totalDay.kcal),         color: 'text-accent'    },
            { label: 'Proteína', value: `${Math.round(totalDay.protein)}g`, color: 'text-red-400'   },
            { label: 'Carb',     value: `${Math.round(totalDay.carbs)}g`,   color: 'text-amber-400' },
            { label: 'Gordura',  value: `${Math.round(totalDay.fat)}g`,     color: 'text-blue-400'  },
          ].map(t => (
            <div key={t.label} className="text-center">
              <p className={`text-base font-semibold tabular-nums ${t.color}`}>{t.value}</p>
              <p className="text-[10px] text-muted-foreground">{t.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── MEALS ── */}
      {plan.meals.map((meal, mealIdx) => {
        const mealTotals = sumMacros(meal.foods);
        return (
          <Card key={mealIdx} className="glass-card overflow-hidden">
            <button
              onClick={() => updateMeal(mealIdx, 'expanded', !meal.expanded)}
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-left">{meal.name}</p>
                <p className="text-[10px] text-muted-foreground text-left">
                  {meal.foods.length} alimento{meal.foods.length !== 1 ? 's' : ''} · {Math.round(mealTotals.kcal)} kcal
                  {meal.time_suggestion && ` · ${meal.time_suggestion}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={e => { e.stopPropagation(); removeMeal(mealIdx); }}
                  className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                {meal.expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </button>

            {meal.expanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nome da refeição</label>
                    <input value={meal.name} onChange={e => updateMeal(mealIdx, 'name', e.target.value)}
                      className="w-full mt-1 h-8 px-3 rounded-lg border border-border bg-secondary/30 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Horário sugerido</label>
                    <input type="time" value={meal.time_suggestion} onChange={e => updateMeal(mealIdx, 'time_suggestion', e.target.value)}
                      className="w-full mt-1 h-8 px-3 rounded-lg border border-border bg-secondary/30 text-sm focus:outline-none" />
                  </div>
                </div>

                {meal.foods.length > 0 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-1 text-[10px] uppercase tracking-widest text-muted-foreground px-1">
                      <span className="col-span-4">Alimento</span>
                      <span className="col-span-2">Qtd</span>
                      <span className="col-span-2">Unid</span>
                      <span className="col-span-1">Kcal</span>
                      <span className="col-span-1">Prot</span>
                      <span className="col-span-1">Carb</span>
                      <span className="col-span-1">Gord</span>
                    </div>
                    {meal.foods.map((food, foodIdx) => (
                      <div key={foodIdx} className="grid grid-cols-12 gap-1 items-center">
                        <input value={food.food_name} onChange={e => updateFood(mealIdx, foodIdx, 'food_name', e.target.value)}
                          placeholder="Ex: Arroz"
                          className="col-span-4 h-8 px-2 rounded border border-border bg-secondary/30 text-xs focus:outline-none" />
                        <input type="number" value={food.quantity} onChange={e => updateFood(mealIdx, foodIdx, 'quantity', Number(e.target.value))}
                          className="col-span-2 h-8 px-2 rounded border border-border bg-secondary/30 text-xs focus:outline-none" />
                        <select value={food.unit} onChange={e => updateFood(mealIdx, foodIdx, 'unit', e.target.value)}
                          className="col-span-2 h-8 px-1 rounded border border-border bg-secondary/30 text-xs focus:outline-none">
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <input type="number" value={food.kcal} onChange={e => updateFood(mealIdx, foodIdx, 'kcal', Number(e.target.value))}
                          className="col-span-1 h-8 px-1 rounded border border-border bg-secondary/30 text-xs focus:outline-none" />
                        <input type="number" value={food.protein} onChange={e => updateFood(mealIdx, foodIdx, 'protein', Number(e.target.value))}
                          className="col-span-1 h-8 px-1 rounded border border-border bg-secondary/30 text-xs focus:outline-none" />
                        <input type="number" value={food.carbs} onChange={e => updateFood(mealIdx, foodIdx, 'carbs', Number(e.target.value))}
                          className="col-span-1 h-8 px-1 rounded border border-border bg-secondary/30 text-xs focus:outline-none" />
                        <div className="col-span-1 flex items-center gap-0.5">
                          <input type="number" value={food.fat} onChange={e => updateFood(mealIdx, foodIdx, 'fat', Number(e.target.value))}
                            className="w-full h-8 px-1 rounded border border-border bg-secondary/30 text-xs focus:outline-none" />
                          <button onClick={() => removeFood(mealIdx, foodIdx)}
                            className="h-8 w-6 flex items-center justify-center text-muted-foreground hover:text-destructive shrink-0">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button variant="outline" size="sm" onClick={() => addFood(mealIdx)} className="w-full">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar alimento
                </Button>
              </div>
            )}
          </Card>
        );
      })}

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={addMeal} className="flex-1">
          <Plus className="h-4 w-4 mr-2" /> Nova refeição
        </Button>
        <Button onClick={savePlan} disabled={saving} className="flex-1">
          {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Salvar plano
        </Button>
      </div>
    </div>
  );
}
