"use client"

import React from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface SchedulePostProps {
  scheduleDate: Date | null
  setScheduleDate: (date: Date | null) => void
}

export function SchedulePost({ scheduleDate, setScheduleDate }: SchedulePostProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !scheduleDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {scheduleDate ? format(scheduleDate, "PPP") : <span>Schedule post</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={scheduleDate!}
          onSelect={setScheduleDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

