import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AuthErrorPage() {
  const errorMessage = "An unknown error occurred during authentication";
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <Card className="w-full max-w-lg rounded-3xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <AlertCircle className="h-12 w-12 text-red-900" />
          </div>
          <CardTitle className="text-3xl font-bold text-center text-red-900">
            Authentication Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center dark:text-neutral-500 text-neutral-700">
            {errorMessage}
          </p>
        </CardContent>
        <div className="p-3">
          <Button
            asChild
            variant="secondary"
            className="w-full py-6 rounded-xl"
          >
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}
