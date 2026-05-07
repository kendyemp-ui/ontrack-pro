// process-meal — registra refeição ou atividade enviada diretamente pelo app
// Body: { client_id: string, type: "meal"|"activity", text: string, image_base64?: string }
// Para atividade: { client_id, type:"activity", activity_type, duration_min }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const OPENAI_API_KEY       = Deno.env.get("OPENAI_API_KEY")!;
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

// ── Prompts e tools (mesma IA do whatsapp-webhook) ───────────────────────────
const MEAL_PROMPT = `Você é a IA nutricional do app Grove.
Estime calorias, proteínas, carboidratos e gorduras com base em TBCA-USP > TACO > USDA, considerando preparo brasileiro.
Use porções padrão quando a quantidade não for informada (arroz cozido 120g, feijão 100g, frango grelhado 120g, ovo 50g, pão francês 50g).
SEMPRE preencha meal_description com uma descrição curta dos alimentos (máx 120 chars).
SEMPRE chame a tool estimate_macros com o total final.`;

const MACRO_TOOL = {
  type: "function" as const,
  function: {
    name: "estimate_macros",
    description: "Retorna estimativa nutricional total e descrição curta da refeição.",
    parameters: {
      type: "object",
      properties: {
        meal_description:  { type: "string" },
        estimated_kcal:    { type: "number" },
        estimated_protein: { type: "number" },
        estimated_carbs:   { type: "number" },
        estimated_fat:     { type: "number" },
      },
      required: ["meal_description","estimated_kcal","estimated_protein","estimated_carbs","estimated_fat"],
      additionalProperties: false,
    },
  },
};

const ACTIVITY_PROMPT = `Você é a IA de atividade física do app Grove.
Interprete a atividade descrita em texto e estime o gasto calórico.
Estimativas (kcal por minuto, adulto ~70kg):
- caminhada: 5 | corrida: 11 | ciclismo: 8 | musculação: 7 | natação: 9 | yoga: 3 | HIIT/crossfit: 12
SEMPRE chame a tool estimate_activity com os campos preenchidos.`;

const ACTIVITY_TOOL = {
  type: "function" as const,
  function: {
    name: "estimate_activity",
    description: "Retorna registro estimado da atividade física.",
    parameters: {
      type: "object",
      properties: {
        activity_type:        { type: "string" },
        activity_duration:    { type: ["string","null"] },
        estimated_burn_kcal:  { type: "number" },
      },
      required: ["activity_type","estimated_burn_kcal"],
      additionalProperties: false,
    },
  },
};

