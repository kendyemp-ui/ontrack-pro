import { Link } from "react-router-dom";
import { Mail, AtSign, MessageCircle } from "lucide-react";
import logo from "@/assets/ontrack-logo.png";

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="landing-container py-10 md:py-16">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-12">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <img src={logo} alt="OnTrack App" className="h-8 w-8 rounded-lg" width={32} height={32} />
              <span className="font-heading text-lg font-semibold tracking-tight">OnTrack</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Evolução que acompanha você. O jeito mais simples e visual de manter
              constância na sua rotina alimentar.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="mailto:contato@ontrackapp.com"
                aria-label="E-mail"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/60 text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
              >
                <Mail size={15} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/60 text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
              >
                <AtSign size={15} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/60 text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
              >
                <MessageCircle size={15} />
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
              <li><Link to="/login" className="transition-colors hover:text-foreground">Entrar</Link></li>
              <li><a href="#planos" className="transition-colors hover:text-foreground">Criar conta</a></li>
              <li><Link to="/pro" className="transition-colors hover:text-foreground">Para profissionais</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold">Legal</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="transition-colors hover:text-foreground">Política de privacidade</a></li>
              <li><a href="#" className="transition-colors hover:text-foreground">Termos de uso</a></li>
              <li><a href="mailto:contato@ontrackapp.com" className="transition-colors hover:text-foreground">Contato</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row md:mt-12">
          <p>© {year} OnTrack App. Todos os direitos reservados.</p>
          <p className="italic">Evolução que acompanha você.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
