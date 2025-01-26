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

  const platforms = ["Linkedin", "X", "Instagram"];

  if (!content && images.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <h2 className="font-ClashDisplayMedium bg-secondary/50 rounded-xl leading-none border border-secondary px-10 py-3 text-lg">
          Write something or add an image to preview your post.
        </h2>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {platforms.map((platform) => (
        <Card
          className="border-none shadow-none rounded-none p-0"
          key={platform}
        >
          <CardHeader className="px-1 py-3">
            <CardTitle className="font-ClashDisplayRegular">
              {platform}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {platform === "Linkedin" ? (
              <LinkedInPreview content={content} images={images} user={user} />
            ) : platform === "Instagram" ? (
              <InstagramPreview content={content} images={images} user={user} />
            ) : platform === "X" ? (
              <TwitterPreview content={content} images={images} user={user} />
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
