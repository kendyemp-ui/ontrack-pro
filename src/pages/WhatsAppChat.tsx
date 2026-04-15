import BottomNav from '@/components/BottomNav';
import { chatMessages } from '@/data/mockData';
import { MessageCircle, Copy, Phone } from 'lucide-react';
import { toast } from 'sonner';

const WhatsAppChat = () => {
  const handleCopy = () => {
    navigator.clipboard.writeText('+55 11 99999-0000');
    toast.success('Número copiado!');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-heading font-bold text-foreground">WhatsApp Oficial</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envie por aqui as fotos das suas refeições e receba feedbacks, alertas e lembretes diretamente no WhatsApp.
          </p>
        </div>

        {/* Official Number Card */}
        <div className="glass-card rounded-2xl p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
              <MessageCircle size={22} className="text-primary-foreground" />
            </div>
            <div>
              <p className="font-heading font-semibold text-foreground">Moveon Health</p>
              <p className="text-sm text-muted-foreground">+55 11 99999-0000</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-warning/10">
            <span className="text-xs text-warning font-medium">🔧 Integração em configuração</span>
          </div>

          <button className="w-full h-11 rounded-xl bg-[#25D366] text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]">
            <Phone size={16} />
            Iniciar conversa no WhatsApp
          </button>

          <button
            onClick={handleCopy}
            className="w-full h-11 rounded-xl border border-border text-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-secondary transition-all"
          >
            <Copy size={16} />
            Copiar número
          </button>
        </div>

        {/* Chat Preview */}
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <h2 className="text-base font-heading font-semibold text-foreground mb-3">Preview da Conversa</h2>
          <div className="rounded-2xl overflow-hidden border border-border">
            {/* WhatsApp Header */}
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
                <MessageCircle size={14} className="text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">Moveon Health</p>
                <p className="text-[10px] text-primary-foreground/70">online</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="whatsapp-bg p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 ${
                    msg.type === 'sent' ? 'whatsapp-bubble-sent' : 'whatsapp-bubble-received'
                  }`}>
                    {msg.image && (
                      <div className="bg-muted rounded-lg p-3 mb-1 text-center text-sm">
                        {msg.image}
                      </div>
                    )}
                    {msg.text && (
                      <p className="text-sm text-foreground whitespace-pre-line">{msg.text}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground text-right mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="glass-card rounded-2xl p-5 space-y-3 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <h3 className="text-sm font-heading font-semibold text-foreground">Como funciona?</h3>
          <div className="space-y-2">
            {[
              { emoji: '📸', text: 'Envie fotos das refeições pelo WhatsApp' },
              { emoji: '🤖', text: 'O sistema analisa e estima calorias e macros' },
              { emoji: '📊', text: 'Os dados aparecem automaticamente no dashboard' },
              { emoji: '🔔', text: 'Receba lembretes e alertas pelo WhatsApp' },
              { emoji: '🌙', text: 'Fechamento diário com resumo completo' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span>{item.emoji}</span>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default WhatsAppChat;
