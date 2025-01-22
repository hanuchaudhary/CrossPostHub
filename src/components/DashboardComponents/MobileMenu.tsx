"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserProfile } from "./UserProfile"
import { LogOut } from "lucide-react"

export function MobileMenu() {
  const pathname = usePathname()

  const menuItems = [
    { href: "/connected-accounts", label: "Connected Accounts" },
    { href: "/pricing", label: "Pricing" },
  ]

  return (
    <nav className="flex flex-col justify-between h-full w-full">
      <div>
        <UserProfile />
        <ul className="space-y-1 mt-4">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-md transition-colors ${
                  pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <button className="flex items-center justify-center w-full py-2 px-4 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </button>
    </nav>
  )
}

