import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import logo from '@/assets/logo.png';
import { toast } from 'sonner';

type Tab = 'login' | 'signup';

const signInSchema = z.object({
  email: z.string().trim().email({ message: 'E-mail inválido' }).max(255),
  password: z.string().min(1, { message: 'Informe sua senha' }),
});

const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, { message: 'Informe seu nome completo' }).max(120),
    email: z.string().trim().email({ message: 'E-mail inválido' }).max(255),
    phone: z
      .string()
      .trim()
      .min(8, { message: 'Telefone inválido' })
      .max(20, { message: 'Telefone inválido' })
      .regex(/^[\d\s()+-]+$/, { message: 'Telefone inválido' }),
    password: z.string().min(6, { message: 'A senha deve ter ao menos 6 caracteres' }).max(72),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'Você precisa aceitar os termos' }),
    }),
  })
  .refine(d => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  });

const Login = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');

  // Shared
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [stayConnected, setStayConnected] = useState(true);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  // Signup fields
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});
    const parsed = signInSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach(i => { errs[i.path[0] as string] = i.message; });
      setLoginErrors(errs);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      const msg = error.message.includes('Invalid login credentials')
        ? 'E-mail ou senha incorretos'
        : error.message;
      setLoginErrors({ form: msg });
      return;
    }
    toast.success('Bem-vindo de volta!');
    navigate('/dashboard');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});
    const parsed = signUpSchema.safeParse({
      fullName, email: signupEmail, phone, password: signupPassword, confirmPassword, acceptTerms,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach(i => { errs[i.path[0] as string] = i.message; });
      setSignupErrors(errs);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: parsed.data.fullName,
          phone: parsed.data.phone,
        },
      },
    });
    setLoading(false);
    if (error) {
      const msg = error.message.includes('already registered') || error.message.includes('already been registered')
        ? 'Já existe uma conta com esse e-mail'
        : error.message;
      setSignupErrors({ form: msg });
      return;
    }
    toast.success('Conta criada com sucesso!', { description: 'Você já está conectado.' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-background">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-3">
          <img src={logo} alt="OnTrack" className="h-16 sm:h-20 object-contain invert dark:invert-0" />
          <p className="text-xs text-muted-foreground tracking-[0.2em] italic">
            evolução que acompanha você
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-card border border-border">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`h-10 rounded-lg text-sm font-semibold transition-all ${
              tab === 'login' ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={`h-10 rounded-lg text-sm font-semibold transition-all ${
              tab === 'signup' ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Criar conta
          </button>
        </div>

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
            <Field label="E-mail" error={loginErrors.email}>
              <input
                type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                placeholder="seu@email.com" autoComplete="email"
                className={inputCls(!!loginErrors.email)}
              />
            </Field>

            <Field label="Senha" error={loginErrors.password}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)} placeholder="••••••"
                  autoComplete="current-password" className={inputCls(!!loginErrors.password, true)}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={stayConnected}
                  onChange={e => setStayConnected(e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-foreground" />
                <span className="text-xs text-muted-foreground">Continuar conectado</span>
              </label>
              <Link to="/esqueci-senha" className="text-xs text-foreground/80 hover:text-foreground underline underline-offset-4">
                Esqueci minha senha
              </Link>
            </div>

            {loginErrors.form && <p className="text-xs text-destructive text-center">{loginErrors.form}</p>}

            <button type="submit" disabled={loading} className={primaryBtn}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Entrar'}
            </button>
          </form>
        )}

        {/* SIGNUP FORM */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4 animate-fade-in">
            <Field label="Nome completo" error={signupErrors.fullName}>
              <input
                type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Seu nome" autoComplete="name"
                className={inputCls(!!signupErrors.fullName)}
              />
            </Field>

            <Field label="E-mail" error={signupErrors.email}>
              <input
                type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                placeholder="seu@email.com" autoComplete="email"
                className={inputCls(!!signupErrors.email)}
              />
            </Field>

            <Field label="Telefone / WhatsApp" error={signupErrors.phone}>
              <input
                type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="(11) 99999-0000" autoComplete="tel"
                className={inputCls(!!signupErrors.phone)}
              />
            </Field>

            <Field label="Senha" error={signupErrors.password}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)} placeholder="mín. 6 caracteres"
                  autoComplete="new-password" className={inputCls(!!signupErrors.password, true)}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <Field label="Confirmar senha" error={signupErrors.confirmPassword}>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} placeholder="repita a senha"
                  autoComplete="new-password" className={inputCls(!!signupErrors.confirmPassword, true)}
                />
                <button type="button" onClick={() => setShowConfirm(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input type="checkbox" checked={acceptTerms}
                onChange={e => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-border accent-foreground shrink-0" />
              <span className="text-xs text-muted-foreground leading-relaxed">
                Aceito os <a className="underline underline-offset-2 text-foreground/80" href="#">Termos de uso</a> e a <a className="underline underline-offset-2 text-foreground/80" href="#">Política de privacidade</a>.
              </span>
            </label>
            {signupErrors.acceptTerms && <p className="text-xs text-destructive">{signupErrors.acceptTerms}</p>}

            {signupErrors.form && <p className="text-xs text-destructive text-center">{signupErrors.form}</p>}

            <button type="submit" disabled={loading} className={primaryBtn}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Criar conta'}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Já tem conta?{' '}
              <button type="button" onClick={() => setTab('login')}
                className="font-semibold text-foreground underline underline-offset-4">
                Entrar
              </button>
            </p>
          </form>
        )}

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

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.15em]">{label}</label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

const inputCls = (hasError: boolean, withRightIcon = false) =>
  `w-full h-12 px-4 ${withRightIcon ? 'pr-12' : ''} rounded-xl bg-card border ${
    hasError ? 'border-destructive' : 'border-border'
  } text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all`;

const primaryBtn =
  'w-full h-12 rounded-xl bg-foreground text-background font-semibold text-sm tracking-wide hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed';

export default Login;