async function callAITool(messages: any[], tool: any, toolName: string): Promise<any> {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      tools: [tool],
      tool_choice: { type: "function", function: { name: toolName } },
    }),
  });
  if (!resp.ok) throw new Error(`OpenAI error ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("OpenAI não retornou tool_call");
  return JSON.parse(toolCall.function.arguments);
}

// ── Handler principal ─────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    // Valida JWT do usuário
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return json({ error: "Não autorizado" }, 401);

    const body = await req.json();
    const { client_id, type = "meal", text, image_base64 } = body as {
      client_id: string;
      type?: "meal" | "activity";
      text: string;
      image_base64?: string;
    };

    if (!client_id) return json({ error: "client_id é obrigatório" }, 400);
    if (!text?.trim() && !image_base64) return json({ error: "text ou image_base64 é obrigatório" }, 400);

    // ── REFEIÇÃO ─────────────────────────────────────────────────────────────
    if (type === "meal") {
      // 1) Cria log pendente
      const { data: mealLog, error: insertErr } = await supabase
        .from("meal_logs")
        .insert({
          client_id,
          source: "app",
          status: "pending",
          original_text: text || null,
        })
        .select("id")
        .single();
      if (insertErr || !mealLog) throw insertErr || new Error("Falha ao criar meal_log");

      // 2) Estima macros com IA
      const userContent: any[] = [];
      const hasText  = !!text?.trim();
      const hasImage = !!image_base64;

      let prompt: string;
      if (hasImage && hasText) {
        prompt = `IMAGEM + TEXTO COMPLEMENTAR. Texto: "${text}". Some imagem + texto em uma única estimativa.`;
      } else if (hasImage) {
        prompt = "Estime os macros da refeição na imagem.";
      } else {
        prompt = `Estime os macros: ${text}`;
      }
      userContent.push({ type: "text", text: prompt });
      if (hasImage) {
        userContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${image_base64}` } });
      }

      const r = await callAITool(
        [{ role: "system", content: MEAL_PROMPT }, { role: "user", content: userContent }],
        MACRO_TOOL,
        "estimate_macros",
      );

      const meal_description = (typeof r.meal_description === "string" && r.meal_description.trim())
        ? r.meal_description.trim().slice(0, 140)
        : "Refeição não identificada";
      const finalText = text?.trim() || meal_description;

      // 3) Atualiza log com macros
      await supabase.from("meal_logs").update({
        original_text:     finalText,
        estimated_kcal:    Number(r.estimated_kcal)    || 0,
        estimated_protein: Number(r.estimated_protein) || 0,
        estimated_carbs:   Number(r.estimated_carbs)   || 0,
        estimated_fat:     Number(r.estimated_fat)     || 0,
        status: "processed",
      }).eq("id", mealLog.id);

      // daily_summary é atualizado automaticamente pelo trigger do banco

      return json({
        success: true,
        meal_description,
        estimated_kcal:    Math.round(Number(r.estimated_kcal)    || 0),
        estimated_protein: Math.round(Number(r.estimated_protein) || 0),
        estimated_carbs:   Math.round(Number(r.estimated_carbs)   || 0),
        estimated_fat:     Math.round(Number(r.estimated_fat)     || 0),
      });
    }

    // ── ATIVIDADE ─────────────────────────────────────────────────────────────
    if (type === "activity") {
      const { activity_type: actTypeHint, duration_min } = body as any;

      let activity_type = actTypeHint || "Atividade";
      let estimated_burn_kcal = 0;
      let activity_duration: string | null = duration_min ? `${duration_min} min` : null;

      if (text?.trim()) {
        // Usa IA para estimar a atividade a partir do texto
        const r = await callAITool(
          [
            { role: "system", content: ACTIVITY_PROMPT },
            { role: "user", content: `Estime esta atividade: ${text}` },
          ],
          ACTIVITY_TOOL,
          "estimate_activity",
        );
        activity_type     = String(r.activity_type || actTypeHint || "Atividade");
        estimated_burn_kcal = Number(r.estimated_burn_kcal) || 0;
        activity_duration   = r.activity_duration ?? activity_duration;
      } else if (duration_min && actTypeHint) {
        // Estimativa manual sem IA
        const MET: Record<string, number> = {
          Corrida: 11, Caminhada: 5, Musculação: 7, Ciclismo: 8,
          Natação: 9, Yoga: 3, HIIT: 12, Outro: 6,
        };
        estimated_burn_kcal = (MET[actTypeHint] ?? 6) * Number(duration_min);
      }

      const { data: actLog, error: actErr } = await supabase
        .from("activity_logs")
        .insert({
          client_id,
          source: "app",
          status: "processed",
          original_text: text || `${activity_type} ${duration_min ? duration_min + "min" : ""}`.trim(),
          activity_type,
          activity_duration,
          estimated_burn_kcal,
        })
        .select("id")
        .single();
      if (actErr || !actLog) throw actErr || new Error("Falha ao criar activity_log");

      return json({
        success: true,
        activity_type,
        activity_duration,
        estimated_burn_kcal: Math.round(estimated_burn_kcal),
      });
    }

    return json({ error: "type deve ser 'meal' ou 'activity'" }, 400);

  } catch (err: any) {
    console.error("process-meal error:", err);
    return json({ error: err.message || "Erro interno" }, 500);
  }
});
