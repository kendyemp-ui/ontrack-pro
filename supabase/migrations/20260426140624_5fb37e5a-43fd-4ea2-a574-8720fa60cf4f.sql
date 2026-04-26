-- Cria bucket para imagens de refeições se ainda não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-images', 'meal-images', false)
ON CONFLICT (id) DO NOTHING;

-- Nutricionistas podem ver imagens dos seus pacientes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Profissionais can view their clients meal images'
  ) THEN
    CREATE POLICY "Profissionais can view their clients meal images"
    ON storage.objects FOR SELECT TO authenticated
    USING (
      bucket_id = 'meal-images'
      AND EXISTS (
        SELECT 1 FROM public.clients c
        WHERE c.professional_id = auth.uid()
        AND name LIKE (c.id::text || '/%')
      )
    );
  END IF;
END $$;

-- Política de leitura de meal_logs para nutricionistas (se ainda não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'meal_logs'
    AND policyname = 'Profissionais can view their clients meal logs'
  ) THEN
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
  END IF;
END $$;

-- Política de leitura de activity_logs para nutricionistas (se ainda não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'activity_logs'
    AND policyname = 'Profissionais can view their clients activity logs'
  ) THEN
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
  END IF;
END $$;