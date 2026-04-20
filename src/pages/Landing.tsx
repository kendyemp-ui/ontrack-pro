import { useEffect } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import PainSection from "@/components/landing/PainSection";
import HowItWorks from "@/components/landing/HowItWorks";
import WhatsAppFeature from "@/components/landing/WhatsAppFeature";
import Benefits from "@/components/landing/Benefits";
import Features from "@/components/landing/Features";
import Mockups from "@/components/landing/Mockups";
import Pricing from "@/components/landing/Pricing";
import SocialProof from "@/components/landing/SocialProof";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  useEffect(() => {
    document.title = "OnTrack App, Evolução que acompanha você";

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
      "Acompanhe sua rotina alimentar com clareza, consistência e resultado. Registre refeições, monitore calorias e macros, e visualize sua evolução com o OnTrack App."
    );

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + "/";

    // JSON-LD
    const ldId = "ld-product";
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
      name: "OnTrack App",
      description:
        "App de acompanhamento nutricional com registro de refeições, monitoramento de calorias e macros e gráficos de evolução.",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web, iOS, Android",
      offers: [
        { "@type": "Offer", name: "Mensal", price: "29.90", priceCurrency: "BRL" },
        { "@type": "Offer", name: "Semestral", price: "149.90", priceCurrency: "BRL" },
        { "@type": "Offer", name: "Anual", price: "249.90", priceCurrency: "BRL" },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "320",
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <main>
        <h1 className="sr-only">OnTrack App, Acompanhamento nutricional inteligente</h1>
        <Hero />
        <PainSection />
        <HowItWorks />
        <WhatsAppFeature />
        <Benefits />
        <Features />
        <Mockups />
        <Pricing />
        <SocialProof />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
