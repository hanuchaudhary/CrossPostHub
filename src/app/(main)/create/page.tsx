import { CreatePostForm } from "@/components/CreatePost/CreatePostForm";
import { IconLoader } from "@tabler/icons-react";
import { Metadata } from "next";
import React from "react";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Create Post | CrossPostHub",
  description: "Create a new post on CrossPostHub and share it with the world.",
  openGraph: {
    title: "Create Post | CrossPostHub",
    description: "Create a new post on CrossPostHub and share it with the world.",
    url: "https://crossposthub.com/create",
    siteName: "CrossPostHub",
    locale: "en-US",
    type: "website",
  },
};

export default function CreatePostPage() {
  return (
    <div className="max-w-6xl overflow-x-hidden mx-auto sm:px-6 lg:px-8 md:py-10 pb-6">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <IconLoader className="animate-spin" />
          </div>
        }
      >
        <CreatePostForm />
      </Suspense>
    </div>
  );
}
