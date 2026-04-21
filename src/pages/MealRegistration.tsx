import BottomNav from '@/components/BottomNav';
import { MessageCircle, Camera, Type, Activity, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

const MealRegistration = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-heading font-bold text-foreground">Como registrar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Todo registro acontece pelo WhatsApp — é mais rápido e tudo cai automaticamente no seu painel.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-1">
            <Camera size={14} className="text-accent" />
            <h2 className="text-sm font-heading font-semibold uppercase tracking-wider">Refeições</h2>
          </div>
          <ItemRow icon={<Type size={14} />} title="Por texto" desc='Ex.: "almoço: arroz, feijão e frango"' />
          <ItemRow icon={<Camera size={14} />} title="Por foto" desc="Tire uma foto do prato e envie no WhatsApp" />
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-accent" />
            <h2 className="text-sm font-heading font-semibold uppercase tracking-wider">Atividades físicas</h2>
          </div>
          <ItemRow icon={<Type size={14} />} title="Por texto" desc='Ex.: "corri 5km", "fiz 40min de musculação"' />
          <ItemRow icon={<Camera size={14} />} title="Print de smartwatch" desc="Apple Watch, Garmin, Strava ou app esportivo" />
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-accent" />
            <h2 className="text-sm font-heading font-semibold uppercase tracking-wider">Substituições</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Pergunte algo como "me sugere substituição para o arroz" e receba 3 opções equivalentes.
          </p>
        </div>

        <Link
          to="/whatsapp"
          className="w-full h-12 rounded-xl bg-[#25D366] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
        >
          <MessageCircle size={16} />
          Abrir WhatsApp
        </Link>
      </div>
      <BottomNav />
    </div>
  );
};

const ItemRow = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground mt-0.5">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  </div>
);

export default MealRegistration;
