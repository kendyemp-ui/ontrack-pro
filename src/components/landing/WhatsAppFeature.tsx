import { Camera, MessageCircle, CheckCheck, Sparkles, Zap, Clock } from "lucide-react";

const messages = [
  {
    type: "received" as const,
    time: "12:42",
    image: "🥗",
    caption: "Almoço de hoje 🍽️",
  },
  {
    type: "sent" as const,
    time: "12:42",
    text: "Recebi! Analisando sua refeição… 📸",
  },
  {
    type: "sent" as const,
    time: "12:42",
    text:
      "✅ *Almoço registrado*\n\n🍗 Frango grelhado · 180g\n🍚 Arroz integral · 100g\n🥦 Brócolis · 80g\n\n📊 *520 kcal* · 42g proteína · 48g carbs",
  },
  {
    type: "received" as const,
    time: "12:43",
    text: "Perfeito! Como tô indo no dia?",
  },
  {
    type: "sent" as const,
    time: "12:43",
    text:
      "Você já consumiu *1.840 / 2.480 kcal* hoje 🔥\nProteína: 98/140g\nFaltam *640 kcal* pra sua meta, segue firme! 💪",
  },
];

const benefits = [
  {
    icon: Camera,
    title: "Tire uma foto",
    desc: "Bateu uma foto da refeição? Pronto. Sem digitar nada.",
  },
  {
    icon: Zap,
    title: "Registro automático",
    desc: "Calorias, proteína e carbs calculados na hora, sem você precisar pensar.",
  },
  {
    icon: Clock,
    title: "Tempo real no app",
    desc: "Tudo aparece no seu dashboard imediatamente, sincronizado com seu dia.",
  },
];

export const WhatsAppFeature = () => {
  return (
    <section
      id="whatsapp"
      className="landing-section relative overflow-hidden border-y border-border/60 bg-card/30"
    >
      <div
        aria-hidden
        className="absolute right-0 top-1/2 -z-10 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/3 rounded-full bg-[#25D366]/10 blur-[120px]"
      />

      <div className="landing-container">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-20">
          {/* Left: copy */}
          <div>
            <span className="landing-eyebrow">
              <MessageCircle size={12} className="text-[#25D366]" />
              O diferencial Grove
            </span>

            <h2 className="landing-h2 mt-5">
              Registre suas refeições <br className="hidden sm:block" />
              <span className="text-gradient-mono">direto pelo WhatsApp.</span>
            </h2>

            <p className="landing-lead mt-5 max-w-xl">
              Esqueça digitar, escanear código de barras ou abrir app. Mande uma
              foto da sua refeição no WhatsApp do Grove e ela é registrada
              automaticamente, calorias, proteína e carbs calculados na hora.
            </p>

            <div className="mt-10 space-y-5">
              {benefits.map((b) => (
                <div key={b.title} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background">
                    <b.icon size={18} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-semibold">
                      {b.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 p-4">
              <Sparkles size={16} className="shrink-0 text-accent" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Sem app pra abrir.</span>{" "}
                Você usa o WhatsApp 80x por dia, agora ele trabalha pela sua
                evolução.
              </p>
            </div>
          </div>

          {/* Right: WhatsApp preview */}
          <div className="relative mx-auto hidden w-full max-w-[400px] sm:block">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 translate-y-10 scale-105 rounded-[2.5rem] bg-[#25D366]/15 blur-3xl"
            />

            <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-background shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
              {/* WhatsApp header */}
              <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]">
                  <MessageCircle size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Grove</p>
                  <p className="text-[10px] text-white/70">online</p>
                </div>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white/90">
                  Oficial
                </span>
              </div>

              {/* Messages */}
              <div
                className="space-y-2.5 px-4 py-5"
                style={{ background: "#0b1014" }}
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      m.type === "sent" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow ${
                        m.type === "sent"
                          ? "rounded-bl-md bg-[#1f2c34] text-foreground/95"
                          : "rounded-br-md bg-[#005c4b] text-white"
                      }`}
                    >
                      {m.image && (
                        <div className="mb-1.5 flex h-32 items-center justify-center rounded-lg bg-black/30 text-5xl">
                          {m.image}
                        </div>
                      )}
                      {m.caption && (
                        <p className="text-[13px] leading-relaxed">{m.caption}</p>
                      )}
                      {m.text && (
                        <p className="whitespace-pre-line text-[13px] leading-relaxed">
                          {m.text.split(/(\*[^*]+\*)/g).map((part, j) =>
                            part.startsWith("*") && part.endsWith("*") ? (
                              <span key={j} className="font-semibold">
                                {part.slice(1, -1)}
                              </span>
                            ) : (
                              <span key={j}>{part}</span>
                            )
                          )}
                        </p>
                      )}
                      <div className="mt-1 flex items-center justify-end gap-1">
                        <span
                          className={`text-[10px] ${
                            m.type === "sent"
                              ? "text-muted-foreground"
                              : "text-white/70"
                          }`}
                        >
                          {m.time}
                        </span>
                        {m.type === "received" && (
                          <CheckCheck size={12} className="text-[#53bdeb]" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsAppFeature;
