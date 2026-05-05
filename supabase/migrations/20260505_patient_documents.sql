-- Documentos clínicos do paciente (exames, bioimpedâncias, prescrições)
CREATE TABLE IF NOT EXISTS public.patient_documents (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            text NOT NULL,
  doc_type        text NOT NULL DEFAULT 'other',
  -- 'blood_test' | 'bioimpedance' | 'prescription' | 'report' | 'other'
  file_path       text NOT NULL,
  file_size       bigint,
  mime_type       text,
  notes           text,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals manage patient documents"
  ON public.patient_documents
  FOR ALL
  USING  (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

-- Storage bucket for patient documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patient-documents',
  'patient-documents',
  false,
  52428800, -- 50 MB
  ARRAY['application/pdf','image/jpeg','image/png','image/webp','image/heic']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS: professional can read/write files inside their own folder
CREATE POLICY "Professionals manage their patient files"
  ON storage.objects
  FOR ALL
  USING  (bucket_id = 'patient-documents' AND auth.uid()::text = (string_to_array(name, '/'))[1])
  WITH CHECK (bucket_id = 'patient-documents' AND auth.uid()::text = (string_to_array(name, '/'))[1]);
