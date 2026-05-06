import { ProLayout } from '@/components/pro/ProLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Smartphone, Bot, Bell, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProWhatsApp() {
  return (
    <ProLayout title="Integração WhatsApp" subtitle="O canal principal de interação com seus pacientes">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 glass-card lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <MessageCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold">WhatsApp Business oficial</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Conectado
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Número oficial: <span className="font-mono text-foreground">+55 11 4002-8922</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline">Reconectar integração</Button>
                <Button size="sm" variant="ghost">Copiar número</Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 glass-card">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Mensagens hoje</p>
          <p className="text-3xl font-semibold tabular-nums">428</p>
          <p className="text-xs text-emerald-400 mt-1">+12% vs ontem</p>
        </Card>
      </div>

      {/* Flow */}
      <Card className="p-5 glass-card mb-6">
        <h3 className="text-sm font-semibold mb-4">Como funciona o fluxo</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { icon: Smartphone, title: '1. Paciente envia', desc: 'Foto da refeição via WhatsApp' },
            { icon: Bot, title: '2. Sistema interpreta', desc: 'IA estima nutrientes e calorias' },
            { icon: Bell, title: '3. Dashboard recebe', desc: 'Você vê os dados em tempo real' },
            { icon: CheckCircle2, title: '4. Resposta automática', desc: 'Paciente recebe feedback no WhatsApp' },
          ].map((s, i, arr) => (
            <div key={i} className="relative">
              <div className="p-3 rounded-lg bg-secondary/40 border border-border h-full">
                <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                  <s.icon className="h-4 w-4 text-accent" />
                </div>
                <p className="text-sm font-medium mb-0.5">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              {i < arr.length - 1 && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Conversation preview */}
      <Card className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">Prévia da conversa</p>
            <p className="text-xs text-muted-foreground">Exemplo do feedback automático ao paciente</p>
          </div>
        </div>
        <div className="whatsapp-bg p-6 space-y-3 min-h-[400px]">
          <Bubble side="received">
            <p className="text-xs text-muted-foreground mb-1">Marina • 12:34</p>
            <div className="h-32 w-48 rounded-lg bg-secondary mb-2 flex items-center justify-center text-xs text-muted-foreground">
              [foto do almoço]
            </div>
            <p className="text-sm">Bora! Almoço de hoje 🍽️</p>
          </Bubble>

          <Bubble side="sent">
            <p className="text-xs opacity-70 mb-1">Grove • 12:34</p>
            <p className="text-sm leading-relaxed">
              Boa, Marina! Identifiquei <strong>frango grelhado, arroz integral e salada</strong>.
              <br /><br />
              📊 Estimativa: <strong>540 kcal</strong> • 42g proteína • 58g carbo
            </p>
          </Bubble>

          <Bubble side="sent">
            <p className="text-sm leading-relaxed">
              Você ainda tem <strong>480 kcal</strong> para a meta de hoje 💪
              <br />
              Faltam 30g de proteína. Que tal incluir um iogurte no lanche da tarde?
            </p>
          </Bubble>

          <Bubble side="received">
            <p className="text-sm">Posso trocar o arroz por batata doce no jantar?</p>
          </Bubble>

          <Bubble side="sent">
            <p className="text-sm leading-relaxed">
              Pode sim! 100g de batata doce ≈ 100g de arroz integral em carbo.
              Mantém o equilíbrio do plano ✅
            </p>
          </Bubble>
        </div>
      </Card>
    </ProLayout>
  );
}

function Bubble({ side, children }: { side: 'sent' | 'received'; children: React.ReactNode }) {
  return (
    <div className={cn('flex', side === 'sent' ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[75%] rounded-2xl px-3.5 py-2.5 shadow-sm',
        side === 'sent' ? 'whatsapp-bubble-sent rounded-tr-sm' : 'whatsapp-bubble-received rounded-tl-sm'
      )}>
        {children}
      </div>
    </div>
  );
}
