import { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

const schema = z.object({
  email: z.string().trim().email({ message: 'E-mail inválido' }).max(255),
});

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    // Always show generic success — never reveal if account exists
    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-background">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="flex flex-col items-center space-y-3">
          <img src={logo} alt="OnTrack" className="h-14 object-contain invert dark:invert-0" />
        </div>

        {!sent ? (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-heading font-bold text-foreground">Recuperar senha</h1>
              <p className="text-sm text-muted-foreground">
                Informe seu e-mail e enviaremos um link para você redefinir a senha.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.15em]">E-mail</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com" autoComplete="email"
                  className={`w-full h-12 px-4 rounded-xl bg-card border ${error ? 'border-destructive' : 'border-border'} text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/20`}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-xl bg-foreground text-background font-semibold text-sm tracking-wide hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-60">
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Enviar link de recuperação'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-foreground/5 mx-auto flex items-center justify-center">
              <CheckCircle2 size={32} className="text-foreground" strokeWidth={1.5} />
            </div>
            <h1 className="text-xl font-heading font-bold text-foreground">Verifique seu e-mail</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Se existir uma conta com este e-mail, enviaremos um link de recuperação de senha em instantes.
            </p>
          </div>
        )}

        <Link to="/" className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Voltar para o login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
