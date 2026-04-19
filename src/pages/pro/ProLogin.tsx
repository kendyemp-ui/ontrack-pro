import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { usePro } from '@/contexts/ProContext';
import { toast } from '@/hooks/use-toast';

export default function ProLogin() {
  const [email, setEmail] = useState('profissional@teste.com');
  const [password, setPassword] = useState('123456');
  const [keepConnected, setKeepConnected] = useState(true);
  const { login } = usePro();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/pro/dashboard');
    } else {
      toast({ title: 'Credenciais inválidas', description: 'Verifique e tente novamente.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center mb-4 stat-glow">
            <Activity className="h-6 w-6 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">OnTrack <span className="text-muted-foreground font-light">Pro</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Área do profissional da saúde</p>
        </div>

        <Card className="p-6 glass-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail profissional</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="keep" checked={keepConnected} onCheckedChange={v => setKeepConnected(!!v)} />
              <Label htmlFor="keep" className="text-sm font-normal cursor-pointer">Continuar conectado</Label>
            </div>
            <Button type="submit" className="w-full" size="lg">Entrar na plataforma</Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Acesso de demonstração</p>
            <p>profissional@teste.com / 123456</p>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Da rotina à conquista — para você acompanhar cada paciente.
        </p>
      </div>
    </div>
  );
}
