import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Analytics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between">
        <div>
          <span className="text-2xl font-bold">10</span>
          <span className="text-sm text-muted-foreground ml-2">Posts this month</span>
        </div>
        <div>
          <span className="text-2xl font-bold">2.4k</span>
          <span className="text-sm text-muted-foreground ml-2">Engagement</span>
        </div>
      </CardContent>
    </Card>
  )
}

