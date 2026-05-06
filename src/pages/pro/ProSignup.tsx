import { useState, useMemo, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, Upload, Check, Loader2, FileText } from "lucide-react";
import { GroveIcon } from "@/components/GroveIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// CRN: aceita "CRN-3 12345/P", "CRN3 12345/P", "CRN-3 12345" etc.
const crnRegex = /^CRN[-\s]?[0-9]{1,2}\s?[0-9]{3,6}(\/[A-Za-z]{1,2})?$/i;

const signupSchema = z.object({
  fullName: z.string().trim().min(3, "Nome muito curto").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  whatsapp: z
    .string()
    .trim()
    .min(10, "WhatsApp incompleto")
    .max(20, "WhatsApp muito longo")
    .regex(/^[0-9()\s+\-]+$/, "Use apenas números"),
  crn: z
    .string()
    .trim()
    .min(4)
    .max(30)
    .regex(crnRegex, "Formato esperado: CRN-3 12345/P"),
});

const PLANS = ["teste", "start", "scale", "pro"] as const;
type Plan = (typeof PLANS)[number];

const planLabels: Record<Plan, string> = {
  teste: "Teste, 5 pacientes (grátis)",
  start: "Start, 10 pacientes (R$ 199,90/mês)",
  scale: "Scale, 30 pacientes (R$ 398,90/mês)",
  pro: "Pro, 50 pacientes (R$ 499,90/mês)",
};

const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "pdf"];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export default function ProSignup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialPlan = (params.get("plano") as Plan) || "teste";

  const [plan, setPlan] = useState<Plan>(PLANS.includes(initialPlan) ? initialPlan : "teste");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [crn, setCrn] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string | null => {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXT.includes(ext)) return "Envie JPG, PNG, WEBP ou PDF.";
    if (f.size > MAX_FILE_SIZE) return "Arquivo deve ter até 8 MB.";
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return setFile(null);
    const err = validateFile(f);
    if (err) {
      toast({ title: "Documento inválido", description: err, variant: "destructive" });
      e.target.value = "";
      return;
    }
    setFile(f);
    setErrors((p) => ({ ...p, file: "" }));
  };

  const filePreviewName = useMemo(() => file?.name ?? "", [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = signupSchema.safeParse({ fullName, email, whatsapp, crn });
    const newErrors: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        newErrors[issue.path[0] as string] = issue.message;
      }
    }
    if (!file) newErrors.file = "Anexe o documento de comprovação do CRN.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({ title: "Verifique os campos", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const data = parsed.data!;
      const ext = file!.name.split(".").pop()?.toLowerCase() ?? "pdf";
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
      const path = `signups/${safeName}`;

      const { error: upErr } = await supabase.storage
        .from("pro-documents")
        .upload(path, file!, { contentType: file!.type, upsert: false });

      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("pro_signups").insert({
        full_name: data.fullName,
        email: data.email.toLowerCase(),
        whatsapp: data.whatsapp,
        crn: data.crn.toUpperCase(),
        document_path: path,
        selected_plan: plan,
      });

      if (insErr) {
        // tenta limpar o documento órfão (pode falhar por RLS, sem problema)
        await supabase.storage.from("pro-documents").remove([path]).catch(() => {});
        throw insErr;
      }

      setSuccess(true);
      toast({
        title: "Cadastro recebido",
        description: "Vamos validar seu CRN e te chamar no WhatsApp em até 24h úteis.",
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
              Vamos validar seu CRN e o documento enviado. Em até 24h úteis você recebe a
              liberação no WhatsApp informado.
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

          <h1 className="landing-h2 mt-6">Crie sua conta de profissional.</h1>
          <p className="landing-lead mt-3">
            Validamos cada cadastro manualmente para garantir que o Grove Pro seja usado apenas
            por nutricionistas registrados. Liberação em até 24h úteis.
          </p>

          <Card className="mt-8 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Plano */}
              <div className="space-y-2">
                <Label htmlFor="plan">Plano escolhido</Label>
                <select
                  id="plan"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as Plan)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {PLANS.map((p) => (
                    <option key={p} value={p}>
                      {planLabels[p]}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Você pode trocar de plano depois, sem fidelidade.
                </p>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Como aparece no seu CRN"
                  maxLength={120}
                  autoComplete="name"
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName}</p>
                )}
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
                  {errors.whatsapp && (
                    <p className="text-xs text-destructive">{errors.whatsapp}</p>
                  )}
                </div>
              </div>

              {/* CRN */}
              <div className="space-y-2">
                <Label htmlFor="crn">Número do CRN</Label>
                <Input
                  id="crn"
                  value={crn}
                  onChange={(e) => setCrn(e.target.value.toUpperCase())}
                  placeholder="CRN-3 12345/P"
                  maxLength={30}
                />
                <p className="text-xs text-muted-foreground">
                  Formato: CRN seguido do número da regional, número de inscrição e categoria. Ex.: CRN-3 12345/P.
                </p>
                {errors.crn && <p className="text-xs text-destructive">{errors.crn}</p>}
              </div>

              {/* Upload */}
              <div className="space-y-2">
                <Label htmlFor="document">Documento de comprovação</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-border bg-card/40 px-4 py-4 transition-colors hover:border-accent/50 hover:bg-card"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-background pro-accent">
                    {file ? <FileText size={18} /> : <Upload size={18} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    {file ? (
                      <>
                        <p className="truncate text-sm font-medium text-foreground">
                          {filePreviewName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(0)} KB · clique para trocar
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-foreground">
                          Clique para anexar carteira do CRN ou diploma
                        </p>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG, WEBP ou PDF, até 8 MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  id="document"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf,application/pdf,image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                {errors.file && <p className="text-xs text-destructive">{errors.file}</p>}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full pro-bg-accent text-white hover:opacity-90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando cadastro
                  </>
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
