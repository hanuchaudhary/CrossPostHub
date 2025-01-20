"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TwitterLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/twitter/request-token")
      const data = await response.json()
      if (data.oauth_token) {
        window.location.href = `https://api.twitter.com/oauth/authenticate?oauth_token=${data.oauth_token}`
      } else if (data.error) {
        setError(data.details || data.error)
      } else {
        throw new Error("Failed to get OAuth token")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to initiate Twitter login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "Loading..." : "Login with Twitter and go to Dashboard"}
      </Button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}

