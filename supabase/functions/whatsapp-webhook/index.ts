// Twilio WhatsApp webhook handler
// Recebe mensagens (texto/imagem), identifica cliente, classifica intenção
// (refeição, atividade, substituição, fora de escopo), processa com IA e responde no WhatsApp.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ---------- Twilio signature validation ----------
async function isValidTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string,
): Promise<boolean> {
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) data += key + params[key];

  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(TWILIO_AUTH_TOKEN),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  const sigBytes = new Uint8Array(sigBuffer);
  const expected = btoa(String.fromCharCode(...sigBytes));
  return expected === signature;
}

function normalizePhone(raw: string): string {
  return raw.replace(/^whatsapp:/i, "").trim();
}

function phoneLookupCandidates(phone: string): string[] {
  const digits = phone.replace(/\D/g, "");
  const candidates = new Set<string>([phone]);
  if (digits.startsWith("55") && digits.length >= 12) {
    const country = digits.slice(0, 2);
    const ddd = digits.slice(2, 4);
    const local = digits.slice(4);
    if (local.length === 8) candidates.add(`+${country}${ddd}9${local}`);
    if (local.length === 9 && local.startsWith("9")) candidates.add(`+${country}${ddd}${local.slice(1)}`);
  }
  return [...candidates];
}

function twimlResponse(message: string): Response {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`;
  return new Response(xml, { status: 200, headers: { "Content-Type": "text/xml" } });
}

function emptyTwimlResponse(): Response {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response/>`, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

// ============================================================
// PROMPTS E TOOLS
// ============================================================

const CLASSIFIER_PROMPT = `Você é o classificador de intenção do app OnTrack.
Analise a mensagem do usuário (texto e/ou imagem) e classifique em UMA categoria:

- "meal_text": SOMENTE texto descrevendo refeição. Ex: "almoço: arroz, feijão e frango", "comi 2 ovos".
- "meal_image": SOMENTE imagem de comida/prato/refeição, sem texto complementar relevante (ou texto vazio/saudação curta).
- "meal_image_plus_text": imagem de comida/prato JUNTO com texto complementar que adiciona contexto sobre ingredientes, preparo, quantidade, complementos ou itens não totalmente visíveis. Ex: foto de iogurte + "tem whey misturado", foto de salada + "coloquei azeite e frango", foto de pão + "tem requeijão dentro", foto de fruta + "bati com leite e aveia".
- "activity_text": descrição de atividade física em texto. Ex: "corri 5km", "fiz 40min de musculação", "pedalei 1h", "caminhei 7 mil passos", "joguei tênis 1h30".
- "activity_image": print de smartwatch (Apple Watch, Garmin, Strava, etc) ou app esportivo mostrando atividade física, distância, calorias, frequência cardíaca.
- "food_substitution": pedido para trocar/substituir um alimento. Ex: "me sugere substituição para frango", "o que posso comer no lugar do arroz".
- "out_of_scope": qualquer outra coisa (saudação, papo, perguntas fora de nutrição/atividade).

REGRA IMPORTANTE: se houver imagem de comida E texto que descreve/complementa a refeição, use "meal_image_plus_text" (NÃO use "meal_image"). Se o texto for apenas saudação irrelevante ("oi", "olha"), use "meal_image".

Use a tool classify_intent.`;

const CLASSIFIER_TOOL = {
  type: "function" as const,
  function: {
    name: "classify_intent",
    description: "Classifica a intenção da mensagem do usuário.",
    parameters: {
      type: "object",
      properties: {
        intent: {
          type: "string",
          enum: ["meal_text", "meal_image", "meal_image_plus_text", "activity_text", "activity_image", "food_substitution", "out_of_scope"],
        },
      },
      required: ["intent"],
      additionalProperties: false,
    },
  },
};

const MEAL_PROMPT = `Você é a IA nutricional do app OnTrack. Estime calorias, proteínas, carboidratos e gorduras de refeições com base em TBCA-USP > TACO > USDA, considerando preparo brasileiro.
Use porções padrão quando a quantidade não for informada (arroz cozido 120g, feijão 100g, frango grelhado 120g, ovo 50g, pão francês 50g, pão de forma 25g/fatia, leite 200ml, iogurte 170g, whey 30g/scoop, banana 90g, azeite 10g/colher, requeijão 30g, pasta de amendoim 15g, granola 30g, etc).

REGRA CRÍTICA PARA IMAGEM + TEXTO COMPLEMENTAR:
- Quando houver IMAGEM e TEXTO juntos, considere os DOIS como parte da MESMA refeição.
- A imagem é a base visual; o texto adiciona ingredientes, preparo, quantidade, complementos ou itens escondidos/misturados/internos que não aparecem claramente na foto.
- SEMPRE inclua no cálculo o que o texto informar mesmo que não esteja visível na imagem (ex: "tem whey misturado", "coloquei granola", "tem mel por cima", "usei leite integral", "tem requeijão dentro", "misturei pasta de amendoim").
- Some imagem + texto em UMA única estimativa final.
- Se houver conflito, escolha a combinação mais plausível dos dois.

Mantenha consistência: nunca devolva valores absurdamente baixos para pratos grandes nem altos para refeições leves.
SEMPRE chame a tool estimate_macros com o total final. Se não for possível estimar, retorne zeros.`;

const MACRO_TOOL = {
  type: "function" as const,
  function: {
    name: "estimate_macros",
    description: "Retorna a estimativa nutricional total da refeição.",
    parameters: {
      type: "object",
      properties: {
        estimated_kcal: { type: "number" },
        estimated_protein: { type: "number" },
        estimated_carbs: { type: "number" },
        estimated_fat: { type: "number" },
      },
      required: ["estimated_kcal", "estimated_protein", "estimated_carbs", "estimated_fat"],
      additionalProperties: false,
    },
  },
};

const ACTIVITY_PROMPT = `Você é a IA de atividade física do app OnTrack.
Sua tarefa é interpretar atividades físicas descritas em TEXTO ou em IMAGEM (print de smartwatch como Apple Watch, Garmin, Strava etc) e estimar o GASTO CALÓRICO.

REGRAS:
- Se o print mostrar EXPLICITAMENTE as calorias gastas, USE EXATAMENTE esse valor.
- Se não estiver explícito, estime de forma plausível considerando peso médio adulto (~70kg) e MET da atividade.
- Identifique tipo de atividade (corrida, musculação, caminhada, ciclismo, natação, tênis, etc).
- Capte duração, distância e passos quando disponíveis.

ESTIMATIVAS APROXIMADAS (kcal por minuto, adulto ~70kg):
- caminhada leve: 4 / caminhada rápida: 6
- corrida 6km/h: 9 / corrida 8km/h: 11 / corrida 10km/h: 14
- ciclismo moderado: 7 / ciclismo intenso: 12
- musculação moderada: 6 / musculação intensa: 9
- natação: 9 / tênis: 8 / futebol: 9 / yoga: 3
- crossfit/HIIT: 12

Para passos: ~0,04 kcal por passo (adulto 70kg).
Para distância de corrida: ~70 kcal por km.

SEMPRE chame a tool estimate_activity com os campos preenchidos. Se não souber duração/distância/passos, deixe null. Sempre informe activity_type e estimated_burn_kcal.`;

const ACTIVITY_TOOL = {
  type: "function" as const,
  function: {
    name: "estimate_activity",
    description: "Retorna o registro estimado da atividade física.",
    parameters: {
      type: "object",
      properties: {
        activity_type: { type: "string", description: "Ex: Corrida, Musculação, Caminhada, Ciclismo" },
        activity_duration: { type: ["string", "null"], description: "Duração legível, ex: '40 min', '1h30'" },
        activity_distance: { type: ["string", "null"], description: "Ex: '5 km', '10 km'" },
        activity_steps: { type: ["number", "null"], description: "Quantidade de passos, se aplicável" },
        estimated_burn_kcal: { type: "number", description: "Gasto calórico estimado em kcal" },
      },
      required: ["activity_type", "estimated_burn_kcal"],
      additionalProperties: false,
    },
  },
};

const SUBSTITUTION_PROMPT = `Você é a IA nutricional do app OnTrack.
O usuário quer substituir um alimento. Sugira 3 opções equivalentes em macros, comuns no Brasil.
Trocas comuns:
- arroz → batata, mandioca, macarrão, cuscuz, quinoa
- frango → peixe, carne magra, ovos, atum, tofu
- pão → tapioca, cuscuz, wrap, batata-doce
Mantenha calorias e macros próximos do original. Explique brevemente o motivo.
SEMPRE chame a tool suggest_substitutions.`;

const SUBSTITUTION_TOOL = {
  type: "function" as const,
  function: {
    name: "suggest_substitutions",
    description: "Sugere 3 substituições alimentares.",
    parameters: {
      type: "object",
      properties: {
        original_food: { type: "string" },
        replacement_options: {
          type: "array",
          items: {
            type: "object",
            properties: {
              food: { type: "string" },
              reason: { type: "string" },
              estimated_kcal: { type: "number" },
              estimated_protein: { type: "number" },
              estimated_carbs: { type: "number" },
              estimated_fat: { type: "number" },
            },
            required: ["food", "reason", "estimated_kcal", "estimated_protein", "estimated_carbs", "estimated_fat"],
          },
        },
      },
      required: ["original_food", "replacement_options"],
      additionalProperties: false,
    },
  },
};

const OUT_OF_SCOPE_MSG =
  "No momento, eu só consigo registrar refeições enviadas por texto ou imagem, registrar atividades físicas (texto ou print de smartwatch) e ajudar com substituições alimentares da dieta.";

// ============================================================
// LOVABLE AI
// ============================================================

interface MacroEstimate {
  estimated_kcal: number;
  estimated_protein: number;
  estimated_carbs: number;
  estimated_fat: number;
}

interface ActivityEstimate {
  activity_type: string;
  activity_duration: string | null;
  activity_distance: string | null;
  activity_steps: number | null;
  estimated_burn_kcal: number;
}

interface SubstitutionResult {
  original_food: string;
  replacement_options: Array<{
    food: string;
    reason: string;
    estimated_kcal: number;
    estimated_protein: number;
    estimated_carbs: number;
    estimated_fat: number;
  }>;
}

async function callAITool(messages: any[], tool: any, toolName: string): Promise<any> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      tools: [tool],
      tool_choice: { type: "function", function: { name: toolName } },
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Lovable AI error ${resp.status}: ${errText}`);
  }
  const data = await resp.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("Lovable AI não retornou tool_call");
  return JSON.parse(toolCall.function.arguments);
}

async function downloadTwilioImageAsDataUrl(imageUrl: string, contentType: string): Promise<string> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  if (!accountSid) return imageUrl;
  const basicAuth = btoa(`${accountSid}:${TWILIO_AUTH_TOKEN}`);
  const imgResp = await fetch(imageUrl, { headers: { Authorization: `Basic ${basicAuth}` } });
  if (!imgResp.ok) throw new Error(`Falha ao baixar imagem do Twilio: ${imgResp.status}`);
  const buf = await imgResp.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return `data:${contentType};base64,${btoa(binary)}`;
}

async function classifyIntent(text: string, imageDataUrl: string | null): Promise<string> {
  const userContent: any[] = [];
  if (text?.trim()) userContent.push({ type: "text", text });
  else userContent.push({ type: "text", text: "(mensagem sem texto)" });
  if (imageDataUrl) userContent.push({ type: "image_url", image_url: { url: imageDataUrl } });

  const result = await callAITool(
    [
      { role: "system", content: CLASSIFIER_PROMPT },
      { role: "user", content: userContent },
    ],
    CLASSIFIER_TOOL,
    "classify_intent",
  );
  return result.intent;
}

async function estimateMeal(text: string, imageDataUrl: string | null): Promise<MacroEstimate> {
  const userContent: any[] = [];
  userContent.push({ type: "text", text: text?.trim() ? `Estime os macros: ${text}` : "Estime os macros desta refeição na imagem." });
  if (imageDataUrl) userContent.push({ type: "image_url", image_url: { url: imageDataUrl } });
  const r = await callAITool(
    [{ role: "system", content: MEAL_PROMPT }, { role: "user", content: userContent }],
    MACRO_TOOL,
    "estimate_macros",
  );
  return {
    estimated_kcal: Number(r.estimated_kcal) || 0,
    estimated_protein: Number(r.estimated_protein) || 0,
    estimated_carbs: Number(r.estimated_carbs) || 0,
    estimated_fat: Number(r.estimated_fat) || 0,
  };
}

async function estimateActivity(text: string, imageDataUrl: string | null): Promise<ActivityEstimate> {
  const userContent: any[] = [];
  userContent.push({ type: "text", text: text?.trim() ? `Estime esta atividade: ${text}` : "Identifique e estime esta atividade física a partir da imagem (print de smartwatch/app esportivo)." });
  if (imageDataUrl) userContent.push({ type: "image_url", image_url: { url: imageDataUrl } });
  const r = await callAITool(
    [{ role: "system", content: ACTIVITY_PROMPT }, { role: "user", content: userContent }],
    ACTIVITY_TOOL,
    "estimate_activity",
  );
  return {
    activity_type: String(r.activity_type || "Atividade"),
    activity_duration: r.activity_duration ?? null,
    activity_distance: r.activity_distance ?? null,
    activity_steps: r.activity_steps != null ? Number(r.activity_steps) : null,
    estimated_burn_kcal: Number(r.estimated_burn_kcal) || 0,
  };
}

async function suggestSubstitutions(text: string): Promise<SubstitutionResult> {
  const r = await callAITool(
    [
      { role: "system", content: SUBSTITUTION_PROMPT },
      { role: "user", content: `O usuário pediu: ${text}` },
    ],
    SUBSTITUTION_TOOL,
    "suggest_substitutions",
  );
  return r as SubstitutionResult;
}

// ---------- Send WhatsApp message via Twilio ----------
async function sendWhatsApp(toPhone: string, fromPhone: string, body: string): Promise<void> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  if (!accountSid) {
    console.warn("TWILIO_ACCOUNT_SID não configurado — pulando envio assíncrono");
    return;
  }
  const basicAuth = btoa(`${accountSid}:${TWILIO_AUTH_TOKEN}`);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams({
    To: `whatsapp:${toPhone}`,
    From: `whatsapp:${fromPhone}`,
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
    console.error("Falha ao enviar WhatsApp:", resp.status, txt);
  }
}

// ============================================================
// MAIN HANDLER
// ============================================================

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const rawBody = await req.text();
    const formData = new URLSearchParams(rawBody);
    const params: Record<string, string> = {};
    for (const [k, v] of formData.entries()) params[k] = v;

    // Validação Twilio
    const signature = req.headers.get("X-Twilio-Signature") || "";
    const projectRef = (SUPABASE_URL.match(/^https?:\/\/([^.]+)\./) || [])[1];
    const publicUrl = req.headers.get("x-forwarded-url")
      || (projectRef ? `https://${projectRef}.supabase.co/functions/v1/whatsapp-webhook` : req.url);
    const skipValidation = Deno.env.get("TWILIO_SKIP_VALIDATION") === "true";
    if (!skipValidation) {
      let valid = await isValidTwilioSignature(publicUrl, params, signature);
      if (!valid) valid = await isValidTwilioSignature(req.url, params, signature);
      if (!valid) {
        console.error("Assinatura Twilio inválida");
        return new Response("Forbidden", { status: 403 });
      }
    }

    const fromRaw = params["From"] || "";
    const toRaw = params["To"] || "";
    const body = params["Body"] || "";
    const numMedia = parseInt(params["NumMedia"] || "0", 10);
    const messageSid = params["MessageSid"] || params["SmsMessageSid"] || null;
    const fromPhone = normalizePhone(fromRaw);
    const toPhone = normalizePhone(toRaw);
    if (!fromPhone) return emptyTwimlResponse();

    // Buscar cliente
    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .select("id, name")
      .in("phone_e164", phoneLookupCandidates(fromPhone))
      .limit(1)
      .maybeSingle();
    if (clientErr) {
      console.error("Erro ao buscar client:", clientErr);
      return emptyTwimlResponse();
    }

    // Sempre grava mensagem inbound
    await supabase.from("whatsapp_messages").insert({
      client_id: client?.id || null,
      direction: "inbound",
      message_type: numMedia > 0 ? "image" : "text",
      text_body: body || null,
      twilio_message_sid: messageSid,
      media_count: numMedia,
      raw_payload: params,
    });

    if (!client) {
      return twimlResponse(
        "Olá! 👋 Você ainda não está cadastrado no OnTrack. Para começar, peça acesso ao seu nutricionista.",
      );
    }

    const isImage = numMedia > 0;
    const mediaUrl = isImage ? params["MediaUrl0"] || null : null;
    const mediaContentType = isImage ? params["MediaContentType0"] || null : null;

    // Resposta imediata genérica enquanto processamos em background
    const ackMessage = isImage
      ? "Recebi sua imagem e estou analisando... 🔎"
      : "Recebi sua mensagem e estou analisando... 🔎";

    const processAsync = async () => {
      try {
        // Baixa imagem (se houver) uma única vez
        let imageDataUrl: string | null = null;
        if (isImage && mediaUrl && mediaContentType) {
          imageDataUrl = await downloadTwilioImageAsDataUrl(mediaUrl, mediaContentType);
        }

        // 1) Classificação de intenção
        const intent = await classifyIntent(body, imageDataUrl);
        console.log("Intent classificada:", intent);

        // 2) Roteamento
        if (intent === "out_of_scope") {
          await sendWhatsApp(fromPhone, toPhone, OUT_OF_SCOPE_MSG);
          await supabase.from("whatsapp_messages").insert({
            client_id: client.id, direction: "outbound", message_type: "text", text_body: OUT_OF_SCOPE_MSG,
          });
          return;
        }

        if (intent === "food_substitution") {
          const sub = await suggestSubstitutions(body);
          const lines = [
            `🔄 *Sugestões de substituição* para *${sub.original_food}*:`,
            "",
            ...sub.replacement_options.slice(0, 3).map((opt, i) =>
              `${i + 1}. *${opt.food}* (${Math.round(opt.estimated_kcal)} kcal)\n   ${opt.reason}`
            ),
          ];
          const msg = lines.join("\n");
          await sendWhatsApp(fromPhone, toPhone, msg);
          await supabase.from("whatsapp_messages").insert({
            client_id: client.id, direction: "outbound", message_type: "text", text_body: msg,
          });
          return;
        }

        if (intent === "activity_text" || intent === "activity_image") {
          // Insert pending activity
          const { data: actLog, error: actErr } = await supabase
            .from("activity_logs")
            .insert({
              client_id: client.id,
              source: intent === "activity_image" ? "whatsapp_activity_image" : "whatsapp_activity_text",
              status: "pending",
              original_text: body || null,
              media_url: mediaUrl,
              media_content_type: mediaContentType,
              twilio_message_sid: messageSid,
            })
            .select("id")
            .single();
          if (actErr || !actLog) throw actErr || new Error("Falha ao criar activity_log");

          const est = await estimateActivity(body, imageDataUrl);
          await supabase.from("activity_logs").update({
            activity_type: est.activity_type,
            activity_duration: est.activity_duration,
            activity_distance: est.activity_distance,
            activity_steps: est.activity_steps,
            estimated_burn_kcal: est.estimated_burn_kcal,
            status: "processed",
          }).eq("id", actLog.id);

          const detailsLines = [`• Atividade: ${est.activity_type}`];
          if (est.activity_duration) detailsLines.push(`• Duração: ${est.activity_duration}`);
          if (est.activity_distance) detailsLines.push(`• Distância: ${est.activity_distance}`);
          if (est.activity_steps) detailsLines.push(`• Passos: ${est.activity_steps.toLocaleString("pt-BR")}`);
          detailsLines.push(`• Gasto calórico estimado: ${Math.round(est.estimated_burn_kcal)} kcal`);

          const msg =
            `✅ *Atividade registrada com sucesso!*\n\n` +
            `🏃 *Resumo da atividade:*\n` +
            detailsLines.join("\n") + `\n\n` +
            `📌 Esse valor é estimado com base nas informações enviadas.`;

          await sendWhatsApp(fromPhone, toPhone, msg);
          await supabase.from("whatsapp_messages").insert({
            client_id: client.id, direction: "outbound", message_type: "text", text_body: msg,
          });
          return;
        }

        // meal_text ou meal_image
        const { data: mealLog, error: mealErr } = await supabase
          .from("meal_logs")
          .insert({
            client_id: client.id,
            source: "whatsapp",
            status: "pending",
            original_text: body || null,
            media_url: mediaUrl,
            media_content_type: mediaContentType,
            twilio_message_sid: messageSid,
          })
          .select("id")
          .single();
        if (mealErr || !mealLog) throw mealErr || new Error("Falha ao criar meal_log");

        const macros = await estimateMeal(body, imageDataUrl);
        await supabase.from("meal_logs").update({
          estimated_kcal: macros.estimated_kcal,
          estimated_protein: macros.estimated_protein,
          estimated_carbs: macros.estimated_carbs,
          estimated_fat: macros.estimated_fat,
          status: "processed",
        }).eq("id", mealLog.id);

        const finalMsg =
          `✅ *Refeição registrada com sucesso!*\n\n` +
          `🍽️ *Estimativa nutricional:*\n` +
          `• Calorias: ${Math.round(macros.estimated_kcal)} kcal\n` +
          `• Proteínas: ${macros.estimated_protein.toFixed(1)} g\n` +
          `• Carboidratos: ${macros.estimated_carbs.toFixed(1)} g\n` +
          `• Gorduras: ${macros.estimated_fat.toFixed(1)} g`;

        await sendWhatsApp(fromPhone, toPhone, finalMsg);
        await supabase.from("whatsapp_messages").insert({
          client_id: client.id, direction: "outbound", message_type: "text", text_body: finalMsg,
        });
      } catch (err) {
        console.error("Erro no processamento assíncrono:", err);
        await sendWhatsApp(
          fromPhone,
          toPhone,
          "❌ Ops, não consegui processar sua mensagem agora. Tente reformular ou enviar outra foto.",
        );
      }
    };

    // @ts-ignore - EdgeRuntime é global no Supabase Edge Functions
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(processAsync());
    } else {
      processAsync();
    }

    return twimlResponse(ackMessage);
  } catch (err) {
    console.error("Erro no webhook:", err);
    return emptyTwimlResponse();
  }
});
