import { Link } from "react-router-dom";
import { Activity, Mail, AtSign, Linkedin } from "lucide-react";

export const ProFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="landing-container py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/pro" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-card pro-accent">
                <Activity size={16} strokeWidth={2.4} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading text-lg font-semibold tracking-tight">OnTrack</span>
                <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] pro-accent">
                  Pro
                </span>
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Acompanhamento inteligente, adesão real. A plataforma B2B que transforma
              acompanhamento em retenção.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="mailto:comercial@ontrackpro.com"
                aria-label="E-mail comercial"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/60 text-muted-foreground transition-colors hover:pro-border-accent hover:pro-accent"
              >
                <Mail size={15} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/60 text-muted-foreground transition-colors hover:pro-border-accent hover:pro-accent"
              >
                <AtSign size={15} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/60 text-muted-foreground transition-colors hover:pro-border-accent hover:pro-accent"
              >
                <Linkedin size={15} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold">Produto</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><a href="#beneficios" className="transition-colors hover:text-foreground">Benefícios</a></li>
              <li><a href="#funcionalidades" className="transition-colors hover:text-foreground">Funcionalidades</a></li>
              <li><a href="#planos" className="transition-colors hover:text-foreground">Planos</a></li>
              <li><a href="#faq" className="transition-colors hover:text-foreground">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold">Conta</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><Link to="/pro/login" className="transition-colors hover:text-foreground">Entrar</Link></li>
              <li><a href="#planos" className="transition-colors hover:text-foreground">Testar grátis</a></li>
              <li><Link to="/" className="transition-colors hover:text-foreground">Versão para pacientes</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold">Legal</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="transition-colors hover:text-foreground">Política de privacidade</a></li>
              <li><a href="#" className="transition-colors hover:text-foreground">Termos de uso</a></li>
              <li><a href="mailto:comercial@ontrackpro.com" className="transition-colors hover:text-foreground">Contato comercial</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} OnTrack Pro. Todos os direitos reservados.</p>
          <p className="italic">Acompanhamento inteligente, adesão real.</p>
        </div>
      </div>
    </footer>
  );
};

export default ProFooter;
