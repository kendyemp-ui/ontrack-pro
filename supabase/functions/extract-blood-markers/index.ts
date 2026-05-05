// Extrai marcadores laboratoriais de um exame de sangue (PDF ou imagem) usando IA
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { document_id } = await req.json();
    if (!document_id) {
      return new Response(JSON.stringify({ error: "document_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch document record
    const { data: doc, error: docErr } = await admin
      .from("patient_documents")
      .select("id, client_id, file_path, mime_type, name")
      .eq("id", document_id)
      .single();

    if (docErr || !doc) {
      return new Response(JSON.stringify({ error: "Document not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download file from storage
    const { data: fileData, error: fileErr } = await admin.storage
      .from("patient-documents")
      .download(doc.file_path);

    if (fileErr || !fileData) {
      return new Response(JSON.stringify({ error: "Failed to download file: " + fileErr?.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const chunkSize = 8192;
    let binary = "";
    for (let i = 0; i < uint8.length; i += chunkSize) {
      binary += String.fromCharCode(...uint8.slice(i, i + chunkSize));
    }
    const base64 = btoa(binary);
    const mimeType = doc.mime_type || "application/pdf";

    const prompt = `Você é um especialista em medicina laboratorial. Analise este exame de sangue e extraia os marcadores laboratoriais.

Retorne SOMENTE um JSON com esta estrutura exata (use null para marcadores não encontrados):
{
  "exam_date": "YYYY-MM-DD ou null",
  "glucose": número em mg/dL ou null,
  "hba1c": número em % ou null,
  "ldl": número em mg/dL ou null,
  "hdl": número em mg/dL ou null,
  "total_cholesterol": número em mg/dL ou null,
  "triglycerides": número em mg/dL ou null,
  "uric_acid": número em mg/dL ou null,
  "creatinine": número em mg/dL ou null,
  "tsh": número em mUI/L ou null,
  "t4": número em ng/dL ou null,
  "hemoglobin": número em g/dL ou null,
  "hematocrit": número em % ou null,
  "raw_markers": { "nome_marcador": { "value": número, "unit": "string", "reference": "string" } }
}

Inclua em raw_markers TODOS os marcadores encontrados no exame, mesmo os não listados acima.
Retorne apenas o JSON, sem markdown, sem explicação.`;

    // Call AI with vision
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
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
    const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let markers: Record<string, any>;
    try {
      markers = JSON.parse(cleaned);
    } catch {
      return new Response(JSON.stringify({ error: "Failed to parse AI response", raw: rawContent }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save to patient_health_markers
    const { data: saved, error: saveErr } = await admin
      .from("patient_health_markers")
      .insert({
        client_id: doc.client_id,
        document_id: doc.id,
        exam_date: markers.exam_date || null,
        glucose: markers.glucose || null,
        hba1c: markers.hba1c || null,
        ldl: markers.ldl || null,
        hdl: markers.hdl || null,
        total_cholesterol: markers.total_cholesterol || null,
        triglycerides: markers.triglycerides || null,
        uric_acid: markers.uric_acid || null,
        creatinine: markers.creatinine || null,
        tsh: markers.tsh || null,
        t4: markers.t4 || null,
        hemoglobin: markers.hemoglobin || null,
        hematocrit: markers.hematocrit || null,
        raw_markers: markers.raw_markers || {},
      })
      .select()
      .single();

    if (saveErr) {
      return new Response(JSON.stringify({ error: "Failed to save markers: " + saveErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, markers: saved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
