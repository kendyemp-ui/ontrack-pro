import { Link } from "react-router-dom";
import { GroveIcon } from "@/components/GroveIcon";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";

export default function ProObrigado() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">

        {/* Logo */}
        <div className="flex justify-center">
          <GroveIcon size={44} wordmark wordmarkSize={24} />
        </div>

        {/* Ícone de sucesso */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full pro-bg-accent flex items-center justify-center shadow-lg">
            <CheckCircle2 size={40} className="text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Título */}
        <div className="space-y-3">
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Assinatura confirmada!
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Obrigado por assinar o Grove Pro. Em instantes você receberá um e-mail
            com o link para criar sua senha e acessar a plataforma.
          </p>
        </div>

        {/* Card de instrução */}
        <div className="rounded-2xl border border-border/60 bg-card/60 p-6 text-left space-y-4">
          <p className="text-sm font-semibold text-foreground">Próximos passos:</p>
          <div className="space-y-3">
            {[
              { n: "1", text: "Abra o e-mail enviado pelo Grove Pro" },
              { n: "2", text: 'Clique em "Criar minha senha"' },
              { n: "3", text: "Defina sua senha e acesse o dashboard" },
              { n: "4", text: "Cadastre seus primeiros pacientes 🚀" },
            ].map((s) => (
              <div key={s.n} className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full pro-bg-accent text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {s.n}
                </span>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Aviso email */}
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-left">
          <Mail size={16} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700">
            Não encontrou o e-mail? Verifique a caixa de spam ou aguarde alguns minutos.
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" className="h-11">
            <Link to="/pro">Voltar ao início</Link>
          </Button>
          <Button asChild className="h-11 pro-bg-accent text-white hover:opacity-90">
            <Link to="/pro/login">
              Já tenho minha senha <ArrowRight size={15} className="ml-1" />
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Dúvidas? Fale conosco no WhatsApp.
        </p>
      </div>
    </div>
  );
}
