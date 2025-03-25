"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MediaUpload } from "@/components/CreatePost/MediaUpload";
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
import { AnimatePresence } from "framer-motion";
import { useDashboardStore } from "@/store/DashboardStore/useDashboardStore";
import NoAppButton from "../Buttons/NoAppButton";

type Platform = "instagram" | "twitter" | "linkedin";

export function CreatePostForm() {
  const [content, setContent] = useState("");
  const [medias, setMedias] = useState<File[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [scheduleTime, setScheduleTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSinglePreview, setIsSinglePreview] = useState(true);
  const { connectedApps } = useDashboardStore();

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
      setMedias(Array.from(files));
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
            <div className="text-xs leading-none opacity-90">
              <p>
                Please select at least one platform to publish your post. You
                can choose from Instagram, Twitter, or LinkedIn.
              </p>
              <span className="text-neutral-400 text-xs">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <p className="font-ClashDisplayMedium text-right pt-3 tracking-tighter text-emerald-500">
              CrossPostHub.
            </p>
          </div>
        ),
      });
      return;
    }

    if (!content.trim() && medias.length === 0) {
      toast({
        title: "Content Required",
        description: (
          <div>
            <Badge className="my-2" variant="destructive">
              Error
            </Badge>
            <div className="text-xs bg-opacity-90">
              <p>
                Your post needs either text content or images. Please add some
                content or upload images to continue.
              </p>
              <span className="text-neutral-500 text-xs">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <p className="font-ClashDisplayMedium text-right pt-3 tracking-tighter text-emerald-500">
              CrossPostHub.
            </p>
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
            <div className="text-xs opacity-90">
              <p>
                Your scheduled post is missing date or time information. Please
                set both a valid date and time for scheduling.
              </p>
              <span className="text-neutral-500 text-xs">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <p className="font-ClashDisplayMedium text-right pt-3 tracking-tighter text-emerald-500">
              CrossPostHub.
            </p>
          </div>
        ),
      });
      return;
    }

    if (
      (selectedPlatforms.includes("twitter") && content.length > 275) ||
      (selectedPlatforms.includes("linkedin") && content.length > 2900)
    ) {
      toast({
        title: selectedPlatforms.includes("twitter")
          ? "Twitter Character Limit Exceeded"
          : "LinkedIn Character Limit Exceeded",
        description: (
          <div className="w-full">
            <Badge className="my-2" variant="destructive">
              Error
            </Badge>
            <div className="text-xs">
              <p>
                {selectedPlatforms.includes("twitter")
                  ? "Twitter posts cannot exceed 275 characters."
                  : "LinkedIn posts cannot exceed 2900 characters."}
              </p>
              <span className="text-neutral-500 text-xs">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <p className="font-ClashDisplayMedium text-right pt-3 tracking-tighter text-emerald-500">
              CrossPostHub.
            </p>
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
      medias.forEach((media) => formData.append("medias", media));

      const response = await axios.post("/api/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: isScheduled
          ? "Post Scheduled for Processing"
          : "Post Sent for Processing",
        description: (
          <div className="w-full">
            <Badge variant={"pending"} className="my-2">
              {isScheduled ? "Scheduled" : "Processing"}
            </Badge>
            <div className="text-xs">
              <p>
                Your post is being processed. You will be notified once it is
                published.
              </p>
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
            </div>
            <p className="font-ClashDisplayMedium text-right pt-3 tracking-tighter text-emerald-500">
              CrossPostHub.
            </p>
          </div>
        ),
      });

      setContent("");
      setSelectedPlatforms([]);
      setMedias([]);
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
      {connectedApps.length === 0 ? (
        <NoAppButton />
      ) : (
        <>
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
                  <MediaUpload onChange={handleImageChange} />
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
                  <PostPreview content={content} medias={medias} />
                </TabsContent>
              </Tabs>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  disabled={isLoading}
                  variant={"default"}
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
              <SimplePostPreview content={content} medias={medias} />
            )}
          </AnimatePresence>
        </>
      )}
    </section>
  );
}
