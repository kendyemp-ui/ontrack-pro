CREATE OR REPLACE FUNCTION public.recompute_daily_summary(_client_id uuid, _date date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _kcal numeric;
  _protein numeric;
  _carbs numeric;
  _fat numeric;
  _burn numeric;
  _meals integer;
  _activities integer;
  _basal numeric;
  _total_exp numeric;
BEGIN
  SELECT
    COALESCE(SUM(estimated_kcal), 0),
    COALESCE(SUM(estimated_protein), 0),
    COALESCE(SUM(estimated_carbs), 0),
    COALESCE(SUM(estimated_fat), 0),
    COUNT(*)
  INTO _kcal, _protein, _carbs, _fat, _meals
  FROM public.meal_logs
  WHERE client_id = _client_id AND status = 'processed'
    AND (created_at AT TIME ZONE 'America/Sao_Paulo')::date = _date;

  SELECT
    COALESCE(SUM(estimated_burn_kcal), 0),
    COUNT(*)
  INTO _burn, _activities
  FROM public.activity_logs
  WHERE client_id = _client_id AND status = 'processed'
    AND (created_at AT TIME ZONE 'America/Sao_Paulo')::date = _date;

  SELECT COALESCE(basal_rate_kcal, 1750) INTO _basal
  FROM public.clients WHERE id = _client_id;

  _total_exp := COALESCE(_basal, 0) + COALESCE(_burn, 0);

  INSERT INTO public.daily_summary (
    client_id, summary_date, kcal_consumed, protein_consumed, carbs_consumed, fat_consumed,
    kcal_burned, basal_kcal, total_expenditure_kcal, calorie_balance,
    meal_count, activity_count, updated_at
  )
  VALUES (
    _client_id, _date, _kcal, _protein, _carbs, _fat,
    _burn, _basal, _total_exp, (_kcal - _total_exp),
    _meals, _activities, now()
  )
  ON CONFLICT (client_id, summary_date) DO UPDATE
    SET kcal_consumed = EXCLUDED.kcal_consumed,
        protein_consumed = EXCLUDED.protein_consumed,
        carbs_consumed = EXCLUDED.carbs_consumed,
        fat_consumed = EXCLUDED.fat_consumed,
        kcal_burned = EXCLUDED.kcal_burned,
        basal_kcal = EXCLUDED.basal_kcal,
        total_expenditure_kcal = EXCLUDED.total_expenditure_kcal,
        calorie_balance = EXCLUDED.calorie_balance,
        meal_count = EXCLUDED.meal_count,
        activity_count = EXCLUDED.activity_count,
        updated_at = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.meal_logs_after_change()
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
    _date := (OLD.created_at AT TIME ZONE 'America/Sao_Paulo')::date;
  ELSE
    _client := NEW.client_id;
    _date := (NEW.created_at AT TIME ZONE 'America/Sao_Paulo')::date;
  END IF;

  IF _client IS NOT NULL AND _date IS NOT NULL THEN
    PERFORM public.recompute_daily_summary(_client, _date);
  END IF;

  RETURN NULL;
END;
$function$;

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
    _date := (OLD.created_at AT TIME ZONE 'America/Sao_Paulo')::date;
  ELSE
    _client := NEW.client_id;
    _date := (NEW.created_at AT TIME ZONE 'America/Sao_Paulo')::date;
  END IF;

  IF _client IS NOT NULL AND _date IS NOT NULL THEN
    PERFORM public.recompute_daily_summary(_client, _date);
  END IF;

  RETURN NULL;
END;
$function$;