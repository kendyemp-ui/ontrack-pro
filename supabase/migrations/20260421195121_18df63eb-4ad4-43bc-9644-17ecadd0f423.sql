
-- Add new fields to daily_summary
ALTER TABLE public.daily_summary
  ADD COLUMN IF NOT EXISTS fat_consumed numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS calorie_balance numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS meal_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS activity_count integer DEFAULT 0;

-- Replace recompute function to include new fields
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

  INSERT INTO public.daily_summary (
    client_id, summary_date, kcal_consumed, protein_consumed, carbs_consumed, fat_consumed,
    kcal_burned, calorie_balance, meal_count, activity_count, updated_at
  )
  VALUES (
    _client_id, _date, _kcal, _protein, _carbs, _fat,
    _burn, (_kcal - _burn), _meals, _activities, now()
  )
  ON CONFLICT (client_id, summary_date) DO UPDATE
    SET kcal_consumed = EXCLUDED.kcal_consumed,
        protein_consumed = EXCLUDED.protein_consumed,
        carbs_consumed = EXCLUDED.carbs_consumed,
        fat_consumed = EXCLUDED.fat_consumed,
        kcal_burned = EXCLUDED.kcal_burned,
        calorie_balance = EXCLUDED.calorie_balance,
        meal_count = EXCLUDED.meal_count,
        activity_count = EXCLUDED.activity_count,
        updated_at = now();
END;
$function$;
