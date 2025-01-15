import { CreatePostForm } from "@/components/CreatePost/CreatePostForm";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Create Post",
};

export default function CreatePostPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <CreatePostForm />
    </div>
  );
}
