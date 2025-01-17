import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Twitter, Linkedin, Instagram } from 'lucide-react'

const accounts = [
  { platform: "Twitter", connected: true, icon: Twitter },
  { platform: "LinkedIn", connected: true, icon: Linkedin },
  { platform: "Instagram", connected: false, icon: Instagram },
]

export function ConnectedAccounts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Social Media Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {accounts.map((account) => (
            <li key={account.platform} className="flex items-center justify-between">
              <div className="flex items-center">
                <account.icon className="mr-2 h-5 w-5" />
                <span>{account.platform}: </span>
                <span className={account.connected ? "text-green-500 ml-2" : "text-red-500 ml-2"}>
                  {account.connected ? "Connected" : "Not Connected"}
                </span>
              </div>
              {!account.connected && (
                <Button variant="outline" size="sm">Connect</Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

