-- Tabela principal do plano alimentar
CREATE TABLE IF NOT EXISTS public.diet_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Meu Plano Alimentar',
  objective TEXT DEFAULT 'maintain',
  total_kcal NUMERIC DEFAULT 0,
  total_protein NUMERIC DEFAULT 0,
  total_carbs NUMERIC DEFAULT 0,
  total_fat NUMERIC DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_diet_plans_client ON public.diet_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_user ON public.diet_plans(user_id);

CREATE TABLE IF NOT EXISTS public.diet_plan_meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.diet_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  meal_order INTEGER DEFAULT 0,
  time_suggestion TEXT,
  target_kcal NUMERIC DEFAULT 0,
  target_protein NUMERIC DEFAULT 0,
  target_carbs NUMERIC DEFAULT 0,
  target_fat NUMERIC DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_diet_plan_meals_plan ON public.diet_plan_meals(plan_id, meal_order);

CREATE TABLE IF NOT EXISTS public.diet_plan_foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id UUID NOT NULL REFERENCES public.diet_plan_meals(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  quantity NUMERIC DEFAULT 100,
  unit TEXT DEFAULT 'g',
  kcal NUMERIC DEFAULT 0,
  protein NUMERIC DEFAULT 0,
  carbs NUMERIC DEFAULT 0,
  fat NUMERIC DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_diet_plan_foods_meal ON public.diet_plan_foods(meal_id);

CREATE TRIGGER diet_plans_updated_at
BEFORE UPDATE ON public.diet_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plan_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plan_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profissionais can manage their diet plans"
ON public.diet_plans FOR ALL TO authenticated
USING (professional_id = auth.uid())
WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Patients can view their diet plan"
ON public.diet_plans FOR SELECT TO authenticated
USING (client_id = public.current_client_id());

CREATE POLICY "B2C users can manage their own diet plan"
ON public.diet_plans FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Access diet_plan_meals via plan"
ON public.diet_plan_meals FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.diet_plans dp WHERE dp.id = plan_id
    AND (dp.professional_id = auth.uid() OR dp.user_id = auth.uid() OR dp.client_id = public.current_client_id())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.diet_plans dp WHERE dp.id = plan_id
    AND (dp.professional_id = auth.uid() OR dp.user_id = auth.uid())
  )
);

CREATE POLICY "Access diet_plan_foods via meal"
ON public.diet_plan_foods FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.diet_plan_meals m
    JOIN public.diet_plans dp ON dp.id = m.plan_id
    WHERE m.id = meal_id
    AND (dp.professional_id = auth.uid() OR dp.user_id = auth.uid() OR dp.client_id = public.current_client_id())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.diet_plan_meals m
    JOIN public.diet_plans dp ON dp.id = m.plan_id
    WHERE m.id = meal_id
    AND (dp.professional_id = auth.uid() OR dp.user_id = auth.uid())
  )
);