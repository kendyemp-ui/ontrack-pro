// Extrai dados de bioimpedância a partir de um PDF usando Lovable AI Gateway.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um especialista em interpretar laudos de bioimpedância (InBody, Tanita, Omron, Bodygram, etc).
Receberá um PDF de exame e deve extrair os principais valores corporais.
Retorne SOMENTE os campos solicitados via tool call. Se um campo não aparecer no laudo, retorne null para ele.
Atenção a unidades: peso e massa muscular em kg; altura em cm; gordura corporal e água corporal em %; gasto basal (TMB / BMR) em kcal/dia; idade metabólica em anos; gordura visceral como nível (número inteiro).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing env" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth: precisamos do user para verificar que ele é dono do PDF
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
    const userId = userData.user.id;

    const { pdfPath } = await req.json();
    if (!pdfPath || typeof pdfPath !== "string") {
      return new Response(JSON.stringify({ error: "pdfPath is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!pdfPath.startsWith(`${userId}/`)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: fileData, error: dlErr } = await supabaseAdmin.storage
      .from("bioimpedance-pdfs")
      .download(pdfPath);
    if (dlErr || !fileData) {
      return new Response(JSON.stringify({ error: "PDF não encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = encodeBase64(new Uint8Array(arrayBuffer));
    const dataUrl = `data:application/pdf;base64,${base64}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Extraia os dados de bioimpedância deste laudo." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_bioimpedance",
              description: "Extrai os dados corporais do laudo de bioimpedância.",
              parameters: {
                type: "object",
                properties: {
                  basalRate: { type: ["number", "null"], description: "Taxa Metabólica Basal (TMB/BMR) em kcal/dia" },
                  weight: { type: ["number", "null"], description: "Peso corporal em kg" },
                  height: { type: ["number", "null"], description: "Altura em cm" },
                  bodyFat: { type: ["number", "null"], description: "Percentual de gordura corporal (%)" },
                  muscleMass: { type: ["number", "null"], description: "Massa muscular esquelética em kg" },
                  bodyWater: { type: ["number", "null"], description: "Água corporal total (%)" },
                  boneMass: { type: ["number", "null"], description: "Massa óssea em kg" },
                  visceralFat: { type: ["number", "null"], description: "Nível de gordura visceral" },
                  metabolicAge: { type: ["number", "null"], description: "Idade metabólica em anos" },
                },
                required: ["basalRate", "weight", "height", "bodyFat", "muscleMass", "bodyWater", "boneMass", "visceralFat", "metabolicAge"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_bioimpedance" } },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de uso da IA atingido. Tente novamente em instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos da IA esgotados. Adicione créditos na sua workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Falha ao analisar PDF com IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "Não foi possível extrair os dados do PDF" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const extracted = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ data: extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-bioimpedance-pdf error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function encodeBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
