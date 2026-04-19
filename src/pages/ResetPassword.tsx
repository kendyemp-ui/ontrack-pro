import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const schema = z
  .object({
    password: z.string().min(6, { message: 'A senha deve ter ao menos 6 caracteres' }).max(72),
    confirmPassword: z.string(),
  })
  .refine(d => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  });

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase parses recovery token from URL hash and creates a temporary session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed = schema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach(i => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) {
      setErrors({ form: error.message });
      return;
    }
    toast.success('Senha atualizada!', { description: 'Você já pode entrar com a nova senha.' });
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-background">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="flex flex-col items-center space-y-3">
          <img src={logo} alt="OnTrack" className="h-14 object-contain invert dark:invert-0" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-heading font-bold text-foreground">Nova senha</h1>
          <p className="text-sm text-muted-foreground">Defina uma nova senha para acessar sua conta.</p>
        </div>

        {!ready ? (
          <div className="flex justify-center py-8 text-muted-foreground">
            <Loader2 className="animate-spin" size={20} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.15em]">Nova senha</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="mín. 6 caracteres"
                  autoComplete="new-password"
                  className={`w-full h-12 px-4 pr-12 rounded-xl bg-card border ${errors.password ? 'border-destructive' : 'border-border'} text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/20`}
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.15em]">Confirmar senha</label>
              <input
                type={show ? 'text' : 'password'} value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)} placeholder="repita a senha"
                autoComplete="new-password"
                className={`w-full h-12 px-4 rounded-xl bg-card border ${errors.confirmPassword ? 'border-destructive' : 'border-border'} text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/20`}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>

            {errors.form && <p className="text-xs text-destructive text-center">{errors.form}</p>}

            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl bg-foreground text-background font-semibold text-sm tracking-wide hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-60">
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
