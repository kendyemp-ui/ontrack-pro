// Daily report — agrega refeições + atividades do dia e envia resumo no WhatsApp
// Pode ser disparado:
//   - via cron (sem body)            -> envia para todos os clientes com registros no dia
//   - manualmente: { client_id }     -> envia para um cliente específico
//   - manualmente: { phone }         -> envia para o cliente do telefone
//   - manualmente: { dry_run: true } -> apenas retorna a mensagem, sem enviar

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Twilio WhatsApp sandbox sender (override via env if needed)
const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM") || "+14155238886";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function todayInTZ(tz = "America/Sao_Paulo"): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date()); // YYYY-MM-DD
}

interface Totals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  burn: number;
  basal: number;
  total_expenditure: number;
  meal_count: number;
  activity_count: number;
}

async function aggregateForClient(clientId: string, date: string, basalRate: number): Promise<Totals> {
  const start = `${date}T00:00:00.000Z`;
  const end = `${date}T23:59:59.999Z`;

  const { data: meals } = await supabase
    .from("meal_logs")
    .select("estimated_kcal,estimated_protein,estimated_carbs,estimated_fat,status")
    .eq("client_id", clientId)
    .eq("status", "processed")
    .gte("created_at", start)
    .lte("created_at", end);

  const { data: acts } = await supabase
    .from("activity_logs")
    .select("estimated_burn_kcal,status")
    .eq("client_id", clientId)
    .eq("status", "processed")
    .gte("created_at", start)
    .lte("created_at", end);

  const totals: Totals = {
    kcal: 0, protein: 0, carbs: 0, fat: 0, burn: 0,
    basal: basalRate,
    total_expenditure: 0,
    meal_count: meals?.length ?? 0,
    activity_count: acts?.length ?? 0,
  };
  for (const m of meals ?? []) {
    totals.kcal += Number(m.estimated_kcal ?? 0);
    totals.protein += Number(m.estimated_protein ?? 0);
    totals.carbs += Number(m.estimated_carbs ?? 0);
    totals.fat += Number(m.estimated_fat ?? 0);
  }
  for (const a of acts ?? []) {
    totals.burn += Number(a.estimated_burn_kcal ?? 0);
  }
  totals.total_expenditure = totals.basal + totals.burn;
  return totals;
}

function formatMessage(t: Totals): string {
  if (t.meal_count === 0 && t.activity_count === 0) {
    return `📊 *Resumo do seu dia*\n\nHoje ainda não encontramos registros suficientes de refeições ou atividades para gerar seu resumo diário.`;
  }

  const lines: string[] = [];
  lines.push(`📊 *Resumo do seu dia*`);
  lines.push(``);

  if (t.meal_count > 0) {
    lines.push(`🍽️ *Consumo alimentar*`);
    lines.push(`• 🔥 Calorias: ${Math.round(t.kcal)} kcal`);
    lines.push(`• 💪 Proteínas: ${t.protein.toFixed(1)} g`);
    lines.push(`• 🍚 Carboidratos: ${t.carbs.toFixed(1)} g`);
    lines.push(`• 🥑 Gorduras: ${t.fat.toFixed(1)} g`);
  } else {
    lines.push(`🍽️ *Consumo alimentar*`);
    lines.push(`• Nenhuma refeição registrada hoje.`);
  }

  lines.push(``);

  lines.push(`🏃 *Gasto calórico*`);
  lines.push(`• 🛌 Gasto basal (TMB): ${Math.round(t.basal)} kcal`);
  if (t.activity_count > 0) {
    lines.push(`• 🏋️ Atividade física: ${Math.round(t.burn)} kcal`);
  } else {
    lines.push(`• 🏋️ Atividade física: 0 kcal (nenhuma atividade registrada)`);
  }
  lines.push(`• ⚡ Total gasto: ${Math.round(t.total_expenditure)} kcal`);

  lines.push(``);
  const balance = Math.round(t.kcal - t.total_expenditure);
  const balanceLabel = balance >= 0 ? 'superávit' : 'déficit';
  lines.push(`📉 *Saldo do dia*`);
  lines.push(`• ${balance > 0 ? '+' : ''}${balance} kcal (${balanceLabel})`);
  lines.push(``);
  lines.push(`📌 Cálculo: consumido − (TMB + atividades).`);
  return lines.join("\n");
}

