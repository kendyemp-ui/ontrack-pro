import { useParams, useNavigate } from 'react-router-dom';
import { ProLayout } from '@/components/pro/ProLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/pro/StatusBadge';
import { usePro } from '@/contexts/ProContext';
import { weeklyAdherenceTrend, monthlyAdherenceTrend, patientTimeline, TimelineItem } from '@/data/proMockData';
import {
  Flame, TrendingDown, Beef, Wheat, Utensils, MessageCircle, ArrowLeft,
  Image as ImageIcon, Bot, AlertTriangle, RefreshCw, NotebookPen, Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, ReferenceLine, CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';

const timelineIcon: Record<TimelineItem['type'], { icon: any; color: string; bg: string }> = {
  meal_photo: { icon: ImageIcon, color: 'text-accent', bg: 'bg-accent/10' },
  auto_response: { icon: Bot, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  alert: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  substitution: { icon: RefreshCw, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  professional_note: { icon: NotebookPen, color: 'text-foreground', bg: 'bg-secondary' },
};

export default function ProPatientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPatient } = usePro();
  const patient = id ? getPatient(id) : undefined;

  if (!patient) {
    return (
      <ProLayout title="Paciente não encontrado">
        <Button onClick={() => navigate('/pro/dashboard')}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
      </ProLayout>
    );
  }

  const balance = patient.caloriesToday - patient.burnToday;
  const weekly = weeklyAdherenceTrend(patient.weeklyAdherence);
  const monthly = monthlyAdherenceTrend(patient.weeklyAdherence);
  const timeline = patientTimeline(patient.id);
  const diasNaMeta = weekly.filter(w => w.adesao >= 80).length;
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
              <span>{patient.email}</span>
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
            <span className="text-xs text-muted-foreground">% por dia</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
              />
              <ReferenceLine y={80} stroke="hsl(var(--accent))" strokeDasharray="3 3" />
              <Bar dataKey="adesao" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Evolução mensal</h3>
            <span className="text-xs text-muted-foreground">últimos 30 dias</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="adesao" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timeline */}
        <Card className="p-5 glass-card lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4">Timeline de interações via WhatsApp</h3>
          <div className="space-y-4">
            {timeline.map(item => {
              const ic = timelineIcon[item.type];
              return (
                <div key={item.id} className="flex gap-3">
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', ic.bg)}>
                    <ic.icon className={cn('h-4 w-4', ic.color)} />
                  </div>
                  <div className="flex-1 min-w-0 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-medium">{item.title}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-5 glass-card">
          <h3 className="text-sm font-semibold mb-3">Observações do profissional</h3>
          <div className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3 mb-3 leading-relaxed">
            {patient.notes || 'Sem observações registradas.'}
          </div>
          <Button variant="outline" size="sm" className="w-full">
            <NotebookPen className="h-3.5 w-3.5 mr-1.5" /> Registrar nova observação
          </Button>
        </Card>
      </div>
    </ProLayout>
  );
}
