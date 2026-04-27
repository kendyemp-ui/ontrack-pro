// One-shot admin endpoint to create Caio's B2C account, linked to nutri.demo@ontrack.com.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CAIO = {
  email: "rissocaio@gmail.com",
  password: "123456",
  full_name: "Caio",
  phone: "+5543991285510",
};

// Nutricionista demo (Dra. Helena Vieira) — will own this patient
const NUTRI_DEMO_ID = "9f5c24a2-d639-49ba-b77f-fa5030eeda5e";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
  const log: string[] = [];

  try {
    // 1) Create or fetch the auth user
    const { data: list } = await sb.auth.admin.listUsers();
    let userId: string;
    const existing = list.users.find(
      (x) => x.email?.toLowerCase() === CAIO.email.toLowerCase(),
    );
    if (existing) {
      userId = existing.id;
      log.push(`user exists: ${CAIO.email} (${userId})`);
      await sb.auth.admin.updateUserById(userId, {
        password: CAIO.password,
        email_confirm: true,
        user_metadata: { full_name: CAIO.full_name, phone: CAIO.phone },
      });
    } else {
      const { data, error } = await sb.auth.admin.createUser({
        email: CAIO.email,
        password: CAIO.password,
        email_confirm: true,
        user_metadata: { full_name: CAIO.full_name, phone: CAIO.phone },
      });
      if (error) throw new Error(`createUser: ${error.message}`);
      userId = data.user!.id;
      log.push(`user created: ${CAIO.email} (${userId})`);
    }

    // 2) Profile (trigger handles e164 + auto-creates client)
    await sb
      .from("profiles")
      .upsert({ id: userId, full_name: CAIO.full_name, phone: CAIO.phone });
    log.push("profile upserted");

    // 3) Active subscription (B2C)
    const { data: sub } = await sb
      .from("subscriptions")
      .select("id")
      .ilike("email", CAIO.email)
      .maybeSingle();
    if (sub) {
      await sb
        .from("subscriptions")
        .update({ status: "active", plan: "b2c", provider: "manual" })
        .eq("id", sub.id);
      log.push("subscription updated to active");
    } else {
      await sb.from("subscriptions").insert({
        email: CAIO.email,
        status: "active",
        plan: "b2c",
        provider: "manual",
      });
      log.push("subscription inserted (active)");
    }

    // 4) Link the B2C client to nutri demo as professional
    const { data: client } = await sb
      .from("clients")
      .select("id, professional_id")
      .eq("phone_e164", CAIO.phone)
      .maybeSingle();

    if (client) {
      await sb
        .from("clients")
        .update({
          professional_id: NUTRI_DEMO_ID,
          name: CAIO.full_name,
          email: CAIO.email,
        })
        .eq("id", client.id);
      log.push(`client ${client.id} linked to nutri demo`);
    } else {
      const { data: ins, error: insErr } = await sb
        .from("clients")
        .insert({
          name: CAIO.full_name,
          phone_e164: CAIO.phone,
          email: CAIO.email,
          professional_id: NUTRI_DEMO_ID,
        })
        .select()
        .single();
      if (insErr) throw new Error(`client insert: ${insErr.message}`);
      log.push(`client created ${ins.id}`);
    }

    return new Response(JSON.stringify({ ok: true, userId, log }, null, 2), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e), log }, null, 2), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
