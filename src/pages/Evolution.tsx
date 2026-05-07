import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import {
  TrendingUp, Scale, Flame, Droplets, Activity, Zap, FlaskConical,
  CheckCircle2, AlertCircle, AlertTriangle, Upload, Link as LinkIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Tipos ────────────────────────────────────────────────────────────────────
interface HealthMarkers {
  exam_date: string | null;
  glucose: number | null;
  hba1c: number | null;
  ldl: number | null;
  hdl: number | null;
  total_cholesterol: number | null;
  triglycerides: number | null;
  uric_acid: number | null;
  creatinine: number | null;
  tsh: number | null;
  hemoglobin: number | null;
}

type MarkerStatus = 'ok' | 'borderline' | 'high' | 'low';

interface MarkerDef {
  key: keyof HealthMarkers;
  label: string;
  unit: string;
  evaluate: (v: number) => MarkerStatus;
}

// ── Definições de referência clínica ─────────────────────────────────────────
const MARKERS: MarkerDef[] = [
  { key: 'glucose',           label: 'Glicemia',       unit: 'mg/dL', evaluate: v => v < 100 ? 'ok' : v < 126 ? 'borderline' : 'high' },
  { key: 'hba1c',             label: 'HbA1c',          unit: '%',     evaluate: v => v < 5.7 ? 'ok' : v < 6.5 ? 'borderline' : 'high' },
  { key: 'ldl',               label: 'LDL',            unit: 'mg/dL', evaluate: v => v < 130 ? 'ok' : v < 160 ? 'borderline' : 'high' },
  { key: 'hdl',               label: 'HDL',            unit: 'mg/dL', evaluate: v => v >= 60 ? 'ok' : v >= 40 ? 'borderline' : 'low' },
  { key: 'total_cholesterol', label: 'Colesterol total',unit: 'mg/dL', evaluate: v => v < 200 ? 'ok' : v < 240 ? 'borderline' : 'high' },
  { key: 'triglycerides',     label: 'Triglicerídeos', unit: 'mg/dL', evaluate: v => v < 150 ? 'ok' : v < 200 ? 'borderline' : 'high' },
  { key: 'tsh',               label: 'TSH',            unit: 'mUI/L', evaluate: v => v >= 0.5 && v <= 4.0 ? 'ok' : 'borderline' },
  { key: 'creatinine',        label: 'Creatinina',     unit: 'mg/dL', evaluate: v => v < 1.3 ? 'ok' : v < 1.7 ? 'borderline' : 'high' },
  { key: 'hemoglobin',        label: 'Hemoglobina',    unit: 'g/dL',  evaluate: v => v >= 12 ? 'ok' : v >= 10 ? 'borderline' : 'low' },
  { key: 'uric_acid',         label: 'Ácido úrico',    unit: 'mg/dL', evaluate: v => v < 7.0 ? 'ok' : 'high' },
];

const STATUS_CONFIG: Record<MarkerStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  ok:         { label: 'Normal',     icon: CheckCircle2,  color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  borderline: { label: 'Atenção',    icon: AlertTriangle, color: 'text-amber-500',   bg: 'bg-amber-500/10'   },
  high:       { label: 'Alto',       icon: AlertCircle,   color: 'text-red-500',     bg: 'bg-red-500/10'     },
  low:        { label: 'Baixo',      icon: AlertCircle,   color: 'text-red-500',     bg: 'bg-red-500/10'     },
};

const toLocalISO = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

// ── Body fat reference ranges ─────────────────────────────────────────────────
function bodyFatStatus(pct: number): { label: string; color: string } {
  if (pct < 6)   return { label: 'Muito baixo', color: 'text-amber-500' };
  if (pct < 18)  return { label: 'Atlético',    color: 'text-emerald-500' };
  if (pct < 25)  return { label: 'Normal',       color: 'text-emerald-400' };
  if (pct < 30)  return { label: 'Acima do ideal', color: 'text-amber-500' };
  return            { label: 'Alto',            color: 'text-red-500' };
}

function visceralFatStatus(v: number): { label: string; color: string } {
  if (v <= 9)  return { label: 'Saudável', color: 'text-emerald-500' };
  if (v <= 14) return { label: 'Atenção',  color: 'text-amber-500' };
  return          { label: 'Risco',      color: 'text-red-500' };
}

// ── Heatmap de consistência ───────────────────────────────────────────────────
function buildCalendar(trackedDates: Set<string>) {
  const today = new Date();
  const days: { iso: string; tracked: boolean; future: boolean }[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const iso = toLocalISO(d);
    days.push({ iso, tracked: trackedDates.has(iso), future: false });
  }
  return days;
}

// ── Sub-componentes ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={15} className="text-primary" />
    <h2 className="text-sm font-heading font-semibold text-foreground">{title}</h2>
  </div>
);

