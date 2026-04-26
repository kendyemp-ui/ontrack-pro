
-- 1) Função utilitária para normalizar phone para E.164 (Brasil)
CREATE OR REPLACE FUNCTION public.normalize_phone_e164(_phone text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  digits text;
BEGIN
  IF _phone IS NULL OR length(trim(_phone)) = 0 THEN
    RETURN NULL;
  END IF;
  digits := regexp_replace(_phone, '\D', '', 'g');
  IF length(digits) = 0 THEN
    RETURN NULL;
  END IF;
  -- Se já começa com 55 (Brasil) e tem 12+ dígitos, OK
  IF left(digits, 2) = '55' AND length(digits) >= 12 THEN
    RETURN '+' || digits;
  END IF;
  -- Se tem 10 ou 11 dígitos (DDD + número), assume Brasil
  IF length(digits) IN (10, 11) THEN
    RETURN '+55' || digits;
  END IF;
  -- Caso genérico: prefixa com +
  RETURN '+' || digits;
END;
$$;

-- 2) Atualiza handle_new_user para normalizar o phone ao criar profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _phone_raw text;
  _phone_norm text;
  _full_name text;
BEGIN
  _phone_raw := COALESCE(NEW.raw_user_meta_data ->> 'phone', '');
  _phone_norm := public.normalize_phone_e164(_phone_raw);
  _full_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '');

  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, _full_name, _phone_norm);

  RETURN NEW;
END;
$$;

-- 3) Trigger no profiles: ao inserir/atualizar profile com phone,
--    se NÃO existir client com esse phone_e164, criar um client B2C puro (sem professional_id).
--    Se já existir, não faz nada (vínculo é via phone, current_client_id() resolve sozinho).
CREATE OR REPLACE FUNCTION public.sync_profile_to_client()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _phone_norm text;
  _existing_client_id uuid;
BEGIN
  _phone_norm := public.normalize_phone_e164(NEW.phone);
  IF _phone_norm IS NULL THEN
    RETURN NEW;
  END IF;

  -- Garante phone normalizado no profile
  IF NEW.phone IS DISTINCT FROM _phone_norm THEN
    NEW.phone := _phone_norm;
  END IF;

  SELECT id INTO _existing_client_id
  FROM public.clients
  WHERE phone_e164 = _phone_norm
  LIMIT 1;

  IF _existing_client_id IS NULL THEN
    INSERT INTO public.clients (name, phone_e164, professional_id)
    VALUES (
      COALESCE(NULLIF(NEW.full_name, ''), 'Usuário'),
      _phone_norm,
      NULL  -- B2C puro: pode ser vinculado a um nutri no futuro
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sync_to_client ON public.profiles;
CREATE TRIGGER profiles_sync_to_client
BEFORE INSERT OR UPDATE OF phone, full_name ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_to_client();

-- 4) Trigger no clients: ao inserir/atualizar client (geralmente pelo nutri),
--    normaliza phone_e164. Se já existe um client com mesmo phone, é o mesmo registro
--    (evitar duplicidade fica como responsabilidade do app — addPatient deve checar).
CREATE OR REPLACE FUNCTION public.normalize_client_phone()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.phone_e164 := public.normalize_phone_e164(NEW.phone_e164);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS clients_normalize_phone ON public.clients;
CREATE TRIGGER clients_normalize_phone
BEFORE INSERT OR UPDATE OF phone_e164 ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.normalize_client_phone();

-- 5) Limpeza: normaliza phones existentes em profiles e clients
UPDATE public.profiles
SET phone = public.normalize_phone_e164(phone)
WHERE phone IS NOT NULL AND phone <> public.normalize_phone_e164(phone);

UPDATE public.clients
SET phone_e164 = public.normalize_phone_e164(phone_e164)
WHERE phone_e164 IS NOT NULL AND phone_e164 <> public.normalize_phone_e164(phone_e164);