async function sendWhatsApp(toPhone: string, body: string): Promise<{ ok: boolean; error?: string }> {
  if (!TWILIO_ACCOUNT_SID) return { ok: false, error: "TWILIO_ACCOUNT_SID not configured" };
  const basicAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const params = new URLSearchParams({
    To: `whatsapp:${toPhone}`,
    From: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
    Body: body,
  });
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    return { ok: false, error: `${resp.status} ${txt}` };
  }
  return { ok: true };
}

async function processClient(client: { id: string; phone_e164: string; name: string; basal_rate_kcal?: number | null }, date: string, dryRun: boolean) {
  const basal = Number(client.basal_rate_kcal ?? 1750);
  const totals = await aggregateForClient(client.id, date, basal);
  const message = formatMessage(totals);

  // Upsert daily_summary so dashboard reflete
  await supabase.from("daily_summary").upsert({
    client_id: client.id,
    summary_date: date,
    kcal_consumed: totals.kcal,
    protein_consumed: totals.protein,
    carbs_consumed: totals.carbs,
    fat_consumed: totals.fat,
    kcal_burned: totals.burn,
    basal_kcal: totals.basal,
    total_expenditure_kcal: totals.total_expenditure,
    calorie_balance: totals.kcal - totals.total_expenditure,
    meal_count: totals.meal_count,
    activity_count: totals.activity_count,
    updated_at: new Date().toISOString(),
  }, { onConflict: "client_id,summary_date" });

  if (dryRun) return { client_id: client.id, name: client.name, totals, message, sent: false };

  const send = await sendWhatsApp(client.phone_e164, message);
  if (send.ok) {
    await supabase.from("whatsapp_messages").insert({
      client_id: client.id,
      direction: "outbound",
      message_type: "text",
      text_body: message,
    });
  }
  return { client_id: client.id, name: client.name, totals, sent: send.ok, error: send.error };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let body: any = {};
    if (req.method === "POST") {
      try { body = await req.json(); } catch { body = {}; }
    }
    const date: string = body.date || todayInTZ();
    const dryRun: boolean = body.dry_run === true;

    let clients: { id: string; phone_e164: string; name: string; basal_rate_kcal: number | null }[] = [];
    const SELECT_COLS = "id,phone_e164,name,basal_rate_kcal";

    if (body.client_id) {
      const { data } = await supabase
        .from("clients").select(SELECT_COLS).eq("id", body.client_id).limit(1);
      clients = (data as any) ?? [];
    } else if (body.phone) {
      const { data } = await supabase
        .from("clients").select(SELECT_COLS).eq("phone_e164", body.phone).limit(1);
      clients = (data as any) ?? [];
    } else {
      // Cron mode: pega todos os clientes que tiveram pelo menos 1 registro no dia
      const start = `${date}T00:00:00.000Z`;
      const end = `${date}T23:59:59.999Z`;
      const [{ data: m }, { data: a }] = await Promise.all([
        supabase.from("meal_logs").select("client_id").eq("status", "processed").gte("created_at", start).lte("created_at", end),
        supabase.from("activity_logs").select("client_id").eq("status", "processed").gte("created_at", start).lte("created_at", end),
      ]);
      const ids = new Set<string>();
      for (const r of m ?? []) if (r.client_id) ids.add(r.client_id);
      for (const r of a ?? []) if (r.client_id) ids.add(r.client_id);
      if (ids.size > 0) {
        const { data } = await supabase
          .from("clients").select(SELECT_COLS).in("id", [...ids]);
        clients = (data as any) ?? [];
      }
    }

    const results = [];
    for (const c of clients) {
      results.push(await processClient(c, date, dryRun));
    }

    return new Response(JSON.stringify({ date, dry_run: dryRun, count: results.length, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
