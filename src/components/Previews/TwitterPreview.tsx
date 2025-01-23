import React from "react";
import Image from "next/image";
import {
  MessageCircle,
  Repeat2,
  Heart,
  BarChart2,
  Bookmark,
  Share,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/lib/getImageUrl";

interface TwitterPreviewProps {
  content: string;
  images: File[];
  user: any;
}

export function TwitterPreview({ content, images, user }: TwitterPreviewProps) {
  return (
    <div className="max-w-xl dark:bg-black bg-neutral-100 rounded-xl p-4 font-sans">
      <div className="flex items-center gap-1 mb-2">
        <Avatar>
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback className="uppercase">
            {user?.name ? user.name[0] : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="leading-none">{user?.name}</span>
            <span className="text-neutral-500 leading-none text-xs">
              {user?.email}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm dark:text-neutral-400 text-neutral-700 leading-none p-1">
          {content.length > 220 ? content.slice(0, 220) + "..." : content}
        </p>

        <div className="border dark:border-neutral-800 border-neutral-200 rounded-xl overflow-hidden">
          <div className="space-y-2">
            {images.length > 0 ? (
              images.length === 1 ? (
                <div>
                  <div className="relative aspect-square">
                    <Image
                      src={getImageUrl(images[0]) || "/placeholder.svg"}
                      alt="Uploaded image"
                      fill
                      className="object-cover rounded-t-xl"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {images.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={getImageUrl(image) || "/placeholder.svg"}
                        alt={`Uploaded image ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              )
            ) : null}
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
