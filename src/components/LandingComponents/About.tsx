"use client";

import { useState } from "react";
import FeatureCard from "./FeatureCard";

interface Feature {
  title: string;
  description: string;
  image: string;
}

function About() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const Features: Feature[] = [
    {
      title: "Unified Post Scheduler",
      description: "One dashboard for all your social media posts.",
      image:
        "https://images.unsplash.com/photo-1642618717985-a681a41d04bc?q=80&w=3118&auto=format&fit=crop",
    },
    {
      title: "Multi-Platform Support",
      description: "Seamlessly post to multiple platforms.",
      image:
        "https://images.unsplash.com/photo-1620794511798-d7ba5299a087?w=900&auto=format&fit=crop",
    },
    {
      title: "Image & Video Uploads",
      description: "Upload and schedule media content.",
      image:
        "https://i.pinimg.com/736x/9d/18/3b/9d183b81c09071745583fe932bb5657a.jpg",
    },
    {
      title: "Smart Scheduling",
      description: "Post at optimal engagement times.",
      image:
        "https://i.pinimg.com/736x/cf/c3/fe/cfc3fee57f4e2cf86ce83d362b6c36c2.jpg",
    },
    {
      title: "AI-Assisted Captions",
      description: "Generate engaging captions with AI.",
      image:
        "https://i.pinimg.com/736x/de/ca/d2/decad2dc12d7eacb57814abc200e6657.jpg",
    },
    {
      title: "Analytics Dashboard",
      description: "Track and analyze post performance.",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen relative py-40 flex flex-col justify-center max-w-7xl mx-auto items-center">
      <div className="font-ClashDisplaySemibold text-2xl">
        <h2 className="text-center w-full">
          Why <span className="text-emerald-500">CrossPostHub?</span>
        </h2>
        <p className="md:text-base text-sm text-center font-ClashDisplayRegular text-muted-foreground">
          "Effortless Social Media Management – Schedule, Post, and Analyze with
          Ease!"
        </p>
      </div>

      <div className="mt-12 z-20 md:flex grid grid-cols-1 gap-4 w-full mx-auto overflow-hidden">
        {Features.map((feature, index) => (
          <FeatureCard
            index={index + 1}
            key={index}
            title={feature.title}
            image={feature.image}
            description={feature.description}
            isActive={activeIndex === index}
            onHover={() => setActiveIndex(index)}
            onLeave={() => setActiveIndex(null)}
          />
        ))}
      </div>

      <div
        className={`absolute md:top-40 md:-left-40 top-40 -left-40 md:h-80 h-24 w-[20rem] dark:block rounded-full md:blur-[210px] blur-3xl bg-[#25DFB3]`}
      />
      <div
        className={`absolute md:hidden block top-[60rem] -right-40 md:h-96 h-24 w-[20rem] rounded-full md:blur-[210px] blur-3xl bg-[#25DFB3]`}
      />
    </div>
  );
}

export default About;
