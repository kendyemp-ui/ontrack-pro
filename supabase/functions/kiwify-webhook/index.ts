// Kiwify webhook — salva assinatura + convida usuário automaticamente ao comprar
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-kiwify-signature',
};

const STATUS_MAP: Record<string, string> = {
  approved:              'active',
  paid:                  'active',
  completed:             'active',
  subscription_renewed:  'active',
  subscription_late:     'past_due',
  pending:               'pending',
  waiting_payment:       'pending',
  refused:               'cancelled',
  cancelled:             'cancelled',
  canceled:              'cancelled',
  subscription_canceled: 'cancelled',
  refunded:              'refunded',
  chargeback:            'refunded',
};

// Mapeia nome do plano Kiwify → slug interno
function parsePlan(planName: string = ''): string {
  const n = planName.toLowerCase();
  if (n.includes('pro'))   return 'pro';
  if (n.includes('scale')) return 'scale';
  if (n.includes('start')) return 'start';
  return 'teste';
}

const SITE_URL = 'https://ontrack-pro.vercel.app';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

  try {
    // 1) Validar token
    const expectedToken = Deno.env.get('KIWIFY_WEBHOOK_TOKEN');
    const url = new URL(req.url);
    const providedToken = url.searchParams.get('token') || req.headers.get('x-kiwify-signature') || '';
    if (!expectedToken || providedToken !== expectedToken) {
      console.warn('Token inválido', providedToken.slice(0, 6));
      return json({ error: 'invalid token' }, 401);
    }

    const payload = await req.json();
    console.log('Kiwify payload', JSON.stringify(payload).slice(0, 600));

    // 2) Extrair campos
    const customer   = payload.Customer ?? payload.customer ?? {};
    const email: string | undefined = customer.email ?? payload.customer_email ?? payload.email;
    const name: string | undefined  = customer.full_name ?? customer.first_name ?? payload.customer_name ?? '';
    const eventStatus = (
      payload.order_status ?? payload.subscription_status ??
      payload.webhook_event_type ?? payload.event ?? ''
    ).toString().toLowerCase();

    if (!email) {
      console.error('Webhook sem e-mail', payload);
      return json({ error: 'missing email' }, 400);
    }

    const normalEmail = email.toLowerCase().trim();
    const status      = STATUS_MAP[eventStatus] ?? 'pending';
    const planRaw     = payload.product?.product_name ?? payload.Product?.product_name ?? payload.plan_name ?? '';
    const plan        = parsePlan(planRaw);
    const externalId  = payload.order_id ?? payload.subscription_id ?? payload.transaction_id ?? payload.id;

    let expiresAt: string | null = null;
    const nextPayment = payload.subscription?.next_payment ?? payload.next_payment;
    if (nextPayment) {
      const d = new Date(nextPayment);
      if (!isNaN(d.getTime())) expiresAt = d.toISOString();
    }

    // 3) Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 4) Upsert assinatura
    const { error: subErr } = await supabase
      .from('subscriptions')
      .upsert(
        {
          email:         normalEmail,
          status,
          plan,
          provider:      'kiwify',
          external_id:   externalId,
          customer_name: name,
          expires_at:    expiresAt,
          raw_payload:   payload,
        },
        { onConflict: 'email' },
      );

    if (subErr) {
      console.error('Erro upsert subscription', subErr);
      return json({ error: subErr.message }, 500);
    }

    // 5) Se compra aprovada → convidar usuário (cria conta se não existe)
    if (status === 'active') {
      // Tenta convidar — se já existe, ignora o erro graciosamente
      const { error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(normalEmail, {
        redirectTo: `${SITE_URL}/pro/login`,
        data: { full_name: name, plan },
      });

      if (inviteErr) {
        // "User already registered" não é um erro fatal
        if (inviteErr.message?.toLowerCase().includes('already')) {
          console.log(`Usuário já existe: ${normalEmail}`);
        } else {
          console.error('Erro ao convidar usuário', inviteErr);
        }
      } else {
        console.log(`Convite enviado para ${normalEmail} (plano: ${plan})`);
      }
    }

    console.log(`Webhook processado: ${normalEmail} → ${status} (${plan})`);
    return json({ ok: true, email: normalEmail, status, plan });

  } catch (err) {
    console.error('Erro no webhook', err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
