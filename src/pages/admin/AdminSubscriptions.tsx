import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Trash2, Edit2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type Subscription = {
  id: string;
  email: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'refunded' | 'pending';
  plan: string | null;
  provider: string;
  external_id: string | null;
  customer_name: string | null;
  expires_at: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<Subscription['status'], string> = {
  active: 'Ativa',
  cancelled: 'Cancelada',
  expired: 'Expirada',
  past_due: 'Em atraso',
  refunded: 'Reembolsada',
  pending: 'Pendente',
};

const STATUS_VARIANT: Record<Subscription['status'], 'default' | 'destructive' | 'secondary' | 'outline'> = {
  active: 'default',
  cancelled: 'destructive',
  expired: 'destructive',
  past_due: 'secondary',
  refunded: 'destructive',
  pending: 'outline',
};

export default function AdminSubscriptions() {
  const navigate = useNavigate();
  const { user, authLoading } = useApp();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Verificar admin
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/');
      return;
    }
    supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }).then(({ data }) => {
      setIsAdmin(!!data);
    });
  }, [user, authLoading, navigate]);

  const fetchSubs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error('Erro ao carregar assinaturas');
    else setSubs((data ?? []) as Subscription[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchSubs();
  }, [isAdmin]);

  const handleSave = async (form: Partial<Subscription>) => {
    const payload = {
      email: form.email!.toLowerCase().trim(),
      status: form.status ?? 'active',
      plan: form.plan || null,
      provider: form.provider || 'manual',
      customer_name: form.customer_name || null,
      expires_at: form.expires_at || null,
      created_by: user?.id,
    };
    const { error } = editing
      ? await supabase.from('subscriptions').update(payload).eq('id', editing.id)
      : await supabase.from('subscriptions').insert(payload);
    if (error) {
      toast.error('Erro ao salvar', { description: error.message });
      return;
    }
    toast.success(editing ? 'Assinatura atualizada' : 'Assinatura criada');
    setDialogOpen(false);
    setEditing(null);
    fetchSubs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta assinatura?')) return;
    const { error } = await supabase.from('subscriptions').delete().eq('id', id);
    if (error) toast.error('Erro ao remover', { description: error.message });
    else {
      toast.success('Assinatura removida');
      fetchSubs();
    }
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="p-8 max-w-md text-center space-y-4">
          <ShieldAlert className="mx-auto text-destructive" size={40} />
          <h1 className="text-xl font-bold">Acesso restrito</h1>
          <p className="text-sm text-muted-foreground">
            Esta área é exclusiva para administradores.
          </p>
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
            Voltar ao app
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
            >
              <ArrowLeft size={12} /> Voltar
            </button>
            <h1 className="text-2xl font-bold tracking-tight">Assinaturas</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie quem tem acesso à plataforma. {subs.length} cadastrada{subs.length !== 1 ? 's' : ''}.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} /> Nova assinatura
              </Button>
            </DialogTrigger>
            <SubDialog editing={editing} onSave={handleSave} />
          </Dialog>
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : subs.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Nenhuma assinatura cadastrada ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">E-mail</th>
                    <th className="text-left px-4 py-3 font-medium">Nome</th>
                    <th className="text-left px-4 py-3 font-medium">Plano</th>
                    <th className="text-left px-4 py-3 font-medium">Origem</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Expira</th>
                    <th className="text-right px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map(s => (
                    <tr key={s.id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{s.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.customer_name ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.plan ?? '—'}</td>
                      <td className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{s.provider}</td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[s.status]}>{STATUS_LABEL[s.status]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {s.expires_at ? new Date(s.expires_at).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setDialogOpen(true); }}>
                            <Edit2 size={14} />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)}>
                            <Trash2 size={14} className="text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-4 bg-muted/30">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">URL do webhook Kiwify:</strong>{' '}
            <code className="text-[11px] bg-card px-2 py-1 rounded">
              {import.meta.env.VITE_SUPABASE_URL}/functions/v1/kiwify-webhook?token=SEU_TOKEN
            </code>
            <br />
            Configure essa URL no painel da Kiwify em Configurações → Webhooks. O token é o mesmo configurado nos secrets da plataforma.
          </p>
        </Card>
      </div>
    </div>
  );
}

function SubDialog({
  editing,
  onSave,
}: {
  editing: Subscription | null;
  onSave: (s: Partial<Subscription>) => void | Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Subscription>>(
    editing ?? { email: '', status: 'active', plan: '', provider: 'manual', customer_name: '' },
  );
  useEffect(() => {
    setForm(editing ?? { email: '', status: 'active', plan: '', provider: 'manual', customer_name: '' });
  }, [editing]);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{editing ? 'Editar assinatura' : 'Nova assinatura'}</DialogTitle>
        <DialogDescription>
          Cadastre um e-mail autorizado a acessar a plataforma.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>E-mail *</Label>
          <Input
            type="email"
            value={form.email ?? ''}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="cliente@exemplo.com"
            disabled={!!editing}
          />
        </div>
        <div className="space-y-2">
          <Label>Nome do cliente</Label>
          <Input
            value={form.customer_name ?? ''}
            onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
            placeholder="Nome completo"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status ?? 'active'} onValueChange={v => setForm(f => ({ ...f, status: v as Subscription['status'] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Origem</Label>
            <Select value={form.provider ?? 'manual'} onValueChange={v => setForm(f => ({ ...f, provider: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="kiwify">Kiwify</SelectItem>
                <SelectItem value="hotmart">Hotmart</SelectItem>
                <SelectItem value="eduzz">Eduzz</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Plano</Label>
          <Input
            value={form.plan ?? ''}
            onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
            placeholder="Ex: Premium Mensal"
          />
        </div>
        <div className="space-y-2">
          <Label>Expira em (opcional)</Label>
          <Input
            type="date"
            value={form.expires_at ? form.expires_at.slice(0, 10) : ''}
            onChange={e => setForm(f => ({ ...f, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
          />
        </div>
      </div>

      <DialogFooter>
        <Button onClick={() => onSave(form)} disabled={!form.email}>Salvar</Button>
      </DialogFooter>
    </DialogContent>
  );
}
