"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { TwitterPreview } from "@/components/Previews/TwitterPreview";
import { InstagramPreview } from "@/components/Previews/InstagramPreview";
import { LinkedInPreview } from "@/components/Previews/LinkedinPreview";

interface PostPreviewProps {
  content: string;
  images: File[];
}

export function PostPreview({ content, images }: PostPreviewProps) {
  const { data: session, status } = useSession();
  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser(session.user);
    }
  }, [session, status]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to preview your post.</div>;
  }

  const platforms = ["Instagram", "X", "LinkedIn"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {platforms.map((platform) => (
        <Card
          className="border-none shadow-none rounded-none p-0"
          key={platform}
        >
          <CardHeader>
            <CardTitle>{platform}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {platform === "X" ? (
              <TwitterPreview content={content} images={images} user={user} />
            ) : platform === "Instagram" ? (
              <InstagramPreview content={content} images={images} user={user} />
            ) : platform === "LinkedIn" ? (
              <LinkedInPreview content={content} images={images} user={user} />
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
