import { LayoutDashboard, Flame, Drumstick, LineChart, History, Target, Bell, Smartphone } from "lucide-react";

const features = [
  { icon: LayoutDashboard, label: "Dashboard nutricional diário" },
  { icon: Flame, label: "Acompanhamento de calorias" },
  { icon: Drumstick, label: "Proteína e carboidratos em tempo real" },
  { icon: LineChart, label: "Evolução por semana, mês e ano" },
  { icon: History, label: "Histórico completo de refeições" },
  { icon: Target, label: "Metas nutricionais personalizadas" },
  { icon: Bell, label: "Alertas e feedbacks inteligentes" },
  { icon: Smartphone, label: "Integração futura: WhatsApp e wearables" },
];

export const Features = () => {
  return (
    <section id="funcionalidades" className="landing-section relative bg-card/30">
      <div className="landing-container">
        <div className="grid items-end gap-10 md:grid-cols-2">
          <div>
            <span className="landing-eyebrow">Funcionalidades</span>
            <h2 className="landing-h2 mt-5">
              Um produto pensado <br />
              para a sua <span className="accent-text">consistência</span>.
            </h2>
          </div>
          <p className="landing-lead md:text-right">
            Cada funcionalidade existe pra eliminar uma fricção da sua rotina.
            Sem excesso, sem distração, só o que importa.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-3 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.label}
              className="group flex flex-col gap-3 bg-background p-4 transition-colors hover:bg-card sm:gap-4 sm:p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <f.icon size={18} />
              </div>
              <p className="font-heading text-sm font-medium leading-snug">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
