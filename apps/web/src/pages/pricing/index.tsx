import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { Pricing } from "@/components/landing/pricing";

export default function PricingPage() {
  return (
    <div className="overflow-hidden">
      <Navbar />
      <main>
        <h1 className="sr-only">Plans and pricing</h1>
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
