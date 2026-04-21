import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Meal, DietGoal, DailyBurn, Bioimpedance, Race, defaultGoal, todayMeals, dailyBurn, defaultBioimpedance, defaultRaces } from '@/data/mockData';
import { useTodayMeals } from '@/hooks/useTodayMeals';

interface AppState {
  isLoggedIn: boolean;
  authLoading: boolean;
  user: User | null;
  session: Session | null;
  userName: string;
  meals: Meal[];
  goal: DietGoal;
  burn: DailyBurn;
  bioimpedance: Bioimpedance;
  races: Race[];
  /** True when meals are coming from the live Supabase fluxo (Make/Twilio). */
  mealsLive: boolean;
  /** Loading state of the live meals fetch. */
  mealsLoading: boolean;
  /** Whether the logged-in user has a matched `clients` row by phone. */
  hasClientRecord: boolean;
  logout: () => Promise<void>;
  addMeal: (meal: Meal) => void;
  updateGoal: (goal: DietGoal) => void;
  updateBioimpedance: (bio: Bioimpedance) => void;
  addRace: (race: Race) => void;
  removeRace: (id: string) => void;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
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

  const [meals, setMeals] = useState<Meal[]>(todayMeals);
  const [goal, setGoal] = useState<DietGoal>(defaultGoal);
  const [burn] = useState<DailyBurn>(dailyBurn);
  const [bioimpedance, setBioimpedance] = useState<Bioimpedance>(defaultBioimpedance);
  const [races, setRaces] = useState<Race[]>(defaultRaces);

  // Live meals from Supabase (fed by Make/Twilio/OpenAI flow)
  const liveMeals = useTodayMeals(user?.id ?? null, userPhone);

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile (name + phone) when user logs in (deferred to avoid deadlock)
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

  const addMeal = (meal: Meal) => setMeals(prev => [...prev, meal]);
  const updateGoal = (newGoal: DietGoal) => setGoal(newGoal);
  const updateBioimpedance = (bio: Bioimpedance) => setBioimpedance(bio);
  const addRace = (race: Race) => setRaces(prev => [...prev, race]);
  const removeRace = (id: string) => setRaces(prev => prev.filter(r => r.id !== id));

  // Decide which meals feed the rest of the app:
  // - if the logged user has a real `clients` row, use live data (even if empty for today)
  // - otherwise, keep the mock so the demo experience stays intact
  const hasClientRecord = !!liveMeals.clientId;
  const effectiveMeals: Meal[] = hasClientRecord ? liveMeals.meals : meals;

  const todaysMeals = hasClientRecord
    ? effectiveMeals
    : effectiveMeals.filter(m => m.date === '2026-04-15');
  const totalCalories = todaysMeals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = todaysMeals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = todaysMeals.reduce((s, m) => s + m.carbs, 0);

  const caloriesRemaining = goal.caloriesTarget - totalCalories;
  const proteinRemaining = goal.proteinTarget - totalProtein;
  const carbsRemaining = goal.carbsTarget - totalCarbs;
  const totalBurn = burn.total + bioimpedance.basalRate;
  const netBalance = totalCalories - totalBurn;

  const userName = fullName?.split(' ')[0] || 'você';

  return (
    <AppContext.Provider value={{
      isLoggedIn: !!session,
      authLoading,
      user,
      session,
      userName,
      meals: effectiveMeals,
      goal, burn, bioimpedance, races,
      mealsLive: hasClientRecord,
      mealsLoading: liveMeals.loading,
      hasClientRecord,
      logout, addMeal, updateGoal, updateBioimpedance, addRace, removeRace,
      totalCalories, totalProtein, totalCarbs,
      caloriesRemaining, proteinRemaining, carbsRemaining, netBalance,
    }}>
      {children}
    </AppContext.Provider>
  );
};
