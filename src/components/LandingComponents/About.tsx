"use client";

import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { cn } from "@/lib/utils";
import { IconAi, IconBellRinging2, IconClockHour10, IconCode, IconCoinRupeeFilled, IconLayoutDashboardFilled, IconPassword, IconPhotoEdit } from "@tabler/icons-react";

export default function About() {
  const features = [
    {
      icon: <IconAi />,
      title: "AI-Generated Captions",
      description: "Generate captions for your posts with AI.",
    },
    {
      icon: <IconPhotoEdit />,
      title: "Inbuilt Image Editor",
      description: "Edit images within the platform.",
    },
    {
      icon: <IconCode />,
      title: "Code-to-Image Converter",
      description: "Convert code snippets into images.",
    },
    {
      icon: <IconLayoutDashboardFilled />,
      title: "Analytics",
      description: "Track your post performance with analytics.",
    },
    {
      icon: <IconPassword />,
      title: "Security",
      description:
        "Secure login and integrations with social media platforms to keep your accounts safe.",
    },
    {
      icon: <IconCoinRupeeFilled />,
      title: "Affordable Pricing",
      description: "Affordable pricing plans for all users.",
    },
    {
      icon: <IconBellRinging2 />,
      title: "Notifications",
      description: "Get notified about your posts and account activity.",
    },
    {
      icon: <IconClockHour10 />,
      title: "Scheduling",
      description: "Schedule posts for the future.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 my-16 z-30 relative">
      <div className="text-center font-ClashDisplayMedium mb-4">
        <h4 className="md:text-4xl text-2xl">
          ...and so much <span className="text-emerald-500">more!</span>
        </h4>
        <p className="md:text-base text-sm text-center font-ClashDisplayRegular text-muted-foreground leading-4">
          &quot;CrossPostHub offers a plethora of features that make it the
          perfect tool for managing your social media accounts. Here are some of
          the features that make CrossPostHub stand out from the rest.&quot;
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 md:gap-6 gap-2 md:p-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="relative p-6 md:h-44 md:w-48  border dark:border-secondary border-neutral-300/50 flex flex-col overflow-hidden items-center group text-center shadow-sm rounded-2xl bg-primary-foreground gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative dark:bg-muted bg-neutral-200/20 border dark:border-neutral-700/30 border-neutral-300/30` p-5 flex items-center justify-center rounded-2xl">
              {feature.icon}
              <div className="dot1 absolute top-2 left-2 rounded-full bg-muted-foreground/50 h-1 w-1"></div>
              <div className="dot1 absolute top-2 right-2 rounded-full bg-muted-foreground/50 h-1 w-1"></div>
              <div className="dot1 absolute bottom-2 left-2 rounded-full bg-muted-foreground/50 h-1 w-1"></div>
              <div className="dot1 absolute bottom-2 right-2 rounded-full bg-muted-foreground/50 h-1 w-1"></div>
            </div>
            <h3 className="font-ClashDisplayMedium md:text-base leading-tight">
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
                <p className="text-primary text-base font-ClashDisplayMedium leading-5 p-4 flex flex-wrap gap-1 items-center justify-center">
                  {feature.description.split(" ").map((word, index) => (
                    <span
                      key={index}
                      className={cn(index === 0 && "text-emerald-500")}
                    >
                      {word}
                    </span>
                  ))}
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
