-- Enum para status do cadastro
CREATE TYPE public.pro_signup_status AS ENUM ('pending', 'approved', 'rejected');

-- Tabela de cadastros do OnTrack Pro (nutricionistas)
CREATE TABLE public.pro_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  crn TEXT NOT NULL,
  document_path TEXT NOT NULL,
  selected_plan TEXT NOT NULL DEFAULT 'teste',
  status public.pro_signup_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_pro_signups_status ON public.pro_signups(status);
CREATE INDEX idx_pro_signups_email ON public.pro_signups(email);

ALTER TABLE public.pro_signups ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa (anônima) pode criar um cadastro pendente
CREATE POLICY "Anyone can submit pro signup"
ON public.pro_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Apenas admins podem ler/atualizar/deletar
CREATE POLICY "Admins can view all pro signups"
ON public.pro_signups
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pro signups"
ON public.pro_signups
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pro signups"
ON public.pro_signups
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_pro_signups_updated_at
BEFORE UPDATE ON public.pro_signups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Bucket privado para documentos dos nutris
INSERT INTO storage.buckets (id, name, public)
VALUES ('pro-documents', 'pro-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policies do bucket: qualquer pessoa pode fazer upload (cadastro público),
-- mas só admins podem ver/baixar/deletar.
CREATE POLICY "Anyone can upload pro signup documents"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'pro-documents');

CREATE POLICY "Admins can read pro signup documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'pro-documents' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pro signup documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'pro-documents' AND public.has_role(auth.uid(), 'admin'));