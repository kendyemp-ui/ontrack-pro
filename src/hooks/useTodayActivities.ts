import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLogRow {
  id: string;
  client_id: string | null;
  source: string | null;
  status: string | null;
  original_text: string | null;
  media_url: string | null;
  activity_type: string | null;
  activity_duration: string | null;
  activity_distance: string | null;
  activity_steps: number | null;
  estimated_burn_kcal: number | null;
  created_at: string;
}

export interface TodayActivitiesState {
  loading: boolean;
  rows: ActivityLogRow[];
  totalBurn: number;
}

export function useTodayActivities(clientId: string | null) {
  const [state, setState] = useState<TodayActivitiesState>({
    loading: true,
    rows: [],
    totalBurn: 0,
  });

  useEffect(() => {
    if (!clientId) {
      setState({ loading: false, rows: [], totalBurn: 0 });
      return;
    }

    let cancelled = false;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const fetchAll = async () => {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('client_id', clientId)
        .gte('created_at', startOfDay.toISOString())
        .order('created_at', { ascending: true });

      const rows = (data ?? []) as ActivityLogRow[];
      const processed = rows.filter(r => r.status === 'processed');
      const totalBurn = processed.reduce((s, r) => s + Number(r.estimated_burn_kcal ?? 0), 0);
      if (!cancelled) setState({ loading: false, rows, totalBurn: Math.round(totalBurn) });
    };

    fetchAll();

    const channel = supabase
      .channel(`activity_logs_${clientId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_logs', filter: `client_id=eq.${clientId}` },
        () => fetchAll(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  return state;
}
