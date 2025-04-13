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
import { format } from "date-fns";
import axios from "axios";
import BottomLoader from "../Loaders/BottomLoader";
import { SimplePostPreview } from "@/components/Previews/SimplePostPreview";
import { AnimatePresence } from "framer-motion";
import { useDashboardStore } from "@/store/DashboardStore/useDashboardStore";
import NoAppButton from "../Buttons/NoAppButton";
import { customToast } from "./customToast";
import EnhanceCaption from "./EnhanceCaption";

type Platform = "instagram" | "twitter" | "linkedin";

export function CreatePostForm() {
  const [content, setContent] = useState("");
  const [medias, setMedias] = useState<{
    files: File[] | [] | null;
    mediaKeys: string[] | [] | null;
  }>({
    files: null,
    mediaKeys: null,
  });
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
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

  const handleImageChange = (data: {
    files: File[] | null;
    mediaKeys: string[] | null;
    isUploading: boolean;
  }) => {
    if (data.files) {
      setMedias(data);
      setIsUploadingMedia(data.isUploading);
    }
  };

  const handlePublishPost = async () => {
    if (selectedPlatforms.length === 0) {
      customToast({
        title: "Platform Selection Required",
        description:
          "Please select at least one platform to publish your post. You can choose from Instagram, Twitter, or LinkedIn.",
        badgeVariant: "destructive",
      });
      return;
    }

    if (!content.trim() && medias.files?.length === 0) {
      customToast({
        title: "Content Required",
        description:
          "Please enter some content or upload media to publish your post.",
        badgeVariant: "destructive",
      });
      return;
    }

    if (isScheduled && (!scheduleDate || !scheduleTime)) {
      customToast({
        title: "Schedule Date and Time Required",
        description: "Please select a date and time for scheduling your post.",
        badgeVariant: "destructive",
      });

      return;
    }

    if (
      (selectedPlatforms.includes("twitter") && content.length > 275) ||
      (selectedPlatforms.includes("linkedin") && content.length > 2900)
    ) {
      customToast({
        title: selectedPlatforms.includes("twitter")
          ? "Twitter Character Limit Exceeded"
          : "LinkedIn Character Limit Exceeded",
        description: selectedPlatforms.includes("twitter")
          ? "Twitter posts cannot exceed 275 characters."
          : "LinkedIn posts cannot exceed 2900 characters.",
        badgeVariant: "destructive",
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
      // medias.forEach((media) => formData.append("medias", media));
      formData.append(
        "mediaKeys",
        medias.mediaKeys ? JSON.stringify(medias.mediaKeys) : "[]"
      );
      const response = await axios.post("/api/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      customToast({
        title: isScheduled
          ? "Post Scheduled for Processing"
          : "Post Sent for Processing",
        description:
          "Your post is being processed. You will be notified once it is published.",
        badgeVariant: "pending",
      });

      setContent("");
      setSelectedPlatforms([]);
      setMedias({
        files: null,
        mediaKeys: null,
      });
      setIsScheduled(false);
      setScheduleDate(null);
      setScheduleTime("");
    } catch (error: any) {
      console.error("CreatePost Error:", error);
      customToast({
        title: "Post Creation Failed",
        description:
          error.response?.data?.error ||
          "An error occurred while creating the post.",
        badgeVariant: "destructive",
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
                    </div>
                    <div className="dark:bg-neutral-900 bg-neutral-100 h-full w-full rounded-2xl border">
                      <Textarea
                        className="border-none py-3 focus-visible:ring-0 focus-visible:outline-none shadow-none"
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={handleContentChange}
                        rows={6}
                      />
                      <div className="flex justify-end gap-2 items-center p-2 rounded-2xl">
                        <EnhanceCaption
                          content={content}
                          setContent={setContent}
                        />
                        <AIAssist onGenerate={handleAIAssist} />
                      </div>
                    </div>
                  </div>
                  <MediaUpload
                    platforms={selectedPlatforms}
                    onChange={handleImageChange}
                  />
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
                  <PostPreview content={content} medias={medias.files!} />
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
              <SimplePostPreview
                isUploading={isUploadingMedia}
                content={content}
                medias={medias.files!}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </section>
  );
}
