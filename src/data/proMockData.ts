export type PatientStatus = 'aderente' | 'atencao' | 'risco';

export interface Patient {
  id: string;          // UUID do clients.id
  name: string;
  phone: string;
  email: string | null;
  avatar: string;
  goal: string;        // vem de client_goals.objective
  status: PatientStatus;
  weeklyAdherence: number; // 0-100, calculado dos últimos 7 dias
  lastInteraction: string; // human readable
  lastInteractionAt: string | null; // ISO
  startDate: string;
  caloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  registeredToday: boolean;
  caloriesToday: number;
  burnToday: number;
  proteinToday: number;
  carbsToday: number;
  mealsToday: number;
  notes?: string;
}

export const avatarFor = (name: string) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=10b981,059669,0d9488,0891b2,7c3aed,db2777&textColor=ffffff`;

export function deriveStatus(weeklyAdherence: number): PatientStatus {
  if (weeklyAdherence >= 75) return 'aderente';
  if (weeklyAdherence >= 40) return 'atencao';
  return 'risco';
}

export function humanizeLastInteraction(isoDate: string | null): string {
  if (!isoDate) return 'sem interação';
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `há ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  return `há ${Math.floor(hrs / 24)} dias`;
}

// Helpers visuais usados no perfil do paciente (séries derivadas da adesão atual)
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

// Sem dados fictícios — timeline real virá de whatsapp_messages / professional_notes futuramente
export const patientTimeline = (_patientId: string): TimelineItem[] => [];
