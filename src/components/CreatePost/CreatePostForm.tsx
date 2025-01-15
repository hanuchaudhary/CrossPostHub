"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/CreatePost/ImageUpload";
import { PostPreview } from "@/components/CreatePost/PostPreview";
import { PlatformSelector } from "@/components/CreatePost/PlatformSelector";
import { SchedulePost } from "@/components/CreatePost/SchedulePost";
import { toast } from "@/hooks/use-toast";

type Platform = "instagram" | "twitter" | "linkedin";

export function CreatePostForm() {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleImageChange = (files: FileList | null) => {
    if (files) {
      console.log(files);
      console.log("file sleected");
      
      
      setImages(Array.from(files));
    }
  };

  const handlePublishPost = () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Please select at least one platform",
        description:
          "You need to select at least one platform to publish your post",
      });
      return;
    }

    if (!content.trim() && images.length === 0) {
      toast({
        title: "Please add some content or images",
        description:
          "You need to add some content or images to publish your post",
      });
      return;
    }

    console.log({
      content,
      images,
      platforms: selectedPlatforms,
      scheduleDate,
    });
    toast({
      title: "Post published",
      description: "Your post has been published successfully",
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="edit" className="space-y-4">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={handleContentChange}
              rows={5}
            />
            <ImageUpload onChange={handleImageChange} />
            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              setSelectedPlatforms={setSelectedPlatforms}
            />
            <SchedulePost
              scheduleDate={scheduleDate}
              setScheduleDate={setScheduleDate}
            />
          </TabsContent>
          <TabsContent value="preview">
            <PostPreview content={content} images={images} />
          </TabsContent>
        </Tabs>
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={handlePublishPost}>
            {scheduleDate ? "Schedule Post" : "Publish Now"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
