"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { guideContent } from "@/data/GuideData";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ChevronDown, ChevronRight } from "lucide-react";

interface GuideProps {
  title?: string;
  size?: "default" | "sm" | "lg" | "icon" | "xl" | null | undefined;
}

export default function Guide({ title = "Guide", size }: GuideProps) {
  const [guideData] = React.useState(guideContent);
  const { theme } = useTheme();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="text-primary" variant="outline" size={size}>
          {title}
        </Button>
      </SheetTrigger>
      <SheetContent className="max-w-2xl overflow-y-auto md:max-w-3xl">
        <SheetHeader>
          <SheetTitle>
            <h1 className="font-ClashDisplayMedium text-xl text-emerald-500 leading-none">
              CrosspostHub
            </h1>
            <SheetDescription className="text-neutral-500 font-medium text-sm leading-none dark:text-neutral-400 md:text-base">
              All your social media in one place.
            </SheetDescription>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <Section title={guideData.features.title}>
            <div className="space-y-4">
              {guideData.features.content.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-secondary/20 transition-colors">
                  <h3 className="font-ClashDisplayMedium text-base mb-2 text-emerald-600 dark:text-emerald-400">
                    {item.feature}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.description}
                  </p>
                  <div className="bg-secondary/30 rounded p-2">
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      How to use: {item.howTo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title={guideData.stepByStepGuide.title}>
            <div className="space-y-4">
              {guideData.stepByStepGuide.steps.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-ClashDisplayMedium text-base mb-1">
                      {item.step}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 space-y-4">
              <h3 className="font-ClashDisplayMedium text-base">Creating Posts:</h3>
              <Image
                src={
                  theme === "dark"
                    ? guideData.stepByStepGuide.createPostImageDark
                    : guideData.stepByStepGuide.createPostImageLight
                }
                alt="Create Post Interface"
                width={1200}
                height={800}
                className="rounded-2xl border-4"
              />
              
              <h3 className="font-ClashDisplayMedium text-base">Preview Posts:</h3>
              <Image
                src={
                  theme === "dark"
                    ? guideData.stepByStepGuide.previewImageDark
                    : guideData.stepByStepGuide.previewImageLight
                }
                alt="Preview Post Interface"
                width={1200}
                height={800}
                className="rounded-2xl border-4"
              />
            </div>
          </Section>

          <Section title={guideData.securityFaq.title}>
            <div className="space-y-2">
              {guideData.securityFaq.faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-semibold text-xl mb-2">{title}</h2>
      {children}
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-secondary rounded-lg mb-2">
      <button
        className="w-full p-4 text-left flex items-center justify-between hover:bg-secondary/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-sm md:text-base">{question}</span>
        {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-sm md:text-base text-muted-foreground">
          <div dangerouslySetInnerHTML={{ __html: answer }} />
        </div>
      )}
    </div>
  );
}
