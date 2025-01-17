import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const recentPosts = [
  { id: 1, title: "Post 1", platforms: ["Twitter", "LinkedIn"], status: "published" },
  { id: 2, title: "Post 2", platforms: ["Instagram"], status: "failed" },
]

export function RecentPosts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {recentPosts.map((post) => (
            <li key={post.id} className="flex items-center justify-between">
              <div>
                <span className="font-medium">{post.title}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  ({post.status === "published" ? "Published on" : "Failed on"}: {post.platforms.join(", ")})
                </span>
              </div>
              <div>
                {post.status === "published" ? (
                  <Button variant="outline" size="sm">Edit/Delete</Button>
                ) : (
                  <Button variant="outline" size="sm">Retry</Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

