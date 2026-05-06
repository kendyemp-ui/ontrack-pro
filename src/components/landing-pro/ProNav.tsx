import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GroveIcon } from "@/components/GroveIcon";

const links = [
  { href: "#dor", label: "O problema" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#planos", label: "Planos" },
  { href: "#faq", label: "FAQ" },
];

export const ProNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-border/60 bg-background/85 backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <nav className="landing-container flex h-16 items-center justify-between md:h-20">
        <Link to="/pro" className="flex items-center gap-2.5">
          <GroveIcon size={30} wordmark wordmarkSize={18} />
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] pro-accent -ml-1">
            Pro
          </span>
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="sm" className="text-sm">
            <Link to="/pro/login">Entrar</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="text-sm pro-bg-accent text-white hover:opacity-90"
          >
            <Link to="/pro/cadastro">Testar grátis</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label="Abrir menu"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-card/60 text-foreground lg:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden">
          <div className="landing-container flex flex-col gap-1 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-card hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border/60 pt-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/pro/login">Entrar</Link>
              </Button>
              <Button asChild size="sm" className="pro-bg-accent text-white hover:opacity-90">
                <Link to="/pro/cadastro" onClick={() => setOpen(false)}>Testar grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default ProNav;
