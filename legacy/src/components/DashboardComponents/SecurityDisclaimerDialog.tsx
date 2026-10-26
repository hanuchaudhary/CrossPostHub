"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, Lock } from "lucide-react";

export function SecurityDisclaimerDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the disclaimer
    const hasSeenDisclaimer = localStorage.getItem('security-disclaimer-seen');
    if (!hasSeenDisclaimer) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('security-disclaimer-seen', 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-emerald-600" />
            <DialogTitle className="text-lg font-ClashDisplayMedium">
              Your Security & Privacy
            </DialogTitle>
          </div>
          <DialogDescription className="text-left space-y-3">
            <p>
              Before you connect your social media accounts, here's what you should know:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">We never store your passwords</p>
                  <p className="text-xs text-muted-foreground">
                    You authenticate directly with each platform. We only receive secure access tokens.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Industry-standard security</p>
                  <p className="text-xs text-muted-foreground">
                    We use the same OAuth security as Buffer, Hootsuite, and other major platforms.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">You're in control</p>
                  <p className="text-xs text-muted-foreground">
                    Disconnect anytime from your dashboard or directly from your social media settings.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground pt-2">
              For more details, check our Security FAQ in the Guide.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleAccept} className="w-full">
            Got it, let's continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
