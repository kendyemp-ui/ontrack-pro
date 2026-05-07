import { useState, useMemo } from 'react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle2, AlertTriangle, AlertOctagon, CalendarX, TrendingUp, Search, MessageCircle, ChevronRight, Bell, Loader2 } from 'lucide-react';
import { ProLayout } from '@/components/pro/ProLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/pro/StatusBadge';
import { usePro } from '@/contexts/ProContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Filter = 'todos' | 'aderente' | 'atencao' | 'risco' | 'sem-registro';

export default function ProDashboard() {
  const { patients, kpis } = usePro();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('todos');
  const [search, setSearch] = useState('');
  const [sendingBulk, setSendingBulk] = useState(false);

  const sendBulkReminder = async () => {
    const semRegistro = patients.filter(p => !p.registeredToday);
    if (semRegistro.length === 0) { toast.info('Todos os pacientes já registraram hoje!'); return; }
    if (!confirm(`Enviar lembrete pelo WhatsApp para ${semRegistro.length} paciente(s) sem registro hoje?`)) return;
    setSendingBulk(true);
    let ok = 0; let fail = 0;
    await Promise.allSettled(semRegistro.map(async p => {
      const firstName = p.name.split(' ')[0];
      const message = `Olá ${firstName}! 👋 Lembrete do Grove: não esqueça de registrar suas refeições de hoje. É rápido — mande uma foto ou escreva o que comeu! 🥗`;
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: { to_phone: p.phone, message, client_id: p.id },
      });
      if (error || data?.error) fail++; else ok++;
    }));
    setSendingBulk(false);
    if (ok > 0) toast.success(`${ok} lembrete(s) enviado(s) com sucesso!`);
    if (fail > 0) toast.error(`${fail} falha(s) no envio.`);
  };

  const filtered = useMemo(() => {
    return patients.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === 'todos') return true;
      if (filter === 'sem-registro') return !p.registeredToday;
      return p.status === filter;
    });
  }, [patients, filter, search]);

  type KpiFilter = Filter | null;
  const kpiCards: { label: string; value: number | string; icon: React.ElementType; accent: string; bg: string; filterKey: KpiFilter; ring: string }[] = [
    { label: 'Clientes ativos', value: kpis.total, icon: Users, accent: 'text-foreground', bg: 'bg-secondary', filterKey: 'todos', ring: 'ring-border' },
    { label: 'Boa adesão', value: kpis.aderentes, icon: CheckCircle2, accent: 'text-emerald-400', bg: 'bg-emerald-500/10', filterKey: 'aderente', ring: 'ring-emerald-500/40' },
    { label: 'Em atenção', value: kpis.atencao, icon: AlertTriangle, accent: 'text-amber-400', bg: 'bg-amber-500/10', filterKey: 'atencao', ring: 'ring-amber-500/40' },
    { label: 'Em risco', value: kpis.risco, icon: AlertOctagon, accent: 'text-red-400', bg: 'bg-red-500/10', filterKey: 'risco', ring: 'ring-red-500/40' },
    { label: 'Sem registro hoje', value: kpis.semRegistro, icon: CalendarX, accent: 'text-muted-foreground', bg: 'bg-secondary', filterKey: 'sem-registro', ring: 'ring-border' },
    { label: 'Adesão média', value: `${kpis.mediaAdesao}%`, icon: TrendingUp, accent: 'text-accent', bg: 'bg-accent/10', filterKey: null, ring: 'ring-accent/30' },
  ];

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'todos', label: 'Todos', count: kpis.total },
    { id: 'aderente', label: 'Aderentes', count: kpis.aderentes },
    { id: 'atencao', label: 'Atenção', count: kpis.atencao },
    { id: 'risco', label: 'Risco', count: kpis.risco },
    { id: 'sem-registro', label: 'Sem registro hoje', count: kpis.semRegistro },
  ];

  return (
    <ProLayout
      title="Visão geral"
      subtitle="Acompanhe sua carteira de pacientes em tempo real"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={sendBulkReminder}
            disabled={sendingBulk}
            title={`Enviar lembrete para ${kpis.semRegistro} pacientes sem registro hoje`}
          >
            {sendingBulk
              ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              : <Bell className="h-4 w-4 mr-1.5" />}
            Lembrar {kpis.semRegistro > 0 ? `(${kpis.semRegistro})` : 'todos'}
          </Button>
          <Button onClick={() => navigate('/pro/pacientes/novo')} size="sm">Novo paciente</Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {kpiCards.map((k, i) => (
          <Card
            key={i}
            onClick={() => k.filterKey && setFilter(k.filterKey)}
            className={cn(
              'p-4 glass-card transition-all',
              k.filterKey ? 'cursor-pointer hover:shadow-md' : '',
              k.filterKey && filter === k.filterKey ? `ring-2 ${k.ring}` : ''
            )}
          >
            <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center mb-3', k.bg)}>
              <k.icon className={cn('h-4 w-4', k.accent)} />
            </div>
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className="text-2xl font-semibold tracking-tight">{k.value}</p>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors border',
                  filter === f.id
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/40'
                )}
              >
                {f.label} <span className="opacity-60 ml-1">{f.count}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
          <div className="col-span-3">Paciente</div>
          <div className="col-span-2">Objetivo</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Adesão semanal</div>
          <div className="col-span-2">Última interação</div>
          <div className="col-span-1 text-right">Ações</div>
        </div>

        <div className="divide-y divide-border">
          {filtered.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Nenhum paciente encontrado.
            </div>
          )}
          {filtered.map(p => (
            <div
              key={p.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors items-center cursor-pointer"
              onClick={() => navigate(`/pro/pacientes/${p.id}`)}
            >
              <div className="col-span-3 flex items-center gap-3 min-w-0">
                <img src={p.avatar} alt={p.name} className="h-9 w-9 rounded-full bg-secondary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" /> WhatsApp
                  </p>
                </div>
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">{p.goal}</div>
              <div className="col-span-2"><StatusBadge status={p.status} /></div>
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden max-w-[100px]">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        p.weeklyAdherence >= 75 ? 'bg-emerald-500' : p.weeklyAdherence >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      )}
                      style={{ width: `${p.weeklyAdherence}%` }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">{p.weeklyAdherence}%</span>
                </div>
              </div>
              <div className="col-span-2 text-xs text-muted-foreground">{p.lastInteraction}</div>
              <div className="col-span-1 flex justify-end">
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  Ver perfil <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </ProLayout>
  );
}
