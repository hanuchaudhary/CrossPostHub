"use client"

import { useState } from "react"
import { PostCard } from "./PostCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon, FilterIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Post, STATUS } from "@/Types/Types"

// This would be replaced with actual data fetching in a real app
const mockPosts: Post[] = [
  {
    id: "1",
    text: "This is an active post about our new product launch!",
    provider: "Twitter",
    userId: "user1",
    mediaKeys: ["image1.jpg"],
    createdAt: new Date(),
    updatedAt: new Date(),
    status : STATUS.SUCCESS,
  },
  {
    id: "2",
    text: "This is a scheduled post for our upcoming event.",
    provider: "LinkedIn",
    userId: "user1",
    mediaKeys: [],
    scheduledFor: new Date(Date.now() + 86400000), // Tomorrow
    isScheduled: true,
    status: STATUS.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    text: "This is a pending post waiting for approval.",
    provider: "Facebook",
    userId: "user1",
    mediaKeys: ["image2.jpg", "image3.jpg"],
    status: STATUS.PENDING,
    isScheduled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

interface PostsListProps {
  status: STATUS
}

export function PostsList({ status }: PostsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [providerFilter, setProviderFilter] = useState("all")

  // Filter posts based on status, search query, and provider filter
  const filteredPosts = mockPosts.filter((post) => {
    // Filter by status
    if (post.status !== status) {
      return false
    }

    // Filter by search query
    if (searchQuery && !post.text?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Filter by provider
    if (providerFilter !== "all" && post.provider !== providerFilter) {
      return false
    }

    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <FilterIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No posts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
