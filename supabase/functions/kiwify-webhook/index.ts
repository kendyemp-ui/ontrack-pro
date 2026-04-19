// Kiwify webhook handler — atualiza tabela `subscriptions` com base nos eventos de compra/cancelamento.
// Validação de assinatura via token (parâmetro ?token=... ou header x-kiwify-signature) usando o secret KIWIFY_WEBHOOK_TOKEN.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-kiwify-signature',
};

// Mapeamento dos status da Kiwify -> nosso enum
const STATUS_MAP: Record<string, string> = {
  approved: 'active',
  paid: 'active',
  completed: 'active',
  subscription_renewed: 'active',
  subscription_late: 'past_due',
  pending: 'pending',
  waiting_payment: 'pending',
  refused: 'cancelled',
  cancelled: 'cancelled',
  canceled: 'cancelled',
  subscription_canceled: 'cancelled',
  refunded: 'refunded',
  chargeback: 'refunded',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // 1) Validar token (Kiwify usa ?token=... na URL do webhook)
    const expectedToken = Deno.env.get('KIWIFY_WEBHOOK_TOKEN');
    const url = new URL(req.url);
    const providedToken = url.searchParams.get('token') || req.headers.get('x-kiwify-signature') || '';
    if (!expectedToken) {
      console.error('KIWIFY_WEBHOOK_TOKEN não configurado');
      return json({ error: 'webhook not configured' }, 500);
    }
    if (providedToken !== expectedToken) {
      console.warn('Token inválido recebido', { providedToken: providedToken.slice(0, 6) });
      return json({ error: 'invalid token' }, 401);
    }

    const payload = await req.json();
    console.log('Kiwify webhook recebido', JSON.stringify(payload).slice(0, 500));

    // 2) Extrair dados (Kiwify pode mandar formato diferente por evento)
    const customer = payload.Customer ?? payload.customer ?? {};
    const email: string | undefined = customer.email ?? payload.customer_email ?? payload.email;
    const name: string | undefined = customer.full_name ?? customer.first_name ?? payload.customer_name;
    const eventStatus: string =
      (payload.order_status ?? payload.subscription_status ?? payload.webhook_event_type ?? payload.event ?? '')
        .toString()
        .toLowerCase();

    if (!email) {
      console.error('Webhook sem e-mail', payload);
      return json({ error: 'missing email' }, 400);
    }

    const status = STATUS_MAP[eventStatus] ?? 'pending';
    const externalId: string | undefined =
      payload.order_id ?? payload.subscription_id ?? payload.transaction_id ?? payload.id;
    const plan: string | undefined =
      payload.product?.product_name ?? payload.Product?.product_name ?? payload.plan_name;

    // Calcular expires_at se tiver next_payment
    let expiresAt: string | null = null;
    const nextPayment = payload.subscription?.next_payment ?? payload.next_payment;
    if (nextPayment) {
      const d = new Date(nextPayment);
      if (!isNaN(d.getTime())) expiresAt = d.toISOString();
    }

    // 3) Upsert via service-role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { error } = await supabase
      .from('subscriptions')
      .upsert(
        {
          email: email.toLowerCase(),
          status,
          plan,
          provider: 'kiwify',
          external_id: externalId,
          customer_name: name,
          expires_at: expiresAt,
          raw_payload: payload,
        },
        { onConflict: 'email' },
      );

    if (error) {
      console.error('Erro upsert subscription', error);
      return json({ error: error.message }, 500);
    }

    console.log(`Assinatura atualizada: ${email} -> ${status}`);
    return json({ ok: true, email, status });
  } catch (err) {
    console.error('Erro no webhook', err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
