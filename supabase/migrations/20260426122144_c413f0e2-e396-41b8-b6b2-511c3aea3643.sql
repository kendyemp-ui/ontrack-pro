-- Sincroniza client_goals -> diet_goals (Pro atualiza, paciente recebe)
CREATE OR REPLACE FUNCTION public.sync_client_goals_to_diet_goals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  SELECT p.id INTO _user_id
  FROM public.profiles p
  JOIN public.clients c ON c.phone_e164 = p.phone
  WHERE c.id = NEW.client_id
  LIMIT 1;

  IF _user_id IS NOT NULL THEN
    INSERT INTO public.diet_goals (
      user_id, name, calories_target, protein_target, carbs_target, objective
    ) VALUES (
      _user_id,
      'Plano do nutricionista',
      COALESCE(NEW.calories_target, 2000),
      COALESCE(NEW.protein_target, 150),
      COALESCE(NEW.carbs_target, 200),
      COALESCE(NEW.objective, 'maintain')
    )
    ON CONFLICT (user_id) DO UPDATE SET
      calories_target = EXCLUDED.calories_target,
      protein_target = EXCLUDED.protein_target,
      carbs_target = EXCLUDED.carbs_target,
      objective = EXCLUDED.objective,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_client_goals_to_diet_goals ON public.client_goals;
CREATE TRIGGER trg_sync_client_goals_to_diet_goals
AFTER INSERT OR UPDATE ON public.client_goals
FOR EACH ROW EXECUTE FUNCTION public.sync_client_goals_to_diet_goals();

-- Sincroniza diet_goals -> client_goals (paciente atualiza, nutricionista recebe)
CREATE OR REPLACE FUNCTION public.sync_diet_goals_to_client_goals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _client_id uuid;
  _professional_id uuid;
BEGIN
  SELECT c.id, c.professional_id INTO _client_id, _professional_id
  FROM public.clients c
  JOIN public.profiles p ON p.phone = c.phone_e164
  WHERE p.id = NEW.user_id
    AND c.professional_id IS NOT NULL
  LIMIT 1;

  IF _client_id IS NOT NULL AND _professional_id IS NOT NULL THEN
    INSERT INTO public.client_goals (
      client_id, professional_id, calories_target, protein_target, carbs_target, objective
    ) VALUES (
      _client_id, _professional_id,
      NEW.calories_target, NEW.protein_target, NEW.carbs_target, NEW.objective
    )
    ON CONFLICT (client_id) DO UPDATE SET
      calories_target = EXCLUDED.calories_target,
      protein_target = EXCLUDED.protein_target,
      carbs_target = EXCLUDED.carbs_target,
      objective = EXCLUDED.objective,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

-- Garante constraint UNIQUE em client_goals.client_id para o ON CONFLICT funcionar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_goals_client_id_unique'
  ) THEN
    ALTER TABLE public.client_goals
      ADD CONSTRAINT client_goals_client_id_unique UNIQUE (client_id);
  END IF;
END$$;

DROP TRIGGER IF EXISTS trg_sync_diet_goals_to_client_goals ON public.diet_goals;
CREATE TRIGGER trg_sync_diet_goals_to_client_goals
AFTER INSERT OR UPDATE ON public.diet_goals
FOR EACH ROW EXECUTE FUNCTION public.sync_diet_goals_to_client_goals();