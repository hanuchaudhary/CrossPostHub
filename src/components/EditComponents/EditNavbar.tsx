import React from 'react'
import { Camera, Code2, Twitter, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
    onScreenshot: () => void;
    onTweet: () => void;
    onCode: () => void;
    onMockup: () => void;
    activeMode: 'default' | 'screenshot' | 'twitter';
}

export function EditorNavbar({ onScreenshot, onTweet, onCode, onMockup, activeMode }: EditorNavbarProps) {
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-background/80 backdrop-blur-xl border rounded-full px-4 py-2 flex items-center gap-2">
                <Button
                    variant={activeMode === 'screenshot' ? "secondary" : "ghost"}
                    className="flex items-center gap-2"
                    onClick={onScreenshot}
                >
                    <Camera className="h-4 w-4" />
                    <span className="text-sm">Screenshot</span>
                </Button>

                <Button
                    variant={activeMode === 'twitter' ? "secondary" : "ghost"}
                    className="flex items-center gap-2"
                    onClick={onTweet}
                >
                    <Twitter className="h-4 w-4" />
                    <span className="text-sm">Tweet</span>
                </Button>

                <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                    onClick={onCode}
                >
                    <Code2 className="h-4 w-4" />
                    <span className="text-sm">Code</span>
                </Button>

                <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                    onClick={onMockup}
                >
                    <Monitor className="h-4 w-4" />
                    <span className="text-sm">Mockup</span>
                </Button>
            </div>
        </div>
    );
}
