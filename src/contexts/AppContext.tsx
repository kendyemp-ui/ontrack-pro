import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Meal, DietGoal, DailyBurn, defaultGoal, todayMeals, dailyBurn } from '@/data/mockData';

interface AppState {
  isLoggedIn: boolean;
  userName: string;
  meals: Meal[];
  goal: DietGoal;
  burn: DailyBurn;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addMeal: (meal: Meal) => void;
  updateGoal: (goal: DietGoal) => void;
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

  const login = (email: string, password: string) => {
    if (email === 'teste@moveonhealth.com' && password === '123456') {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsLoggedIn(false);

  const addMeal = (meal: Meal) => setMeals(prev => [...prev, meal]);

  const updateGoal = (newGoal: DietGoal) => setGoal(newGoal);

  const todaysMeals = meals.filter(m => m.date === '2026-04-15');
  const totalCalories = todaysMeals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = todaysMeals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = todaysMeals.reduce((s, m) => s + m.carbs, 0);

  const caloriesRemaining = goal.caloriesTarget - totalCalories;
  const proteinRemaining = goal.proteinTarget - totalProtein;
  const carbsRemaining = goal.carbsTarget - totalCarbs;
  const netBalance = totalCalories - burn.total;

  return (
    <AppContext.Provider value={{
      isLoggedIn, userName, meals, goal, burn,
      login, logout, addMeal, updateGoal,
      totalCalories, totalProtein, totalCarbs,
      caloriesRemaining, proteinRemaining, carbsRemaining, netBalance,
    }}>
      {children}
    </AppContext.Provider>
  );
};
