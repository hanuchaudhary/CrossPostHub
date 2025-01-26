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

interface PreviewUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface TwitterPreviewProps {
  content: string;
  images: File[];
  user: PreviewUser | null;
}

export function TwitterPreview({ content, images, user }: TwitterPreviewProps) {
  return (
    <div className="max-w-xl bg-black text-white rounded-xl p-4 font-sans">
      <div className="flex gap-2">
        <div>
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.image || ""} />
            <AvatarFallback className="uppercase">
              {user?.name ? user.name[0] : "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-semibold">{user?.name}</span>
            <span className="text-neutral-500">
              @{user?.email?.split("@")[0]}
            </span>
            <span className="text-neutral-500">· 9h</span>
          </div>

          <div
            className="whitespace-pre-wrap text-sm mb-2"
            dangerouslySetInnerHTML={{ __html: content }}
          ></div>

          {images.length > 0 && (
            <div className="mb-3 rounded-xl overflow-hidden border border-neutral-800">
              {images.length === 1 ? (
                <div className="relative aspect-square">
                  <Image
                    src={getImageUrl(images[0]) || "/placeholder.svg"}
                    alt="Uploaded image"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-0.5">
                  {images.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={getImageUrl(image) || "/placeholder.svg"}
                        alt={`Uploaded image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-neutral-500 max-w-md">
            <button className="flex items-center gap-2 hover:text-blue-400 group">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm group-hover:text-blue-400">20K</span>
            </button>
            <button className="flex items-center gap-2 hover:text-green-400 group">
              <Repeat2 className="h-5 w-5" />
              <span className="text-sm group-hover:text-green-400">19K</span>
            </button>
            <button className="flex items-center gap-2 hover:text-pink-400 group">
              <Heart className="h-5 w-5" />
              <span className="text-sm group-hover:text-pink-400">195K</span>
            </button>
            <button className="flex items-center gap-2 hover:text-blue-400 group">
              <BarChart2 className="h-5 w-5" />
              <span className="text-sm group-hover:text-blue-400">35M</span>
            </button>
            <div className="flex items-center gap-4">
              <button className="hover:text-blue-400">
                <Bookmark className="h-5 w-5" />
              </button>
              <button className="hover:text-blue-400">
                <Share className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
