-- =====================================================
-- Tabelas do fluxo Make/Twilio/OpenAI
-- =====================================================

-- 1) clients: cadastro do paciente que envia refeições pelo WhatsApp
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone_e164 text NOT NULL UNIQUE,
  email text,
  professional_id uuid,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_clients_phone_e164 ON public.clients(phone_e164);
CREATE INDEX idx_clients_professional_id ON public.clients(professional_id);

-- 2) meal_logs: cada refeição enviada (texto ou imagem)
CREATE TABLE public.meal_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  source text DEFAULT 'whatsapp',
  image_path text,
  estimated_kcal numeric,
  estimated_protein numeric,
  estimated_carbs numeric,
  estimated_fat numeric,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  original_text text,
  media_url text,
  media_content_type text,
  twilio_message_sid text,
  CONSTRAINT meal_logs_status_check CHECK (status IN ('pending','processed','error'))
);
CREATE INDEX idx_meal_logs_client_id_created_at ON public.meal_logs(client_id, created_at DESC);
CREATE INDEX idx_meal_logs_status ON public.meal_logs(status);

-- 3) daily_summary: agregação diária por cliente
CREATE TABLE public.daily_summary (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  summary_date date NOT NULL,
  kcal_consumed numeric DEFAULT 0,
  protein_consumed numeric DEFAULT 0,
  carbs_consumed numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (client_id, summary_date)
);
CREATE INDEX idx_daily_summary_client_date ON public.daily_summary(client_id, summary_date DESC);

-- 4) whatsapp_messages: log bruto de mensagens recebidas/enviadas
CREATE TABLE public.whatsapp_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  direction text NOT NULL,
  message_type text NOT NULL,
  text_body text,
  twilio_message_sid text,
  media_count integer DEFAULT 0,
  raw_payload jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT whatsapp_messages_direction_check CHECK (direction IN ('inbound','outbound'))
);
CREATE INDEX idx_whatsapp_messages_client_created_at ON public.whatsapp_messages(client_id, created_at DESC);

-- =====================================================
-- Função utilitária: client_id do usuário logado pelo telefone do profile
-- =====================================================
CREATE OR REPLACE FUNCTION public.current_client_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id
  FROM public.clients c
  JOIN public.profiles p ON p.phone IS NOT NULL AND p.phone = c.phone_e164
  WHERE p.id = auth.uid()
  LIMIT 1
$$;

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- clients: usuário vê apenas o próprio registro (match por phone), admin vê tudo
CREATE POLICY "Users can view their own client record"
  ON public.clients FOR SELECT TO authenticated
  USING (
    id = public.current_client_id()
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage clients"
  ON public.clients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- meal_logs: usuário vê só as próprias refeições
CREATE POLICY "Users can view their own meal logs"
  ON public.meal_logs FOR SELECT TO authenticated
  USING (
    client_id = public.current_client_id()
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage meal logs"
  ON public.meal_logs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- daily_summary: usuário vê só os próprios totais
CREATE POLICY "Users can view their own daily summary"
  ON public.daily_summary FOR SELECT TO authenticated
  USING (
    client_id = public.current_client_id()
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage daily summary"
  ON public.daily_summary FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- whatsapp_messages: usuário vê só o próprio histórico
CREATE POLICY "Users can view their own whatsapp messages"
  ON public.whatsapp_messages FOR SELECT TO authenticated
  USING (
    client_id = public.current_client_id()
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage whatsapp messages"
  ON public.whatsapp_messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Observação: o Make grava usando service_role, que ignora RLS. Por isso não criamos policies de INSERT públicas.

-- =====================================================
-- Trigger: atualizar daily_summary automaticamente quando uma meal_log
-- vira "processed" (ou tem seus valores nutricionais alterados)
-- =====================================================
CREATE OR REPLACE FUNCTION public.recompute_daily_summary(_client_id uuid, _date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.daily_summary (client_id, summary_date, kcal_consumed, protein_consumed, carbs_consumed, updated_at)
  SELECT
    _client_id,
    _date,
    COALESCE(SUM(estimated_kcal), 0),
    COALESCE(SUM(estimated_protein), 0),
    COALESCE(SUM(estimated_carbs), 0),
    now()
  FROM public.meal_logs
  WHERE client_id = _client_id
    AND status = 'processed'
    AND (created_at AT TIME ZONE 'UTC')::date = _date
  ON CONFLICT (client_id, summary_date) DO UPDATE
    SET kcal_consumed = EXCLUDED.kcal_consumed,
        protein_consumed = EXCLUDED.protein_consumed,
        carbs_consumed = EXCLUDED.carbs_consumed,
        updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.meal_logs_after_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE TRIGGER trg_meal_logs_summary
AFTER INSERT OR UPDATE OR DELETE ON public.meal_logs
FOR EACH ROW EXECUTE FUNCTION public.meal_logs_after_change();

-- =====================================================
-- Realtime para refeições (UI atualiza quando Make muda pending->processed)
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_summary;
ALTER TABLE public.meal_logs REPLICA IDENTITY FULL;
ALTER TABLE public.daily_summary REPLICA IDENTITY FULL;