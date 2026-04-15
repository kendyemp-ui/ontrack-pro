export interface Meal {
  id: string;
  type: 'cafe' | 'almoco' | 'jantar' | 'lanche';
  typeLabel: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  image: string;
  origin: 'WhatsApp' | 'App';
  date: string;
}

export interface DietGoal {
  name: string;
  caloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  startDate: string;
  notes: string;
}

export interface DailyBurn {
  total: number;
  steps: number;
  activity: string;
  activityDuration: string;
}

export interface Bioimpedance {
  basalRate: number;
  weight: number;
  height: number;
  bodyFat: number;
  muscleMass: number;
  bodyWater: number;
  boneMass: number;
  visceralFat: number;
  metabolicAge: number;
}

export interface Race {
  id: string;
  name: string;
  type: string;
  date: string;
  location: string;
  distance: string;
}

export const defaultBioimpedance: Bioimpedance = {
  basalRate: 1750,
  weight: 78,
  height: 178,
  bodyFat: 16.5,
  muscleMass: 35.2,
  bodyWater: 58,
  boneMass: 3.2,
  visceralFat: 8,
  metabolicAge: 28,
};

export const defaultRaces: Race[] = [
  { id: '1', name: 'Maratona de São Paulo', type: 'Maratona', date: '2026-10-18', location: 'São Paulo, Brasil', distance: '42.195 km' },
  { id: '2', name: 'Ironman 70.3 Florianópolis', type: 'Ironman 70.3', date: '2026-07-12', location: 'Florianópolis, Brasil', distance: '113 km' },
  { id: '3', name: 'Meia Maratona do Rio', type: 'Meia Maratona', date: '2026-06-07', location: 'Rio de Janeiro, Brasil', distance: '21.1 km' },
];

export const defaultGoal: DietGoal = {
  name: 'Plano Performance',
  caloriesTarget: 2000,
  proteinTarget: 160,
  carbsTarget: 180,
  startDate: '2026-04-01',
  notes: 'Foco em ganho de massa magra com controle calórico.',
};

export const todayMeals: Meal[] = [
  {
    id: '1',
    type: 'cafe',
    typeLabel: 'Café da Manhã',
    time: '07:30',
    calories: 380,
    protein: 28,
    carbs: 35,
    image: '🥣',
    origin: 'WhatsApp',
    date: '2026-04-15',
  },
  {
    id: '2',
    type: 'lanche',
    typeLabel: 'Lanche da Manhã',
    time: '10:15',
    calories: 220,
    protein: 18,
    carbs: 22,
    image: '🍎',
    origin: 'WhatsApp',
    date: '2026-04-15',
  },
  {
    id: '3',
    type: 'almoco',
    typeLabel: 'Almoço',
    time: '12:45',
    calories: 580,
    protein: 42,
    carbs: 52,
    image: '🍗',
    origin: 'WhatsApp',
    date: '2026-04-15',
  },
  {
    id: '4',
    type: 'lanche',
    typeLabel: 'Lanche da Tarde',
    time: '15:30',
    calories: 270,
    protein: 22,
    carbs: 21,
    image: '🥤',
    origin: 'WhatsApp',
    date: '2026-04-15',
  },
];

export const dailyBurn: DailyBurn = {
  total: 640,
  steps: 9240,
  activity: 'Corrida',
  activityDuration: '45 min',
};

// basalRate default = 1750 for mock chart data
export const weeklyData = [
  { day: 'Seg', calories: 1850, burned: 580, protein: 145, carbs: 165, basal: 1750 },
  { day: 'Ter', calories: 2100, burned: 420, protein: 155, carbs: 190, basal: 1750 },
  { day: 'Qua', calories: 1920, burned: 700, protein: 162, carbs: 170, basal: 1750 },
  { day: 'Qui', calories: 2050, burned: 350, protein: 148, carbs: 185, basal: 1750 },
  { day: 'Sex', calories: 1780, burned: 640, protein: 158, carbs: 155, basal: 1750 },
  { day: 'Sáb', calories: 2300, burned: 300, protein: 130, carbs: 210, basal: 1750 },
  { day: 'Dom', calories: 1950, burned: 500, protein: 152, carbs: 175, basal: 1750 },
];

