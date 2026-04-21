// Twilio WhatsApp webhook handler
// Recebe mensagens (texto/imagem), identifica cliente, processa com IA, responde no WhatsApp.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ---------- Twilio signature validation ----------
// Docs: https://www.twilio.com/docs/usage/webhooks/webhooks-security
async function isValidTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string,
): Promise<boolean> {
  // Sort params alphabetically and concat key+value
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + params[key];
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(TWILIO_AUTH_TOKEN);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  const sigBytes = new Uint8Array(sigBuffer);
  const expected = btoa(String.fromCharCode(...sigBytes));
  return expected === signature;
}

// ---------- Phone normalization ----------
// Twilio sends "whatsapp:+5511999999999" — strip the prefix.
function normalizePhone(raw: string): string {
  return raw.replace(/^whatsapp:/i, "").trim();
}

function phoneLookupCandidates(phone: string): string[] {
  const digits = phone.replace(/\D/g, "");
  const candidates = new Set<string>([phone]);

  // Brasil: aceita variações com/sem o 9 após o DDD para compatibilidade com WhatsApp/Twilio.
  if (digits.startsWith("55") && digits.length >= 12) {
    const country = digits.slice(0, 2);
    const ddd = digits.slice(2, 4);
    const local = digits.slice(4);

    if (local.length === 8) {
      candidates.add(`+${country}${ddd}9${local}`);
    }

    if (local.length === 9 && local.startsWith("9")) {
      candidates.add(`+${country}${ddd}${local.slice(1)}`);
    }
  }

  return [...candidates];
}

