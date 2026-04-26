import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { useApp } from '@/contexts/AppContext';
import { Save, Check, Target, UtensilsCrossed, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { objectiveLabels } from '@/lib/goalStatus';
import type { DietObjective } from '@/data/mockData';

const objectiveOptions: { value: DietObjective; label: string; hint: string }[] = [
  { value: 'lose', label: 'Perder peso', hint: 'déficit moderado' },
  { value: 'maintain', label: 'Manter peso', hint: 'próximo do equilíbrio' },
  { value: 'gain', label: 'Ganhar massa', hint: 'leve superávit' },
];

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

  const setObjective = (value: DietObjective) => {
    setForm(prev => ({ ...prev, objective: value }));
    setSaved(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-heading font-bold text-foreground">Dieta / Meta Nutricional</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure sua meta diária para acompanhar pelo dashboard</p>
        </div>

        {/* Objetivo atual */}
        <div className="glass-card rounded-2xl p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-accent" strokeWidth={1.5} />
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Objetivo atual</label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {objectiveOptions.map(opt => {
              const active = form.objective === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setObjective(opt.value)}
                  className={`rounded-xl border px-3 py-3 text-left transition-all active:scale-[0.98] ${
                    active
                      ? 'border-accent bg-accent/10 text-foreground shadow-sm'
                      : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <p className="text-xs font-semibold leading-tight">{opt.label}</p>
                  <p className="text-[10px] mt-1 opacity-70 leading-tight">{opt.hint}</p>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            O objetivo selecionado controla como o dashboard interpreta seu saldo calórico — cores e mensagens
            indicam se você está alinhado com <span className="text-foreground font-medium">{objectiveLabels[form.objective]}</span>.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
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
