import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, User, Target, NotebookPen, CheckCircle2 } from 'lucide-react';
import { ProLayout } from '@/components/pro/ProLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePro } from '@/contexts/ProContext';
import { PatientStatus } from '@/data/proMockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type WizardStep = 1 | 2 | 3;

const STEPS = [
  { id: 1, label: 'Contato', icon: User },
  { id: 2, label: 'Plano', icon: Target },
  { id: 3, label: 'Clínico', icon: NotebookPen },
] as const;

export default function ProPatientNew() {
  const navigate = useNavigate();
  const { addPatient } = usePro();
  const [step, setStep] = useState<WizardStep>(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    goal: '',
    caloriesTarget: 2000, proteinTarget: 130, carbsTarget: 220,
    notes: '',
    status: 'aderente' as PatientStatus,
    startDate: new Date().toISOString().slice(0, 10),
  });

  const update = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  const validateStep1 = () => {
    if (!form.name.trim()) { toast.error('Nome é obrigatório.'); return false; }
    if (!form.phone.trim()) { toast.error('WhatsApp é obrigatório.'); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep(s => Math.min(s + 1, 3) as WizardStep);
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1) as WizardStep);

  const handleSubmit = async () => {
    setLoading(true);
    const result = await addPatient({ name: form.name, phone: form.phone, email: form.email });
    setLoading(false);
    if (result) {
      toast.success('Paciente adicionado com sucesso!');
      navigate(`/pro/pacientes/${result.id}`);
    }
  };

  return (
    <ProLayout title="Novo paciente" subtitle="Preencha os dados em 3 etapas">
      <div className="max-w-2xl space-y-6">

        {/* Progress */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const done = step > s.id;
            const active = step === s.id;
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <button
                  onClick={() => done ? setStep(s.id as WizardStep) : undefined}
                  className={cn(
                    'flex flex-col items-center gap-1.5 flex-1',
                    done ? 'cursor-pointer' : 'cursor-default'
                  )}
                >
                  <div className={cn(
                    'h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all',
                    active ? 'border-primary bg-primary text-white' :
                    done ? 'border-primary bg-primary/10 text-primary' :
                    'border-border bg-background text-muted-foreground'
                  )}>
                    {done ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                  </div>
                  <span className={cn(
                    'text-[10px] font-medium uppercase tracking-wider hidden sm:block',
                    active ? 'text-primary' : done ? 'text-primary/70' : 'text-muted-foreground'
                  )}>{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    'h-px flex-1 mx-1 transition-colors',
                    step > s.id ? 'bg-primary/40' : 'bg-border'
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step cards */}
        <Card className="p-6 glass-card">
          {/* Step 1 — Contato */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold mb-1">Dados de contato</h3>
                <p className="text-sm text-muted-foreground">Nome e WhatsApp são obrigatórios para vincular o paciente.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input id="name" placeholder="Ex: Maria Silva" value={form.name} onChange={e => update('name', e.target.value)} autoFocus />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp *</Label>
                  <Input id="phone" placeholder="+55 11 99999-9999" value={form.phone} onChange={e => update('phone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail <span className="text-muted-foreground">(opcional)</span></Label>
                  <Input id="email" type="email" placeholder="maria@email.com" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start">Data de início</Label>
                  <Input id="start" type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Plano nutricional */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold mb-1">Plano nutricional</h3>
                <p className="text-sm text-muted-foreground">Defina o objetivo e as metas diárias do paciente.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="goal">Objetivo</Label>
                  <Input id="goal" placeholder="Ex: Perda de gordura, Hipertrofia, Manutenção" value={form.goal} onChange={e => update('goal', e.target.value)} autoFocus />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cal">Meta calórica (kcal/dia)</Label>
                  <Input id="cal" type="number" value={form.caloriesTarget} onChange={e => update('caloriesTarget', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prot">Proteína (g/dia)</Label>
                  <Input id="prot" type="number" value={form.proteinTarget} onChange={e => update('proteinTarget', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carb">Carboidrato (g/dia)</Label>
                  <Input id="carb" type="number" value={form.carbsTarget} onChange={e => update('carbsTarget', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status inicial</Label>
                  <Select value={form.status} onValueChange={(v: PatientStatus) => update('status', v)}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aderente">Aderente</SelectItem>
                      <SelectItem value="atencao">Atenção</SelectItem>
                      <SelectItem value="risco">Em risco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Clínico */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold mb-1">Observações clínicas</h3>
                <p className="text-sm text-muted-foreground">Alergias, restrições, comorbidades ou contexto relevante para o atendimento.</p>
              </div>
              <Textarea
                rows={6}
                placeholder="Ex: Intolerância à lactose, hipertensão, histórico de hipoglicemia, pratica musculação 4x por semana..."
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                autoFocus
              />
              {/* Resumo do que foi preenchido */}
              <div className="rounded-xl bg-secondary/50 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resumo</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-foreground">
                  <span className="text-muted-foreground">Nome</span><span className="font-medium truncate">{form.name}</span>
                  <span className="text-muted-foreground">WhatsApp</span><span className="font-medium">{form.phone}</span>
                  <span className="text-muted-foreground">Objetivo</span><span className="font-medium">{form.goal || '—'}</span>
                  <span className="text-muted-foreground">Meta</span><span className="font-medium">{form.caloriesTarget} kcal · {form.proteinTarget}g P</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 justify-between pt-6 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={step === 1 ? () => navigate('/pro/dashboard') : handleBack}>
              {step === 1 ? 'Cancelar' : 'Voltar'}
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext}>
                Próximo →
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Salvar paciente
              </Button>
            )}
          </div>
        </Card>
      </div>
    </ProLayout>
  );
}
