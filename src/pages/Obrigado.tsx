import { useEffect } from "react";
import { CheckCircle, Smartphone, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Obrigado() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F6FAF6] flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <img src="/grove-icon.svg" alt="Grove" className="h-8 w-8" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <span className="text-2xl font-bold text-[#1B3A24]">Grove</span>
      </div>

      {/* Card principal */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-[#D3E3D3] p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-[#DCF0DA] rounded-full p-4">
            <CheckCircle className="text-[#4A7C59]" size={40} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#1B3A24] mb-2">
          Compra confirmada! 🎉
        </h1>
        <p className="text-[#5A7A63] mb-8">
          Bem-vindo ao Grove. Em instantes você vai receber um e-mail para criar sua senha e começar a usar o app.
        </p>

        {/* Passos */}
        <div className="space-y-4 text-left mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-[#DCF0DA] rounded-full p-2 mt-0.5 shrink-0">
              <Mail className="text-[#4A7C59]" size={16} />
            </div>
            <div>
              <p className="font-semibold text-[#1B3A24] text-sm">1. Verifique seu e-mail</p>
              <p className="text-[#5A7A63] text-xs mt-0.5">Você vai receber um link para criar sua senha. Verifique também a caixa de spam.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-[#DCF0DA] rounded-full p-2 mt-0.5 shrink-0">
              <Smartphone className="text-[#4A7C59]" size={16} />
            </div>
            <div>
              <p className="font-semibold text-[#1B3A24] text-sm">2. Baixe o app Grove Saúde</p>
              <p className="text-[#5A7A63] text-xs mt-0.5">Disponível gratuitamente na App Store para iPhone.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-[#DCF0DA] rounded-full p-2 mt-0.5 shrink-0">
              <ArrowRight className="text-[#4A7C59]" size={16} />
            </div>
            <div>
              <p className="font-semibold text-[#1B3A24] text-sm">3. Faça login e comece</p>
              <p className="text-[#5A7A63] text-xs mt-0.5">Use o e-mail e a senha criados para entrar no app e começar seu acompanhamento.</p>
            </div>
          </div>
        </div>

        {/* Botão App Store */}
        <Button
          asChild
          className="w-full bg-[#1B3A24] hover:bg-[#1B3A24]/90 text-white h-12 rounded-xl text-sm font-semibold"
        >
          <a
            href="https://apps.apple.com/app/grove-saude/id6769884675"
            target="_blank"
            rel="noopener noreferrer"
          >
            Baixar na App Store
          </a>
        </Button>

        <p className="text-xs text-[#5A7A63] mt-4">
          Dúvidas? Entre em contato: <a href="mailto:kendy.emp@gmail.com" className="underline">kendy.emp@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
