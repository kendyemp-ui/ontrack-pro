import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Meal, DietGoal, Bioimpedance, Race, defaultGoal, defaultBioimpedance, defaultRaces } from '@/data/mockData';
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
  updateGoal: (goal: DietGoal) => void;
  updateBioimpedance: (bio: Bioimpedance) => void;
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
    }, 0);
  }, [user]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateGoal = (newGoal: DietGoal) => setGoal(newGoal);
  const updateBioimpedance = async (bio: Bioimpedance, source: string = 'manual', pdfPath?: string) => {
    setBioimpedance(bio);
    if (!user) return;
    const { error } = await supabase
      .from('bioimpedance')
      .upsert({
        user_id: user.id,
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
      }, { onConflict: 'user_id' });
    if (error) console.error('updateBioimpedance error', error);
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

  const resolvedBasalRate = liveMeals.clientBasalRate ?? bioimpedance.basalRate;

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
