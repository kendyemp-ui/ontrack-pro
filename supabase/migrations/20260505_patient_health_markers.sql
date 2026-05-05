-- ══════════════════════════════════════════════════════════════════════
-- 1. Tornar professional_id nullable em patient_documents
--    (paciente pode enviar exames sem um profissional associado)
-- ══════════════════════════════════════════════════════════════════════
ALTER TABLE public.patient_documents
  ALTER COLUMN professional_id DROP NOT NULL;

-- Políticas adicionais para o próprio paciente acessar seus documentos
CREATE POLICY "Patients read their own documents"
  ON public.patient_documents FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Patients insert their own documents"
  ON public.patient_documents FOR INSERT
  WITH CHECK (auth.uid() = client_id AND professional_id IS NULL);

CREATE POLICY "Patients delete their own documents"
  ON public.patient_documents FOR DELETE
  USING (auth.uid() = client_id AND professional_id IS NULL);

-- Profissional passa a ver também os documentos enviados pelo próprio paciente
-- (antes só via via professional_id = auth.uid())
DROP POLICY IF EXISTS "Professionals manage patient documents" ON public.patient_documents;

CREATE POLICY "Professionals manage patient documents"
  ON public.patient_documents FOR ALL
  USING  (auth.uid() = professional_id OR (
    professional_id IS NULL AND EXISTS (
      SELECT 1 FROM public.professional_notes pn
      WHERE pn.professional_id = auth.uid() AND pn.client_id = patient_documents.client_id
    )
  ))
  WITH CHECK (auth.uid() = professional_id);


-- ══════════════════════════════════════════════════════════════════════
-- 2. Tabela de marcadores laboratoriais extraídos de exames
-- ══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.patient_health_markers (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_id       uuid REFERENCES public.patient_documents(id) ON DELETE SET NULL,
  exam_date         date,
  -- Glicemia / diabetes
  glucose           numeric,   -- mg/dL  ref: 70–99
  hba1c             numeric,   -- %       ref: <5.7
  -- Lipídios
  ldl               numeric,   -- mg/dL  ref: <130
  hdl               numeric,   -- mg/dL  ref: >40H / >50F
  total_cholesterol numeric,   -- mg/dL  ref: <200
  triglycerides     numeric,   -- mg/dL  ref: <150
  -- Outros metabólicos
  uric_acid         numeric,   -- mg/dL  ref: 2.4–6.0F / 3.4–7.0H
  creatinine        numeric,   -- mg/dL  ref: 0.5–1.1F / 0.7–1.2H
  -- Tireoide
  tsh               numeric,   -- mUI/L  ref: 0.4–4.0
  t4                numeric,   -- ng/dL
  -- Hemograma
  hemoglobin        numeric,   -- g/dL   ref: 12–16F / 13.5–17.5H
  hematocrit        numeric,   -- %
  -- JSON livre com todos os marcadores encontrados
  raw_markers       jsonb DEFAULT '{}',
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE public.patient_health_markers ENABLE ROW LEVEL SECURITY;

-- Paciente lê seus próprios marcadores
CREATE POLICY "Patients read their own markers"
  ON public.patient_health_markers FOR SELECT
  USING (auth.uid() = client_id);

-- Profissional lê marcadores dos seus pacientes
CREATE POLICY "Professionals read patient health markers"
  ON public.patient_health_markers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.professional_notes pn
      WHERE pn.professional_id = auth.uid() AND pn.client_id = patient_health_markers.client_id
    )
    OR EXISTS (
      SELECT 1 FROM public.patient_documents pd
      WHERE pd.professional_id = auth.uid() AND pd.client_id = patient_health_markers.client_id
    )
  );

-- Edge function (service role) pode inserir/atualizar via bypass RLS
-- (service role bypassa RLS automaticamente — nenhuma policy necessária)
