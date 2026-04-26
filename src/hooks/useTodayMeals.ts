import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Meal } from '@/data/mockData';

export interface MealLogRow {
  id: string;
  client_id: string | null;
  source: string | null;
  status: string | null;
  estimated_kcal: number | null;
  estimated_protein: number | null;
  estimated_carbs: number | null;
  estimated_fat: number | null;
  original_text: string | null;
  media_url: string | null;
  media_content_type: string | null;
  image_path: string | null;
  created_at: string;
}

export interface TodayMealsState {
  loading: boolean;
  clientId: string | null;
  clientBasalRate: number | null;
  rows: MealLogRow[];
  meals: Meal[]; // adapted to legacy Meal shape so existing UI keeps working
}

const TYPE_LABELS = ['Café da manhã', 'Lanche', 'Almoço', 'Lanche', 'Jantar', 'Ceia'];

function inferTypeFromHour(hour: number): { type: Meal['type']; label: string; emoji: string } {
  if (hour < 10) return { type: 'cafe', label: 'Café da manhã', emoji: '☕' };
  if (hour < 12) return { type: 'lanche', label: 'Lanche', emoji: '🥪' };
  if (hour < 15) return { type: 'almoco', label: 'Almoço', emoji: '🍽️' };
  if (hour < 18) return { type: 'lanche', label: 'Lanche', emoji: '🍎' };
  if (hour < 22) return { type: 'jantar', label: 'Jantar', emoji: '🍛' };
  return { type: 'lanche', label: 'Ceia', emoji: '🌙' };
}

function rowToMeal(row: MealLogRow): Meal {
  const d = new Date(row.created_at);
  const inf = inferTypeFromHour(d.getHours());
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = d.toISOString().slice(0, 10);
  return {
    id: row.id,
    type: inf.type,
    typeLabel: row.original_text?.slice(0, 32) || inf.label,
    time,
    calories: Math.round(row.estimated_kcal ?? 0),
    protein: Math.round(row.estimated_protein ?? 0),
    carbs: Math.round(row.estimated_carbs ?? 0),
    image: row.media_url || row.image_path ? '📷' : inf.emoji,
    origin: row.source === 'whatsapp' ? 'WhatsApp' : 'App',
    date: dateStr,
  };
}

/**
 * Resolves the current client (by matching profiles.phone -> clients.phone_e164),
 * subscribes to today's meal_logs in realtime, and returns them adapted
 * to the legacy Meal shape used by the existing UI.
 */
export function useTodayMeals(userId: string | null, userPhone: string | null) {
  const [state, setState] = useState<TodayMealsState>({
    loading: true,
    clientId: null,
    clientBasalRate: null,
    rows: [],
    meals: [],
  });

  useEffect(() => {
    if (!userId) {
      setState({ loading: false, clientId: null, clientBasalRate: null, rows: [], meals: [] });
      return;
    }

    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      // 1) Resolve the exact client linked to the logged-in user.
      // Avoid fetching an arbitrary visible client (important for admin/pro demo accounts).
      let clientId: string | null = null;
      let clientBasalRate: number | null = null;

      const { data: rpcClientId, error: rpcError } = await supabase.rpc('current_client_id');

      if (!rpcError && rpcClientId) {
        clientId = rpcClientId;

        const { data: clientRow } = await supabase
          .from('clients')
          .select('id, basal_rate_kcal')
          .eq('id', rpcClientId)
          .maybeSingle();

        clientBasalRate = clientRow?.basal_rate_kcal ?? null;
      }

      if (!clientId && userPhone) {
        const { data: clientByPhone } = await supabase
          .from('clients')
          .select('id, basal_rate_kcal')
          .eq('phone_e164', userPhone)
          .maybeSingle();

        clientId = clientByPhone?.id ?? null;
        clientBasalRate = clientByPhone?.basal_rate_kcal ?? null;
      }

      if (!clientId) {
        if (!cancelled) setState({ loading: false, clientId: null, clientBasalRate: null, rows: [], meals: [] });
        return;
      }

      // 2) Fetch today's meal_logs
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: rows } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('client_id', clientId)
        .gte('created_at', startOfDay.toISOString())
        .order('created_at', { ascending: true });

      const safeRows = (rows ?? []) as MealLogRow[];
      if (!cancelled) {
        setState({
          loading: false,
          clientId,
          clientBasalRate,
          rows: safeRows,
          meals: safeRows.filter(r => r.status === 'processed').map(rowToMeal),
        });
      }

      // 3) Realtime: refresh on any change to this client's meal_logs today
      channel = supabase
        .channel(`meal_logs_${clientId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'meal_logs', filter: `client_id=eq.${clientId}` },
          async () => {
            const { data: refreshed } = await supabase
              .from('meal_logs')
              .select('*')
              .eq('client_id', clientId)
              .gte('created_at', startOfDay.toISOString())
              .order('created_at', { ascending: true });
            const safe = (refreshed ?? []) as MealLogRow[];
            if (!cancelled) {
              setState({
                loading: false,
                clientId,
                clientBasalRate,
                rows: safe,
                meals: safe.filter(r => r.status === 'processed').map(rowToMeal),
              });
            }
          }
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId, userPhone]);

  return state;
}
