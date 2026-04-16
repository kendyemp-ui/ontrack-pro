import { PatientStatus } from '@/data/proMockData';
import { cn } from '@/lib/utils';

const config: Record<PatientStatus, { label: string; className: string; dot: string }> = {
  aderente: {
    label: 'Aderente',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  atencao: {
    label: 'Atenção',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-500',
  },
  risco: {
    label: 'Em risco',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
    dot: 'bg-red-500',
  },
};

export function StatusBadge({ status, className }: { status: PatientStatus; className?: string }) {
  const c = config[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium', c.className, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  );
}
