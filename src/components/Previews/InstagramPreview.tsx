import React from "react"
import Image from "next/image"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getImageUrl } from "@/lib/getImageUrl"

interface InstagramPreviewProps {
  content: string
  images: File[]
  user: any
}

export function InstagramPreview({ content, images, user }: InstagramPreviewProps) {
  return (
    <div className="max-w-[468px] bg-black text-white font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border-2 border-pink-500 p-[2px] rounded-full">
            <AvatarImage src={user?.image || ""} />
            <AvatarFallback className="uppercase">{user?.name ? user.name[0] : "U"}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold">{user?.name || "mr_hariom_varshney_2021"}</span>
          <span className="text-neutral-500 text-sm">• 7 h</span>
        </div>
        <button className="hover:opacity-60">
          <MoreHorizontal className="h-6 w-6" />
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-square w-full">
        {images.length > 0 ? (
          <Image src={getImageUrl(images[0]) || "/placeholder.svg"} alt="Post image" fill className="object-cover" />
        ) : null}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button className="hover:opacity-60">
              <Heart className="w-6 h-6" />
            </button>
            <button className="hover:opacity-60">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="hover:opacity-60">
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button className="hover:opacity-60">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        {/* Likes */}
        <div className="text-sm font-semibold mb-2">19 likes</div>

        {/* Caption */}
        <div className="text-sm">
          <span className="font-semibold mr-2">{user?.name || "mr_hariom_varshney_2021"}</span>
          <span className="text-neutral-100">{content}</span>
        </div>

        {/* Translation & Comments */}
        <button className="text-neutral-500 text-sm mt-1 hover:text-neutral-400">See Translation</button>
        <button className="block text-neutral-500 text-sm mt-1 hover:text-neutral-400">View 1 comment</button>

        <div className="mt-3 border-t border-neutral-800 pt-3">
          <input
            type="text"
            placeholder="Add a comment..."
            className="w-full bg-transparent text-sm text-neutral-400 placeholder-neutral-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}

