import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { GroveIcon } from "@/components/GroveIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const signupSchema = z.object({
  fullName: z.string().trim().min(3, "Nome muito curto").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  whatsapp: z
    .string()
    .trim()
    .min(10, "WhatsApp incompleto")
    .max(20, "WhatsApp muito longo")
    .regex(/^[0-9()\s+\-]+$/, "Use apenas números"),
});

export default function ProSignup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = signupSchema.safeParse({ fullName, email, whatsapp });
    if (!parsed.success) {
      const newErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        newErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(newErrors);
      toast({ title: "Verifique os campos", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error: insErr } = await supabase.from("pro_signups").insert({
        full_name: parsed.data.fullName,
        email: parsed.data.email.toLowerCase(),
        whatsapp: parsed.data.whatsapp,
        selected_plan: 'teste',
      });

      if (insErr) throw insErr;

      setSuccess(true);
      toast({
        title: "Cadastro recebido!",
        description: "Entraremos em contato no WhatsApp em até 24h úteis.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Tente novamente em instantes.";
      toast({ title: "Não foi possível enviar", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="landing-container flex min-h-screen items-center justify-center py-20">
          <Card className="w-full max-w-lg p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full pro-bg-accent text-white">
              <Check size={26} strokeWidth={2.6} />
            </div>
            <h1 className="mt-6 font-heading text-2xl font-semibold tracking-tight">
              Cadastro recebido!
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Em até 24h úteis você recebe a liberação no WhatsApp informado.
            </p>
            <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild variant="outline">
                <Link to="/pro">Voltar para a página inicial</Link>
              </Button>
              <Button onClick={() => navigate("/pro/login")} className="pro-bg-accent text-white hover:opacity-90">
                Já tenho acesso
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="landing-container py-10 sm:py-14">
        <Link
          to="/pro"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} /> Voltar
        </Link>

        <div className="mx-auto mt-8 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <GroveIcon size={30} wordmark wordmarkSize={18} />
            <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] pro-accent -ml-1">Pro</span>
          </div>

          <h1 className="landing-h2 mt-6">Começar gratuitamente.</h1>
          <p className="landing-lead mt-3">
            Plano Teste — até 5 pacientes, sem cartão. Liberação em até 24h úteis direto no seu WhatsApp.
          </p>

          <Card className="mt-8 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  maxLength={120}
                  autoComplete="name"
                />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
              </div>

              {/* Email + WhatsApp */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail profissional</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    maxLength={255}
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
                    maxLength={20}
                    autoComplete="tel"
                  />
                  {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp}</p>}
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full pro-bg-accent text-white hover:opacity-90"
              >
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando cadastro</>
                ) : (
                  "Enviar cadastro"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Ao enviar, você concorda com nossa Política de Privacidade e Termos de Uso.
              </p>
            </form>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/pro/login" className="text-foreground underline-offset-4 hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
