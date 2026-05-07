import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import { ProLayout } from '@/components/pro/ProLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/pro/StatusBadge';
import { usePro } from '@/contexts/ProContext';
import { cn } from '@/lib/utils';

type StatusFilter = 'todos' | 'aderente' | 'atencao' | 'risco';

const FILTER_OPTIONS: { id: StatusFilter; label: string; color: string }[] = [
  { id: 'todos', label: 'Todos', color: 'border-border text-foreground' },
  { id: 'aderente', label: 'Aderentes', color: 'border-emerald-500/40 text-emerald-500' },
  { id: 'atencao', label: 'Atenção', color: 'border-amber-500/40 text-amber-500' },
  { id: 'risco', label: 'Em risco', color: 'border-red-500/40 text-red-500' },
];

export default function ProPatients() {
  const { patients, patientsLoading } = usePro();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');

  const filtered = useMemo(() =>
    patients.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search);
      const matchStatus = statusFilter === 'todos' || p.status === statusFilter;
      return matchSearch && matchStatus;
    }), [patients, search, statusFilter]);

  const counts = useMemo(() => ({
    todos: patients.length,
    aderente: patients.filter(p => p.status === 'aderente').length,
    atencao: patients.filter(p => p.status === 'atencao').length,
    risco: patients.filter(p => p.status === 'risco').length,
  }), [patients]);

  return (
    <ProLayout
      title="Pacientes"
      subtitle={`${patients.length} ${patients.length === 1 ? 'paciente cadastrado' : 'pacientes cadastrados'}`}
      actions={
        <Button onClick={() => navigate('/pro/pacientes/novo')} size="sm">
          <UserPlus className="h-4 w-4 mr-1.5" /> Novo paciente
        </Button>
      }
    >
      <Card className="glass-card">
        <div className="p-4 border-b border-border flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {FILTER_OPTIONS.map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium border transition-colors',
                  statusFilter === f.id
                    ? 'bg-foreground text-background border-foreground'
                    : `bg-transparent border-border text-muted-foreground hover:${f.color}`
                )}
              >
                {f.label} <span className="opacity-60 ml-1">{counts[f.id]}</span>
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou WhatsApp..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {patientsLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-sm text-muted-foreground gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando pacientes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {search ? 'Nenhum paciente encontrado.' : 'Nenhum paciente cadastrado ainda.'}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(p => (
              <div
                key={p.id}
                className="px-4 py-3 flex items-center gap-3 hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/pro/pacientes/${p.id}`)}
              >
                <img src={p.avatar} alt={p.name} className="h-10 w-10 rounded-full bg-secondary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{p.phone} · {p.goal}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn(
                    'text-sm font-semibold tabular-nums',
                    p.weeklyAdherence >= 75
                      ? 'text-emerald-400'
                      : p.weeklyAdherence >= 40
                        ? 'text-amber-400'
                        : 'text-red-400'
                  )}>{p.weeklyAdherence}%</p>
                  <p className="text-[11px] text-muted-foreground">{p.lastInteraction}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </ProLayout>
  );
}
