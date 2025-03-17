import About from "@/components/LandingComponents/About";
import Features from "@/components/LandingComponents/Features";
import Home from "@/components/LandingComponents/Home";
import LandingFooter from "@/components/LandingComponents/LandingFooter";
import Navbar from "@/components/LandingComponents/Navbar";
import PricingSection from "@/components/LandingComponents/PricingSection";

export default function Page() {
  return (
    <div className="h-full px-3 pt-20 overflow-hidden dark:bg-black bg-neutral-100">
      <Navbar />
      <Home />
      <Features/>
      <About />
      <PricingSection />
      <LandingFooter />
    </div>
  );
}