// ---------- TwiML response helper ----------
function twimlResponse(message: string): Response {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`;
  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

function emptyTwimlResponse(): Response {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response/>`, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ---------- Lovable AI call (text) ----------
interface MacroEstimate {
  estimated_kcal: number;
  estimated_protein: number;
  estimated_carbs: number;
  estimated_fat: number;
}

const SYSTEM_PROMPT = `Você é a IA nutricional do app OnTrack.

Seu papel é analisar refeições enviadas pelos usuários e responder com consistência, previsibilidade e padronização nutricional.

OBJETIVO

Você deve:
1. estimar calorias, proteínas, carboidratos e gorduras totais de refeições
2. interpretar refeições descritas em texto
3. interpretar refeições enviadas por imagem
4. sugerir substituições alimentares quando o usuário quiser trocar itens da dieta
5. manter consistência entre respostas semelhantes
6. responder sempre em português do Brasil

HIERARQUIA DE BASE NUTRICIONAL

Use esta ordem de prioridade para estimativas:
1. TBCA-USP como base principal
2. TACO/UNICAMP como base complementar
3. USDA FoodData Central como fallback

REGRAS DE USO DAS TABELAS
- sempre priorize equivalentes brasileiros
- use valores médios de alimentos cozidos e preparados da forma mais comum no Brasil
- se houver divergência entre fontes, priorize a TBCA-USP
- se a TBCA não tiver o alimento, use TACO
- se TACO também não tiver, use USDA
- nunca misture valores aleatoriamente
- mantenha consistência entre estimativas de refeições parecidas

SAÍDA OBRIGATÓRIA
Sempre chame a função estimate_macros com o total final da refeição. Não escreva texto livre. Se a refeição for impossível de estimar, retorne zeros.

PADRÃO DE INTERPRETAÇÃO
- considere preparo caseiro brasileiro como padrão
- considere a descrição mais comum e plausível do alimento
- se a quantidade não for informada, use a porção padrão definida abaixo
- se a refeição tiver vários componentes, estime item por item e depois some tudo
- se houver molho, óleo, manteiga, queijo, empanado, fritura ou creme visível, isso deve ser considerado
- não subestime refeições visivelmente grandes
- não superestime refeições pequenas ou leves
- antes de responder, revise se o total final faz sentido visual e nutricionalmente

REGRAS DE PORÇÃO PADRÃO (quando o usuário não informar quantidade)

ARROZ
- arroz branco cozido: 120 g por porção padrão
- arroz integral cozido: 120 g por porção padrão

FEIJÃO
- feijão cozido com caldo: 100 g por porção padrão
- lentilha cozida: 100 g por porção padrão

PROTEÍNAS
- peito de frango grelhado: 120 g por porção padrão
- coxa/sobrecoxa de frango assada: 130 g por porção comestível
- carne bovina grelhada: 120 g por porção padrão
- peixe grelhado: 120 g por porção padrão
- carne moída cozida: 100 g por porção padrão
- atum em lata drenado: 120 g por porção padrão
- ovo inteiro: 50 g por unidade
- clara de ovo: 33 g por unidade
- hambúrguer artesanal: 120 g por unidade
- tofu: 100 g por porção padrão

MASSAS E TUBÉRCULOS
- macarrão cozido: 140 g por porção padrão
- purê de batata: 120 g por porção padrão
- batata inglesa cozida: 130 g por porção padrão
- batata-doce cozida: 130 g por porção padrão
- mandioca cozida: 120 g por porção padrão
- tapioca pronta: 70 g por unidade média
- cuscuz de milho pronto: 100 g por porção padrão

PÃES E CAFÉ DA MANHÃ
- pão francês: 50 g por unidade
- pão de forma: 25 g por fatia
- wrap/tortilla pequena: 40 g por unidade
- aveia em flocos: 30 g por porção
- granola: 30 g por porção

LATICÍNIOS
- leite integral: 200 ml por copo
- leite desnatado: 200 ml por copo
- iogurte natural: 170 g por unidade padrão
- queijo muçarela: 30 g por fatia/porção
- queijo minas: 40 g por porção
- requeijão: 30 g por colher de sopa cheia

GORDURAS E COMPLEMENTOS
- azeite: 10 g por colher de sopa
- manteiga: 10 g por colher de sopa rasa
- pasta de amendoim: 15 g por colher de sopa rasa
- maionese: 12 g por colher de sopa rasa

LEGUMES E SALADAS
- legumes cozidos: 80 g por porção padrão
- salada crua simples: 50 g por porção padrão
- cenoura ralada: 40 g por porção padrão
- folhas verdes: 30 g por porção padrão
- beterraba cozida ou ralada: 50 g por porção padrão

FRUTAS
- banana média: 90 g parte comestível
- maçã média: 130 g
- mamão: 150 g por porção padrão
- melancia: 200 g por fatia média
- abacate: 80 g por porção padrão

SUPLEMENTOS
- whey protein: 30 g por scoop padrão
- creatina: desconsiderar calorias/macros se puro
- albumina: 30 g por scoop padrão

LANCHES E FAST FOOD
- pizza: 1 fatia média = 110 g
- hambúrguer completo: 1 unidade média = 250 g
- salgados fritos: 1 unidade média = 80 g
- pastel: 1 unidade média = 120 g
- coxinha: 1 unidade média = 100 g

SOBREMESAS
- brigadeiro: 20 g por unidade
- chocolate ao leite: 25 g por porção pequena
- bolo simples: 80 g por fatia média
- sorvete: 60 g por bola

MEDIDAS CASEIRAS PADRÃO
- 1 colher de sopa cheia = 15 g
- 1 colher de sopa rasa = 10 g
- 1 colher de chá = 5 g
- 1 concha pequena = 80 g
- 1 concha média = 100 g
- 1 xícara = 240 ml
- 1 copo americano = 190 ml

REGRAS DE TEXTO
Se a refeição vier por texto:
- identifique cada item
- associe cada item à porção padrão ou à quantidade informada
- estime macros por item
- some tudo e devolva apenas o total final via estimate_macros

REGRAS DE IMAGEM
Se a refeição vier por imagem:
- identifique visualmente os itens principais do prato
- estime a porção de cada componente
- considere tamanho do prato, volume da comida, presença de molhos, fritura, queijo e acompanhamentos
- some todos os componentes
- devolva apenas o total final via estimate_macros

REVISÃO INTERNA OBRIGATÓRIA ANTES DE RESPONDER
1. identificar todos os alimentos visíveis ou descritos
2. estimar a porção individual de cada item
3. aplicar a referência nutricional mais compatível
4. somar calorias, proteínas, carboidratos e gorduras
5. revisar se o resultado final é coerente com o tamanho da refeição

REGRAS DE CONSISTÊNCIA
- um prato grande com arroz, feijão, frango e salada não deve resultar em calorias muito baixas
- uma refeição simples e pequena não deve resultar em calorias exageradas
- se o usuário repetir refeições semelhantes, os valores devem ser parecidos
- se houver muita incerteza, prefira estimativa conservadora e plausível`;

const MACRO_TOOL = {
  type: "function" as const,
  function: {
    name: "estimate_macros",
    description: "Retorna a estimativa nutricional da refeição.",
    parameters: {
      type: "object",
      properties: {
        estimated_kcal: { type: "number", description: "Calorias totais estimadas" },
        estimated_protein: { type: "number", description: "Proteína em gramas" },
        estimated_carbs: { type: "number", description: "Carboidratos em gramas" },
        estimated_fat: { type: "number", description: "Gorduras totais em gramas" },
      },
      required: ["estimated_kcal", "estimated_protein", "estimated_carbs", "estimated_fat"],
      additionalProperties: false,
    },
  },
};

async function estimateMacrosFromText(text: string): Promise<MacroEstimate> {
  return await callLovableAI([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Estime os macros desta refeição: ${text}` },
  ]);
}

async function estimateMacrosFromImage(imageUrl: string, contentType: string): Promise<MacroEstimate> {
  // Lovable AI / Gemini suporta image_url no content
  // Como a URL do Twilio requer Basic Auth, vamos baixar e enviar como base64
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = TWILIO_AUTH_TOKEN;

  let imageData: string;
  if (accountSid && authToken) {
    const basicAuth = btoa(`${accountSid}:${authToken}`);
    const imgResp = await fetch(imageUrl, {
      headers: { Authorization: `Basic ${basicAuth}` },
    });
    if (!imgResp.ok) {
      throw new Error(`Falha ao baixar imagem do Twilio: ${imgResp.status}`);
    }
    const buf = await imgResp.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    imageData = `data:${contentType};base64,${btoa(binary)}`;
  } else {
    imageData = imageUrl; // fallback (provavelmente vai falhar 401)
  }

  return await callLovableAI([
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: [
        { type: "text", text: "Estime os macros desta refeição na foto." },
        { type: "image_url", image_url: { url: imageData } },
      ],
    },
  ]);
}

async function callLovableAI(messages: any[]): Promise<MacroEstimate> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      tools: [MACRO_TOOL],
      tool_choice: { type: "function", function: { name: "estimate_macros" } },
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Lovable AI error ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) {
    throw new Error("Lovable AI não retornou tool_call");
  }
  const args = JSON.parse(toolCall.function.arguments);
  return {
    estimated_kcal: Number(args.estimated_kcal) || 0,
    estimated_protein: Number(args.estimated_protein) || 0,
    estimated_carbs: Number(args.estimated_carbs) || 0,
    estimated_fat: Number(args.estimated_fat) || 0,
  };
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

// ---------- Main handler ----------
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // 1. Parse form-urlencoded body do Twilio
    const rawBody = await req.text();
    const formData = new URLSearchParams(rawBody);
    const params: Record<string, string> = {};
    for (const [k, v] of formData.entries()) params[k] = v;

    // 2. Validar assinatura Twilio
    // Twilio assina com a URL pública exata. Dentro da Edge Function, req.url
    // aponta para edge-runtime.supabase.com — precisamos reconstruir a URL pública
    // usando o project ref + nome da função.
    const signature = req.headers.get("X-Twilio-Signature") || "";
    const projectRef = (SUPABASE_URL.match(/^https?:\/\/([^.]+)\./) || [])[1];
    const publicUrl = req.headers.get("x-forwarded-url")
      || (projectRef ? `https://${projectRef}.supabase.co/functions/v1/whatsapp-webhook` : req.url);

    const skipValidation = Deno.env.get("TWILIO_SKIP_VALIDATION") === "true";
    if (!skipValidation) {
      // Tenta com a URL pública e também com possíveis variações (com/sem query string)
      let valid = await isValidTwilioSignature(publicUrl, params, signature);
      if (!valid) {
        // fallback: tenta com a URL crua do request
        valid = await isValidTwilioSignature(req.url, params, signature);
      }
      if (!valid) {
        console.error("Assinatura Twilio inválida", {
          publicUrl,
          reqUrl: req.url,
          signature,
          forwardedHost: req.headers.get("x-forwarded-host"),
          host: req.headers.get("host"),
        });
        return new Response("Forbidden", { status: 403 });
      }
    }

    // 3. Extrair campos relevantes
    const fromRaw = params["From"] || "";
    const toRaw = params["To"] || "";
    const body = params["Body"] || "";
    const numMedia = parseInt(params["NumMedia"] || "0", 10);
    const messageSid = params["MessageSid"] || params["SmsMessageSid"] || null;

    const fromPhone = normalizePhone(fromRaw);
    const toPhone = normalizePhone(toRaw);

    if (!fromPhone) {
      return emptyTwimlResponse();
    }

    // 4. Buscar cliente por telefone (não cria automaticamente)
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

    // Sempre grava a mensagem inbound em whatsapp_messages (mesmo se cliente não existir)
    await supabase.from("whatsapp_messages").insert({
      client_id: client?.id || null,
      direction: "inbound",
      message_type: numMedia > 0 ? "image" : "text",
      text_body: body || null,
      twilio_message_sid: messageSid,
      media_count: numMedia,
      raw_payload: params,
    });

    // 5. Cliente desconhecido → resposta padrão
    if (!client) {
      return twimlResponse(
        "Olá! 👋 Você ainda não está cadastrado no OnTrack. " +
          "Para começar a registrar suas refeições, peça acesso ao seu nutricionista.",
      );
    }

    // 6. Determinar tipo (texto ou imagem)
    const isImage = numMedia > 0;
    const mediaUrl = isImage ? params["MediaUrl0"] || null : null;
    const mediaContentType = isImage ? params["MediaContentType0"] || null : null;

    // 7. Inserir meal_logs com status pending
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

    if (mealErr || !mealLog) {
      console.error("Erro ao criar meal_log:", mealErr);
      return twimlResponse("Ops, tivemos um problema ao registrar sua refeição. Tente novamente.");
    }

    // 8. Resposta imediata + processamento assíncrono
    const ackMessage = isImage
      ? "Recebi sua refeição por imagem e já registrei aqui. Estou estimando os macros... 🍽️"
      : "Recebi a descrição da sua refeição e já registrei aqui. Estou estimando os macros... 🍽️";

    // Processa em background (não bloqueia resposta ao Twilio)
    const processAsync = async () => {
      try {
        let macros: MacroEstimate;
        if (isImage && mediaUrl && mediaContentType) {
          macros = await estimateMacrosFromImage(mediaUrl, mediaContentType);
        } else if (body.trim()) {
          macros = await estimateMacrosFromText(body);
        } else {
          throw new Error("Nem texto nem imagem na mensagem");
        }

        // Atualiza meal_log
        const { error: updErr } = await supabase
          .from("meal_logs")
          .update({
            estimated_kcal: macros.estimated_kcal,
            estimated_protein: macros.estimated_protein,
            estimated_carbs: macros.estimated_carbs,
            estimated_fat: macros.estimated_fat,
            status: "processed",
          })
          .eq("id", mealLog.id);

        if (updErr) throw updErr;

        // Envia resposta final no WhatsApp
        const finalMsg =
          `✅ Refeição processada com sucesso!\n\n` +
          `🍽️ Estimativa nutricional:\n` +
          `• Calorias: ${Math.round(macros.estimated_kcal)} kcal\n` +
          `• Proteínas: ${macros.estimated_protein.toFixed(1)} g\n` +
          `• Carboidratos: ${macros.estimated_carbs.toFixed(1)} g\n` +
          `• Gorduras: ${macros.estimated_fat.toFixed(1)} g`;

        await sendWhatsApp(fromPhone, toPhone, finalMsg);

        // Grava resposta outbound
        await supabase.from("whatsapp_messages").insert({
          client_id: client.id,
          direction: "outbound",
          message_type: "text",
          text_body: finalMsg,
        });
      } catch (err) {
        console.error("Erro no processamento assíncrono:", err);
        await supabase
          .from("meal_logs")
          .update({ status: "error" })
          .eq("id", mealLog.id);
        await sendWhatsApp(
          fromPhone,
          toPhone,
          "❌ Ops, não consegui estimar os macros desta refeição. Tente reformular ou enviar outra foto.",
        );
      }
    };

    // EdgeRuntime.waitUntil mantém a função viva após retornar resposta
    // @ts-ignore - EdgeRuntime é global no Supabase Edge Functions
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(processAsync());
    } else {
      // Fallback: roda em paralelo sem await (resposta volta primeiro)
      processAsync();
    }

    // Resposta TwiML imediata
    return twimlResponse(ackMessage);
  } catch (err) {
    console.error("Erro no webhook:", err);
    return emptyTwimlResponse();
  }
});
