import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';
import { Loader2, UtensilsCrossed, Clock, ChevronDown, ChevronUp, Plus, Trash2, Save, Lock } from 'lucide-react';
import { toast } from 'sonner';

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
  time_suggestion: string | null;
  meal_order: number;
  target_kcal: number;
  target_protein: number;
  target_carbs: number;
  foods: Food[];
  expanded: boolean;
}

interface Plan {
  id: string;
  name: string;
  objective: string;
  notes: string | null;
  total_kcal: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  professional_id: string | null;
}

const UNITS = ['g', 'ml', 'unidade', 'colher de sopa', 'xícara'];

const emptyFood = (): Food => ({ food_name: '', quantity: 100, unit: 'g', kcal: 0, protein: 0, carbs: 0, fat: 0 });

const sumMacros = (foods: Food[]) => ({
  kcal: foods.reduce((s, f) => s + (f.kcal || 0), 0),
  protein: foods.reduce((s, f) => s + (f.protein || 0), 0),
  carbs: foods.reduce((s, f) => s + (f.carbs || 0), 0),
  fat: foods.reduce((s, f) => s + (f.fat || 0), 0),
});

export default function DietPlan() {
  const { user, updateGoal, goal } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isNutriPlan, setIsNutriPlan] = useState(false);

  useEffect(() => {
    if (user) loadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadPlan = async () => {
    setLoading(true);
    try {
      // 1. Plano do nutricionista (B2B2C)
      const { data: clientPlans } = await supabase
        .from('diet_plans')
        .select(`
          id, name, objective, notes, total_kcal, total_protein, total_carbs, total_fat, professional_id,
          diet_plan_meals (id, name, time_suggestion, meal_order, target_kcal, target_protein, target_carbs,
            diet_plan_foods (id, food_name, quantity, unit, kcal, protein, carbs, fat))
        `)
        .not('professional_id', 'is', null)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (clientPlans && clientPlans.length > 0) {
        const p = clientPlans[0] as any;
        setIsNutriPlan(true);
        setPlan(p);
        setMeals(((p.diet_plan_meals || []) as any[]).map((m, i) => ({
          id: m.id,
          name: m.name,
          time_suggestion: m.time_suggestion,
          meal_order: m.meal_order,
          target_kcal: m.target_kcal,
          target_protein: m.target_protein,
          target_carbs: m.target_carbs,
          foods: m.diet_plan_foods || [],
          expanded: i === 0,
        })).sort((a, b) => a.meal_order - b.meal_order));
        setLoading(false);
        return;
      }

      // 2. Plano próprio (B2C)
      const { data: userPlans } = await supabase
        .from('diet_plans')
        .select(`
          id, name, objective, notes, total_kcal, total_protein, total_carbs, total_fat, professional_id,
          diet_plan_meals (id, name, time_suggestion, meal_order, target_kcal, target_protein, target_carbs,
            diet_plan_foods (id, food_name, quantity, unit, kcal, protein, carbs, fat))
        `)
        .eq('user_id', user?.id ?? '')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (userPlans && userPlans.length > 0) {
        const p = userPlans[0] as any;
        setIsNutriPlan(false);
        setPlan(p);
        setMeals(((p.diet_plan_meals || []) as any[]).map((m, i) => ({
          id: m.id,
          name: m.name,
          time_suggestion: m.time_suggestion,
          meal_order: m.meal_order,
          target_kcal: m.target_kcal,
          target_protein: m.target_protein,
          target_carbs: m.target_carbs,
          foods: m.diet_plan_foods || [],
          expanded: i === 0,
        })).sort((a, b) => a.meal_order - b.meal_order));
      } else {
        setIsNutriPlan(false);
        setPlan(null);
        setMeals(['Café da manhã', 'Almoço', 'Lanche da tarde', 'Jantar'].map((name, i) => ({
          name, time_suggestion: '', meal_order: i, target_kcal: 0, target_protein: 0, target_carbs: 0,
          foods: [], expanded: i === 0,
        })));
      }
    } catch (err) {
      toast.error('Erro ao carregar plano');
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async () => {
    if (!user || isNutriPlan) return;
    setSaving(true);
    try {
      const totals = meals.reduce((acc, m) => {
        const s = sumMacros(m.foods);
        return { kcal: acc.kcal + s.kcal, protein: acc.protein + s.protein, carbs: acc.carbs + s.carbs, fat: acc.fat + s.fat };
      }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });

      let planId = plan?.id;

      if (planId) {
        await supabase.from('diet_plans').update({
          total_kcal: totals.kcal, total_protein: totals.protein,
          total_carbs: totals.carbs, total_fat: totals.fat,
        }).eq('id', planId);
        await supabase.from('diet_plan_meals').delete().eq('plan_id', planId);
      } else {
        const { data: newPlan, error } = await supabase.from('diet_plans').insert({
          user_id: user.id, name: 'Meu Plano Alimentar',
          objective: goal.objective || 'maintain',
          total_kcal: totals.kcal, total_protein: totals.protein,
          total_carbs: totals.carbs, total_fat: totals.fat,
        }).select().single();
        if (error) throw error;
        planId = newPlan.id;
      }

      for (const meal of meals) {
        const mealTotals = sumMacros(meal.foods);
        const { data: insertedMeal } = await supabase.from('diet_plan_meals').insert({
          plan_id: planId, name: meal.name, meal_order: meal.meal_order,
          time_suggestion: meal.time_suggestion,
          target_kcal: mealTotals.kcal, target_protein: mealTotals.protein,
          target_carbs: mealTotals.carbs, target_fat: mealTotals.fat,
        }).select().single();
        if (insertedMeal && meal.foods.length > 0) {
          await supabase.from('diet_plan_foods').insert(
            meal.foods.map(f => ({
              meal_id: insertedMeal.id,
              food_name: f.food_name,
              quantity: f.quantity,
              unit: f.unit,
              kcal: f.kcal,
              protein: f.protein,
              carbs: f.carbs,
              fat: f.fat,
            }))
          );
        }
      }

      await updateGoal({
        ...goal,
        caloriesTarget: Math.round(totals.kcal),
        proteinTarget: Math.round(totals.protein),
        carbsTarget: Math.round(totals.carbs),
      });

      toast.success('Plano salvo! Suas metas foram atualizadas automaticamente.');
      await loadPlan();
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addFood = (mealIdx: number) => {
    setMeals(prev => prev.map((m, i) => i === mealIdx ? { ...m, foods: [...m.foods, emptyFood()] } : m));
  };

  const updateFood = (mealIdx: number, foodIdx: number, field: keyof Food, value: any) => {
    setMeals(prev => prev.map((m, i) => i === mealIdx ? {
      ...m, foods: m.foods.map((f, j) => j === foodIdx ? { ...f, [field]: value } : f)
    } : m));
  };

  const removeFood = (mealIdx: number, foodIdx: number) => {
    setMeals(prev => prev.map((m, i) => i === mealIdx ? { ...m, foods: m.foods.filter((_, j) => j !== foodIdx) } : m));
  };

  const toggleMeal = (mealIdx: number) => {
    setMeals(prev => prev.map((m, i) => i === mealIdx ? { ...m, expanded: !m.expanded } : m));
  };

  const totalDay = meals.reduce((acc, m) => {
    const s = sumMacros(m.foods);
    return { kcal: acc.kcal + s.kcal, protein: acc.protein + s.protein, carbs: acc.carbs + s.carbs, fat: acc.fat + s.fat };
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-4">
        {/* Cabeçalho */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <UtensilsCrossed size={18} className="text-accent" strokeWidth={1.5} />
            <h1 className="text-2xl font-heading font-bold text-foreground">Plano Alimentar</h1>
          </div>
          {isNutriPlan ? (
            <div className="flex items-center gap-1.5 mt-1">
              <Lock size={11} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Criado pelo seu nutricionista</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              Monte seu plano e suas metas serão atualizadas automaticamente.
            </p>
          )}
        </div>

        {/* Total do dia */}
        <div className="glass-card rounded-2xl p-4 animate-slide-up">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Total planejado por dia</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Kcal', value: Math.round(totalDay.kcal), color: 'text-accent' },
              { label: 'Proteína', value: `${Math.round(totalDay.protein)}g`, color: 'text-red-400' },
              { label: 'Carb', value: `${Math.round(totalDay.carbs)}g`, color: 'text-amber-400' },
              { label: 'Gordura', value: `${Math.round(totalDay.fat)}g`, color: 'text-blue-400' },
            ].map(t => (
              <div key={t.label} className="text-center">
                <p className={`text-base font-semibold tabular-nums ${t.color}`}>{t.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t.label}</p>
              </div>
            ))}
          </div>
          {isNutriPlan && plan?.notes && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground italic">{plan.notes}</p>
            </div>
          )}
        </div>

        {/* Refeições */}
        {meals.map((meal, mealIdx) => {
          const mealTotals = sumMacros(meal.foods);
          return (
            <div key={mealIdx} className="glass-card rounded-2xl overflow-hidden animate-slide-up">
              <button
                onClick={() => toggleMeal(mealIdx)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{meal.name}</p>
                    {meal.time_suggestion && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock size={10} /> {meal.time_suggestion}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {meal.foods.length} alimento{meal.foods.length !== 1 ? 's' : ''} · {Math.round(mealTotals.kcal)} kcal · {Math.round(mealTotals.protein)}g prot
                  </p>
                </div>
                {meal.expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </button>

              {meal.expanded && (
                <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                  {meal.foods.length === 0 && isNutriPlan && (
                    <p className="text-xs text-muted-foreground italic text-center py-3">Nenhum alimento nesta refeição.</p>
                  )}

                  {meal.foods.map((food, foodIdx) => (
                    <div key={foodIdx} className="rounded-xl bg-secondary/30 p-3">
                      {isNutriPlan ? (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{food.food_name}</p>
                            <p className="text-[11px] text-muted-foreground">{food.quantity} {food.unit}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-semibold text-accent tabular-nums">{food.kcal} kcal</p>
                            <p className="text-[10px] text-muted-foreground">{food.protein}g prot · {food.carbs}g carb · {food.fat}g gord</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <label className="text-[9px] uppercase tracking-widest text-muted-foreground">Alimento</label>
                              <input
                                value={food.food_name}
                                onChange={e => updateFood(mealIdx, foodIdx, 'food_name', e.target.value)}
                                placeholder="Ex: Frango grelhado"
                                className="w-full h-8 mt-0.5 px-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] uppercase tracking-widest text-muted-foreground">Quantidade</label>
                              <div className="flex gap-1 mt-0.5">
                                <input
                                  type="number"
                                  value={food.quantity}
                                  onChange={e => updateFood(mealIdx, foodIdx, 'quantity', Number(e.target.value))}
                                  className="w-full h-8 px-2 rounded-lg border border-border bg-background text-sm focus:outline-none"
                                />
                                <select
                                  value={food.unit}
                                  onChange={e => updateFood(mealIdx, foodIdx, 'unit', e.target.value)}
                                  className="h-8 px-1 rounded-lg border border-border bg-background text-xs focus:outline-none"
                                >
                                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            {([
                              { field: 'kcal', label: 'Kcal' },
                              { field: 'protein', label: 'Prot (g)' },
                              { field: 'carbs', label: 'Carb (g)' },
                              { field: 'fat', label: 'Gord (g)' },
                            ] as const).map(f => (
                              <div key={f.field}>
                                <label className="text-[9px] uppercase tracking-widest text-muted-foreground">{f.label}</label>
                                <input
                                  type="number"
                                  value={food[f.field]}
                                  onChange={e => updateFood(mealIdx, foodIdx, f.field, Number(e.target.value))}
                                  className="w-full h-8 mt-0.5 px-2 rounded-lg border border-border bg-background text-xs focus:outline-none"
                                />
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => removeFood(mealIdx, foodIdx)}
                            className="flex items-center gap-1 text-xs text-destructive hover:opacity-80"
                          >
                            <Trash2 size={12} /> Remover
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {!isNutriPlan && (
                    <button
                      onClick={() => addFood(mealIdx)}
                      className="w-full h-9 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus size={12} /> Adicionar alimento
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Botão salvar (só B2C) */}
        {!isNutriPlan && (
          <button
            onClick={savePlan}
            disabled={saving}
            className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Salvando...' : 'Salvar plano e atualizar metas'}
          </button>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
