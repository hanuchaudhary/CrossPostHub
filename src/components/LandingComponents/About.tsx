"use client";

import {
  AlignVerticalJustifyCenter,
  Captions,
  Code2,
  EditIcon,
  SquareSquare,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

export default function About() {
  const features = [
    {
      icon: Captions,
      title: "AI-Generated Captions",
      description: "Generate captions for your posts with AI.",
    },
    {
      icon: EditIcon,
      title: "Inbuilt Image Editor",
      description: "Edit images within the platform.",
    },
    {
      icon: Code2,
      title: "Code-to-Image Converter",
      description: "Convert code snippets into images.",
    },
    {
      icon: AlignVerticalJustifyCenter,
      title: "Analytics",
      description: "Track your post performance with analytics.",
    },
    {
      icon: SquareSquare,
      title: "Security",
      description:
        "Secure login and integrations with social media platforms to keep your accounts safe.",
    },
    {
      icon: AlignVerticalJustifyCenter,
      title: "Analytics",
      description: "Track your post performance with analytics.",
    },
    {
      icon: AlignVerticalJustifyCenter,
      title: "Analytics",
      description: "Track your post performance with analytics.",
    },
    {
      icon: SquareSquare,
      title: "Security",
      description:
        "Secure login and integrations with social media platforms to keep your accounts safe.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 my-16 z-50 relative">
      <h4 className="text-4xl text-center font-ClashDisplayMedium mb-4">
        ...and so much <span className="text-emerald-500">more!</span>
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="relative p-6 h-44 w-48 border dark:border-secondary border-neutral-300/80 flex flex-col overflow-hidden items-center group text-center shadow-sm rounded-2xl bg-primary-foreground gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative dark:bg-muted bg-neutral-200/40 border border-secondary p-5 flex items-center justify-center rounded-2xl">
              <feature.icon className="h-6 w-6 text-primary" />
              <div className="dot1 absolute top-2 left-2 rounded-full bg-muted-foreground/50 h-1 w-1"></div>
              <div className="dot1 absolute top-2 right-2 rounded-full bg-muted-foreground/50 h-1 w-1"></div>
              <div className="dot1 absolute bottom-2 left-2 rounded-full bg-muted-foreground/50 h-1 w-1"></div>
              <div className="dot1 absolute bottom-2 right-2 rounded-full bg-muted-foreground/50 h-1 w-1"></div>
            </div>
            <h3 className="font-ClashDisplayMedium text-lg leading-none">
              {feature.title}
            </h3>
            <AnimatePresence>
              <motion.div
                initial={{ scale: 0.98, opacity: 0, filter: "blur(10px)" }}
                whileHover={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 h-full w-full bg-primary-foreground flex items-center justify-center rounded-3xl"
              >
                <p className="text-primary text-lg font-ClashDisplayMedium leading-5 text-center p-4">
                  {feature.description}
                </p>
                <div className="dot1 absolute top-3 left-3 rounded-full bg-muted-foreground/50 h-1.5 w-1.5"></div>
                <div className="dot1 absolute top-3 right-3 rounded-full bg-muted-foreground/50 h-1.5 w-1.5"></div>
                <div className="dot1 absolute bottom-3 left-3 rounded-full bg-muted-foreground/50 h-1.5 w-1.5"></div>
                <div className="dot1 absolute bottom-3 right-3 rounded-full bg-muted-foreground/50 h-1.5 w-1.5"></div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
