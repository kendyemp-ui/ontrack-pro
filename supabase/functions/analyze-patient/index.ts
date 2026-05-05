// Analisa padrões do paciente usando IA e retorna insights estruturados
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL    = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not set" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseAuth = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { client_id } = await req.json();
    if (!client_id) {
      return new Response(JSON.stringify({ error: "client_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Fetch last 60 days of daily_summary ──────────────────────────────────
    const today = new Date().toISOString().split("T")[0];
    const start = new Date();
    start.setDate(start.getDate() - 59);
    const startDate = start.toISOString().split("T")[0];

    const { data: summaries } = await admin
      .from("daily_summary")
      .select("summary_date,kcal_consumed,kcal_burned,basal_kcal,total_expenditure_kcal,calorie_balance,protein_consumed,carbs_consumed,fat_consumed,meal_count")
      .eq("client_id", client_id)
      .gte("summary_date", startDate)
      .lte("summary_date", today)
      .order("summary_date");

    // ── Fetch recent meal logs (last 30 days) ─────────────────────────────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    const { data: meals } = await admin
      .from("meal_logs")
      .select("created_at,original_text,estimated_kcal,estimated_protein,estimated_carbs,estimated_fat")
      .eq("client_id", client_id)
      .eq("status", "processed")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(80);

    // ── Fetch client goals ────────────────────────────────────────────────────
    const { data: goals } = await admin
      .from("client_goals")
      .select("calories_target,protein_target,carbs_target,objective")
      .eq("client_id", client_id)
      .maybeSingle();

    // ── Build data summary for AI ─────────────────────────────────────────────
    const days = summaries || [];
    const activeDays = days.filter((d: any) => d.meal_count > 0);
    const avgKcal = activeDays.length
      ? Math.round(activeDays.reduce((s: number, d: any) => s + d.kcal_consumed, 0) / activeDays.length)
      : 0;
    const avgBalance = activeDays.length
      ? Math.round(activeDays.reduce((s: number, d: any) => s + d.calorie_balance, 0) / activeDays.length)
      : 0;
    const deficitDays = activeDays.filter((d: any) => d.calorie_balance < -500);
    const surplusDays = activeDays.filter((d: any) => d.calorie_balance > 500);

    // Day-of-week adherence
    const byWeekday: Record<number, number[]> = {};
    days.forEach((d: any) => {
      const wd = new Date(d.summary_date + "T12:00:00").getDay();
      if (!byWeekday[wd]) byWeekday[wd] = [];
      byWeekday[wd].push(d.meal_count);
    });
    const weekdayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const weekdayAdherence = Object.entries(byWeekday).map(([wd, counts]) => ({
      day: weekdayNames[Number(wd)],
      avg_meals: (counts.reduce((s, c) => s + c, 0) / counts.length).toFixed(1),
    }));

    // Most common foods (last 30 days)
    const mealTexts = (meals || []).slice(0, 40).map((m: any) => m.original_text).filter(Boolean);

    const prompt = `Você é um nutricionista especialista em análise de dados.
Analise os dados abaixo de um paciente e gere insights clínicos valiosos.

OBJETIVO DO PACIENTE: ${goals?.objective === "lose" ? "Perda de gordura" : goals?.objective === "gain" ? "Ganho de massa" : "Manutenção"}
META CALÓRICA: ${goals?.calories_target ?? "não definida"} kcal/dia
META PROTEÍNA: ${goals?.protein_target ?? "não definida"}g/dia
META CARB: ${goals?.carbs_target ?? "não definida"}g/dia

RESUMO DOS ÚLTIMOS 60 DIAS:
- Dias com registro: ${activeDays.length} de ${days.length}
- Média calórica diária: ${avgKcal} kcal
- Saldo médio diário: ${avgBalance} kcal (${avgBalance < 0 ? "déficit" : "superávit"})
- Dias com déficit > 500 kcal: ${deficitDays.length}
- Dias com superávit > 500 kcal: ${surplusDays.length}

ADESÃO POR DIA DA SEMANA:
${weekdayAdherence.map(w => `- ${w.day}: ${w.avg_meals} refeições em média`).join("\n")}

DIAS DE DÉFICIT EXTREMO (>500 kcal):
${deficitDays.slice(0, 5).map((d: any) => `- ${d.summary_date}: ${Math.round(d.calorie_balance)} kcal`).join("\n") || "Nenhum"}

DIAS DE SUPERÁVIT EXTREMO (>500 kcal):
${surplusDays.slice(0, 5).map((d: any) => `- ${d.summary_date}: ${Math.round(d.calorie_balance)} kcal`).join("\n") || "Nenhum"}

REFEIÇÕES RECENTES (amostra):
${mealTexts.slice(0, 20).join("\n")}

Retorne SOMENTE um JSON com esta estrutura exata:
{
  "summary": "string: avaliação geral em 2-3 frases",
  "adherence_score": número de 0 a 10,
  "patterns": [
    { "icon": "emoji", "title": "string curto", "description": "string explicando o padrão" }
  ],
  "critical_days": [
    { "type": "deficit|surplus", "insight": "string: o que provavelmente causou e impacto" }
  ],
  "positive_highlights": ["string", "string"],
  "recommendations": [
    { "priority": "high|medium|low", "text": "string: recomendação acionável" }
  ]
}
Retorne apenas o JSON, sem markdown, sem explicação.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 1500,
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      return new Response(JSON.stringify({ error: "AI error: " + errText }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const rawContent = aiData.choices?.[0]?.message?.content ?? "{}";

    // Clean possible markdown code block
    const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let insights;
    try {
      insights = JSON.parse(cleaned);
    } catch {
      insights = { summary: rawContent, patterns: [], recommendations: [], positive_highlights: [], critical_days: [] };
    }

    return new Response(JSON.stringify({ ok: true, insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
