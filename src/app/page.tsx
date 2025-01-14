import About from "@/components/LandingComponents/About";
import Home from "@/components/LandingComponents/Home";
import LandingFooter from "@/components/LandingComponents/LandingFooter";
import Navbar from "@/components/LandingComponents/Navbar";
import PricingSection from "@/components/LandingComponents/PricingSection";

export default function Page() {
  return (
    <div className="min-h-screen px-3">
      <Navbar />
      <Home />
      <About/>
      <PricingSection />
      <LandingFooter/>
    </div>
  );
}
