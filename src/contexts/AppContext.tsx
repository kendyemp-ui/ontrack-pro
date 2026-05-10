import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Meal, DietGoal, DietObjective, Bioimpedance, Race, defaultGoal, defaultBioimpedance, defaultRaces } from '@/data/mockData';
import { useTodayMeals } from '@/hooks/useTodayMeals';
import { useTodayActivities, ActivityLogRow } from '@/hooks/useTodayActivities';

interface AppState {
  isLoggedIn: boolean;
  authLoading: boolean;
  user: User | null;
  session: Session | null;
  userName: string;
  meals: Meal[];
  activities: ActivityLogRow[];
  goal: DietGoal;
  bioimpedance: Bioimpedance;
  races: Race[];
  /** True when the logged-in user has a matched `clients` row by phone. */
  hasClientRecord: boolean;
  mealsLoading: boolean;
  activitiesLoading: boolean;
  clientId: string | null;
  logout: () => Promise<void>;
  updateGoal: (goal: DietGoal) => Promise<void>;
  updateBioimpedance: (bio: Bioimpedance, source?: string, pdfPath?: string) => Promise<void>;
  addRace: (race: Race) => void;
  removeRace: (id: string) => void;
  deleteMeal: (id: string) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalBurn: number;
  caloriesRemaining: number;
  proteinRemaining: number;
  carbsRemaining: number;
  netBalance: number;
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [fullName, setFullName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string | null>(null);

  const [goal, setGoal] = useState<DietGoal>(defaultGoal);
  const [bioimpedance, setBioimpedance] = useState<Bioimpedance>(defaultBioimpedance);
  const [races, setRaces] = useState<Race[]>(defaultRaces);

  const liveMeals = useTodayMeals(user?.id ?? null, userPhone);
  const liveActivities = useTodayActivities(liveMeals.clientId);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setFullName('');
      setUserPhone(null);
      setBioimpedance(defaultBioimpedance);
      setGoal(defaultGoal);
      return;
    }
    setTimeout(() => {
      supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.full_name) setFullName(data.full_name);
          else setFullName(user.email?.split('@')[0] ?? '');
          setUserPhone(data?.phone ?? null);
        });

      supabase
        .from('bioimpedance')
        .select('*')
        .eq('user_id', user.id)
        .order('measured_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setBioimpedance({
              basalRate: Number(data.basal_rate ?? defaultBioimpedance.basalRate),
              weight: Number(data.weight ?? defaultBioimpedance.weight),
              height: Number(data.height ?? defaultBioimpedance.height),
              bodyFat: Number(data.body_fat ?? defaultBioimpedance.bodyFat),
              muscleMass: Number(data.muscle_mass ?? defaultBioimpedance.muscleMass),
              bodyWater: Number(data.body_water ?? defaultBioimpedance.bodyWater),
              boneMass: Number(data.bone_mass ?? defaultBioimpedance.boneMass),
              visceralFat: Number(data.visceral_fat ?? defaultBioimpedance.visceralFat),
              metabolicAge: Number(data.metabolic_age ?? defaultBioimpedance.metabolicAge),
            });
          }
        });

      supabase
        .from('diet_goals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setGoal({
              name: data.name,
              caloriesTarget: Number(data.calories_target),
              proteinTarget: Number(data.protein_target),
              carbsTarget: Number(data.carbs_target),
              objective: data.objective as DietObjective,
              startDate: data.start_date ?? '',
              notes: data.notes ?? '',
            });
          }
        });
    }, 0);
  }, [user]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateGoal = async (newGoal: DietGoal) => {
    setGoal(newGoal);
    if (!user) return;
    const { error } = await supabase.from('diet_goals').upsert({
      user_id: user.id,
      name: newGoal.name,
      calories_target: newGoal.caloriesTarget,
      protein_target: newGoal.proteinTarget,
      carbs_target: newGoal.carbsTarget,
      objective: newGoal.objective,
      start_date: newGoal.startDate || null,
      notes: newGoal.notes,
    }, { onConflict: 'user_id' });
    if (error) console.error('updateGoal error', error);
  };
  const updateBioimpedance = async (bio: Bioimpedance, source: string = 'manual', pdfPath?: string) => {
    setBioimpedance(bio);
    if (!user) return;
    // INSERT sempre — cada salvar gera um novo ponto no histórico de evolução
    const { error } = await supabase
      .from('bioimpedance')
      .insert({
        user_id: user.id,
        measured_at: new Date().toISOString(),
        basal_rate: bio.basalRate,
        weight: bio.weight,
        height: bio.height,
        body_fat: bio.bodyFat,
        muscle_mass: bio.muscleMass,
        body_water: bio.bodyWater,
        bone_mass: bio.boneMass,
        visceral_fat: bio.visceralFat,
        metabolic_age: bio.metabolicAge,
        source,
        ...(pdfPath ? { pdf_path: pdfPath } : {}),
      });
    if (error) console.error('updateBioimpedance error', error);

    // Sincroniza o gasto basal no registro de cliente para que o daily_summary
    // use a TMB atualizada nos cálculos de saldo calórico.
    if (liveMeals.clientId && bio.basalRate && bio.basalRate > 0) {
      const { error: clientErr } = await supabase
        .from('clients')
        .update({ basal_rate_kcal: bio.basalRate })
        .eq('id', liveMeals.clientId);
      if (clientErr) console.error('updateBioimpedance: client sync error', clientErr);
    }
  };
  const addRace = (race: Race) => setRaces(prev => [...prev, race]);
  const removeRace = (id: string) => setRaces(prev => prev.filter(r => r.id !== id));

  const deleteMeal = async (id: string) => {
    await supabase.from('meal_logs').delete().eq('id', id);
  };

  const deleteActivity = async (id: string) => {
    await supabase.from('activity_logs').delete().eq('id', id);
  };

  // Sempre dados reais do Supabase. Sem mock.
  const meals: Meal[] = liveMeals.meals;
  const activities = liveActivities.rows.filter(r => r.status === 'processed');

  const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);
  const totalBurn = liveActivities.totalBurn;

  const caloriesRemaining = goal.caloriesTarget - totalCalories;
  const proteinRemaining = goal.proteinTarget - totalProtein;
  const carbsRemaining = goal.carbsTarget - totalCarbs;

  // Prioriza a TMB salva pelo usuário (bioimpedância) sobre a do registro de cliente,
  // pois o usuário pode ter atualizado o valor mais recentemente.
  const resolvedBasalRate = bioimpedance.basalRate && bioimpedance.basalRate > 0
    ? bioimpedance.basalRate
    : (liveMeals.clientBasalRate ?? bioimpedance.basalRate);

  // Saldo diário = consumidas - (TMB + atividade)
  const netBalance = totalCalories - (totalBurn + resolvedBasalRate);

  const userName = fullName?.split(' ')[0] || 'você';

  return (
    <AppContext.Provider value={{
      isLoggedIn: !!session,
      authLoading,
      user,
      session,
      userName,
      meals,
      activities,
      goal, bioimpedance: { ...bioimpedance, basalRate: resolvedBasalRate }, races,
      hasClientRecord: !!liveMeals.clientId,
      mealsLoading: liveMeals.loading,
      activitiesLoading: liveActivities.loading,
      clientId: liveMeals.clientId,
      logout, updateGoal, updateBioimpedance, addRace, removeRace,
      deleteMeal, deleteActivity,
      totalCalories, totalProtein, totalCarbs, totalBurn,
      caloriesRemaining, proteinRemaining, carbsRemaining, netBalance,
    }}>
      {children}
    </AppContext.Provider>
  );
};