const BioCard = ({
  label, value, unit, sub, icon: Icon, barPct, barColor, status,
}: {
  label: string; value: number | string; unit: string; sub?: string;
  icon: React.ElementType; barPct?: number; barColor?: string; status?: string;
}) => (
  <div className="bg-secondary/50 rounded-xl p-3 space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Icon size={13} className="text-muted-foreground" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      {status && <span className="text-[9px] font-medium text-muted-foreground">{status}</span>}
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-xl font-heading font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{unit}</span>
    </div>
    {barPct !== undefined && (
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor ?? 'bg-primary'}`}
          style={{ width: `${Math.min(100, barPct)}%` }}
        />
      </div>
    )}
    {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
  </div>
);

// ── Página principal ──────────────────────────────────────────────────────────
const Evolution = () => {
  const { bioimpedance, clientId, user } = useApp();
  const navigate = useNavigate();

  const [markers, setMarkers]           = useState<HealthMarkers | null>(null);
  const [markersLoading, setMarkersLoading] = useState(false);
  const [trackedDates, setTrackedDates] = useState<Set<string>>(new Set());
  const [consistencyLoading, setConsistencyLoading] = useState(false);

  // Carrega exames de sangue mais recentes
  useEffect(() => {
    if (!clientId) return;
    setMarkersLoading(true);
    supabase
      .from('patient_health_markers')
      .select('exam_date,glucose,hba1c,ldl,hdl,total_cholesterol,triglycerides,uric_acid,creatinine,tsh,hemoglobin')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { setMarkers(data as any); setMarkersLoading(false); });
  }, [clientId]);

  // Carrega consistência dos últimos 28 dias
  useEffect(() => {
    if (!clientId) return;
    setConsistencyLoading(true);
    const since = new Date(); since.setDate(since.getDate() - 27);
    supabase
      .from('daily_summary')
      .select('summary_date, meal_count')
      .eq('client_id', clientId)
      .gte('summary_date', toLocalISO(since))
      .then(({ data }) => {
        const set = new Set<string>(
          (data ?? []).filter((r: any) => Number(r.meal_count) > 0).map((r: any) => r.summary_date)
        );
        setTrackedDates(set);
        setConsistencyLoading(false);
      });
  }, [clientId]);

  const calendar = useMemo(() => buildCalendar(trackedDates), [trackedDates]);
  const trackedCount = calendar.filter(d => d.tracked).length;

  const hasBio = bioimpedance.weight > 0 || bioimpedance.bodyFat > 0;

  const visibleMarkers = MARKERS.filter(m => markers && markers[m.key] != null);
  const examDate = markers?.exam_date
    ? new Date(markers.exam_date).toLocaleDateString('pt-BR')
    : null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">

        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" strokeWidth={2} />
            <h1 className="text-2xl font-heading font-bold text-foreground">Evolução</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Composição corporal e saúde</p>
        </div>

        {/* ── Composição corporal ──────────────────────────────────────── */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader icon={Scale} title="Composição corporal" />
            <button
              onClick={() => navigate('/profile')}
              className="text-[10px] text-primary font-medium hover:opacity-80 transition-opacity"
            >
              Atualizar →
            </button>
          </div>

          {!hasBio ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Scale size={28} className="text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhum dado de bioimpedância</p>
              <button
                onClick={() => navigate('/profile')}
                className="h-9 px-4 rounded-full gradient-primary text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
              >
                Adicionar dados
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Gordura corporal — destaque com barra */}
              {bioimpedance.bodyFat > 0 && (() => {
                const bfStatus = bodyFatStatus(bioimpedance.bodyFat);
                // Barra de 0–45%, marcador de "saudável" em 18–25%
                const pct = (bioimpedance.bodyFat / 45) * 100;
                const barCol = bioimpedance.bodyFat < 18 ? 'bg-amber-400' :
                               bioimpedance.bodyFat < 26 ? 'bg-emerald-500' :
                               bioimpedance.bodyFat < 31 ? 'bg-amber-400' : 'bg-red-500';
                return (
                  <div className="rounded-xl bg-secondary/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Flame size={13} className="text-muted-foreground" />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Gordura corporal</span>
                      </div>
                      <span className={`text-xs font-semibold ${bfStatus.color}`}>{bfStatus.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-heading font-bold text-foreground">{bioimpedance.bodyFat}</span>
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${barCol}`} style={{ width: `${pct}%` }} />
                      {/* Marcador de faixa ideal */}
                      <div className="absolute inset-y-0 bg-emerald-500/20 rounded-sm" style={{ left: '40%', right: '44%' }} />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground">
                      <span>Muito baixo</span>
                      <span className="text-emerald-500">Ideal 18–25%</span>
                      <span>Alto</span>
                    </div>
                  </div>
                );
              })()}

              {/* Grid de métricas */}
              <div className="grid grid-cols-2 gap-3">
                {bioimpedance.weight > 0 && (
                  <BioCard label="Peso" value={bioimpedance.weight} unit="kg" icon={Scale} />
                )}
                {bioimpedance.muscleMass > 0 && (
                  <BioCard
                    label="Massa muscular" value={bioimpedance.muscleMass} unit="kg" icon={Activity}
                    barPct={(bioimpedance.muscleMass / (bioimpedance.weight || 80)) * 100}
                    barColor="bg-primary"
                  />
                )}
                {bioimpedance.basalRate > 0 && (
                  <BioCard label="TMB" value={bioimpedance.basalRate} unit="kcal/dia" icon={Zap} sub="gasto em repouso" />
                )}
                {bioimpedance.bodyWater > 0 && (
                  <BioCard
                    label="Água corporal" value={bioimpedance.bodyWater} unit="%"
                    icon={Droplets}
                    status={bioimpedance.bodyWater >= 50 ? '✓ Hidratado' : '! Baixo'}
                  />
                )}
                {bioimpedance.visceralFat > 0 && (() => {
                  const vs = visceralFatStatus(bioimpedance.visceralFat);
                  return (
                    <BioCard
                      label="Gordura visceral" value={bioimpedance.visceralFat} unit="nível"
                      icon={Flame} status={vs.label}
                    />
                  );
                })()}
                {bioimpedance.metabolicAge > 0 && (
                  <BioCard label="Idade metabólica" value={bioimpedance.metabolicAge} unit="anos" icon={TrendingUp} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Exames de sangue ─────────────────────────────────────────── */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-1">
            <SectionHeader icon={FlaskConical} title="Exames de sangue" />
          </div>

          {markersLoading ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Carregando exames…</p>
          ) : !markers || visibleMarkers.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <FlaskConical size={28} className="text-muted-foreground/40" />
              <div>
                <p className="text-sm text-muted-foreground">Nenhum exame vinculado</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Seu nutricionista pode adicionar seus exames à plataforma
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {examDate && (
                <p className="text-[10px] text-muted-foreground mb-3">
                  Última atualização: {examDate}
                </p>
              )}
              {visibleMarkers.map(m => {
                const val = Number(markers![m.key]);
                const status = m.evaluate(val);
                const cfg = STATUS_CONFIG[status];
                const Icon = cfg.icon;
                return (
                  <div key={m.key} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${cfg.bg}`}>
                    <Icon size={14} className={`shrink-0 ${cfg.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{m.label}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground">{val} <span className="text-[10px] font-normal text-muted-foreground">{m.unit}</span></p>
                      <p className={`text-[10px] font-medium ${cfg.color}`}>{cfg.label}</p>
                    </div>
                  </div>
                );
              })}

              {/* Score geral */}
              {visibleMarkers.length > 0 && (() => {
                const total = visibleMarkers.length;
                const okCount = visibleMarkers.filter(m => m.evaluate(Number(markers![m.key])) === 'ok').length;
                const pct = Math.round((okCount / total) * 100);
                return (
                  <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{okCount} de {total} dentro do normal</span>
                    <div className={`text-sm font-semibold ${pct >= 80 ? 'text-emerald-500' : pct >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                      {pct}% OK
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* ── Heatmap de consistência (28 dias) ────────────────────────── */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.18s' }}>
          <div className="flex items-center justify-between mb-4">
            <SectionHeader icon={Activity} title="Consistência — últimos 28 dias" />
            <span className="text-xs font-semibold text-foreground">
              {trackedCount}<span className="text-muted-foreground font-normal">/28 dias</span>
            </span>
          </div>

          {consistencyLoading ? (
            <p className="text-xs text-muted-foreground text-center py-4">Carregando…</p>
          ) : (
            <>
              {/* Weekday labels */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                  <p key={d} className="text-[9px] text-muted-foreground text-center">{d}</p>
                ))}
              </div>

              {/* 28-day grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Fill leading empty cells to align with correct weekday */}
                {(() => {
                  const firstDay = new Date(); firstDay.setDate(firstDay.getDate() - 27);
                  const offset = firstDay.getDay(); // 0=Sun
                  return Array.from({ length: offset }, (_, i) => (
                    <div key={`empty-${i}`} className="aspect-square rounded-md bg-transparent" />
                  ));
                })()}
                {calendar.map(day => (
                  <div
                    key={day.iso}
                    title={day.iso}
                    className={`aspect-square rounded-md transition-colors ${
                      day.tracked
                        ? 'bg-primary hover:bg-primary/80'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  />
                ))}
              </div>

              {/* Legend + score */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-muted" /> Sem registro
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-primary" /> Registrado
                  </div>
                </div>
                <div className={`text-sm font-semibold ${
                  trackedCount >= 20 ? 'text-emerald-500' :
                  trackedCount >= 12 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {Math.round((trackedCount / 28) * 100)}% de adesão
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Dica pro ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border/50 bg-card/40 p-4 flex items-start gap-3 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <LinkIcon size={14} className="text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Quer ver seus exames aqui?</span>{' '}
            Peça ao seu nutricionista para inserir seus resultados na plataforma Grove Pro.
            Eles aparecem automaticamente nesta tela.
          </p>
        </div>

      </div>
      <BottomNav />
    </div>
  );
};

export default Evolution;
