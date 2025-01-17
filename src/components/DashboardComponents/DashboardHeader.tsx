import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardHeaderProps {
  userName: string
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome, {userName}!</CardTitle>
        <CardDescription>Here's an overview of your recent activity.</CardDescription>
      </CardHeader>
    </Card>
  )
}

