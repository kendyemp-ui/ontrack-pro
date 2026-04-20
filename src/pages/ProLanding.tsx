import { useEffect } from "react";
import ProNav from "@/components/landing-pro/ProNav";
import ProHero from "@/components/landing-pro/ProHero";
import ProPainSection from "@/components/landing-pro/ProPainSection";
import ProOpportunity from "@/components/landing-pro/ProOpportunity";
import ProHowItWorks from "@/components/landing-pro/ProHowItWorks";
import ProBenefits from "@/components/landing-pro/ProBenefits";
import ProFeatures from "@/components/landing-pro/ProFeatures";
import ProMockups from "@/components/landing-pro/ProMockups";
import ProPricing from "@/components/landing-pro/ProPricing";
import ProSocialProof from "@/components/landing-pro/ProSocialProof";
import ProFAQ from "@/components/landing-pro/ProFAQ";
import ProFinalCTA from "@/components/landing-pro/ProFinalCTA";
import ProFooter from "@/components/landing-pro/ProFooter";

const ProLanding = () => {
  useEffect(() => {
    document.title = "OnTrack Pro — Acompanhamento inteligente, adesão real";

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta(
      "description",
      "Plataforma B2B para nutricionistas. Aumente retenção com acompanhamento contínuo, alertas de risco e dashboard inteligente. Teste grátis até 5 pacientes."
    );

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + "/pro";

    const ldId = "ld-product-pro";
    let ld = document.getElementById(ldId) as HTMLScriptElement | null;
    if (!ld) {
      ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.id = ldId;
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "OnTrack Pro",
      description:
        "Plataforma B2B de acompanhamento nutricional para nutricionistas e profissionais da saúde. Dashboard de pacientes, alertas de adesão e integração com WhatsApp.",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: [
        { "@type": "Offer", name: "Teste", price: "0", priceCurrency: "BRL" },
        { "@type": "Offer", name: "Start", price: "199.90", priceCurrency: "BRL" },
        { "@type": "Offer", name: "Scale", price: "398.90", priceCurrency: "BRL" },
        { "@type": "Offer", name: "Pro", price: "499.90", priceCurrency: "BRL" },
      ],
      audience: {
        "@type": "Audience",
        audienceType: "Nutricionistas e profissionais da saúde",
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProNav />
      <main>
        <h1 className="sr-only">
          OnTrack Pro — Plataforma de acompanhamento para nutricionistas
        </h1>
        <ProHero />
        <ProPainSection />
        <ProOpportunity />
        <ProHowItWorks />
        <ProBenefits />
        <ProFeatures />
        <ProMockups />
        <ProPricing />
        <ProSocialProof />
        <ProFAQ />
        <ProFinalCTA />
      </main>
      <ProFooter />
    </div>
  );
};

export default ProLanding;
