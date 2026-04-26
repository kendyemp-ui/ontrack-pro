// One-shot admin endpoint to create Pedro Tramontina account.
// One single login that works as B2C patient AND as Pro nutritionist (same as demo@ontrack.com).
// Safe to re-run: uses upsert / "if not exists" semantics.
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
  const log: string[] = [];

  try {
    // 1) Create or fetch the auth user
    const { data: list } = await sb.auth.admin.listUsers();
    let userId: string;
    const existing = list.users.find(
      (x) => x.email?.toLowerCase() === PEDRO.email.toLowerCase(),
    );
    if (existing) {
      userId = existing.id;
      log.push(`user exists: ${PEDRO.email} (${userId})`);
      // make sure password matches what was requested
      await sb.auth.admin.updateUserById(userId, {
        password: PEDRO.password,
        email_confirm: true,
        user_metadata: { full_name: PEDRO.full_name, phone: PEDRO.phone },
      });
    } else {
      const { data, error } = await sb.auth.admin.createUser({
        email: PEDRO.email,
        password: PEDRO.password,
        email_confirm: true,
        user_metadata: { full_name: PEDRO.full_name, phone: PEDRO.phone },
      });
      if (error) throw new Error(`createUser: ${error.message}`);
      userId = data.user!.id;
      log.push(`user created: ${PEDRO.email} (${userId})`);
    }

    // 2) Make sure profile has the right phone (trigger handles E.164)
    await sb
      .from("profiles")
      .upsert({ id: userId, full_name: PEDRO.full_name, phone: PEDRO.phone });
    log.push("profile upserted");

    // 3) Active subscription so B2C login works
    const { data: sub } = await sb
      .from("subscriptions")
      .select("id")
      .ilike("email", PEDRO.email)
      .maybeSingle();
    if (sub) {
      await sb
        .from("subscriptions")
        .update({ status: "active", plan: "demo", provider: "manual" })
        .eq("id", sub.id);
      log.push("subscription updated to active");
    } else {
      await sb.from("subscriptions").insert({
        email: PEDRO.email,
        status: "active",
        plan: "demo",
        provider: "manual",
      });
      log.push("subscription inserted (active)");
    }

    // 4) Pro role
    const { data: existingRole } = await sb
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "profissional")
      .maybeSingle();
    if (!existingRole) {
      await sb.from("user_roles").insert({ user_id: userId, role: "profissional" });
      log.push("role profissional assigned");
    } else {
      log.push("role profissional already present");
    }

    // 5) Make Pedro his own patient too — link the auto-created B2C client to himself as professional
    const { data: client } = await sb
      .from("clients")
      .select("id, professional_id")
      .eq("phone_e164", PEDRO.phone)
      .maybeSingle();

    if (client) {
      await sb
        .from("clients")
        .update({
          professional_id: userId,
          name: PEDRO.full_name,
          email: PEDRO.email,
        })
        .eq("id", client.id);
      log.push(`client ${client.id} linked as own patient`);
    } else {
      const { data: ins, error: insErr } = await sb
        .from("clients")
        .insert({
          name: PEDRO.full_name,
          phone_e164: PEDRO.phone,
          email: PEDRO.email,
          professional_id: userId,
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
