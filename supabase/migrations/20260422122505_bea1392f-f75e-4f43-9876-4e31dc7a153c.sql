-- Adiciona coluna de TMB (Taxa Metabólica Basal) em clients para uso no resumo diário
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS basal_rate_kcal numeric NOT NULL DEFAULT 1750;

-- Adiciona coluna de gasto basal e gasto total no daily_summary
ALTER TABLE public.daily_summary
  ADD COLUMN IF NOT EXISTS basal_kcal numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_expenditure_kcal numeric NOT NULL DEFAULT 0;

-- Atualiza recompute_daily_summary para somar TMB no saldo calórico
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
    AND (created_at AT TIME ZONE 'UTC')::date = _date;

  SELECT
    COALESCE(SUM(estimated_burn_kcal), 0),
    COUNT(*)
  INTO _burn, _activities
  FROM public.activity_logs
  WHERE client_id = _client_id AND status = 'processed'
    AND (created_at AT TIME ZONE 'UTC')::date = _date;

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