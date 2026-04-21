-- 1) Tabela activity_logs para registrar atividades físicas
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  source text DEFAULT 'whatsapp_activity_text',
  original_text text,
  media_url text,
  media_content_type text,
  image_path text,
  twilio_message_sid text,
  activity_type text,
  activity_duration text,
  activity_distance text,
  activity_steps integer,
  estimated_burn_kcal numeric,
  status text DEFAULT 'pending',
  raw_payload jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_client_date ON public.activity_logs (client_id, created_at);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage activity logs"
ON public.activity_logs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own activity logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING ((client_id = public.current_client_id()) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own activity logs"
ON public.activity_logs
FOR DELETE
TO authenticated
USING ((client_id = public.current_client_id()) OR public.has_role(auth.uid(), 'admin'::app_role));

-- 2) Permitir que usuários excluam suas próprias refeições
CREATE POLICY "Users can delete their own meal logs"
ON public.meal_logs
FOR DELETE
TO authenticated
USING ((client_id = public.current_client_id()) OR public.has_role(auth.uid(), 'admin'::app_role));

-- 3) Adicionar coluna kcal_burned em daily_summary
ALTER TABLE public.daily_summary ADD COLUMN IF NOT EXISTS kcal_burned numeric DEFAULT 0;

-- 4) Atualizar recompute_daily_summary para incluir gasto calórico
CREATE OR REPLACE FUNCTION public.recompute_daily_summary(_client_id uuid, _date date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.daily_summary (client_id, summary_date, kcal_consumed, protein_consumed, carbs_consumed, kcal_burned, updated_at)
  SELECT
    _client_id,
    _date,
    COALESCE((SELECT SUM(estimated_kcal) FROM public.meal_logs
              WHERE client_id = _client_id AND status = 'processed'
                AND (created_at AT TIME ZONE 'UTC')::date = _date), 0),
    COALESCE((SELECT SUM(estimated_protein) FROM public.meal_logs
              WHERE client_id = _client_id AND status = 'processed'
                AND (created_at AT TIME ZONE 'UTC')::date = _date), 0),
    COALESCE((SELECT SUM(estimated_carbs) FROM public.meal_logs
              WHERE client_id = _client_id AND status = 'processed'
                AND (created_at AT TIME ZONE 'UTC')::date = _date), 0),
    COALESCE((SELECT SUM(estimated_burn_kcal) FROM public.activity_logs
              WHERE client_id = _client_id AND status = 'processed'
                AND (created_at AT TIME ZONE 'UTC')::date = _date), 0),
    now()
  ON CONFLICT (client_id, summary_date) DO UPDATE
    SET kcal_consumed = EXCLUDED.kcal_consumed,
        protein_consumed = EXCLUDED.protein_consumed,
        carbs_consumed = EXCLUDED.carbs_consumed,
        kcal_burned = EXCLUDED.kcal_burned,
        updated_at = now();
END;
$function$;

-- 5) Trigger para activity_logs recomputar daily_summary
CREATE OR REPLACE FUNCTION public.activity_logs_after_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _client uuid;
  _date date;
BEGIN
  IF TG_OP = 'DELETE' THEN
    _client := OLD.client_id;
    _date := (OLD.created_at AT TIME ZONE 'UTC')::date;
  ELSE
    _client := NEW.client_id;
    _date := (NEW.created_at AT TIME ZONE 'UTC')::date;
  END IF;

  IF _client IS NOT NULL AND _date IS NOT NULL THEN
    PERFORM public.recompute_daily_summary(_client, _date);
  END IF;

  RETURN NULL;
END;
$function$;

DROP TRIGGER IF EXISTS activity_logs_after_change_trg ON public.activity_logs;
CREATE TRIGGER activity_logs_after_change_trg
AFTER INSERT OR UPDATE OR DELETE ON public.activity_logs
FOR EACH ROW EXECUTE FUNCTION public.activity_logs_after_change();

-- 6) Garantir que meal_logs também tem o trigger (se ainda não existe)
DROP TRIGGER IF EXISTS meal_logs_after_change_trg ON public.meal_logs;
CREATE TRIGGER meal_logs_after_change_trg
AFTER INSERT OR UPDATE OR DELETE ON public.meal_logs
FOR EACH ROW EXECUTE FUNCTION public.meal_logs_after_change();