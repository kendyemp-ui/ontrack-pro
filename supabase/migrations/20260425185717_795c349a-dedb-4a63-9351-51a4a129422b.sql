
-- Tabela de bioimpedância persistente
CREATE TABLE public.bioimpedance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  basal_rate NUMERIC,
  weight NUMERIC,
  height NUMERIC,
  body_fat NUMERIC,
  muscle_mass NUMERIC,
  body_water NUMERIC,
  bone_mass NUMERIC,
  visceral_fat NUMERIC,
  metabolic_age NUMERIC,
  source TEXT DEFAULT 'manual',
  pdf_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bioimpedance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bioimpedance"
  ON public.bioimpedance FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bioimpedance"
  ON public.bioimpedance FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bioimpedance"
  ON public.bioimpedance FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bioimpedance"
  ON public.bioimpedance FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_bioimpedance_updated_at
BEFORE UPDATE ON public.bioimpedance
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bucket privado para PDFs de bioimpedância
INSERT INTO storage.buckets (id, name, public)
VALUES ('bioimpedance-pdfs', 'bioimpedance-pdfs', false);

CREATE POLICY "Users can view their own bio PDFs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'bioimpedance-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own bio PDFs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'bioimpedance-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own bio PDFs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'bioimpedance-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);
