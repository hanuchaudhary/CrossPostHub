import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage({ searchParams }: { searchParams: { error?: string } }) {
  const errorMessage = searchParams.error || "An unknown error occurred during authentication"

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-md space-y-8 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-red-600">Authentication Error</h1>
        <p className="text-center text-gray-700">{errorMessage}</p>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/">Try Again</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

