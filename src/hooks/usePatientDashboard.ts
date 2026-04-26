import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DailySummaryPoint {
  summary_date: string;
  kcal_consumed: number;
  kcal_burned: number;
  basal_kcal: number;
  total_expenditure_kcal: number;
  calorie_balance: number;
  protein_consumed: number;
  carbs_consumed: number;
  fat_consumed: number;
  meal_count: number;
  activity_count: number;
}

export interface MealLogItem {
  id: string;
  created_at: string;
  original_text: string | null;
  estimated_kcal: number | null;
  estimated_protein: number | null;
  estimated_carbs: number | null;
  estimated_fat: number | null;
  media_url: string | null;
  image_path: string | null;
  status: string;
}

export interface ActivityLogItem {
  id: string;
  created_at: string;
  original_text: string | null;
  activity_type: string | null;
  activity_duration: string | null;
  estimated_burn_kcal: number | null;
  status: string;
}

export interface ClientGoals {
  calories_target: number;
  protein_target: number;
  carbs_target: number;
  objective: string;
}

export function usePatientDashboard(clientId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState<DailySummaryPoint[]>([]);
  const [todaySummary, setTodaySummary] = useState<DailySummaryPoint | null>(null);
  const [mealHistory, setMealHistory] = useState<MealLogItem[]>([]);
  const [activityHistory, setActivityHistory] = useState<ActivityLogItem[]>([]);
  const [goals, setGoals] = useState<ClientGoals>({ calories_target: 2000, protein_target: 150, carbs_target: 200, objective: 'maintain' });

  useEffect(() => {
    if (!clientId) return;
    load();
  }, [clientId]);

  const load = async () => {
    if (!clientId) return;
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    const startDate = fourteenDaysAgo.toISOString().split('T')[0];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    const historyStart = thirtyDaysAgo.toISOString().split('T')[0];

    const [summaryRes, mealsRes, activitiesRes, goalsRes] = await Promise.all([
      supabase
        .from('daily_summary')
        .select('summary_date, kcal_consumed, kcal_burned, basal_kcal, total_expenditure_kcal, calorie_balance, protein_consumed, carbs_consumed, fat_consumed, meal_count, activity_count')
        .eq('client_id', clientId)
        .gte('summary_date', startDate)
        .lte('summary_date', today)
        .order('summary_date'),
      supabase
        .from('meal_logs')
        .select('id, created_at, original_text, estimated_kcal, estimated_protein, estimated_carbs, estimated_fat, media_url, image_path, status')
        .eq('client_id', clientId)
        .gte('created_at', historyStart + 'T00:00:00')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('activity_logs')
        .select('id, created_at, original_text, activity_type, activity_duration, estimated_burn_kcal, status')
        .eq('client_id', clientId)
        .gte('created_at', historyStart + 'T00:00:00')
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('client_goals')
        .select('calories_target, protein_target, carbs_target, objective')
        .eq('client_id', clientId)
        .maybeSingle(),
    ]);

    // Preenche todos os 14 dias (dias sem dado = zerado)
    const summaryMap: Record<string, DailySummaryPoint> = {};
    (summaryRes.data || []).forEach(d => { summaryMap[d.summary_date] = d as DailySummaryPoint; });

    const fullWeek: DailySummaryPoint[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      fullWeek.push(summaryMap[dateStr] || {
        summary_date: dateStr, kcal_consumed: 0, kcal_burned: 0, basal_kcal: 0,
        total_expenditure_kcal: 0, calorie_balance: 0, protein_consumed: 0,
        carbs_consumed: 0, fat_consumed: 0, meal_count: 0, activity_count: 0,
      });
    }

    setWeeklySummary(fullWeek);
    setTodaySummary(summaryMap[today] || null);
    setMealHistory((mealsRes.data as MealLogItem[]) || []);
    setActivityHistory((activitiesRes.data as ActivityLogItem[]) || []);

    if (goalsRes.data) {
      setGoals({
        calories_target: Number(goalsRes.data.calories_target) || 2000,
        protein_target: Number(goalsRes.data.protein_target) || 150,
        carbs_target: Number(goalsRes.data.carbs_target) || 200,
        objective: goalsRes.data.objective || 'maintain',
      });
    }
    setLoading(false);
  };

  const refresh = () => load();
  return { loading, weeklySummary, todaySummary, mealHistory, activityHistory, goals, refresh };
}
