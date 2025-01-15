import React from "react";
import Image from "next/image";
import {
  MessageCircle,
  Repeat2,
  Heart,
  BarChart2,
  MessageSquare,
  Repeat,
  Send,
  Bookmark,
  Share,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useUserStore } from "@/store/UserStore/useUserStore";

interface PostPreviewProps {
  content: string;
  images: File[];
}

export function PostPreview({ content, images }: PostPreviewProps) {
  const platforms = ["Instagram", "X", "LinkedIn"];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {platforms.map((platform) => (
        <Card key={platform}>
          <CardHeader>
            <CardTitle>{platform}</CardTitle>
          </CardHeader>
          <CardContent>
            {platform === "X" ? (
              <TwitterPreview content={content} images={images} />
            ) : platform === "Instagram" ? (
              <InstagramPreview content={content} images={images} />
            ) : platform === "LinkedIn" ? (
              <LinkedInPreview content={content} images={images} />
            ) : (
              ""
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TwitterPreview({ content, images }: PostPreviewProps) {
  const { user } = useUserStore();
  return (
    <div className="max-w-xl bg-black text-white rounded-xl p-4 font-sans">
      <div className="flex items-center gap-1 mb-2">
        <Avatar>
          <AvatarImage src={user?.photoURL || ""} />
          <AvatarFallback className="uppercase">
            {user?.displayName ? user.displayName[0] : "CH"}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-bold leading-none">{user?.displayName}</span>
            <span className="text-neutral-500 leading-none text-xs">
              {user?.email}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p>{content}</p>

        <div className="border dark:border-neutral-800 border-neutral-200 rounded-xl overflow-hidden">
          <div className="space-y-2">
            {images.length > 0 ? (
              images.length === 1 ? (
                <div>
                  <div className="relative aspect-square">
                    <Image
                      src={URL.createObjectURL(images[0]) || "/placeholder.svg"}
                      alt="Uploaded image"
                      fill
                      className="object-cover rounded-t-xl"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {images.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
                        alt={`Uploaded image ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              )
            ) : (
              ""
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-neutral-500 pt-3">
          <button className="flex items-center gap-2 hover:text-blue-400">
            <MessageCircle className="h-4 w-4" />
            <span>4</span>
          </button>
          <button className="flex items-center gap-2 hover:text-green-400">
            <Repeat2 className="h-4 w-4" />
            <span>7</span>
          </button>
          <button className="flex items-center gap-2 hover:text-pink-400">
            <Heart className="h-4 w-4" />
            <span>95</span>
          </button>
          <button className="flex items-center gap-2 hover:text-blue-400">
            <BarChart2 className="h-4 w-4" />
            <span>20K</span>
          </button>
          <div className="flex items-center gap-4">
            <button className="hover:text-blue-400">
              <Bookmark className="h-4 w-4" />
            </button>
            <button className="hover:text-blue-400">
              <Share className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InstagramPreview({ content, images }: PostPreviewProps) {
  const { user } = useUserStore();
  return (
    <div className="max-w-full dark:bg-black bg-neutral-100 p-1  font-sans">
      <div className="flex items-center gap-1 mb-2">
        <Avatar>
          <AvatarImage src={user?.photoURL || ""} />
          <AvatarFallback className="uppercase">
            {user?.displayName ? user.displayName[0] : "CH"}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-bold leading-none">{user?.displayName}</span>
            <span className="text-neutral-500 leading-none text-xs">
              {user?.email}
            </span>
          </div>
        </div>
      </div>

      <div className="border dark:border-neutral-800 border-neutral-200 rounded-xl overflow-hidden">
        <div className="space-y-2">
          {images.length > 0 ? (
            images.length === 1 ? (
              <div>
                <div className="relative aspect-square">
                  <Image
                    src={URL.createObjectURL(images[0]) || "/placeholder.svg"}
                    alt="Uploaded image"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={URL.createObjectURL(image) || "/placeholder.svg"}
                      alt={`Uploaded image ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            ""
          )}
        </div>
      </div>
      <p className="text-sm p-1">
        {content.length > 220 ? content.slice(0, 220) + "..." : content}
      </p>

      <div className="p-3">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-1">
            <button className="hover:opacity-60">
              <Heart className="w-6  h-6 " />
            </button>
            <button className="hover:opacity-60">
              <MessageCircle className="w-6  h-6 " />
            </button>
            <button className="hover:opacity-60">
              <Send className="w-6   h-6  " />
            </button>
          </div>
          <button className="hover:opacity-60">
            <Bookmark className="w-6   h-6  " />
          </button>
        </div>
      </div>
    </div>
  );
}

function LinkedInPreview({ content, images }: PostPreviewProps) {
  const { user } = useUserStore();
  return (
    <div className="max-w-2xl bg-primary border border-neutral-200 font-sans">
      <div className="p-2 flex items-start justify-between">
        <div className="flex items-center gap-1">
          <Avatar>
            <AvatarImage src={user?.photoURL || ""} />
            <AvatarFallback className="uppercase">
              {user?.displayName ? user.displayName[0] : "CH"}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="font-semibold text-primary-foreground leading-none">
                {user?.displayName}
              </span>
              <span className="text-neutral-500 leading-none text-xs">
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-primary-foreground text-sm p-1">{content}</p>
      <div className="overflow-hidden">
        <div className="space-y-2">
          {images.length > 0 ? (
            images.length === 1 ? (
              <div>
                <div className="relative aspect-square">
                  <Image
                    src={URL.createObjectURL(images[0]) || "/placeholder.svg"}
                    alt="Uploaded image"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={URL.createObjectURL(image) || "/placeholder.svg"}
                      alt={`Uploaded image ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            ""
          )}
        </div>
      </div>

      <div className="px-2 py-2 border-t border-neutral-200">
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
          <button className="flex items-center text-sm gap-1 p-2 hover:bg-neutral-100 rounded-lg justify-center">
            <span className="w-4 h-4">👍</span>
            <span className="text-neutral-600">Like</span>
          </button>
          <button className="flex items-center text-sm gap-1 p-2 hover:bg-neutral-100 rounded-lg justify-center">
            <MessageSquare className="w-4 h-4 text-neutral-600" />
            <span className="text-neutral-600">Comment</span>
          </button>
          <button className="flex items-center text-sm gap-1 p-2 hover:bg-neutral-100 rounded-lg justify-center">
            <Repeat className="w-4 h-4 text-neutral-600" />
            <span className="text-neutral-600">Repost</span>
          </button>
          <button className="flex items-center text-sm gap-1 p-2 hover:bg-neutral-100 rounded-lg justify-center">
            <Send className="w-4 h-4 text-neutral-600" />
            <span className="text-neutral-600">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
