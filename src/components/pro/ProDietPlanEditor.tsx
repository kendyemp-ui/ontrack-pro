import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePro } from '@/contexts/ProContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Save, Loader2, ChevronDown, ChevronUp, UtensilsCrossed } from 'lucide-react';

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

const UNITS = ['g', 'ml', 'unidade', 'colher de sopa', 'xícara'];
const OBJECTIVES = [
  { value: 'lose', label: 'Perda de gordura' },
  { value: 'maintain', label: 'Manutenção' },
  { value: 'gain', label: 'Ganho de massa' },
];
const DEFAULT_MEALS = ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar'];

const emptyFood = (): Food => ({ food_name: '', quantity: 100, unit: 'g', kcal: 0, protein: 0, carbs: 0, fat: 0 });

const sumMacros = (foods: Food[]) => ({
  kcal: foods.reduce((s, f) => s + (f.kcal || 0), 0),
  protein: foods.reduce((s, f) => s + (f.protein || 0), 0),
  carbs: foods.reduce((s, f) => s + (f.carbs || 0), 0),
  fat: foods.reduce((s, f) => s + (f.fat || 0), 0),
});

export default function ProDietPlanEditor({ clientId }: { clientId: string }) {
  const { professionalId } = usePro();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan>({
    name: 'Plano Alimentar', objective: 'maintain', notes: '',
    meals: DEFAULT_MEALS.map((name, i) => ({ name, time_suggestion: '', meal_order: i, foods: [], expanded: i === 0 })),
  });

  useEffect(() => {
    loadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

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
          foods: (m.diet_plan_foods || []),
        })),
      });
    }
    setLoading(false);
  };

  const savePlan = async () => {
    if (!professionalId) return;
    setSaving(true);
    try {
      const totals = plan.meals.reduce((acc, m) => {
        const s = sumMacros(m.foods);
        return { kcal: acc.kcal + s.kcal, protein: acc.protein + s.protein, carbs: acc.carbs + s.carbs, fat: acc.fat + s.fat };
      }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });

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

  const updateMeal = (i: number, field: string, value: any) => {
    setPlan(p => ({ ...p, meals: p.meals.map((m, idx) => idx === i ? { ...m, [field]: value } : m) }));
  };

  const addFood = (mealIdx: number) => {
    setPlan(p => ({ ...p, meals: p.meals.map((m, i) => i === mealIdx ? { ...m, foods: [...m.foods, emptyFood()] } : m) }));
  };

  const updateFood = (mealIdx: number, foodIdx: number, field: string, value: any) => {
    setPlan(p => ({
      ...p, meals: p.meals.map((m, i) => i === mealIdx ? {
        ...m, foods: m.foods.map((f, j) => j === foodIdx ? { ...f, [field]: value } : f)
      } : m)
    }));
  };

  const removeFood = (mealIdx: number, foodIdx: number) => {
    setPlan(p => ({ ...p, meals: p.meals.map((m, i) => i === mealIdx ? { ...m, foods: m.foods.filter((_, j) => j !== foodIdx) } : m) }));
  };

  const addMeal = () => {
    setPlan(p => ({ ...p, meals: [...p.meals, { name: 'Nova refeição', time_suggestion: '', meal_order: p.meals.length, foods: [], expanded: true }] }));
  };

  const removeMeal = (i: number) => {
    setPlan(p => ({ ...p, meals: p.meals.filter((_, idx) => idx !== i) }));
  };

  const totalDay = plan.meals.reduce((acc, m) => {
    const s = sumMacros(m.foods);
    return { kcal: acc.kcal + s.kcal, protein: acc.protein + s.protein, carbs: acc.carbs + s.carbs, fat: acc.fat + s.fat };
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
        <Loader2 className="animate-spin h-4 w-4" /> Carregando plano...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header do plano */}
      <Card className="p-5 glass-card space-y-4">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold">Configuração do plano</h3>
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
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border">
          {[
            { label: 'Kcal/dia', value: Math.round(totalDay.kcal), color: 'text-accent' },
            { label: 'Proteína', value: `${Math.round(totalDay.protein)}g`, color: 'text-red-400' },
            { label: 'Carb', value: `${Math.round(totalDay.carbs)}g`, color: 'text-amber-400' },
            { label: 'Gordura', value: `${Math.round(totalDay.fat)}g`, color: 'text-blue-400' },
          ].map(t => (
            <div key={t.label} className="text-center">
              <p className={`text-base font-semibold tabular-nums ${t.color}`}>{t.value}</p>
              <p className="text-[10px] text-muted-foreground">{t.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Refeições */}
      {plan.meals.map((meal, mealIdx) => {
        const mealTotals = sumMacros(meal.foods);
        return (
          <Card key={mealIdx} className="glass-card overflow-hidden">
            <button
              onClick={() => updateMeal(mealIdx, 'expanded', !meal.expanded)}
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-left">{meal.name}</p>
                  <p className="text-[10px] text-muted-foreground text-left">
                    {meal.foods.length} alimento{meal.foods.length !== 1 ? 's' : ''} · {Math.round(mealTotals.kcal)} kcal
                  </p>
                </div>
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
                          placeholder="Ex: Arroz" className="col-span-4 h-8 px-2 rounded border border-border bg-secondary/30 text-xs focus:outline-none" />
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
