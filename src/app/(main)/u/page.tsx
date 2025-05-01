import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostsList } from "./PostList"
import { GeneratedImagesList } from "./GeneratedImagesList"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="active" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="images">AI Images</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <PostsList status="SUCCESS" />
        </TabsContent>

        <TabsContent value="scheduled">
          <PostsList status="PENDING" />
        </TabsContent>

        <TabsContent value="pending">
          <PostsList status="FAILED" />
        </TabsContent>

        <TabsContent value="all">
          <PostsList status="ALL" />
        </TabsContent>

        <TabsContent value="images">
          <GeneratedImagesList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
