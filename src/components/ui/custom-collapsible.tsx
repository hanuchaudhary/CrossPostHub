"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface CollapsibleProps {
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
  buttonClassName?: string
  contentClassName?: string
  open?: boolean
}

export function Collapsible({ trigger, children, className, buttonClassName, contentClassName,open = false }: CollapsibleProps) {
const [isOpen, setIsOpen] = useState(open)

  return (
    <div className={cn("relative w-full", className)}>
      <div className="border rounded-2xl overflow-hidden bg-secondary/30">
        <button className={cn("w-full text-sm py-2", buttonClassName)} onClick={() => setIsOpen(!isOpen)}>
          {trigger}
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: "auto",
                transition: {
                  height: {
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  },
                  opacity: { duration: 0.2 },
                },
              }}
              exit={{
                opacity: 0,
                height: 0,
                transition: {
                  height: { duration: 0.2 },
                  opacity: { duration: 0.2 },
                },
              }}
              className={cn("overflow-hidden", contentClassName)}
            >
              <div className="p-4">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
