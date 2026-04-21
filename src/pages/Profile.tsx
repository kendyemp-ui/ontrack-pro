import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';
import { User, Activity, Trophy, Save, Plus, X, Calendar, MapPin, ChevronDown, ChevronUp, Pencil, Watch, Smartphone, Heart, MessageCircle, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { integrations } from '@/data/mockData';

const Profile = () => {
  const { userName, bioimpedance, updateBioimpedance, races, addRace, removeRace, logout, totalBurn, activities } = useApp();
  const dailyBurn = {
    total: totalBurn,
    steps: activities.reduce((s, a) => s + Number(a.activity_steps ?? 0), 0),
    activity: activities[0]?.activity_type ?? '—',
    activityDuration: activities[0]?.activity_duration ?? '—',
  };
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast({ title: 'Sessão encerrada', description: 'Você saiu da sua conta.' });
    navigate('/login');
  };

  const [bio, setBio] = useState({ ...bioimpedance });
  const [editingBio, setEditingBio] = useState(false);

  const [showAddRace, setShowAddRace] = useState(false);
  const [newRace, setNewRace] = useState({ name: '', type: 'Maratona', date: '', location: '', distance: '' });
  const [expandedRace, setExpandedRace] = useState<string | null>(null);

  const raceTypes = ['Maratona', 'Meia Maratona', 'Ironman', 'Ironman 70.3', 'Triathlon Olímpico', 'Triathlon Sprint', 'Ultra Maratona', '10K', '5K', 'Trail Run', 'Outro'];

  const handleSaveBio = () => {
    updateBioimpedance(bio);
    setEditingBio(false);
    toast({ title: 'Bioimpedância atualizada', description: 'Seus dados foram salvos com sucesso.' });
  };

  const handleAddRace = () => {
    if (!newRace.name || !newRace.date) {
      toast({ title: 'Preencha os campos', description: 'Nome e data são obrigatórios.', variant: 'destructive' });
      return;
    }
    addRace({
      id: Date.now().toString(),
      ...newRace,
    });
    setNewRace({ name: '', type: 'Maratona', date: '', location: '', distance: '' });
    setShowAddRace(false);
    toast({ title: 'Prova adicionada!', description: `${newRace.name} foi adicionada à sua lista.` });
  };

  const daysUntil = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - new Date('2026-04-15').getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center">
              <User size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">{userName}</h1>
              <p className="text-sm text-muted-foreground">Perfil e dados corporais</p>
            </div>
          </div>
        </div>

        {/* Bioimpedância */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              <h2 className="text-base font-heading font-semibold text-foreground">Bioimpedância</h2>
            </div>
            <button
              onClick={() => setEditingBio(!editingBio)}
              className="text-xs flex items-center gap-1 text-primary font-medium"
            >
              <Pencil size={13} />
              {editingBio ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          <div className="space-y-3">
            <BioField label="Gasto Basal (TMB)" value={bio.basalRate} unit="kcal/dia" editing={editingBio}
              onChange={v => setBio(prev => ({ ...prev, basalRate: Number(v) }))} highlight />
            <BioField label="Peso" value={bio.weight} unit="kg" editing={editingBio}
              onChange={v => setBio(prev => ({ ...prev, weight: Number(v) }))} />
            <BioField label="Altura" value={bio.height} unit="cm" editing={editingBio}
              onChange={v => setBio(prev => ({ ...prev, height: Number(v) }))} />
            <BioField label="Gordura Corporal" value={bio.bodyFat} unit="%" editing={editingBio}
              onChange={v => setBio(prev => ({ ...prev, bodyFat: Number(v) }))} />
            <BioField label="Massa Muscular" value={bio.muscleMass} unit="kg" editing={editingBio}
              onChange={v => setBio(prev => ({ ...prev, muscleMass: Number(v) }))} />
            <BioField label="Água Corporal" value={bio.bodyWater} unit="%" editing={editingBio}
              onChange={v => setBio(prev => ({ ...prev, bodyWater: Number(v) }))} />
            <BioField label="Massa Óssea" value={bio.boneMass} unit="kg" editing={editingBio}
              onChange={v => setBio(prev => ({ ...prev, boneMass: Number(v) }))} />
            <BioField label="Gordura Visceral" value={bio.visceralFat} unit="" editing={editingBio}
              onChange={v => setBio(prev => ({ ...prev, visceralFat: Number(v) }))} />
            <BioField label="Idade Metabólica" value={bio.metabolicAge} unit="anos" editing={editingBio}
              onChange={v => setBio(prev => ({ ...prev, metabolicAge: Number(v) }))} />
          </div>

          {editingBio && (
            <button onClick={handleSaveBio}
              className="w-full mt-4 h-11 rounded-xl gradient-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]">
              <Save size={16} /> Salvar Bioimpedância
            </button>
          )}

          <p className="text-xs text-muted-foreground mt-3">
            💡 O gasto basal (TMB) é usado para calcular déficit e superávit calórico nos gráficos de evolução.
          </p>
        </div>

        {/* Provas */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-primary" />
              <h2 className="text-base font-heading font-semibold text-foreground">Minhas Provas</h2>
            </div>
            <button
              onClick={() => setShowAddRace(!showAddRace)}
              className="text-xs flex items-center gap-1 text-primary font-medium"
            >
              {showAddRace ? <X size={13} /> : <Plus size={13} />}
              {showAddRace ? 'Cancelar' : 'Adicionar'}
            </button>
          </div>

          {showAddRace && (
            <div className="bg-secondary/50 rounded-xl p-4 mb-4 space-y-3">
              <Input placeholder="Nome da prova" value={newRace.name}
                onChange={e => setNewRace(p => ({ ...p, name: e.target.value }))}
                className="bg-background/50" />
              <select value={newRace.type} onChange={e => setNewRace(p => ({ ...p, type: e.target.value }))}
                className="w-full h-10 rounded-md border border-input bg-background/50 px-3 text-sm">
                {raceTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <Input type="date" value={newRace.date}
                onChange={e => setNewRace(p => ({ ...p, date: e.target.value }))}
                className="bg-background/50" />
              <Input placeholder="Local (ex: São Paulo, Brasil)" value={newRace.location}
                onChange={e => setNewRace(p => ({ ...p, location: e.target.value }))}
                className="bg-background/50" />
              <Input placeholder="Distância (ex: 42.195 km)" value={newRace.distance}
                onChange={e => setNewRace(p => ({ ...p, distance: e.target.value }))}
                className="bg-background/50" />
              <button onClick={handleAddRace}
                className="w-full h-10 rounded-xl gradient-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]">
                <Plus size={14} /> Adicionar Prova
              </button>
            </div>
          )}

          {races.length === 0 ? (
            <div className="text-center py-6">
              <Trophy size={32} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma prova adicionada</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Adicione maratonas, Ironman, triathlon e outras provas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {races.map(race => (
                <div key={race.id} className="bg-secondary/50 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedRace(expandedRace === race.id ? null : race.id)}
                    className="w-full flex items-center justify-between p-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getRaceIcon(race.type)}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{race.name}</p>
                        <p className="text-xs text-muted-foreground">{race.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {daysUntil(race.date) > 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          {daysUntil(race.date)}d
                        </span>
                      )}
                      {expandedRace === race.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </button>
                  {expandedRace === race.id && (
                    <div className="px-3 pb-3 space-y-2 border-t border-border/30 pt-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar size={12} /> {new Date(race.date).toLocaleDateString('pt-BR')}
                      </div>
                      {race.location && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin size={12} /> {race.location}
                        </div>
                      )}
                      {race.distance && (
                        <p className="text-xs text-muted-foreground">📏 {race.distance}</p>
                      )}
                      <p className="text-xs text-primary italic">
                        🏋️ Dashboard de treino em breve
                      </p>
                      <button onClick={() => removeRace(race.id)}
                        className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <X size={12} /> Remover prova
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            🏆 Em breve: acompanhe treinos e progressão até a prova em um dashboard dedicado.
          </p>
        </div>

        {/* Integrações - Smartwatches */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Watch size={18} className="text-primary" />
              <h2 className="text-base font-heading font-semibold text-foreground">Integrações</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {integrations.filter(i => i.status === 'config').length} ativo(s)
            </span>
          </div>

          {/* Dados do dia */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-primary" />
              <span className="text-xs font-medium text-foreground">Dados de hoje</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-lg font-heading font-bold text-primary">{dailyBurn.total}</p>
                <p className="text-[10px] text-muted-foreground">kcal ativas</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-heading font-bold text-accent">{dailyBurn.steps.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">passos</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-heading font-bold text-warning">{dailyBurn.activityDuration}</p>
                <p className="text-[10px] text-muted-foreground">{dailyBurn.activity}</p>
              </div>
            </div>
          </div>

          {/* Lista de integrações */}
          <div className="space-y-2">
            {integrations.map(integration => {
              const statusConfig: Record<string, { label: string; color: string }> = {
                connected: { label: 'Conectado', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
                soon: { label: 'Em breve', color: 'bg-muted text-muted-foreground border-border' },
                config: { label: 'Configurando', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
                disconnected: { label: 'Desconectado', color: 'bg-destructive/10 text-destructive border-destructive/20' },
              };
              const config = statusConfig[integration.status] || statusConfig.soon;
              
              const IconComponent = {
                'Apple Watch': Watch,
                'Garmin': Activity,
                'Oura Ring': Heart,
                'Smart Ring': Watch,
                'WhatsApp Business API': MessageCircle,
                'Google Fit': Smartphone,
              }[integration.name] || Watch;

              return (
                <div key={integration.name} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center">
                    <IconComponent size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{integration.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{integration.description}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-1 rounded-full border ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            ⌚ Conecte seus dispositivos para sincronizar calorias gastas, passos e atividades automaticamente.
          </p>
        </div>

        {/* Conta - Logout */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-primary" />
            <h2 className="text-base font-heading font-semibold text-foreground">Conta</h2>
          </div>
          <button
            onClick={handleLogout}
            className="w-full h-11 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive font-medium text-sm flex items-center justify-center gap-2 hover:bg-destructive/10 transition-all active:scale-[0.98]"
          >
            <LogOut size={16} /> Sair da conta
          </button>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Você será redirecionado para a tela de login.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

const BioField = ({ label, value, unit, editing, onChange, highlight }: {
  label: string; value: number; unit: string; editing: boolean;
  onChange: (v: string) => void; highlight?: boolean;
}) => (
  <div className={`flex items-center justify-between py-2 ${highlight ? 'bg-primary/5 -mx-2 px-2 rounded-lg' : ''}`}>
    <span className={`text-sm ${highlight ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{label}</span>
    {editing ? (
      <div className="flex items-center gap-1">
        <Input type="number" value={value} onChange={e => onChange(e.target.value)}
          className="w-24 h-8 text-right text-sm bg-background/50" />
        <span className="text-xs text-muted-foreground w-10">{unit}</span>
      </div>
    ) : (
      <span className={`text-sm font-medium ${highlight ? 'text-primary font-bold' : 'text-foreground'}`}>
        {value} {unit}
      </span>
    )}
  </div>
);

const getRaceIcon = (type: string) => {
  if (type.includes('Ironman')) return '🏊';
  if (type.includes('Triathlon')) return '🚴';
  if (type.includes('Maratona') || type.includes('Ultra')) return '🏃';
  if (type.includes('Trail')) return '⛰️';
  return '🏅';
};

export default Profile;
