import React from "react"
import Image from "next/image"
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getImageUrl } from "@/lib/getImageUrl"

interface InstagramPreviewProps {
  content: string
  images: File[]
  user: any
}

export function InstagramPreview({ content, images, user }: InstagramPreviewProps) {
  return (
    <div className="max-w-full rounded-xl dark:bg-black bg-neutral-100 p-1 font-sans">
      <div className="flex items-center gap-1 mb-2">
        <Avatar>
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback className="uppercase">{user?.name ? user.name[0] : "U"}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="leading-none">{user?.name}</span>
            <span className="text-neutral-500 leading-none text-xs">{user?.email}</span>
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
                    src={getImageUrl(images[0]) || "/placeholder.svg"}
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
      <p className="text-sm dark:text-neutral-400 text-neutral-700 leading-none py-3 p-1">{content.length > 220 ? content.slice(0, 220) + "..." : content}</p>

      <div className="p-3">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-1">
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
      </div>
    </div>
  )
}

