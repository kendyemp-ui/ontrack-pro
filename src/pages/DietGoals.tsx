import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { useApp } from '@/contexts/AppContext';
import { Save, Check } from 'lucide-react';
import { toast } from 'sonner';

const DietGoals = () => {
  const { goal, updateGoal } = useApp();
  const [form, setForm] = useState({ ...goal });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateGoal(form);
    setSaved(true);
    toast.success('Meta atualizada com sucesso!');
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-heading font-bold text-foreground">Dieta / Meta Nutricional</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure sua meta diária para acompanhar pelo dashboard</p>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-5 animate-slide-up">
          <Field label="Nome do Plano" value={form.name} onChange={v => update('name', v)} type="text" />
          <Field label="Calorias Alvo (kcal/dia)" value={String(form.caloriesTarget)} onChange={v => update('caloriesTarget', Number(v))} type="number" />
          <Field label="Proteína Alvo (g/dia)" value={String(form.proteinTarget)} onChange={v => update('proteinTarget', Number(v))} type="number" />
          <Field label="Carboidrato Alvo (g/dia)" value={String(form.carbsTarget)} onChange={v => update('carbsTarget', Number(v))} type="number" />
          <Field label="Data de Início" value={form.startDate} onChange={v => update('startDate', v)} type="date" />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Observações</label>
            <textarea
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
              className="w-full h-20 px-4 py-3 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] animate-slide-up"
          style={{ animationDelay: '0.15s' }}
        >
          {saved ? <Check size={18} /> : <Save size={18} />}
          {saved ? 'Salvo!' : 'Salvar Alterações'}
        </button>
      </div>
      <BottomNav />
    </div>
  );
};

const Field = ({ label, value, onChange, type }: { label: string; value: string; onChange: (v: string) => void; type: string }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
    />
  </div>
);

export default DietGoals;
