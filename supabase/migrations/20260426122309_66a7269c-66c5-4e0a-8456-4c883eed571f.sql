-- Recria as funções com guarda: só sincroniza se os valores REALMENTE mudaram
CREATE OR REPLACE FUNCTION public.sync_client_goals_to_diet_goals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Skip se nada relevante mudou (evita loop)
  IF TG_OP = 'UPDATE' AND
     OLD.calories_target IS NOT DISTINCT FROM NEW.calories_target AND
     OLD.protein_target IS NOT DISTINCT FROM NEW.protein_target AND
     OLD.carbs_target IS NOT DISTINCT FROM NEW.carbs_target AND
     OLD.objective IS NOT DISTINCT FROM NEW.objective THEN
    RETURN NEW;
  END IF;

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
      updated_at = now()
    WHERE
      diet_goals.calories_target IS DISTINCT FROM EXCLUDED.calories_target OR
      diet_goals.protein_target IS DISTINCT FROM EXCLUDED.protein_target OR
      diet_goals.carbs_target IS DISTINCT FROM EXCLUDED.carbs_target OR
      diet_goals.objective IS DISTINCT FROM EXCLUDED.objective;
  END IF;

  RETURN NEW;
END;
$$;

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
  IF TG_OP = 'UPDATE' AND
     OLD.calories_target IS NOT DISTINCT FROM NEW.calories_target AND
     OLD.protein_target IS NOT DISTINCT FROM NEW.protein_target AND
     OLD.carbs_target IS NOT DISTINCT FROM NEW.carbs_target AND
     OLD.objective IS NOT DISTINCT FROM NEW.objective THEN
    RETURN NEW;
  END IF;

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
      updated_at = now()
    WHERE
      client_goals.calories_target IS DISTINCT FROM EXCLUDED.calories_target OR
      client_goals.protein_target IS DISTINCT FROM EXCLUDED.protein_target OR
      client_goals.carbs_target IS DISTINCT FROM EXCLUDED.carbs_target OR
      client_goals.objective IS DISTINCT FROM EXCLUDED.objective;
  END IF;

  RETURN NEW;
END;
$$;