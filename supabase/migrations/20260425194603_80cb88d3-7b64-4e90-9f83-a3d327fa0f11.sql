-- 1. diet_goals table
CREATE TABLE public.diet_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Minha Meta',
  calories_target NUMERIC NOT NULL DEFAULT 2000,
  protein_target NUMERIC NOT NULL DEFAULT 150,
  carbs_target NUMERIC NOT NULL DEFAULT 180,
  objective TEXT NOT NULL DEFAULT 'maintain',
  start_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.diet_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goal" ON public.diet_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goal" ON public.diet_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goal" ON public.diet_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goal" ON public.diet_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_diet_goals_updated_at
BEFORE UPDATE ON public.diet_goals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. profiles RLS fix
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- 5. subscriptions RLS fix
DROP POLICY IF EXISTS "Anyone can check own subscription by email" ON public.subscriptions;

CREATE POLICY "Admins can view subscriptions"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));