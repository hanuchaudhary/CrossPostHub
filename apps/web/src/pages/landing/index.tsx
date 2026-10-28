import { Cta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Navbar } from "@/components/landing/navbar";
import { Pricing } from "@/components/landing/pricing";
import Feature from "@/components/ui/block-feature";

export default function Landing() {
  return (
    <section className="overflow-hidden">
      <Navbar />
      <main className="relative h-full min-h-screen">
        <Hero />
        <HowItWorks />
        <Feature />
        <Pricing />
        <Cta />
        <Footer />
      </main>
    </section>
  );
}
