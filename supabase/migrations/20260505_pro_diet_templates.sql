-- Templates de dieta personalizados do profissional
CREATE TABLE IF NOT EXISTS public.pro_diet_templates (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name           text NOT NULL,
  target_kcal    integer,
  objective      text DEFAULT 'maintain',
  meals_json     jsonb NOT NULL DEFAULT '[]',
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE public.pro_diet_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals manage their own templates"
  ON public.pro_diet_templates
  FOR ALL
  USING  (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);
