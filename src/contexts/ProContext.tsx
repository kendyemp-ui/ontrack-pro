import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient, avatarFor, deriveStatus, humanizeLastInteraction } from '@/data/proMockData';
import { toast } from 'sonner';

interface ProState {
  isLoggedIn: boolean;
  authLoading: boolean;
  professionalName: string;
  professionalId: string | null;
  patients: Patient[];
  patientsLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addPatient: (data: { name: string; phone: string; email?: string }) => Promise<Patient | null>;
  getPatient: (id: string) => Patient | undefined;
  refreshPatients: () => Promise<void>;
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
  const [authLoading, setAuthLoading] = useState(true);
  const [professionalName, setProfessionalName] = useState('');
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);

  // Verifica sessão ao montar
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const isPro = await checkProRole(session.user.id);
        if (isPro) {
          setIsLoggedIn(true);
          setProfessionalId(session.user.id);
          setProfessionalName(session.user.user_metadata?.full_name || session.user.email || 'Profissional');
        }
      }
      setAuthLoading(false);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setProfessionalId(null);
        setProfessionalName('');
        setPatients([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Busca pacientes quando logado
  useEffect(() => {
    if (isLoggedIn && professionalId) {
      loadPatients(professionalId);
    }
  }, [isLoggedIn, professionalId]);

  const checkProRole = async (userId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['profissional', 'admin'])
      .maybeSingle();
    return !!data;
  };

  const loadPatients = async (profId: string) => {
    setPatientsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Busca clients vinculados ao profissional
      const { data: clients, error } = await supabase
        .from('clients')
        .select(`
          id, name, phone_e164, email, created_at,
          client_goals (calories_target, protein_target, carbs_target, objective),
          daily_summary (summary_date, kcal_consumed, kcal_burned, protein_consumed, carbs_consumed, meal_count, calorie_balance)
        `)
        .eq('professional_id', profId)
        .order('name');

      if (error) throw error;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const sevenDaysStr = sevenDaysAgo.toISOString().split('T')[0];

      const patientList: Patient[] = await Promise.all((clients || []).map(async (c: any) => {
        // Adesão: quantos dos últimos 7 dias tiveram ao menos 1 refeição registrada
        const { data: weeklySummary } = await supabase
          .from('daily_summary')
          .select('summary_date, meal_count')
          .eq('client_id', c.id)
          .gte('summary_date', sevenDaysStr)
          .lte('summary_date', today);

        const daysWithMeals = (weeklySummary || []).filter((d: any) => (d.meal_count || 0) > 0).length;
        const weeklyAdherence = Math.round((daysWithMeals / 7) * 100);

        // Última interação via whatsapp_messages
        const { data: lastMsg } = await supabase
          .from('whatsapp_messages')
          .select('created_at')
          .eq('client_id', c.id)
          .eq('direction', 'inbound')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const todaySummary = (c.daily_summary || []).find((d: any) => d.summary_date === today);
        const goals = c.client_goals?.[0];
        const objective = goals?.objective || 'maintain';
        const goalLabel = objective === 'lose'
          ? 'Perda de gordura'
          : objective === 'gain'
            ? 'Ganho de massa'
            : 'Manutenção';

        return {
          id: c.id,
          name: c.name,
          phone: c.phone_e164,
          email: c.email,
          avatar: avatarFor(c.name),
          goal: goalLabel,
          status: deriveStatus(weeklyAdherence),
          weeklyAdherence,
          lastInteraction: humanizeLastInteraction(lastMsg?.created_at || null),
          lastInteractionAt: lastMsg?.created_at || null,
          startDate: c.created_at,
          caloriesTarget: goals?.calories_target || 2000,
          proteinTarget: goals?.protein_target || 150,
          carbsTarget: goals?.carbs_target || 200,
          registeredToday: !!todaySummary && (todaySummary.meal_count || 0) > 0,
          caloriesToday: todaySummary?.kcal_consumed || 0,
          burnToday: todaySummary?.kcal_burned || 0,
          proteinToday: todaySummary?.protein_consumed || 0,
          carbsToday: todaySummary?.carbs_consumed || 0,
          mealsToday: todaySummary?.meal_count || 0,
        } as Patient;
      }));

      setPatients(patientList);
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
      toast.error('Erro ao carregar pacientes');
    } finally {
      setPatientsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return false;

    const isPro = await checkProRole(data.user.id);
    if (!isPro) {
      await supabase.auth.signOut();
      return false;
    }

    setIsLoggedIn(true);
    setProfessionalId(data.user.id);
    setProfessionalName(data.user.user_metadata?.full_name || email);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setProfessionalId(null);
    setProfessionalName('');
    setPatients([]);
  };

  const addPatient = async (data: { name: string; phone: string; email?: string }): Promise<Patient | null> => {
    if (!professionalId) return null;
    // Normaliza para E.164 BR (ex.: 5543991092929 -> +5543991092929).
    // O trigger no banco também normaliza, mas mantemos aqui para a busca abaixo.
    const digits = data.phone.replace(/\D/g, '');
    const phone_e164 = digits.startsWith('55') ? `+${digits}` : `+55${digits}`;

    // Se já existe um client com esse telefone (B2C puro ou de outro nutri), vinculamos
    // ao profissional atual em vez de criar um duplicado — assim o histórico do B2C
    // aparece automaticamente na visão Pró.
    const { data: existing } = await supabase
      .from('clients')
      .select('id, professional_id')
      .eq('phone_e164', phone_e164)
      .maybeSingle();

    let inserted: any = null;
    let error: any = null;

    if (existing) {
      if (existing.professional_id && existing.professional_id !== professionalId) {
        toast.error('Esse telefone já está vinculado a outro profissional.');
        return null;
      }
      const upd = await supabase
        .from('clients')
        .update({ name: data.name, email: data.email || null, professional_id: professionalId })
        .eq('id', existing.id)
        .select()
        .single();
      inserted = upd.data;
      error = upd.error;
    } else {
      const ins = await supabase
        .from('clients')
        .insert({ name: data.name, phone_e164, email: data.email || null, professional_id: professionalId })
        .select()
        .single();
      inserted = ins.data;
      error = ins.error;
    }

    if (error || !inserted) {
      toast.error('Erro ao adicionar paciente: ' + (error?.message ?? 'desconhecido'));
      return null;
    }
    const newPatient: Patient = {
      id: inserted.id,
      name: inserted.name,
      phone: inserted.phone_e164,
      email: inserted.email,
      avatar: avatarFor(inserted.name),
      goal: 'Manutenção',
      status: 'risco',
      weeklyAdherence: 0,
      lastInteraction: 'sem interação',
      lastInteractionAt: null,
      startDate: inserted.created_at,
      caloriesTarget: 2000,
      proteinTarget: 150,
      carbsTarget: 200,
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

  const refreshPatients = async () => {
    if (professionalId) await loadPatients(professionalId);
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
      isLoggedIn, authLoading, professionalName, professionalId,
      patients, patientsLoading, login, logout,
      addPatient, getPatient, refreshPatients, kpis,
    }}>
      {children}
    </ProContext.Provider>
  );
};
