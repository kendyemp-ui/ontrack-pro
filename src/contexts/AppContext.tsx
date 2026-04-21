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
    }, 0);
  }, [user]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateGoal = (newGoal: DietGoal) => setGoal(newGoal);
  const updateBioimpedance = (bio: Bioimpedance) => setBioimpedance(bio);
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

  // Saldo diário = consumidas - (TMB + atividade)
  const netBalance = totalCalories - (totalBurn + bioimpedance.basalRate);

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
      goal, bioimpedance, races,
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
