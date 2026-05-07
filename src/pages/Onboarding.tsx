import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, MessageCircle, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GroveIcon } from '@/components/GroveIcon';

const steps = [
  {
    icon: Target,
    emoji: '🎯',
    title: 'Defina sua meta',
    desc: 'Primeiro configure seu objetivo — emagrecer, hipertrofia ou manutenção — e o Grove calcula as calorias ideais para você.',
    cta: 'Entendi',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: MessageCircle,
    emoji: '📸',
    title: 'Registre pelo WhatsApp',
    desc: 'Mande uma foto da sua refeição pelo WhatsApp do Grove. A IA identifica os alimentos e lança as calorias automaticamente — sem digitar nada.',
    cta: 'Ótimo!',
    color: 'bg-[#25D366]/10 text-[#25D366]',
  },
  {
    icon: TrendingUp,
    emoji: '📊',
    title: 'Acompanhe sua evolução',
    desc: 'Na aba Evolução você vê seus macros do dia, gráficos históricos e insights personalizados sobre sua alimentação.',
    cta: 'Começar agora',
    color: 'bg-accent/10 text-accent',
    isLast: true,
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const current = steps[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      localStorage.setItem('grove-onboarded', '1');
      navigate('/diet'); // vai para configurar meta
    }
  };

  const handleSkip = () => {
    localStorage.setItem('grove-onboarded', '1');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between px-6 py-12">
      {/* Logo + skip */}
      <div className="w-full flex items-center justify-between">
        <GroveIcon size={28} wordmark wordmarkSize={16} />
        <button
          onClick={handleSkip}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Pular
        </button>
      </div>

      {/* Content */}
      <div className="w-full max-w-sm flex flex-col items-center text-center gap-8 flex-1 justify-center">
        {/* Illustration */}
        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl ${current.color.replace('text-', 'bg-').split(' ')[0]} `}>
          <span className="text-5xl">{current.emoji}</span>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-2xl font-heading font-bold text-foreground">{current.title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{current.desc}</p>
        </div>

        {/* CTA */}
        <button
          onClick={handleNext}
          className="w-full h-12 rounded-2xl gradient-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
        >
          {current.cta}
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === step ? 'w-6 h-2 bg-primary' : i < step ? 'w-2 h-2 bg-primary/40' : 'w-2 h-2 bg-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Onboarding;
