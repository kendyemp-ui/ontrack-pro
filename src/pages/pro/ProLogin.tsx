import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { usePro } from '@/contexts/ProContext';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

export default function ProLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = usePro();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      toast.success('Bem-vindo!');
      navigate('/pro/dashboard');
    } else {
      toast.error('Acesso negado. Verifique suas credenciais ou solicite acesso ao suporte.');
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
          <div className="flex items-center gap-3 mb-3">
            <img src={logo} alt="OnTrack" className="h-16 object-contain invert dark:invert-0" />
            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-semibold border-l border-border pl-3">Pro</span>
          </div>
          <p className="text-xs text-muted-foreground italic tracking-wide">evolução que acompanha você</p>
          <p className="text-sm text-muted-foreground mt-3">Área do profissional da saúde</p>
        </div>

        <Card className="p-6 glass-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail profissional</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Entrar na plataforma
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Não tem acesso ainda?{' '}
          <Link to="/pro/cadastro" className="text-foreground font-medium underline">
            Solicite seu cadastro
          </Link>
        </p>
      </div>
    </div>
  );
}
