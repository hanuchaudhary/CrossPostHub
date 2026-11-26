import { Cta } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import { Pricing } from "@/components/landing/pricing";
import { SupportedApps } from "@/components/landing/supported-apps";

export default function Landing() {
  return (
    <section className="landing-neutral overflow-hidden bg-background text-foreground">
      <Navbar />
      <main className="relative h-full min-h-screen">
        <Hero />
        <SupportedApps />
        <Features />
        <Pricing />
        <Cta />
        <Footer />
      </main>
    </section>
  );
}
