import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProLayout } from '@/components/pro/ProLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/pro/StatusBadge';
import { usePro } from '@/contexts/ProContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Flame, TrendingDown, Beef, Wheat, Utensils, MessageCircle, ArrowLeft,
  NotebookPen, Calendar, Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, ReferenceLine, CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ProDietPlanEditor from '@/components/pro/ProDietPlanEditor';
import PatientDashboardTab from '@/components/pro/PatientDashboardTab';

export default function ProPatientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPatient, professionalId } = usePro();
  const patient = id ? getPatient(id) : undefined;

  const [activeTab, setActiveTab] = useState<'dashboard' | 'resumo' | 'dieta' | 'observacoes'>('dashboard');

  // Observações
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [notes, setNotes] = useState<{ id: string; content: string; created_at: string }[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

  // Dados de gráfico
  const [weeklyData, setWeeklyData] = useState<{ dia: string; adesao: number; meta: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ semana: string; adesao: number }[]>([]);

  useEffect(() => {
    if (!patient?.id) return;
    const loadNotes = async () => {
      setNotesLoading(true);
      const { data } = await supabase
        .from('professional_notes')
        .select('id, content, created_at')
        .eq('client_id', patient.id)
        .order('created_at', { ascending: false });
      setNotes(data || []);
      setNotesLoading(false);
    };
    loadNotes();
  }, [patient?.id]);

  useEffect(() => {
    if (!patient?.id) return;
    const loadChartData = async () => {
      const today = new Date();

      // Últimos 7 dias
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });
      const { data: summaries } = await supabase
        .from('daily_summary')
        .select('summary_date, meal_count')
        .eq('client_id', patient.id)
        .in('summary_date', days);
      const summaryMap = Object.fromEntries((summaries || []).map((s: any) => [s.summary_date, s.meal_count || 0]));
      setWeeklyData(days.map(d => ({
        dia: new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }),
        adesao: (summaryMap[d] || 0) > 0 ? 100 : 0,
        meta: 100,
      })));

      // Últimas 4 semanas
      const weeks = Array.from({ length: 4 }, (_, i) => {
        const start = new Date(today);
        start.setDate(start.getDate() - (3 - i) * 7 - 6);
        const end = new Date(today);
        end.setDate(end.getDate() - (3 - i) * 7);
        return { label: `S${i + 1}`, start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
      });
      const weekResults = await Promise.all(weeks.map(async w => {
        const { data } = await supabase
          .from('daily_summary')
          .select('meal_count')
          .eq('client_id', patient.id)
          .gte('summary_date', w.start)
          .lte('summary_date', w.end);
        const activeDays = (data || []).filter((d: any) => (d.meal_count || 0) > 0).length;
        return { semana: w.label, adesao: Math.round((activeDays / 7) * 100) };
      }));
      setMonthlyData(weekResults);
    };
    loadChartData();
  }, [patient?.id]);

  const handleSaveNote = async () => {
    if (!noteText.trim() || !patient || !professionalId) return;
    setSavingNote(true);
    const { data, error } = await supabase
      .from('professional_notes')
      .insert({ client_id: patient.id, professional_id: professionalId, content: noteText.trim() })
      .select()
      .single();
    if (!error && data) {
      setNotes(prev => [data, ...prev]);
      setNoteText('');
      toast.success('Observação registrada');
    } else {
      toast.error('Erro ao salvar observação');
    }
    setSavingNote(false);
  };

  if (!patient) {
    return (
      <ProLayout title="Paciente não encontrado">
        <Button onClick={() => navigate('/pro/dashboard')}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
      </ProLayout>
    );
  }

  const balance = patient.caloriesToday - patient.burnToday;
  const diasNaMeta = weeklyData.filter(w => w.adesao >= 80).length;
  const diasFora = 7 - diasNaMeta;
  const consistencia = Math.round((diasNaMeta / 7) * 100);

  const stats = [
    { label: 'Calorias hoje', value: patient.caloriesToday, suffix: 'kcal', icon: Flame, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Gasto total', value: patient.burnToday, suffix: 'kcal', icon: TrendingDown, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Saldo do dia', value: balance, suffix: 'kcal', icon: Flame, color: balance < 0 ? 'text-red-400' : 'text-emerald-400', bg: balance < 0 ? 'bg-red-500/10' : 'bg-emerald-500/10', signed: true },
    { label: 'Proteína', value: `${patient.proteinToday}/${patient.proteinTarget}`, suffix: 'g', icon: Beef, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Carboidrato', value: `${patient.carbsToday}/${patient.carbsTarget}`, suffix: 'g', icon: Wheat, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Refeições', value: patient.mealsToday, suffix: 'hoje', icon: Utensils, color: 'text-foreground', bg: 'bg-secondary' },
    { label: 'Última interação', value: patient.lastInteraction, suffix: '', icon: MessageCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', isText: true },
  ];

  return (
    <ProLayout
      title={patient.name}
      subtitle={`${patient.goal} • desde ${new Date(patient.startDate).toLocaleDateString('pt-BR')}`}
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate('/pro/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Voltar
        </Button>
      }
    >
      {/* Header card */}
      <Card className="p-5 glass-card mb-6">
        <div className="flex flex-col md:flex-row gap-5 md:items-center">
          <img src={patient.avatar} alt={patient.name} className="h-20 w-20 rounded-2xl bg-secondary" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-semibold tracking-tight">{patient.name}</h2>
              <StatusBadge status={patient.status} />
            </div>
            <p className="text-sm text-muted-foreground mb-2">{patient.goal}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {patient.phone}</span>
              {patient.email && <span>{patient.email}</span>}
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Início {new Date(patient.startDate).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          <div className="md:text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Adesão semanal</p>
            <p className={cn(
              'text-3xl font-semibold tabular-nums',
              patient.weeklyAdherence >= 75 ? 'text-emerald-400' : patient.weeklyAdherence >= 50 ? 'text-amber-400' : 'text-red-400'
            )}>{patient.weeklyAdherence}%</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 p-1 mb-6 rounded-xl bg-secondary/40 border border-border">
        {[
          { id: 'resumo', label: 'Resumo' },
          { id: 'dieta', label: 'Plano Alimentar' },
          { id: 'observacoes', label: 'Observações' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 h-9 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'resumo' && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            {stats.map((s, i) => (
              <Card key={i} className="p-4 glass-card">
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center mb-2', s.bg)}>
                  <s.icon className={cn('h-4 w-4', s.color)} />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
                {s.isText ? (
                  <p className="text-sm font-semibold truncate">{s.value}</p>
                ) : (
                  <p className={cn('text-lg font-semibold tabular-nums', s.color)}>
                    {s.signed && typeof s.value === 'number' && s.value > 0 && '+'}
                    {s.value}
                    <span className="text-xs text-muted-foreground font-normal ml-1">{s.suffix}</span>
                  </p>
                )}
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card className="p-5 glass-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Adesão semanal</h3>
                <span className="text-xs text-muted-foreground">% por dia (últimos 7)</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <ReferenceLine y={80} stroke="hsl(var(--accent))" strokeDasharray="3 3" />
                  <Bar dataKey="adesao" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-5 glass-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Evolução por semana</h3>
                <span className="text-xs text-muted-foreground">últimas 4 semanas</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="semana" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="adesao" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <Card className="p-4 glass-card">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Dias dentro da meta</p>
              <p className="text-2xl font-semibold text-emerald-400 tabular-nums">{diasNaMeta} / 7</p>
            </Card>
            <Card className="p-4 glass-card">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Dias fora da meta</p>
              <p className="text-2xl font-semibold text-red-400 tabular-nums">{diasFora} / 7</p>
            </Card>
            <Card className="p-4 glass-card">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Consistência</p>
              <p className="text-2xl font-semibold tabular-nums">{consistencia}%</p>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'dieta' && (
        <ProDietPlanEditor clientId={patient.id} />
      )}

      {activeTab === 'observacoes' && (
        <Card className="p-5 glass-card">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <NotebookPen className="h-4 w-4" /> Observações profissionais
          </h3>
          <div className="space-y-3 mb-4">
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Registre uma observação sobre este paciente..."
              className="w-full rounded-lg border border-border bg-secondary/30 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20"
              rows={3}
            />
            <Button onClick={handleSaveNote} disabled={savingNote || !noteText.trim()} size="sm">
              {savingNote ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Salvar observação
            </Button>
          </div>
          {notesLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="animate-spin h-4 w-4" /> Carregando...
            </div>
          ) : notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma observação registrada ainda.</p>
          ) : (
            <div className="space-y-3">
              {notes.map(n => (
                <div key={n.id} className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-sm">{n.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    {new Date(n.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </ProLayout>
  );
}
