// One-shot admin endpoint to create Pedro Tramontina B2C + Pro accounts.
// Safe to re-run: uses upserts / "if not exists" semantics.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PEDRO = {
  email: "pedrohtramontina@gmail.com",
  password: "nutri123",
  full_name: "Pedro Tramontina",
  phone: "+5543996937351",
};

const NUTRI = {
  email: "pedrohtramontina+nutri@gmail.com",
  password: "nutri123",
  full_name: "Dr. Pedro Tramontina",
  phone: "+5543996937351",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
  const log: string[] = [];

  async function ensureUser(u: { email: string; password: string; full_name: string; phone: string }) {
    const { data: list } = await sb.auth.admin.listUsers();
    const existing = list.users.find((x) => x.email?.toLowerCase() === u.email.toLowerCase());
    if (existing) {
      log.push(`user exists: ${u.email} (${existing.id})`);
      return existing.id;
    }
    const { data, error } = await sb.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, phone: u.phone },
    });
    if (error) throw new Error(`createUser ${u.email}: ${error.message}`);
    log.push(`user created: ${u.email} (${data.user!.id})`);
    return data.user!.id;
  }

  try {
    // 1) B2C user (paciente)
    const pedroId = await ensureUser(PEDRO);

    // Garante assinatura ativa (necessário para login B2C)
    await sb.from("subscriptions").upsert(
      { email: PEDRO.email, status: "active", plan: "demo", provider: "manual" },
      { onConflict: "email" },
    );
    log.push(`subscription active for ${PEDRO.email}`);

    // 2) Nutricionista (Pró)
    const nutriId = await ensureUser(NUTRI);

    // Role profissional
    await sb.from("user_roles").upsert(
      { user_id: nutriId, role: "profissional" },
      { onConflict: "user_id,role" },
    );
    log.push(`role profissional assigned to ${NUTRI.email}`);

    // 3) Vincula o Pedro como paciente do nutricionista Pedro
    // (o trigger profiles_sync_to_client já criou um client B2C; vamos garantir vínculo)
    const { data: client } = await sb
      .from("clients")
      .select("id, professional_id")
      .eq("phone_e164", PEDRO.phone)
      .maybeSingle();

    if (client) {
      if (client.professional_id !== nutriId) {
        await sb
          .from("clients")
          .update({ professional_id: nutriId, name: PEDRO.full_name, email: PEDRO.email })
          .eq("id", client.id);
        log.push(`client ${client.id} linked to nutri ${nutriId}`);
      } else {
        log.push(`client ${client.id} already linked`);
      }
    } else {
      const { data: ins, error: insErr } = await sb
        .from("clients")
        .insert({
          name: PEDRO.full_name,
          phone_e164: PEDRO.phone,
          email: PEDRO.email,
          professional_id: nutriId,
        })
        .select()
        .single();
      if (insErr) throw new Error(`client insert: ${insErr.message}`);
      log.push(`client created ${ins.id}`);
    }

    return new Response(JSON.stringify({ ok: true, log }, null, 2), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e), log }, null, 2), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
