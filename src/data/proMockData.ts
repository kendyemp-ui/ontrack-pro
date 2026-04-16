export type PatientStatus = 'aderente' | 'atencao' | 'risco';

export interface Patient {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  goal: string;
  status: PatientStatus;
  weeklyAdherence: number; // 0-100
  lastInteraction: string; // human readable
  lastInteractionAt: string; // ISO
  startDate: string;
  caloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  notes: string;
  registeredToday: boolean;
  caloriesToday: number;
  burnToday: number;
  proteinToday: number;
  carbsToday: number;
  mealsToday: number;
}

const initials = (name: string) =>
  name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

export const avatarFor = (name: string) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=10b981,059669,0d9488,0891b2,7c3aed,db2777&textColor=ffffff`;

export const initialPatients: Patient[] = [
  {
    id: 'p1',
    name: 'Marina Costa',
    avatar: avatarFor('Marina Costa'),
    phone: '+55 11 98765-4321',
    email: 'marina@email.com',
    goal: 'Perda de gordura',
    status: 'aderente',
    weeklyAdherence: 92,
    lastInteraction: 'há 12 min',
    lastInteractionAt: new Date(Date.now() - 12 * 60000).toISOString(),
    startDate: '2026-01-10',
    caloriesTarget: 1800,
    proteinTarget: 130,
    carbsTarget: 180,
    notes: 'Intolerância à lactose. Treina 5x por semana.',
    registeredToday: true,
    caloriesToday: 1620,
    burnToday: 2100,
    proteinToday: 118,
    carbsToday: 162,
    mealsToday: 4,
  },
  {
    id: 'p2',
    name: 'Rafael Almeida',
    avatar: avatarFor('Rafael Almeida'),
    phone: '+55 11 99876-1234',
    email: 'rafael@email.com',
    goal: 'Performance maratona',
    status: 'aderente',
    weeklyAdherence: 88,
    lastInteraction: 'há 1h',
    lastInteractionAt: new Date(Date.now() - 60 * 60000).toISOString(),
    startDate: '2025-11-22',
    caloriesTarget: 3200,
    proteinTarget: 180,
    carbsTarget: 450,
    notes: 'Treinando para maratona de Berlim 2026.',
    registeredToday: true,
    caloriesToday: 2890,
    burnToday: 3450,
    proteinToday: 165,
    carbsToday: 410,
    mealsToday: 5,
  },
  {
    id: 'p3',
    name: 'Camila Souza',
    avatar: avatarFor('Camila Souza'),
    phone: '+55 21 98123-4567',
    email: 'camila@email.com',
    goal: 'Hipertrofia',
    status: 'atencao',
    weeklyAdherence: 64,
    lastInteraction: 'há 5h',
    lastInteractionAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    startDate: '2026-02-01',
    caloriesTarget: 2400,
    proteinTarget: 160,
    carbsTarget: 280,
    notes: 'Dificuldade em atingir meta de proteína.',
    registeredToday: true,
    caloriesToday: 1980,
    burnToday: 2300,
    proteinToday: 95,
    carbsToday: 240,
    mealsToday: 3,
  },
  {
    id: 'p4',
    name: 'Lucas Pereira',
    avatar: avatarFor('Lucas Pereira'),
    phone: '+55 31 97654-3210',
    email: 'lucas@email.com',
    goal: 'Perda de peso',
    status: 'risco',
    weeklyAdherence: 38,
    lastInteraction: 'há 2 dias',
    lastInteractionAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    startDate: '2026-03-05',
    caloriesTarget: 2100,
    proteinTarget: 140,
    carbsTarget: 220,
    notes: 'Excedendo metas com frequência. Episódios de compulsão.',
    registeredToday: false,
    caloriesToday: 0,
    burnToday: 1800,
    proteinToday: 0,
    carbsToday: 0,
    mealsToday: 0,
  },
  {
    id: 'p5',
    name: 'Juliana Ribeiro',
    avatar: avatarFor('Juliana Ribeiro'),
    phone: '+55 11 96543-2109',
    email: 'juliana@email.com',
    goal: 'Saúde geral',
    status: 'aderente',
    weeklyAdherence: 84,
    lastInteraction: 'há 30 min',
    lastInteractionAt: new Date(Date.now() - 30 * 60000).toISOString(),
    startDate: '2025-12-15',
    caloriesTarget: 1900,
    proteinTarget: 110,
    carbsTarget: 210,
    notes: 'Pré-diabética. Acompanhamento mensal.',
    registeredToday: true,
    caloriesToday: 1450,
    burnToday: 2050,
    proteinToday: 88,
    carbsToday: 175,
    mealsToday: 3,
  },
  {
    id: 'p6',
    name: 'Bruno Martins',
    avatar: avatarFor('Bruno Martins'),
    phone: '+55 47 95432-1098',
    email: 'bruno@email.com',
    goal: 'Triathlon',
    status: 'atencao',
    weeklyAdherence: 58,
    lastInteraction: 'há 8h',
    lastInteractionAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    startDate: '2025-10-01',
    caloriesTarget: 3500,
    proteinTarget: 200,
    carbsTarget: 480,
    notes: 'Atleta amador. Volume de treino alto.',
    registeredToday: false,
    caloriesToday: 0,
    burnToday: 3200,
    proteinToday: 0,
    carbsToday: 0,
    mealsToday: 0,
  },
  {
    id: 'p7',
    name: 'Patricia Lima',
    avatar: avatarFor('Patricia Lima'),
    phone: '+55 85 94321-0987',
    email: 'patricia@email.com',
    goal: 'Recomposição corporal',
    status: 'risco',
    weeklyAdherence: 41,
    lastInteraction: 'há 3 dias',
    lastInteractionAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    startDate: '2026-02-20',
    caloriesTarget: 1700,
    proteinTarget: 120,
    carbsTarget: 160,
    notes: 'Baixa adesão. Avaliar plano.',
    registeredToday: false,
    caloriesToday: 0,
    burnToday: 1750,
    proteinToday: 0,
    carbsToday: 0,
    mealsToday: 0,
  },
  {
    id: 'p8',
    name: 'Eduardo Faria',
    avatar: avatarFor('Eduardo Faria'),
    phone: '+55 11 93210-9876',
    email: 'eduardo@email.com',
    goal: 'Manutenção',
    status: 'aderente',
    weeklyAdherence: 90,
    lastInteraction: 'há 45 min',
    lastInteractionAt: new Date(Date.now() - 45 * 60000).toISOString(),
    startDate: '2025-09-10',
    caloriesTarget: 2500,
    proteinTarget: 150,
    carbsTarget: 290,
    notes: 'Cliente consistente. Reavaliação trimestral.',
    registeredToday: true,
    caloriesToday: 2380,
    burnToday: 2600,
    proteinToday: 142,
    carbsToday: 275,
    mealsToday: 4,
  },
];

export const weeklyAdherenceTrend = (base: number) => {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  return days.map((d, i) => ({
    day: d,
    adesao: Math.max(20, Math.min(100, base + Math.round((Math.sin(i * 1.3) + Math.cos(i * 0.7)) * 12))),
    meta: 100,
  }));
};

export const monthlyAdherenceTrend = (base: number) => {
  return Array.from({ length: 30 }, (_, i) => ({
    dia: i + 1,
    adesao: Math.max(20, Math.min(100, base + Math.round(Math.sin(i / 3) * 18 + Math.cos(i / 5) * 8))),
  }));
};

export interface TimelineItem {
  id: string;
  type: 'meal_photo' | 'auto_response' | 'alert' | 'substitution' | 'professional_note';
  time: string;
  title: string;
  description: string;
}

export const patientTimeline = (patientId: string): TimelineItem[] => [
  {
    id: 't1',
    type: 'meal_photo',
    time: 'há 12 min',
    title: 'Foto de refeição enviada',
    description: 'Almoço — frango grelhado, arroz integral e salada.',
  },
  {
    id: 't2',
    type: 'auto_response',
    time: 'há 11 min',
    title: 'Resposta automática enviada',
    description: 'Aproximadamente 540 kcal • 42g proteína • 58g carbo. Faltam 480 kcal para a meta.',
  },
  {
    id: 't3',
    type: 'substitution',
    time: 'há 2h',
    title: 'Pergunta sobre substituição',
    description: 'Cliente perguntou sobre substituir arroz por batata doce.',
  },
  {
    id: 't4',
    type: 'alert',
    time: 'há 1 dia',
    title: 'Alerta de baixa proteína',
    description: 'Consumo de proteína 22% abaixo da meta diária.',
  },
  {
    id: 't5',
    type: 'professional_note',
    time: 'há 2 dias',
    title: 'Observação registrada',
    description: 'Ajustar meta de carboidrato no pós-treino. Avaliar próxima semana.',
  },
];
