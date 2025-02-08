import FeatureCard from "./FeatureCard";
import TrueFocus from "./TrueFocusText";

interface Feature {
  title: string;
  description: string;
  image: string;
}

function About() {
  const Features: Feature[] = [
    {
      title: "Unified Post Scheduler",
      description:
        "One dashboard for all your social media posts. Simplify your workflow and save time.",
      image:
        "https://images.unsplash.com/photo-1642618717985-a681a41d04bc?q=80&w=3118&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Multi-Platform Support",
      description:
        "Seamlessly post to Twitter, LinkedIn, and Instagram from a single interface.",
      image:
        "https://images.unsplash.com/photo-1620794511798-d7ba5299a087?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHNvY2lhbCUyMGFwcHN8ZW58MHx8MHx8fDA%3D",
    },
    {
      title: "Image & Video Uploads",
      description:
        "Easily upload and schedule rich media content to engage your audience.",
      image:
        "https://images.unsplash.com/photo-1528109966604-5a6a4a964e8d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2UlMjBhbmQlMjB2aWRlbyUyMHVwbG9hZHxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      title: "Smart Scheduling",
      description:
        "Queue posts for optimal engagement times and maximize your reach.",
      image:
        "https://images.unsplash.com/photo-1421789497144-f50500b5fcf0?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2NoZWR1bGluZ3xlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      title: "AI-Assisted Captions",
      description:
        "Optionally generate engaging captions using advanced AI technology.",
      image:
        "https://images.unsplash.com/photo-1710993012037-8b00998c5130?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvb2dsZSUyMGdlbWluaXxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      title: "Analytics Dashboard",
      description:
        "Track and analyze post performance across all platforms in one place.",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGFzaGJvYXJkfGVufDB8fDB8fHww",
    },
  ];

  return (
    <div className="min-h-screen py-40 flex flex-col justify-center items-center text-white">
      <TrueFocus
        sentence="Why CrossPostHub?"
        manualMode={false}
        blurAmount={5}
        borderColor="#25DFB3"
        animationDuration={1.5}
        pauseBetweenAnimations={1}
      />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
        {Features.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            image={feature.image}
            description={feature.description}
          />
        ))}
      </div>

    </div>
  );
}

export default About;
