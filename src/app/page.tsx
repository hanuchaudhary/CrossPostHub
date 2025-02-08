import About from "@/components/LandingComponents/About";
import Home from "@/components/LandingComponents/Home";
import LandingFooter from "@/components/LandingComponents/LandingFooter";
import Navbar from "@/components/LandingComponents/Navbar";
import PricingSection from "@/components/LandingComponents/PricingSection";

export default function Page() {
  return (
    <div className="h-full px-3 pt-20  dark:bg-black bg-white">
      <Navbar />
      <Home />
      <About />
      <PricingSection />
      <LandingFooter />
    </div>
  );
}
