import { CreatePostForm } from "@/components/CreatePost/CreatePostForm";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Create Post | CrossPostHub",
  description: "Create a new post on CrossPostHub.",
};

export default function CreatePostPage() {
  return (
    <div className="max-w-6xl overflow-x-hidden mx-auto sm:px-6 lg:px-8 md:py-10 pb-6">
      <CreatePostForm />
    </div>
  );
}
