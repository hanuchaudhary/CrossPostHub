"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-secondary rounded-lg mb-2">
      <button
        className="w-full p-4 text-left flex items-center justify-between hover:bg-secondary/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{question}</span>
        {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-sm text-muted-foreground">
          <div dangerouslySetInnerHTML={{ __html: answer }} />
        </div>
      )}
    </div>
  );
};

export function SecurityFAQ() {
  const faqs = [
    {
      question: "Do you store my social media passwords?",
      answer: "<strong>No, absolutely not.</strong> We never see or store your passwords. When you connect your accounts, you authenticate directly with Twitter, LinkedIn, etc. They give us a secure 'access token' that lets us post on your behalf - but we never get your actual login credentials."
    },
    {
      question: "What exactly do you store in your database?",
      answer: "We store encrypted OAuth access tokens (not passwords) that social media platforms provide. These tokens are like temporary keys that allow us to post content you create. All tokens are encrypted using industry-standard AES-256 encryption before storage."
    },
    {
      question: "Can I revoke access anytime?",
      answer: "<strong>Yes, instantly.</strong> You can disconnect any platform from your dashboard, which immediately deletes the stored tokens. You can also revoke access directly from your social media platform's app settings (Twitter → Settings → Apps, LinkedIn → Privacy → Apps, etc.)."
    },
    {
      question: "Why not use browser cookies instead?",
      answer: "Cookies would be less secure and wouldn't work across devices. Our database approach with encryption ensures your accounts stay connected securely, even when you switch devices or clear your browser. This is the industry standard used by major social media management tools."
    },
    {
      question: "How is this different from other apps like Buffer or Hootsuite?",
      answer: "We use the exact same OAuth security standards as Buffer, Hootsuite, Later, and all major social media tools. This is the industry-standard approach for social media management platforms. The alternative would be storing passwords (which would be far less secure) or requiring you to reconnect every time (which would be impractical)."
    }
  ];

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h3 className="text-lg font-ClashDisplayMedium mb-4 text-center">
        Frequently Asked Questions
      </h3>
      
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
}
