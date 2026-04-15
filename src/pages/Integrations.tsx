import BottomNav from '@/components/BottomNav';
import { integrations, dailyBurn } from '@/data/mockData';
import { Activity } from 'lucide-react';

const statusLabels: Record<string, { label: string; className: string }> = {
  connected: { label: 'Conectado', className: 'bg-primary/10 text-primary' },
  soon: { label: 'Disponível em breve', className: 'bg-secondary text-muted-foreground' },
  config: { label: 'Em configuração', className: 'bg-warning/10 text-warning' },
  disconnected: { label: 'Não conectado', className: 'bg-destructive/10 text-destructive' },
};

const Integrations = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-heading font-bold text-foreground">Integrações</h1>
          <p className="text-sm text-muted-foreground mt-1">Conecte dispositivos e plataformas para enriquecer seus dados</p>
        </div>

        {/* Simulated wearable data */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-primary" />
            <h2 className="text-base font-heading font-semibold text-foreground">Dados Simulados do Dia</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-primary/10 rounded-xl p-3 text-center">
              <p className="text-lg font-heading font-bold text-primary">{dailyBurn.total}</p>
              <p className="text-[10px] text-muted-foreground">kcal gastas</p>
            </div>
            <div className="bg-accent/10 rounded-xl p-3 text-center">
              <p className="text-lg font-heading font-bold text-accent">{dailyBurn.steps.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">passos</p>
            </div>
            <div className="bg-warning/10 rounded-xl p-3 text-center">
              <p className="text-lg font-heading font-bold text-warning">{dailyBurn.activityDuration}</p>
              <p className="text-[10px] text-muted-foreground">{dailyBurn.activity}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/60 text-center mt-3">Dados simulados para demonstração</p>
        </div>

        {/* Integration List */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          {integrations.map(integration => {
            const status = statusLabels[integration.status];
            return (
              <div key={integration.name} className="glass-card rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                  {integration.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{integration.name}</p>
                  <p className="text-xs text-muted-foreground">{integration.description}</p>
                  <span className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${status.className}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Integrations;
