"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon, FilterIcon, Download, Share2, Trash2 } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { IGeneratedImage } from "@/Types/Types"

// This would be replaced with actual data fetching in a real app
const mockImages: IGeneratedImage[] = [
  {
    id: "img1",
    caption: "A futuristic city skyline with flying cars",
    url: "/placeholder.svg?height=300&width=400",
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: "img2",
    caption: "A serene mountain landscape at sunset",
    url: "/placeholder.svg?height=300&width=400",
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: "img3",
    caption: "An abstract digital art piece with vibrant colors",
    url: "/placeholder.svg?height=300&width=400",
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000),
  },
  {
    id: "img4",
    url: "/placeholder.svg?height=300&width=400",
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
    updatedAt: new Date(Date.now() - 259200000),
    caption: "A close-up of a flower with dew drops",
  },
]

export function GeneratedImagesList() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter images based on search query
  const filteredImages = mockImages.filter((image) => {
    if (!searchQuery) return true
    return image.caption?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4 mt-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by caption..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <FilterIcon className="h-4 w-4" />
        </Button>
      </div>

      {filteredImages.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No images found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredImages.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={image.caption || "Generated image"}
                  className="object-cover w-full h-full"
                />
              </div>
              <CardContent className="p-4">
                {image.caption && <p className="text-sm font-medium line-clamp-2">{image.caption}</p>}
              </CardContent>
              <CardFooter className="flex justify-between p-4 pt-0">
                <div className="text-xs text-muted-foreground">{formatDistanceToNow(image.createdAt)} ago</div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
