import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Eye, EyeOff } from 'lucide-react';
import logo from '@/assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [stayConnected, setStayConnected] = useState(false);
  const [error, setError] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(email, password)) {
      navigate('/dashboard');
    } else {
      setError('E-mail ou senha incorretos');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-10 animate-fade-in">
        <div className="flex flex-col items-center space-y-4">
          <img src={logo} alt="OnTrack" className="h-8 object-contain invert" />
          <p className="text-xs text-muted-foreground tracking-[0.3em] uppercase">
            da rotina à conquista
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.15em]">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.15em]">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full h-12 px-4 pr-12 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={stayConnected}
              onChange={e => setStayConnected(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-foreground"
            />
            <span className="text-xs text-muted-foreground">Continuar conectado</span>
          </label>

          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-foreground text-background font-semibold text-sm tracking-wide hover:opacity-90 transition-all active:scale-[0.98]"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground/40 tracking-wide">
          teste@ontrack.com / 123456
        </p>

        <div className="pt-4 border-t border-border/40">
          <button
            type="button"
            onClick={() => navigate('/pro')}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide"
          >
            É profissional da saúde? <span className="font-semibold underline underline-offset-4">Acesse o OnTrack Pro →</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
