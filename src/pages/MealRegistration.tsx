import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { useApp } from '@/contexts/AppContext';
import { Camera, Image, X } from 'lucide-react';
import { toast } from 'sonner';

const mealTypes = [
  { value: 'cafe', label: 'Café da Manhã' },
  { value: 'almoco', label: 'Almoço' },
  { value: 'jantar', label: 'Jantar' },
  { value: 'lanche', label: 'Lanche' },
];

const MealRegistration = () => {
  const { addMeal } = useApp();
  const [selectedType, setSelectedType] = useState('almoco');
  const [hasImage, setHasImage] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [notes, setNotes] = useState('');

  const mockResult = { calories: 520, protein: 32, carbs: 48 };

  const handleImageUpload = () => {
    setHasImage(true);
    setTimeout(() => setAnalyzed(true), 800);
  };

  const handleSave = () => {
    const typeInfo = mealTypes.find(t => t.value === selectedType)!;
    addMeal({
      id: Date.now().toString(),
      type: selectedType as any,
      typeLabel: typeInfo.label,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      calories: mockResult.calories,
      protein: mockResult.protein,
      carbs: mockResult.carbs,
      image: '🍽️',
      origin: 'App',
      date: '2026-04-15',
    });
    toast.success('Refeição registrada com sucesso!');
    setHasImage(false);
    setAnalyzed(false);
    setNotes('');
  };

  const handleCancel = () => {
    setHasImage(false);
    setAnalyzed(false);
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-heading font-bold text-foreground">Registro de Refeição</h1>
          <p className="text-sm text-muted-foreground mt-1">Registre também pelo app como alternativa ao WhatsApp</p>
        </div>

        {/* Meal Type */}
        <div className="glass-card rounded-2xl p-5 space-y-3 animate-slide-up">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo de Refeição</label>
          <div className="grid grid-cols-2 gap-2">
            {mealTypes.map(t => (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`h-10 rounded-xl text-sm font-medium transition-all ${
                  selectedType === t.value
                    ? 'gradient-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="glass-card rounded-2xl p-5 space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Foto do Prato</label>

          {!hasImage ? (
            <div className="flex gap-3">
              <button
                onClick={handleImageUpload}
                className="flex-1 h-28 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-all"
              >
                <Camera size={24} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Tirar foto</span>
              </button>
              <button
                onClick={handleImageUpload}
                className="flex-1 h-28 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-all"
              >
                <Image size={24} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Galeria</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="w-full h-48 rounded-xl bg-secondary flex items-center justify-center text-4xl">
                🍽️
              </div>
              <button
                onClick={() => { setHasImage(false); setAnalyzed(false); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-foreground/80 text-background flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Analysis Result */}
        {analyzed && (
          <div className="glass-card rounded-2xl p-5 space-y-4 animate-scale-in">
            <h3 className="text-sm font-heading font-semibold text-foreground">Estimativa Nutricional</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-primary/10 rounded-xl p-3 text-center">
                <p className="text-lg font-heading font-bold text-primary">{mockResult.calories}</p>
                <p className="text-[10px] text-muted-foreground">kcal</p>
              </div>
              <div className="bg-accent/10 rounded-xl p-3 text-center">
                <p className="text-lg font-heading font-bold text-accent">{mockResult.protein}g</p>
                <p className="text-[10px] text-muted-foreground">proteína</p>
              </div>
              <div className="bg-warning/10 rounded-xl p-3 text-center">
                <p className="text-lg font-heading font-bold text-warning">{mockResult.carbs}g</p>
                <p className="text-[10px] text-muted-foreground">carboidratos</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground/60 text-center">Análise simulada para demonstração</p>
          </div>
        )}

        {/* Notes */}
        <div className="glass-card rounded-2xl p-5 space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Observações (opcional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex.: comi menos arroz que o normal..."
            className="w-full h-20 px-4 py-3 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <button
            onClick={handleCancel}
            className="flex-1 h-12 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-secondary transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!analyzed}
            className="flex-1 h-12 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-40"
          >
            Salvar Refeição
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default MealRegistration;
