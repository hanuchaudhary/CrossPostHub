import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const errorMessage =
    searchParams.error || "An unknown error occurred during authentication";

  const getDetailedErrorMessage = (error: string) => {
    switch (error.toLowerCase()) {
      case "accessdenied":
        return "You don't have permission to access this resource. Please contact support if you believe this is an error.";
      case "configuration":
        return "There's an issue with the authentication configuration. Our team has been notified and is working on a fix.";
      case "verification":
        return "We couldn't verify your credentials. Please try logging in again or reset your password.";
      default:
        return "An unexpected error occurred during the authentication process. Please try again later or contact support if the issue persists.";
    }
  };

  const detailedErrorMessage = getDetailedErrorMessage(errorMessage);

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
            {detailedErrorMessage}
          </p>
        </CardContent>
        <div className="p-3">
          <Button asChild variant="secondary" className="w-full py-6 rounded-xl">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}
