import { Cta } from "@/components/landing/cta";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import { Platforms } from "@/components/landing/platforms";
import { Pricing } from "@/components/landing/pricing";
import { SupportedApps } from "@/components/landing/supported-apps";
import { Trust } from "@/components/landing/trust";

export default function Landing() {
  return (
    <section className="landing-neutral overflow-hidden bg-background text-foreground">
      <Navbar />
      <main className="relative h-full min-h-screen">
        <Hero />
        <SupportedApps />
        {/* <HowItWorks /> */}
        <Features />
        <Platforms />
        <Trust />
        <Pricing />
        <Faq />
        <Cta />
        <Footer />
      </main>
    </section>
  );
}
