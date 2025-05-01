import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Calendar, Clock, Twitter, Facebook, Linkedin, Instagram, ImageIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Post, STATUS } from "@/Types/Types"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  // Function to get provider icon
  const getProviderIcon = () => {
    switch (post.provider) {
      case "Twitter":
        return <Twitter className="h-4 w-4" />
      case "Facebook":
        return <Facebook className="h-4 w-4" />
      case "LinkedIn":
        return <Linkedin className="h-4 w-4" />
      case "Instagram":
        return <Instagram className="h-4 w-4" />
      default:
        return null
    }
  }

  // Function to get status badge color
  const getStatusBadge = () => {
    switch (post.status as STATUS) {
      case STATUS.SUCCESS:
        return <Badge className="bg-green-500">Active</Badge>
      case STATUS.PENDING:
        return <Badge className="bg-blue-500">Scheduled</Badge>
      case STATUS.FAILED:
        return <Badge className="bg-yellow-500">Pending</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          {getProviderIcon()}
          <span className="font-medium">{post.provider}</span>
          {getStatusBadge()}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit Post</DropdownMenuItem>
            <DropdownMenuItem>Delete Post</DropdownMenuItem>
            {post.status === "PENDING" && <DropdownMenuItem>Approve Post</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-card-foreground">{post.text}</p>

        {post.mediaKeys && post.mediaKeys.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
              <ImageIcon className="h-4 w-4" />
              <span>{post.mediaKeys.length} media item(s)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {post.mediaKeys.map((key, index) => (
                <div key={index} className="bg-muted rounded-md aspect-square flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" />
          <span>{formatDistanceToNow(post.createdAt)} ago</span>
        </div>
        {post.isScheduled && post.scheduledFor && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            <span>Scheduled for {post.scheduledFor.toLocaleDateString()}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
