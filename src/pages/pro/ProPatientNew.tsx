import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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

export default function ProPatientNew() {
  const navigate = useNavigate();
  const { addPatient } = usePro();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', goal: '',
    caloriesTarget: 2000, proteinTarget: 130, carbsTarget: 220,
    notes: '',
    status: 'aderente' as PatientStatus,
    startDate: new Date().toISOString().slice(0, 10),
  });

  const update = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error('Nome e WhatsApp são obrigatórios.');
      return;
    }
    setLoading(true);
    const result = await addPatient({ name: form.name, phone: form.phone, email: form.email });
    setLoading(false);
    if (result) {
      toast.success('Paciente adicionado com sucesso!');
      navigate(`/pro/pacientes/${result.id}`);
    }
  };

  return (
    <ProLayout title="Novo paciente" subtitle="Cadastre um novo cliente na sua carteira">
      <form onSubmit={handleSubmit} className="max-w-3xl">
        <Card className="p-6 glass-card space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Identificação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input id="name" value={form.name} onChange={e => update('name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp *</Label>
                <Input id="phone" placeholder="+55 11 99999-9999" value={form.phone} onChange={e => update('phone', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Plano nutricional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="goal">Objetivo</Label>
                <Input id="goal" placeholder="Ex: Perda de gordura, Hipertrofia, Maratona" value={form.goal} onChange={e => update('goal', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cal">Meta calórica (kcal)</Label>
                <Input id="cal" type="number" value={form.caloriesTarget} onChange={e => update('caloriesTarget', Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prot">Meta de proteína (g)</Label>
                <Input id="prot" type="number" value={form.proteinTarget} onChange={e => update('proteinTarget', Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carb">Meta de carboidrato (g)</Label>
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
              <div className="space-y-2">
                <Label htmlFor="start">Data de início</Label>
                <Input id="start" type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Observações clínicas</h3>
            <Textarea
              rows={4}
              placeholder="Alergias, restrições, comorbidades, contexto relevante..."
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => navigate('/pro/dashboard')} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Salvar paciente
            </Button>
          </div>
        </Card>
      </form>
    </ProLayout>
  );
}
