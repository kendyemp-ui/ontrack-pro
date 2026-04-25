import { useNavigate } from 'react-router-dom';
import { ProLayout } from '@/components/pro/ProLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePro } from '@/contexts/ProContext';
import { CalendarX, TrendingDown, Flame, Beef, MessageCircleOff, ChevronRight, NotebookPen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Patient } from '@/data/proMockData';

type Priority = 'alta' | 'media' | 'baixa';

interface AlertBlock {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bg: string;
  filter: (p: Patient) => boolean;
  reason: (p: Patient) => string;
  priority: (p: Patient) => Priority;
}

const blocks: AlertBlock[] = [
  {
    id: 'sem-registro',
    title: 'Sem refeição hoje',
    description: 'Pacientes que ainda não registraram nada hoje',
    icon: CalendarX,
    color: 'text-amber-400', bg: 'bg-amber-500/10',
    filter: p => !p.registeredToday,
    reason: () => 'Nenhuma refeição registrada nas últimas 24h',
    priority: p => p.status === 'risco' ? 'alta' : 'media',
  },
  {
    id: 'baixa-adesao',
    title: 'Baixa adesão semanal',
    description: 'Adesão abaixo de 60% nos últimos 7 dias',
    icon: TrendingDown,
    color: 'text-red-400', bg: 'bg-red-500/10',
    filter: p => p.weeklyAdherence < 60,
    reason: p => `Adesão de apenas ${p.weeklyAdherence}% na semana`,
    priority: p => p.weeklyAdherence < 40 ? 'alta' : 'media',
  },
  {
    id: 'excedendo',
    title: 'Excedendo metas calóricas',
    description: 'Pacientes consumindo acima do alvo com frequência',
    icon: Flame,
    color: 'text-orange-400', bg: 'bg-orange-500/10',
    filter: p => p.caloriesToday > p.caloriesTarget * 1.05,
    reason: p => `${Math.round(((p.caloriesToday / p.caloriesTarget) - 1) * 100)}% acima da meta hoje`,
    priority: () => 'media',
  },
  {
    id: 'baixa-proteina',
    title: 'Abaixo da proteína planejada',
    description: 'Consumo de proteína insuficiente',
    icon: Beef,
    color: 'text-purple-400', bg: 'bg-purple-500/10',
    filter: p => p.registeredToday && p.proteinToday < p.proteinTarget * 0.7,
    reason: p => `${p.proteinToday}g de ${p.proteinTarget}g previstos`,
    priority: () => 'media',
  },
  {
    id: 'sem-interacao',
    title: 'Sem interação recente',
    description: 'Mais de 24h sem comunicação no WhatsApp',
    icon: MessageCircleOff,
    color: 'text-muted-foreground', bg: 'bg-secondary',
    filter: p => !p.lastInteractionAt || Date.now() - new Date(p.lastInteractionAt).getTime() > 24 * 3600000,
    reason: p => `Última interação ${p.lastInteraction}`,
    priority: p => !p.lastInteractionAt || Date.now() - new Date(p.lastInteractionAt).getTime() > 48 * 3600000 ? 'alta' : 'baixa',
  },
];

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  alta: { label: 'Alta', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  media: { label: 'Média', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  baixa: { label: 'Baixa', className: 'bg-secondary text-muted-foreground border-border' },
};

export default function ProAlerts() {
  const { patients } = usePro();
  const navigate = useNavigate();

  const totalAlerts = blocks.reduce((s, b) => s + patients.filter(b.filter).length, 0);

  return (
    <ProLayout title="Alertas e acompanhamento" subtitle={`${totalAlerts} alertas ativos na sua carteira`}>
      <div className="space-y-4">
        {blocks.map(block => {
          const list = patients.filter(block.filter);
          if (list.length === 0) return null;
          return (
            <Card key={block.id} className="glass-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', block.bg)}>
                  <block.icon className={cn('h-4 w-4', block.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold">{block.title}</h3>
                  <p className="text-xs text-muted-foreground">{block.description}</p>
                </div>
                <span className="text-2xl font-semibold tabular-nums">{list.length}</span>
              </div>
              <div className="divide-y divide-border">
                {list.map(p => {
                  const prio = block.priority(p);
                  return (
                    <div key={p.id} className="px-4 py-3 flex flex-col md:flex-row md:items-center gap-3 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img src={p.avatar} alt={p.name} className="h-9 w-9 rounded-full bg-secondary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{block.reason(p)}</p>
                        </div>
                      </div>
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium uppercase tracking-wider', priorityConfig[prio].className)}>
                        {priorityConfig[prio].label}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline" size="sm"
                          onClick={() => toast({ title: 'Observação', description: `Modal para registrar observação de ${p.name}.` })}
                        >
                          <NotebookPen className="h-3.5 w-3.5 mr-1" /> Observar
                        </Button>
                        <Button size="sm" onClick={() => navigate(`/pro/pacientes/${p.id}`)}>
                          Abrir <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}

        {totalAlerts === 0 && (
          <Card className="p-12 glass-card text-center">
            <p className="text-sm text-muted-foreground">Nenhum alerta ativo no momento. Carteira saudável.</p>
          </Card>
        )}
      </div>
    </ProLayout>
  );
}
