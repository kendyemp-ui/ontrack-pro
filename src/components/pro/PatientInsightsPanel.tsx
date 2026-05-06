import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, TrendingUp, AlertTriangle, Star, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Insight {
  summary: string;
  adherence_score: number;
  patterns: { icon: string; title: string; description: string }[];
  critical_days: { type: 'deficit' | 'surplus'; insight: string }[];
  positive_highlights: string[];
  recommendations: { priority: 'high' | 'medium' | 'low'; text: string }[];
}

export default function PatientInsightsPanel({ clientId }: { clientId: string }) {
  const [loading, setLoading]     = useState(false);
  const [insights, setInsights]   = useState<Insight | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [expanded, setExpanded]   = useState(true);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-patient', {
        body: { client_id: clientId },
      });
      if (fnError) {
        // Try to extract the actual error from the response body
        const ctx = (fnError as any).context;
        if (ctx && typeof ctx.json === 'function') {
          try {
            const body = await ctx.json();
            throw new Error(body?.error || fnError.message);
          } catch (parseErr: any) {
            if (parseErr.message !== fnError.message) throw parseErr;
          }
        }
        throw new Error(fnError.message);
      }
      if (data?.error) throw new Error(data.error);
      setInsights(data.insights);
      setGeneratedAt(new Date());
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar análise.');
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = {
    high:   'border-l-red-400 bg-red-500/5',
    medium: 'border-l-amber-400 bg-amber-500/5',
    low:    'border-l-emerald-400 bg-emerald-500/5',
  };

  const priorityLabel = {
    high: 'Alta', medium: 'Média', low: 'Baixa',
  };

  const scoreColor =
    !insights ? '' :
    insights.adherence_score >= 8 ? 'text-emerald-400' :
    insights.adherence_score >= 5 ? 'text-amber-400' : 'text-red-400';

  return (
    <Card className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Análise IA</h3>
            {generatedAt && (
              <p className="text-[10px] text-muted-foreground">
                Gerado às {generatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {insights && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
            >
              {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
          )}
          <Button
            size="sm"
            variant={insights ? 'outline' : 'default'}
            onClick={generate}
            disabled={loading}
          >
            {loading
              ? <><Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" /> Analisando...</>
              : insights
              ? <><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reanalisar</>
              : <><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Gerar análise</>
            }
          </Button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="p-5 space-y-3">
          <div className="h-3 bg-secondary/60 rounded-full w-full animate-pulse" />
          <div className="h-3 bg-secondary/60 rounded-full w-4/5 animate-pulse" />
          <div className="h-3 bg-secondary/60 rounded-full w-3/5 animate-pulse" />
          <p className="text-xs text-muted-foreground text-center pt-2">
            Analisando {60} dias de dados — isso pode levar alguns segundos...
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="p-5">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="ghost" size="sm" onClick={generate} className="mt-2">Tentar novamente</Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && !insights && (
        <div className="p-6 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">
            Clique em <strong>Gerar análise</strong> para que a IA cruze os padrões dos últimos 60 dias deste paciente.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Identifica dias críticos, padrões alimentares, adesão por dia da semana e gera recomendações.
          </p>
        </div>
      )}

      {/* Results */}
      {insights && !loading && expanded && (
        <div className="p-5 space-y-5">

          {/* Score + Summary */}
          <div className="flex items-start gap-4">
            <div className="text-center shrink-0">
              <p className={cn('text-4xl font-bold tabular-nums', scoreColor)}>
                {insights.adherence_score}
                <span className="text-base font-normal text-muted-foreground">/10</span>
              </p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">Adesão</p>
            </div>
            <div className="flex-1">
              <p className="text-sm leading-relaxed text-muted-foreground">{insights.summary}</p>
            </div>
          </div>

          {/* Patterns */}
          {insights.patterns?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" /> Padrões identificados
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {insights.patterns.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/20 border border-border">
                    <span className="text-xl shrink-0">{p.icon}</span>
                    <div>
                      <p className="text-xs font-semibold">{p.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{p.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critical days */}
          {insights.critical_days?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" /> Dias críticos — o que aconteceu
              </p>
              <div className="space-y-2">
                {insights.critical_days.map((d, i) => (
                  <div key={i} className={cn(
                    'p-3 rounded-xl border-l-2',
                    d.type === 'deficit' ? 'border-l-sky-400 bg-sky-500/5' : 'border-l-amber-400 bg-amber-500/5'
                  )}>
                    <span className={cn(
                      'text-[10px] uppercase font-semibold tracking-widest',
                      d.type === 'deficit' ? 'text-sky-400' : 'text-amber-400'
                    )}>
                      {d.type === 'deficit' ? '🔵 Déficit' : '🟠 Superávit'}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{d.insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Positive highlights */}
          {insights.positive_highlights?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                <Star className="h-3 w-3" /> Pontos positivos
              </p>
              <div className="space-y-1.5">
                {insights.positive_highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                    <p className="text-muted-foreground text-xs leading-relaxed">{h}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {insights.recommendations?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                💡 Recomendações
              </p>
              <div className="space-y-2">
                {insights.recommendations.map((r, i) => (
                  <div key={i} className={cn('border-l-2 pl-3 py-1.5 rounded-r-lg', priorityColor[r.priority])}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={cn(
                        'text-[10px] uppercase font-semibold tracking-widest',
                        r.priority === 'high' ? 'text-red-400' : r.priority === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                      )}>
                        {priorityLabel[r.priority]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </Card>
  );
}
