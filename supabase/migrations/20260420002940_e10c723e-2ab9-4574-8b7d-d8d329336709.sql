-- Substituir policy genérica por uma com validações
DROP POLICY IF EXISTS "Anyone can submit pro signup" ON public.pro_signups;

CREATE POLICY "Anyone can submit valid pro signup"
ON public.pro_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(full_name) BETWEEN 3 AND 120
  AND char_length(email) BETWEEN 5 AND 255
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND char_length(whatsapp) BETWEEN 8 AND 30
  AND char_length(crn) BETWEEN 4 AND 30
  AND char_length(document_path) BETWEEN 5 AND 500
  AND selected_plan IN ('teste','start','scale','pro')
  AND status = 'pending'
);

-- Reforçar policy de upload exigindo extensões válidas
DROP POLICY IF EXISTS "Anyone can upload pro signup documents" ON storage.objects;

CREATE POLICY "Anyone can upload valid pro signup documents"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'pro-documents'
  AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp','pdf')
);