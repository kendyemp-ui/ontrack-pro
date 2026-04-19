import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Meal, DietGoal, DailyBurn, Bioimpedance, Race, defaultGoal, todayMeals, dailyBurn, defaultBioimpedance, defaultRaces } from '@/data/mockData';

interface AppState {
  isLoggedIn: boolean;
  userName: string;
  meals: Meal[];
  goal: DietGoal;
  burn: DailyBurn;
  bioimpedance: Bioimpedance;
  races: Race[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName] = useState('João');
  const [meals, setMeals] = useState<Meal[]>(todayMeals);
  const [goal, setGoal] = useState<DietGoal>(defaultGoal);
  const [burn] = useState<DailyBurn>(dailyBurn);
  const [bioimpedance, setBioimpedance] = useState<Bioimpedance>(defaultBioimpedance);
  const [races, setRaces] = useState<Race[]>(defaultRaces);

  const login = (email: string, password: string) => {
    if (email === 'teste@ontrack.com' && password === '123456') {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsLoggedIn(false);
  const addMeal = (meal: Meal) => setMeals(prev => [...prev, meal]);
  const updateGoal = (newGoal: DietGoal) => setGoal(newGoal);
  const updateBioimpedance = (bio: Bioimpedance) => setBioimpedance(bio);
  const addRace = (race: Race) => setRaces(prev => [...prev, race]);
  const removeRace = (id: string) => setRaces(prev => prev.filter(r => r.id !== id));

  const todaysMeals = meals.filter(m => m.date === '2026-04-15');
  const totalCalories = todaysMeals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = todaysMeals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = todaysMeals.reduce((s, m) => s + m.carbs, 0);

  const caloriesRemaining = goal.caloriesTarget - totalCalories;
  const proteinRemaining = goal.proteinTarget - totalProtein;
  const carbsRemaining = goal.carbsTarget - totalCarbs;
  const totalBurn = burn.total + bioimpedance.basalRate;
  const netBalance = totalCalories - totalBurn;

  return (
    <AppContext.Provider value={{
      isLoggedIn, userName, meals, goal, burn, bioimpedance, races,
      login, logout, addMeal, updateGoal, updateBioimpedance, addRace, removeRace,
      totalCalories, totalProtein, totalCarbs,
      caloriesRemaining, proteinRemaining, carbsRemaining, netBalance,
    }}>
      {children}
    </AppContext.Provider>
  );
};