export const monthlyData = [
  { week: 'Sem 1', avgCalories: 1950, avgBurned: 520, avgProtein: 148, avgCarbs: 172, daysOnTarget: 5, daysOver: 2, basal: 1750 },
  { week: 'Sem 2', avgCalories: 2020, avgBurned: 480, avgProtein: 155, avgCarbs: 178, daysOnTarget: 4, daysOver: 3, basal: 1750 },
  { week: 'Sem 3', avgCalories: 1880, avgBurned: 610, avgProtein: 160, avgCarbs: 165, daysOnTarget: 6, daysOver: 1, basal: 1750 },
  { week: 'Sem 4', avgCalories: 1920, avgBurned: 550, avgProtein: 158, avgCarbs: 170, daysOnTarget: 5, daysOver: 2, basal: 1750 },
];

export const historyMeals: Meal[] = [
  ...todayMeals,
  {
    id: '5', type: 'cafe', typeLabel: 'Café da Manhã', time: '07:15', calories: 350, protein: 25, carbs: 30,
    image: '🥚', origin: 'WhatsApp', date: '2026-04-14',
  },
  {
    id: '6', type: 'almoco', typeLabel: 'Almoço', time: '12:30', calories: 620, protein: 45, carbs: 55,
    image: '🥩', origin: 'WhatsApp', date: '2026-04-14',
  },
  {
    id: '7', type: 'jantar', typeLabel: 'Jantar', time: '19:45', calories: 480, protein: 38, carbs: 42,
    image: '🐟', origin: 'WhatsApp', date: '2026-04-14',
  },
  {
    id: '8', type: 'lanche', typeLabel: 'Lanche', time: '16:00', calories: 180, protein: 12, carbs: 18,
    image: '🍌', origin: 'WhatsApp', date: '2026-04-14',
  },
  {
    id: '9', type: 'cafe', typeLabel: 'Café da Manhã', time: '08:00', calories: 400, protein: 30, carbs: 38,
    image: '🥞', origin: 'WhatsApp', date: '2026-04-13',
  },
  {
    id: '10', type: 'almoco', typeLabel: 'Almoço', time: '13:00', calories: 550, protein: 40, carbs: 50,
    image: '🍛', origin: 'WhatsApp', date: '2026-04-13',
  },
];

export const integrations = [
  { name: 'Apple Watch', icon: '⌚', status: 'soon' as const, description: 'Sincronize calorias gastas e atividades' },
  { name: 'Garmin', icon: '📟', status: 'soon' as const, description: 'Importe treinos e gasto calórico' },
  { name: 'Oura Ring', icon: '💍', status: 'soon' as const, description: 'Acompanhe sono e prontidão' },
  { name: 'Smart Ring', icon: '🔘', status: 'soon' as const, description: 'Monitore métricas de saúde' },
  { name: 'WhatsApp Business API', icon: '💬', status: 'config' as const, description: 'Canal principal de registro e feedback' },
  { name: 'Google Fit', icon: '🏃', status: 'soon' as const, description: 'Sincronize atividades e passos' },
];

export const chatMessages = [
  { id: 1, type: 'sent' as const, text: '', image: '📸 almoço.jpg', time: '12:45' },
  { id: 2, type: 'received' as const, text: '✅ Refeição registrada com sucesso!\n\n📊 Estimativa:\n• 520 kcal\n• 32g proteína\n• 48g carboidratos', time: '12:45' },
  { id: 3, type: 'received' as const, text: '📈 Até agora você consumiu 1.450 kcal\n\n🎯 Faltam 550 kcal para sua meta diária\n⚡ Faltam 50g de proteína', time: '14:00' },
  { id: 4, type: 'sent' as const, text: '', image: '📸 lanche.jpg', time: '15:30' },
  { id: 5, type: 'received' as const, text: '✅ Lanche registrado!\n\n📊 Estimativa:\n• 270 kcal\n• 22g proteína\n• 21g carboidratos', time: '15:30' },
  { id: 6, type: 'received' as const, text: '🌙 Fechamento do dia concluído\n\n📊 Resumo:\n• Você ficou 270 kcal abaixo da meta\n• Faltaram 28g de proteína\n• Carboidratos dentro da meta ✅\n• Gasto calórico: 640 kcal\n• Saldo líquido: 810 kcal', time: '21:00' },
];
