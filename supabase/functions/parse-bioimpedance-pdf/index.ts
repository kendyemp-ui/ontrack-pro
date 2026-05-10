// parse-bioimpedance-pdf — extrai dados corporais de laudo PDF usando OpenAI Responses API
// Body: { pdf_base64: string }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const OPENAI_API_KEY         = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL           = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY      = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });
}

const PROMPT = `Você é especialista em laudos de bioimpedância (InBody, Tanita, Omron, Bodygram, etc).
Analise o laudo e retorne SOMENTE um JSON com esta estrutura exata (null para campos não encontrados):
{
  "basalRate": número em kcal/dia ou null,
  "weight": número em kg ou null,
  "height": número em cm ou null,
  "bodyFat": número em % ou null,
  "muscleMass": número em kg ou null,
  "bodyWater": número em % ou null,
  "boneMass": número em kg ou null,
  "visceralFat": número inteiro (nível) ou null,
  "metabolicAge": número em anos ou null
}
Retorne apenas o JSON, sem markdown, sem explicação.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    // Valida JWT
    const authHeader = req.headers.get("Authorization") || "";
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await supabaseAuth.auth.getUser();
    if (authErr || !user) return json({ error: "Não autorizado" }, 401);

    const { pdf_base64, pdfPath } = await req.json() as { pdf_base64?: string; pdfPath?: string };

    let finalBase64: string;

    if (pdf_base64?.trim()) {
      // Mobile: base64 enviado diretamente
      finalBase64 = pdf_base64;
    } else if (pdfPath?.trim()) {
      // Web: arquivo já no Supabase Storage — faz download
      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      const { data: fileData, error: dlErr } = await adminClient.storage
        .from("bioimpedance-pdfs")
        .download(pdfPath);
      if (dlErr || !fileData) return json({ error: "Arquivo não encontrado no storage" }, 404);
      const buf = await fileData.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      finalBase64 = btoa(binary);
    } else {
      return json({ error: "pdf_base64 ou pdfPath é obrigatório" }, 400);
    }

    // OpenAI Responses API — suporte nativo a PDF via input_file
    const aiResp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_file",
                filename: "bioimpedance.pdf",
                file_data: `data:application/pdf;base64,${finalBase64}`,
              },
              { type: "input_text", text: PROMPT },
            ],
          },
        ],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("OpenAI error", aiResp.status, errText);
      return json({ error: "Falha ao analisar PDF com IA" }, 500);
    }

    const aiJson = await aiResp.json();
    const rawText =
      aiJson.output_text ??
      aiJson.output?.[0]?.content?.[0]?.text ??
      aiJson.output?.[0]?.content?.[0]?.transcript ??
      "";

    if (!rawText) {
      console.error("OpenAI sem output:", JSON.stringify(aiJson).slice(0, 300));
      return json({ error: "Não foi possível extrair os dados do PDF" }, 422);
    }

    const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let extracted: Record<string, unknown>;
    try {
      extracted = JSON.parse(cleaned);
    } catch {
      console.error("JSON parse error, raw:", cleaned.slice(0, 300));
      return json({ error: "Resposta da IA inválida" }, 422);
    }

    return json({ data: extracted });

  } catch (e: any) {
    console.error("parse-bioimpedance-pdf error:", e);
    return json({ error: e.message || "Erro interno" }, 500);
  }
});
