import React from "react"
import Image from "next/image"
import { MessageSquare, Repeat, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getImageUrl } from "@/lib/getImageUrl"

interface LinkedInPreviewProps {
  content: string
  images: File[]
  user: any
}

export function LinkedInPreview({ content, images, user }: LinkedInPreviewProps) {
  return (
    <div className="max-w-2xl bg-primary border border-neutral-200 font-sans">
      <div className="p-2 flex items-start justify-between">
        <div className="flex items-center gap-1">
          <Avatar>
            <AvatarImage src={user?.image || ""} />
            <AvatarFallback className="uppercase">{user?.name ? user.name[0] : "U"}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="font-semibold text-primary-foreground leading-none">{user?.name}</span>
              <span className="text-neutral-500 leading-none text-xs">{user?.email}</span>
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
                    src={getImageUrl(images[0]) || "/placeholder.svg"}
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
  )
}

