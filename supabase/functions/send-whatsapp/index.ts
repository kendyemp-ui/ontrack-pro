// send-whatsapp — envia mensagem WhatsApp via Twilio para um paciente
// Chamado pela plataforma Pro (botão "Enviar lembrete")
// Body: { to_phone: string, message: string, client_id?: string }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const TWILIO_ACCOUNT_SID   = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN    = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_FROM_NUMBER   = Deno.env.get("TWILIO_FROM_NUMBER") || "+14155238886";
const SUPABASE_URL         = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    // Valida JWT (requer usuário autenticado — profissional)
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return json({ error: "Não autorizado" }, 401);

    const body = await req.json();
    const { to_phone, message, client_id } = body as {
      to_phone: string;
      message: string;
      client_id?: string;
    };

    if (!to_phone || !message) return json({ error: "to_phone e message são obrigatórios" }, 400);
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return json({ error: "Twilio não configurado" }, 500);

    // Normaliza número
    const digits = to_phone.replace(/\D/g, "");
    const toNumber = digits.startsWith("+") ? to_phone : `+${digits}`;

    // Envia via Twilio
    const basicAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const params = new URLSearchParams({
      To:   `whatsapp:${toNumber}`,
      From: `whatsapp:${TWILIO_FROM_NUMBER}`,
      Body: message,
    });

    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const twilioData = await twilioRes.json() as any;

    if (!twilioRes.ok) {
      console.error("Erro Twilio:", twilioData);
      return json({ error: twilioData?.message || "Erro ao enviar mensagem" }, 500);
    }

    // Grava na tabela de mensagens (se client_id informado)
    if (client_id) {
      await supabase.from("whatsapp_messages").insert({
        client_id,
        direction: "outbound",
        message_type: "text",
        text_body: message,
        twilio_message_sid: twilioData.sid,
      });
    }

    return json({ success: true, sid: twilioData.sid });
  } catch (err: any) {
    console.error("send-whatsapp error:", err);
    return json({ error: err.message || "Erro interno" }, 500);
  }
});
