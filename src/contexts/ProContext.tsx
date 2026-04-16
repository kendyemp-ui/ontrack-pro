import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Patient, initialPatients, avatarFor } from '@/data/proMockData';

interface ProState {
  isLoggedIn: boolean;
  professionalName: string;
  patients: Patient[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addPatient: (data: Omit<Patient, 'id' | 'avatar' | 'lastInteraction' | 'lastInteractionAt' | 'weeklyAdherence' | 'registeredToday' | 'caloriesToday' | 'burnToday' | 'proteinToday' | 'carbsToday' | 'mealsToday'>) => Patient;
  getPatient: (id: string) => Patient | undefined;
  kpis: {
    total: number;
    aderentes: number;
    atencao: number;
    risco: number;
    semRegistro: number;
    mediaAdesao: number;
  };
}

const ProContext = createContext<ProState | null>(null);

export const usePro = () => {
  const ctx = useContext(ProContext);
  if (!ctx) throw new Error('usePro must be used within ProProvider');
  return ctx;
};

export const ProProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [professionalName] = useState('Dra. Helena Vieira');
  const [patients, setPatients] = useState<Patient[]>(initialPatients);

  const login = (email: string, password: string) => {
    if (email === 'profissional@teste.com' && password === '123456') {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsLoggedIn(false);

  const addPatient: ProState['addPatient'] = (data) => {
    const newPatient: Patient = {
      ...data,
      id: `p${Date.now()}`,
      avatar: avatarFor(data.name),
      weeklyAdherence: 0,
      lastInteraction: 'sem interação',
      lastInteractionAt: new Date().toISOString(),
      registeredToday: false,
      caloriesToday: 0,
      burnToday: 0,
      proteinToday: 0,
      carbsToday: 0,
      mealsToday: 0,
    };
    setPatients(prev => [newPatient, ...prev]);
    return newPatient;
  };

  const getPatient = (id: string) => patients.find(p => p.id === id);

  const kpis = useMemo(() => {
    const total = patients.length;
    const aderentes = patients.filter(p => p.status === 'aderente').length;
    const atencao = patients.filter(p => p.status === 'atencao').length;
    const risco = patients.filter(p => p.status === 'risco').length;
    const semRegistro = patients.filter(p => !p.registeredToday).length;
    const mediaAdesao = total > 0
      ? Math.round(patients.reduce((s, p) => s + p.weeklyAdherence, 0) / total)
      : 0;
    return { total, aderentes, atencao, risco, semRegistro, mediaAdesao };
  }, [patients]);

  return (
    <ProContext.Provider value={{
      isLoggedIn, professionalName, patients,
      login, logout, addPatient, getPatient, kpis,
    }}>
      {children}
    </ProContext.Provider>
  );
};
