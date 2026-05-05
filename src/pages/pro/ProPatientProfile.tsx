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
  NotebookPen, Calendar, Loader2, Upload, FileText, ImageIcon, Trash2,
  Download, File, FlaskConical, AlertTriangle, CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, ReferenceLine, CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ProDietPlanEditor from '@/components/pro/ProDietPlanEditor';
import PatientDashboardTab from '@/components/pro/PatientDashboardTab';
import PatientInsightsPanel from '@/components/pro/PatientInsightsPanel';
import { usePatientDashboard } from '@/hooks/usePatientDashboard';

export default function ProPatientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPatient, professionalId } = usePro();
  const patient = id ? getPatient(id) : undefined;

  const [activeTab, setActiveTab] = useState<'dashboard' | 'resumo' | 'dieta' | 'observacoes'>('dashboard');

  // Observações
  const [obsSubTab, setObsSubTab] = useState<'notes' | 'docs' | 'ai'>('notes');
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [notes, setNotes] = useState<{ id: string; content: string; created_at: string }[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

  // Documentos
  interface PatientDoc { id: string; name: string; doc_type: string; file_path: string; file_size: number | null; mime_type: string | null; notes: string | null; created_at: string; }
  const [docs, setDocs] = useState<PatientDoc[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('blood_test');
  const [docNote, setDocNote] = useState('');

  // Marcadores laboratoriais
  interface HealthMarkers { id: string; exam_date: string | null; glucose: number | null; hba1c: number | null; ldl: number | null; hdl: number | null; total_cholesterol: number | null; triglycerides: number | null; uric_acid: number | null; creatinine: number | null; tsh: number | null; t4: number | null; hemoglobin: number | null; hematocrit: number | null; raw_markers: Record<string, any>; created_at: string; }
  const [latestMarkers, setLatestMarkers] = useState<HealthMarkers | null>(null);
  const [extractingMarkersId, setExtractingMarkersId] = useState<string | null>(null);

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
    if (!patient?.id || activeTab !== 'observacoes') return;
    if (obsSubTab === 'docs') { loadDocs(); loadMarkers(); }
  }, [patient?.id, activeTab, obsSubTab]);

  const loadMarkers = async () => {
    if (!patient?.id) return;
    const { data } = await supabase
      .from('patient_health_markers')
      .select('*')
      .eq('client_id', patient.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setLatestMarkers(data as any);
  };

  const extractMarkers = async (docId: string) => {
    setExtractingMarkersId(docId);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('extract-blood-markers', {
        body: { document_id: docId },
      });
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      setLatestMarkers(data.markers);
      toast.success('Marcadores extraídos com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao extrair marcadores: ' + err.message);
    } finally {
      setExtractingMarkersId(null);
    }
  };

  const loadDocs = async () => {
    if (!patient?.id) return;
    setDocsLoading(true);
    const { data } = await supabase
      .from('patient_documents')
      .select('id, name, doc_type, file_path, file_size, mime_type, notes, created_at')
      .eq('client_id', patient.id)
      .order('created_at', { ascending: false });
    setDocs((data as any) || []);
    setDocsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !patient?.id || !professionalId) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${professionalId}/${patient.id}/${Date.now()}.${ext}`;
      const { error: storageErr } = await supabase.storage
        .from('patient-documents')
        .upload(fileName, file, { contentType: file.type });
      if (storageErr) throw storageErr;
      const { error: dbErr } = await supabase.from('patient_documents').insert({
        client_id: patient.id,
        professional_id: professionalId,
        name: file.name,
        doc_type: docType,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
        notes: docNote.trim() || null,
      });
      if (dbErr) throw dbErr;
      toast.success('Documento enviado com sucesso!');
      setDocNote('');
      await loadDocs();
    } catch (err: any) {
      toast.error('Erro ao enviar: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteDoc = async (doc: any) => {
    await supabase.storage.from('patient-documents').remove([doc.file_path]);
    await supabase.from('patient_documents').delete().eq('id', doc.id);
    setDocs(prev => prev.filter(d => d.id !== doc.id));
    toast.success('Documento excluído.');
  };

  const getDocUrl = async (filePath: string) => {
    const { data } = await supabase.storage.from('patient-documents').createSignedUrl(filePath, 60);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

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

  // Real data from daily_summary for Resumo tab stats
  const { todaySummary, goals } = usePatientDashboard(patient?.id);

  if (!patient) {
    return (
      <ProLayout title="Paciente não encontrado">
        <Button onClick={() => navigate('/pro/dashboard')}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
      </ProLayout>
    );
  }

  const kcalConsumed = todaySummary?.kcal_consumed ?? 0;
  const kcalGasto = todaySummary?.total_expenditure_kcal ?? 0;
  const balance = todaySummary?.calorie_balance ?? 0;
  const proteinConsumed = todaySummary?.protein_consumed ?? 0;
  const carbsConsumed = todaySummary?.carbs_consumed ?? 0;
  const mealsCount = todaySummary?.meal_count ?? 0;
  const diasNaMeta = weeklyData.filter(w => w.adesao >= 80).length;
  const diasFora = 7 - diasNaMeta;
  const consistencia = Math.round((diasNaMeta / 7) * 100);

  const stats = [
    { label: 'Calorias hoje', value: kcalConsumed, suffix: 'kcal', icon: Flame, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Gasto total', value: kcalGasto, suffix: 'kcal', icon: TrendingDown, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Saldo do dia', value: balance, suffix: 'kcal', icon: Flame, color: balance < 0 ? 'text-red-400' : 'text-emerald-400', bg: balance < 0 ? 'bg-red-500/10' : 'bg-emerald-500/10', signed: true },
    { label: 'Proteína', value: `${Math.round(proteinConsumed)}/${goals.protein_target}`, suffix: 'g', icon: Beef, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Carboidrato', value: `${Math.round(carbsConsumed)}/${goals.carbs_target}`, suffix: 'g', icon: Wheat, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Refeições', value: mealsCount, suffix: 'hoje', icon: Utensils, color: 'text-foreground', bg: 'bg-secondary' },
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
          { id: 'dashboard', label: 'Dashboard' },
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

      {activeTab === 'dashboard' && (
        <PatientDashboardTab clientId={patient.id} />
      )}

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
        <div className="space-y-4">
          {/* Sub-tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-secondary/40 border border-border">
            {[
              { id: 'notes', label: '📝 Anotações' },
              { id: 'docs',  label: '📎 Documentos' },
              { id: 'ai',    label: '✨ Análise IA' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setObsSubTab(t.id as any)}
                className={cn(
                  'flex-1 h-9 rounded-lg text-xs font-semibold transition-all',
                  obsSubTab === t.id ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── ANOTAÇÕES ── */}
          {obsSubTab === 'notes' && (
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

          {/* ── ANÁLISE IA ── */}
          {obsSubTab === 'ai' && (
            <PatientInsightsPanel clientId={patient.id} />
          )}

          {/* ── DOCUMENTOS ── */}
          {obsSubTab === 'docs' && (
            <Card className="p-5 glass-card space-y-5">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" /> Documentos clínicos
              </h3>

              {/* Upload area */}
              <div className="rounded-xl border border-dashed border-border p-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Tipo de documento</label>
                    <select
                      value={docType}
                      onChange={e => setDocType(e.target.value)}
                      className="w-full mt-1 h-9 px-3 rounded-lg border border-border bg-secondary/30 text-sm focus:outline-none"
                    >
                      <option value="blood_test">🩸 Exame de sangue</option>
                      <option value="bioimpedance">⚖️ Bioimpedância</option>
                      <option value="prescription">💊 Prescrição</option>
                      <option value="report">📋 Laudo / Relatório</option>
                      <option value="other">📄 Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Anotação (opcional)</label>
                    <input
                      value={docNote}
                      onChange={e => setDocNote(e.target.value)}
                      placeholder="Ex: Resultado julho 2026..."
                      className="w-full mt-1 h-9 px-3 rounded-lg border border-border bg-secondary/30 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <label className={cn(
                  'flex items-center justify-center gap-2 h-10 rounded-lg border border-border text-sm font-medium transition-colors cursor-pointer',
                  uploading
                    ? 'opacity-50 cursor-not-allowed bg-secondary/30'
                    : 'hover:bg-secondary/40 bg-secondary/20'
                )}>
                  {uploading
                    ? <><Loader2 className="animate-spin h-4 w-4" /> Enviando...</>
                    : <><Upload className="h-4 w-4" /> Selecionar arquivo (PDF ou imagem)</>
                  }
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={handleFileUpload}
                  />
                </label>
                <p className="text-[11px] text-muted-foreground text-center">PDF, JPG, PNG, HEIC · máx 50 MB</p>
              </div>

              {/* Latest markers panel */}
              {latestMarkers && (() => {
                const mk = latestMarkers;
                type MarkerDef = { label: string; value: number | null; unit: string; lo?: number; hi: number; hiDanger?: number };
                const defs: MarkerDef[] = [
                  { label: 'Glicemia', value: mk.glucose, unit: 'mg/dL', lo: 70, hi: 99, hiDanger: 125 },
                  { label: 'HbA1c', value: mk.hba1c, unit: '%', hi: 5.6, hiDanger: 6.4 },
                  { label: 'LDL', value: mk.ldl, unit: 'mg/dL', hi: 129, hiDanger: 159 },
                  { label: 'HDL', value: mk.hdl, unit: 'mg/dL', hi: 999 },
                  { label: 'Colesterol', value: mk.total_cholesterol, unit: 'mg/dL', hi: 199, hiDanger: 239 },
                  { label: 'Triglicerídeos', value: mk.triglycerides, unit: 'mg/dL', hi: 149, hiDanger: 199 },
                  { label: 'Ácido úrico', value: mk.uric_acid, unit: 'mg/dL', hi: 7.0 },
                  { label: 'Creatinina', value: mk.creatinine, unit: 'mg/dL', hi: 1.2 },
                  { label: 'TSH', value: mk.tsh, unit: 'mUI/L', lo: 0.4, hi: 4.0 },
                  { label: 'Hemoglobina', value: mk.hemoglobin, unit: 'g/dL', lo: 12, hi: 17.5 },
                ].filter(d => d.value != null);
                if (defs.length === 0) return null;
                return (
                  <div className="rounded-xl border border-border bg-secondary/10 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <FlaskConical className="h-3 w-3" /> Marcadores laboratoriais
                      </p>
                      {mk.exam_date && (
                        <p className="text-[10px] text-muted-foreground">
                          Exame de {new Date(mk.exam_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {defs.map((d, i) => {
                        const val = d.value!;
                        const isLow = d.lo != null && val < d.lo;
                        const isDanger = d.hiDanger != null ? val > d.hiDanger : val > d.hi;
                        const isWarning = !isDanger && val > d.hi;
                        const isLowRisk = d.label === 'HDL' && val < 40;
                        const colorClass = (isLow || isDanger || isLowRisk)
                          ? 'text-red-400 bg-red-500/5 border-red-500/20'
                          : isWarning
                          ? 'text-amber-400 bg-amber-500/5 border-amber-500/20'
                          : 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20';
                        return (
                          <div key={i} className={cn('rounded-lg border p-2.5 text-center', colorClass)}>
                            <p className="text-[10px] text-muted-foreground mb-0.5">{d.label}</p>
                            <p className="text-sm font-bold tabular-nums">{val}</p>
                            <p className="text-[9px] text-muted-foreground">{d.unit}</p>
                            {(isLow || isDanger || isLowRisk) && <AlertTriangle className="h-2.5 w-2.5 mx-auto mt-0.5 text-red-400" />}
                            {isWarning && <AlertTriangle className="h-2.5 w-2.5 mx-auto mt-0.5 text-amber-400" />}
                            {(!isLow && !isDanger && !isWarning && !isLowRisk) && <CheckCircle className="h-2.5 w-2.5 mx-auto mt-0.5 text-emerald-400" />}
                          </div>
                        );
                      })}
                    </div>
                    {Object.keys(mk.raw_markers || {}).length > Object.keys(defs).length && (
                      <p className="text-[10px] text-muted-foreground">
                        +{Object.keys(mk.raw_markers).length - defs.length} marcadores adicionais no exame original
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Documents list */}
              {docsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                  <Loader2 className="animate-spin h-4 w-4" /> Carregando documentos...
                </div>
              ) : docs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum documento enviado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {docs.map(doc => {
                    const isPdf = doc.mime_type === 'application/pdf';
                    const typeLabels: Record<string, string> = {
                      blood_test: '🩸 Exame de sangue', bioimpedance: '⚖️ Bioimpedância',
                      prescription: '💊 Prescrição', report: '📋 Laudo', other: '📄 Outro',
                    };
                    const sizeKb = doc.file_size ? Math.round(doc.file_size / 1024) : null;
                    const isExtracting = extractingMarkersId === doc.id;
                    return (
                      <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/20 group hover:bg-secondary/30 transition-all">
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-secondary flex items-center justify-center">
                          {isPdf ? <FileText className="h-5 w-5 text-red-400" /> : <ImageIcon className="h-5 w-5 text-blue-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground mt-0.5">
                            <span>{typeLabels[doc.doc_type] || doc.doc_type}</span>
                            {sizeKb && <span>{sizeKb < 1024 ? `${sizeKb} KB` : `${(sizeKb / 1024).toFixed(1)} MB`}</span>}
                            <span>{new Date(doc.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                          {doc.notes && <p className="text-[11px] text-muted-foreground italic mt-0.5">{doc.notes}</p>}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {doc.doc_type === 'blood_test' && (
                            <button
                              onClick={() => extractMarkers(doc.id)}
                              disabled={isExtracting || extractingMarkersId !== null}
                              className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-[11px] font-medium bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 transition-colors disabled:opacity-50"
                              title="Extrair marcadores com IA"
                            >
                              {isExtracting
                                ? <Loader2 className="animate-spin h-3 w-3" />
                                : <FlaskConical className="h-3 w-3" />}
                              {isExtracting ? 'Extraindo...' : 'Extrair'}
                            </button>
                          )}
                          <button
                            onClick={() => getDocUrl(doc.file_path)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                            title="Abrir documento"
                          >
                            <Download className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDeleteDoc(doc)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </ProLayout>
  );
}
