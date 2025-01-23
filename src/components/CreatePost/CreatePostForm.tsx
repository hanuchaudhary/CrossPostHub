"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/CreatePost/ImageUpload";
import { PostPreview } from "@/components/CreatePost/PostPreview";
import { PlatformSelector } from "@/components/CreatePost/PlatformSelector";
import { SchedulePost } from "@/components/CreatePost/SchedulePost";
import { AIAssist } from "@/components/CreatePost/AiAssist";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import axios from "axios";
import BottomLoader from "../Loaders/BottomLoader";
import { Badge } from "@/components/ui/badge";
import { SimplePostPreview } from "@/components/Previews/SimplePostPreview";
import { AnimatePresence, motion } from "framer-motion";

type Platform = "instagram" | "twitter" | "linkedin";

export function CreatePostForm() {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [scheduleTime, setScheduleTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSinglePreview, setIsSinglePreview] = useState(true);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleAIAssist = (generatedContent: string) => {
    setContent(
      (prevContent) =>
        prevContent + (prevContent ? "\n\n" : "") + generatedContent
    );
  };

  const handleImageChange = (files: FileList | null) => {
    if (files) {
      setImages(Array.from(files));
    }
  };

  const handlePublishPost = async () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Platform Selection Required",
        description: (
          <div>
            <Badge className="my-2" variant="destructive">
              Error
            </Badge>
            <div className="text-xs">
              <p>Please select at least one platform to publish your post.</p>
              <p>You can choose from Instagram, Twitter, or LinkedIn.</p>
              <span className="text-neutral-500 text-xs">
                {new Date().toLocaleDateString()}
              </span>
              <p className="font-ClashDisplayMedium text-right pt-3 tracking-tighter text-emerald-500">
                CrossPostHub.
              </p>
            </div>
          </div>
        ),
      });
      return;
    }

    if (!content.trim() && images.length === 0) {
      toast({
        title: "Content Required",
        description: (
          <div>
            <Badge className="my-2" variant="destructive">
              Error
            </Badge>
            <div className="text-xs">
              <p>Your post needs either text content or images.</p>
              <p>Please add some content or upload images to continue.</p>
              <span className="text-neutral-500 text-xs">
                {new Date().toLocaleDateString()}
              </span>
              <p className="font-ClashDisplayMedium text-right pt-3 tracking-tighter text-emerald-500">
                CrossPostHub.
              </p>
            </div>
          </div>
        ),
      });
      return;
    }

    if (isScheduled && (!scheduleDate || !scheduleTime)) {
      toast({
        title: "Invalid Schedule",
        description: (
          <div className="w-full">
            <Badge className="my-2" variant="destructive">
              Error
            </Badge>
            <div className="text-xs w-full">
              <p>Your scheduled post is missing date or time information.</p>
              <p>Please set both a valid date and time for scheduling.</p>
              <span className="text-neutral-500 text-xs">
                {new Date().toLocaleDateString()}
              </span>
              <p className="font-ClashDisplayMedium text-right pt-3 tracking-tighter text-emerald-500">
                CrossPostHub.
              </p>
            </div>
          </div>
        ),
      });
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("postText", content);
      formData.append("providers", JSON.stringify(selectedPlatforms));
      if (isScheduled && scheduleDate && scheduleTime) {
        const scheduledDateTime = new Date(
          `${format(scheduleDate, "yyyy-MM-dd")}T${scheduleTime}`
        ).toISOString();
        formData.append("scheduleAt", scheduledDateTime);
      }
      images.forEach((image) => formData.append("images", image));

      const response = await axios.post("/api/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: isScheduled
          ? "Post Scheduled Successfully"
          : "Post Published Successfully",
        description: (
          <div className="w-full">
            <Badge
              className="my-2"
              variant={isScheduled ? "pending" : "success"}
            >
              {isScheduled ? "Scheduled" : "Published"}
            </Badge>
            <div className="text-xs">
              <p>{response.data.message}</p>
              <p>Platforms: {selectedPlatforms.join(", ")}</p>
              {isScheduled && (
                <p>
                  Scheduled for: {format(scheduleDate!, "PPP")} at{" "}
                  {scheduleTime}
                </p>
              )}
              <span className="text-neutral-500 text-xs">
                {new Date().toLocaleDateString()}
              </span>
              <p className="font-ClashDisplayMedium text-right pt-3 tracking-tighter text-emerald-500">
                CrossPostHub.
              </p>
            </div>
          </div>
        ),
      });

      setContent("");
      setSelectedPlatforms([]);
      setImages([]);
      setIsScheduled(false);
      setScheduleDate(null);
      setScheduleTime("");
    } catch (error: any) {
      console.error("CreatePost Error:", error);
      toast({
        title: "Post Creation Failed",
        description: (
          <div className="w-full">
            <Badge className="my-2" variant="destructive">
              Error
            </Badge>
            <div className="text-xs">
              <p>
                {error.response?.data?.error ||
                  "An error occurred while creating the post."}
              </p>
              <p>Please try again or contact support if the issue persists.</p>
              <span className="text-neutral-500 text-xs">
                {new Date().toLocaleDateString()}
              </span>
              <p className="font-ClashDisplayMedium text-right pt-3 tracking-tighter text-emerald-500">
                CrossPostHub.
              </p>
            </div>
          </div>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="md:flex relative block gap-4 w-full">
      <BottomLoader
        isLoading={isLoading}
        title={`Creating post to ${selectedPlatforms.join(", ")}`}
        selectedPlatforms={selectedPlatforms}
      />
      <Card className="w-full border-none shadow-none md:mx-auto">
        <CardContent className="p-6">
          <Tabs defaultValue="edit" className="space-y-4">
            <TabsList>
              <TabsTrigger
                onClick={() => setIsSinglePreview(true)}
                value="edit"
              >
                Edit
              </TabsTrigger>
              <TabsTrigger
                onClick={() => setIsSinglePreview(false)}
                value="preview"
              >
                Platform Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-ClashDisplayMedium leading-none">
                    Post Content
                  </h2>
                  <AIAssist onGenerate={handleAIAssist} />
                </div>
                <Textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={handleContentChange}
                  rows={5}
                />
              </div>
              <ImageUpload onChange={handleImageChange} />
              <PlatformSelector
                selectedPlatforms={selectedPlatforms}
                setSelectedPlatforms={setSelectedPlatforms}
              />
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="schedule"
                  className="text-lg font-ClashDisplayMedium leading-none"
                >
                  Schedule this post
                </label>
                <Checkbox
                  id="schedule"
                  checked={isScheduled}
                  onCheckedChange={(checked) =>
                    setIsScheduled(checked as boolean)
                  }
                />
              </div>
              {isScheduled && (
                <SchedulePost
                  scheduleDate={scheduleDate}
                  setScheduleDate={setScheduleDate}
                  scheduleTime={scheduleTime}
                  setScheduleTime={setScheduleTime}
                />
              )}
            </TabsContent>
            <TabsContent value="preview">
              <PostPreview content={content} images={images} />
            </TabsContent>
          </Tabs>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              disabled={isLoading}
              variant={"customOne"}
              className="rounded-full"
              onClick={handlePublishPost}
            >
              {isScheduled ? "Schedule Post" : "Publish Now"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <AnimatePresence>
          {isSinglePreview && (
            <SimplePostPreview content={content} images={images} />
          )}
      </AnimatePresence>
    </section>
  );
}
