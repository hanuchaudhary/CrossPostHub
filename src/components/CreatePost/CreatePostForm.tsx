"use client";

import React from "react";
import { useEffect, useState } from "react";
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
import { useMediaStore } from "@/store/MainStore/usePostStore";
import { IconLoader } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useNotificationStore } from "@/store/NotificationStore/useNotificationStore";
import { EnhanceAndImageGen } from "./Enhance&Image";

export type Platform = "instagram" | "twitter" | "linkedin";

export function CreatePostForm() {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [scheduleTime, setScheduleTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSinglePreview, setIsSinglePreview] = useState(true);
  const { connectedApps } = useDashboardStore();
  const { fetchNotifications, notifications } = useNotificationStore();
  const [isPollingNotifications, setIsPollingNotifications] = useState(false);
  const { medias, isUploadingMedia, resetMedias, handleFileUpload } =
    useMediaStore();

  const memoizedMedias = React.useMemo(
    () => medias.files || [],
    [medias.files]
  );

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleAIAssist = (generatedContent: string) => {
    setContent(
      (prevContent) =>
        prevContent + (prevContent ? "\n\n" : "") + generatedContent
    );
  };

  const POLLING_INTERVAL = 2000;
  const POLLING_DURATION = 20000;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    if (isPollingNotifications) {
      interval = setInterval(async () => {
        try {
          await fetchNotifications();

          // Check recent FAILED or SUCCESS notifications within the last 30 seconds
          const recentPublishedNotification = notifications.find(
            (notification) =>
              (notification.type === "POST_STATUS_FAILED" ||
                notification.type === "POST_STATUS_SUCCESS") &&
              new Date(notification.createdAt).getTime() > Date.now() - 30000
          );

          if (recentPublishedNotification) {
            // Stop polling if the desired notification is received
            setIsPollingNotifications(false);
            if (recentPublishedNotification.type === "POST_STATUS_SUCCESS") {
              customToast({
                title: "Post Published",
                description: "Your post has been published successfully!",
              });
            } else {
              customToast({
                title: "Post Failed",
                description: "Your post failed to publish. Please try again.",
              });
            }
          }
        } catch (error) {
          console.error("Polling error:", error);
          customToast({
            title: "Polling Error",
            description: "An error occurred while checking for updates.",
            badgeVariant: "destructive",
          });
        }
      }, POLLING_INTERVAL);

      // Clear the interval after 20 seconds if not stopped earlier
      timeout = setTimeout(() => {
        setIsPollingNotifications(false);
        customToast({
          title: "Notification Polling Stopped",
          description:
            "Stopped checking for notifications. You can check manually if needed.",
          badgeVariant: "default",
        });
      }, POLLING_DURATION);
    }

    // Cleanup on unmount or when polling stops
    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [isPollingNotifications, notifications]);

  // TODO: Uncomment this when the Image Upload funtionality Modified ✅
  const params = useSearchParams();
  const from = params.get("from");

  useEffect(() => {
    if (from === "editor") {
      const storedImage = sessionStorage.getItem("editorImage");
      if (storedImage) {
        try {
          // Decode base64 string to binary data
          // Remove the prefix "data:image/png;base64," if present
          const binaryString = atob(storedImage.split(",")[1]);
          const bytes = new Uint8Array(binaryString.length);
          // Convert binary string to byte array
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const imageBlob = new Blob([bytes], { type: "image/png" });

          // Create a File object
          const file = new File([imageBlob], "editor-image.png", {
            type: "image/png",
          });

          // Convert File to FileList
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          const fileList = dataTransfer.files;

          // Set platform and trigger upload
          setSelectedPlatforms(["twitter"]);
          handleFileUpload(fileList, ["twitter"]);

          // Clean up sessionStorage
          sessionStorage.removeItem("codeEditorImage");
        } catch (error) {
          console.error("Failed to process code-editor image:", error);
          customToast({
            title: "Image Processing Failed",
            description: "Unable to load the image from the code editor.",
          });
        }
      }
    }
  }, [from, handleFileUpload]);

  const handlePublishPost = async () => {
    if (selectedPlatforms.length === 0) {
      customToast({
        title: "Platform Selection Required",
        description:
          "Please select at least one platform to publish your post. You can choose from Instagram, Twitter, or LinkedIn.",
      });
      return;
    }

    if (!content.trim() && (!medias.files || medias.files.length === 0)) {
      customToast({
        title: "Content Required",
        description:
          "Please enter some content or upload media to publish your post.",
      });
      return;
    }

    if (isScheduled && (!scheduleDate || !scheduleTime)) {
      customToast({
        title: "Schedule Date and Time Required",
        description: "Please select a date and time for scheduling your post.",
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
      formData.append(
        "mediaKeys",
        medias.mediaKeys ? JSON.stringify(medias.mediaKeys) : "[]"
      );

      await axios.post("/api/post", formData, {
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
      });

      if (selectedPlatforms.length != 1) {
        setContent("");
        setSelectedPlatforms([]);
        resetMedias();
        setIsScheduled(false);
        setScheduleDate(null);
        setScheduleTime("");
      }
      // Start polling for notifications
      setIsPollingNotifications(true);
    } catch (error: any) {
      console.error("CreatePost Error:", error);
      customToast({
        title: "Post Creation Failed",
        description:
          error.response?.data?.error ||
          "An error occurred while creating the post.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onImageAccept = async () => {};

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
                        className="border-none py-3 focus-visible:ring-0 focus-visible:outline-none shadow-none resize-none"
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={handleContentChange}
                        rows={6}
                      />
                      <div className="flex justify-end gap-2 items-center p-2 rounded-2xl">
                        <EnhanceAndImageGen
                          setContent={setContent}
                          caption={content}
                        />
                        <AIAssist onGenerate={handleAIAssist} />
                      </div>
                    </div>
                  </div>
                  <MediaUpload platforms={selectedPlatforms} />
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
                  <PostPreview content={content} medias={memoizedMedias} />
                </TabsContent>
              </Tabs>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  disabled={
                    isLoading ||
                    isUploadingMedia ||
                    (!content.trim() &&
                      (!medias.mediaKeys || !medias.mediaKeys.length)) ||
                    !selectedPlatforms.length
                  }
                  variant={"default"}
                  className="rounded-full"
                  onClick={handlePublishPost}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-1">
                      <IconLoader className="animate-spin" />
                      Publishing
                    </span>
                  ) : isUploadingMedia ? (
                    <span className="flex items-center gap-1">
                      <IconLoader className="animate-spin" />
                      Uploading Media
                    </span>
                  ) : isScheduled ? (
                    "Schedule Post"
                  ) : (
                    "Publish Post"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          <AnimatePresence>
            {isSinglePreview && (
              <SimplePostPreview
                isUploading={isUploadingMedia}
                content={content}
                medias={medias.files || []}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </section>
  );
}
