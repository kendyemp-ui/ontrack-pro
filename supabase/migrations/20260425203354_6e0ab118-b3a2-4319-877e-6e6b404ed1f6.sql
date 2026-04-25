-- RLS: nutricionistas veem apenas seus próprios clients
CREATE POLICY "Profissionais can view their clients"
  ON public.clients FOR SELECT TO authenticated
  USING (
    id = public.current_client_id()
    OR public.has_role(auth.uid(), 'admin')
    OR professional_id = auth.uid()
  );

CREATE POLICY "Profissionais can insert clients"
  ON public.clients FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'profissional')
    OR public.has_role(auth.uid(), 'admin')
  );

-- RLS: nutricionistas veem meal_logs dos seus pacientes
CREATE POLICY "Profissionais can view their clients meal logs"
  ON public.meal_logs FOR SELECT TO authenticated
  USING (
    client_id = public.current_client_id()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = meal_logs.client_id AND c.professional_id = auth.uid()
    )
  );

-- RLS: nutricionistas veem daily_summary dos seus pacientes
CREATE POLICY "Profissionais can view their clients daily summary"
  ON public.daily_summary FOR SELECT TO authenticated
  USING (
    client_id = public.current_client_id()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = daily_summary.client_id AND c.professional_id = auth.uid()
    )
  );

-- RLS: nutricionistas veem activity_logs dos seus pacientes
CREATE POLICY "Profissionais can view their clients activity logs"
  ON public.activity_logs FOR SELECT TO authenticated
  USING (
    client_id = public.current_client_id()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = activity_logs.client_id AND c.professional_id = auth.uid()
    )
  );

-- Tabela de observações profissionais
CREATE TABLE IF NOT EXISTS public.professional_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_professional_notes_client ON public.professional_notes(client_id, created_at DESC);
ALTER TABLE public.professional_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profissionais can manage their own notes"
  ON public.professional_notes FOR ALL TO authenticated
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());

-- Tabela de metas por cliente
CREATE TABLE IF NOT EXISTS public.client_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calories_target NUMERIC DEFAULT 2000,
  protein_target NUMERIC DEFAULT 150,
  carbs_target NUMERIC DEFAULT 200,
  objective TEXT DEFAULT 'maintain',
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.client_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profissionais can manage their client goals"
  ON public.client_goals FOR ALL TO authenticated
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());