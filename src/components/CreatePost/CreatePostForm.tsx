"use client";

import React, { useState } from "react";
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
import { format, set } from "date-fns";
import Image from "next/image";
import { Axis3D } from "lucide-react";
import axios from "axios";
import DisconnectingLoader from "../Loaders/DisconnectingLoader";

type Platform = "instagram" | "twitter" | "linkedin";

export function CreatePostForm() {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [scheduleTime, setScheduleTime] = useState<string>("");
  const [preview, setPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    setPreview(true);
    if (files) {
      setImages(Array.from(files));
    }
  };

  const formData = new FormData();
  formData.append("postText", content);
  formData.append("providers", JSON.stringify(selectedPlatforms));
  images.forEach((image) => {
    formData.append("images", image);
  });

  //now formdata look like if we have 2 provider and 3 images :
  // postText: "content"
  // images[0]: image1.jpg
  // images[1]: image2.jpg
  // platforms: "instagram,twitter"

  const handlePublishPost = async () => {
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

    try {
      setIsLoading(true);
      const response = await axios.post("/api/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data);
      toast({
        title: "Post published",
        description: "Your post has been published successfully",
      });
      setIsLoading(false);
    } catch (error) {
      console.error("CreatePost Error:", error);
    }

    if (isScheduled && (!scheduleDate || !scheduleTime)) {
      toast({
        title: "Please set a schedule",
        description:
          "You need to set both date and time for scheduling the post",
      });
      return;
    }

    const scheduledDateTime =
      isScheduled && scheduleDate
        ? new Date(`${format(scheduleDate, "yyyy-MM-dd")}T${scheduleTime}`)
        : null;

    // toast({
    //   title: isScheduled ? "Post scheduled" : "Post published",
    //   description: isScheduled
    //     ? `Your post has been scheduled for ${format(
    //         scheduledDateTime!,
    //         "PPpp"
    //       )}`
    //     : "Your post has been published successfully",
    // });
  };

  return (
    <section className="md:flex relative block gap-4 w-full">
      <DisconnectingLoader
        isDisconnecting={isLoading}
        title={`Send Post to ${formData.get("providers")}`}
      />
      <Card className="w-full border-none shadow-none md:mx-auto">
        <CardContent className="p-6">
          <Tabs defaultValue="edit" className="space-y-4">
            <TabsList className="">
              <TabsTrigger onClick={() => setPreview(true)} value="edit">
                Edit
              </TabsTrigger>
              <TabsTrigger onClick={() => setPreview(false)} value="preview">
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
                  className="text-lg font-ClashDisplayMedium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
            <Button disabled={isLoading} onClick={handlePublishPost}>
              {isScheduled ? "Schedule Post" : "Publish Now"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {preview && (
        <div className="w-1/3 md:block hidden">
          <Card className="h-full border-none">
            <CardContent
              className={`p-4 ${images.length === 0 ? "bg-secondary/30" : ""}`}
            >
              <h2 className="text-base font-medium mb-4">
                {content ? content : "No content added"}
              </h2>
              <div className="space-y-4">
                {images.length === 1 ? (
                  <div className="relative w-full h-96">
                    <Image
                      src={URL.createObjectURL(images[0])}
                      alt={images[0].name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((image) => (
                      <div key={image.name} className="relative w-full h-48">
                        <Image
                          src={URL.createObjectURL(image)}
                          alt={image.name}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
