import { CreatePostForm } from "@/components/CreatePost/CreatePostForm";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Create Post",
};

export default function CreatePostPage() {
  return (
    <div className="max-w-5xl mx-auto sm:px-6 lg:px-8 md:py-10 pb-6">
      <CreatePostForm />
    </div>
  );
}
