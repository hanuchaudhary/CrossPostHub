import React from 'react'
import { Camera, Code2, Twitter, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export function EditorNavbar() {
    const activeMode = "screenshot";
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-background/80 backdrop-blur-xl border rounded-full px-4 py-2 flex items-center gap-2">
                <Button
                    variant={activeMode === 'screenshot' ? "secondary" : "ghost"}
                    className="flex items-center gap-2"
                >
                    <Camera className="h-4 w-4" />
                    <span className="text-sm">Screenshot</span>
                </Button>

                <Button
                    variant={"ghost"}
                    className="flex items-center gap-2"
                >
                    <Twitter className="h-4 w-4" />
                    <span className="text-sm">Tweet</span>
                </Button>

                <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                >
                    <Code2 className="h-4 w-4" />
                    <span className="text-sm">Code</span>
                </Button>

                <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                >
                    <Monitor className="h-4 w-4" />
                    <span className="text-sm">Mockup</span>
                </Button>

                <Link href={"/dashboard"}>
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2"
                    >
                        <Monitor className="h-4 w-4" />
                        <span className="text-sm">Dashboard</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}
