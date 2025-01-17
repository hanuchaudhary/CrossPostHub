import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Link } from 'lucide-react'

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Post
        </Button>
        <Button variant="outline">
          <Link className="mr-2 h-4 w-4" /> Connect Social Accounts
        </Button>
      </CardContent>
    </Card>
  )
}

