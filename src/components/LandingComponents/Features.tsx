"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Video,
  Mic,
  MessageSquare,
  MonitorSmartphone,
  MoreHorizontal,
} from "lucide-react";
import { OrbitingCirclesWithIcon } from "./OrbitingCirclesWithIcons";
import { cn } from "@/lib/utils";

export default function Features() {
  const [timeSlots, setTimeSlots] = useState([
    { enabled: true, startTime: "8:30 am", endTime: "5:00 pm" },
    { enabled: true, startTime: "9:00 am", endTime: "6:00 pm" },
    { enabled: false, startTime: "10:00 am", endTime: "7:00 pm" },
  ]);

  const handleToggle = (index: number) => {
    const newTimeSlots = [...timeSlots];
    newTimeSlots[index].enabled = !newTimeSlots[index].enabled;
    setTimeSlots(newTimeSlots);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeSlots = timeSlots.map((slot) => ({
        ...slot,
        enabled: !slot.enabled,
      }));
      setTimeSlots(newTimeSlots);
    }, 3000);
    return () => clearInterval(interval);
  }, [timeSlots]);

  return (
    <div className="md:max-w-6xl mx-auto px-4 py-12 z-30 relative">
      <div className="font-ClashDisplaySemibold md:text-4xl text-2xl mt-8 mb-12">
        <h2 className="text-center w-full">
          Why <span className="text-emerald-500">CrossPostHub?</span>
        </h2>
        <p className="md:text-base text-sm text-center font-ClashDisplayRegular text-muted-foreground">
          &quot;Effortless Social Media Management – Schedule, Post, and Analyze
          with Ease!&quot;
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-6xl">
        <Card className="p-3 rounded-3xl relative overflow-hidden">
          <div
            className={`rounded-lg font-ClashDisplayMedium text-base my-3 h-8 w-8 backdrop-blur-3xl text-neutral-800 bg-neutral-200 flex items-center justify-center`}
          >
            <span>01</span>
          </div>
          <h3 className="text-xl font-semibold my-2 font-ClashDisplayMedium">
            Multiple Platform Support
          </h3>
          <p className="text-muted-foreground mb-8">
            Post to LinkedIn, Twitter, Instagram, and more from one central hub.
          </p>

          <div className="relative h-40 mt-auto">
            <OrbitingCirclesWithIcon />
          </div>
        </Card>

        <Card className="rounded-3xl relative overflow-hidden">
          <div className="p-3">
            <div
              className={` rounded-lg font-ClashDisplayMedium text-base my-3 h-8 w-8 backdrop-blur-3xl text-neutral-800 bg-neutral-200 flex items-center justify-center`}
            >
              <span>02</span>
            </div>
            <h3 className="text-xl font-semibold my-2 font-ClashDisplayMedium">
              Scheduling and Instant Posting
            </h3>
            <p className="text-muted-foreground mb-8">
              Schedule posts for the future or publish them instantly without
              manual effort.
            </p>
          </div>

          <div className="mt-8 space-y-4 ml-20 border-t border-l rounded-tl-3xl p-6">
            {timeSlots.map((slot, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Switch
                  checked={slot.enabled}
                  onCheckedChange={() => handleToggle(index)}
                  className={cn(
                    slot.enabled ? "bg-emerald-500" : "bg-neutral-200"
                  )}
                />
                <Input
                  value={slot.startTime}
                  className="max-w-[100px]"
                  readOnly
                  disabled={!slot.enabled}
                />
                <span className="text-neutral-500">-</span>
                <Input
                  value={slot.endTime}
                  className="max-w-[100px]"
                  readOnly
                  disabled={!slot.enabled}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-3 rounded-3xl relative overflow-hidden">
          <div
            className={`rounded-lg font-ClashDisplayMedium text-base my-3 h-8 w-8 backdrop-blur-3xl text-neutral-800 bg-neutral-200 flex items-center justify-center`}
          >
            <span>03</span>
          </div>
          <h3 className="text-xl font-semibold my-2 font-ClashDisplayMedium">
            User-friendly Interface
          </h3>
          <p className="text-muted-foreground mb-8">
            Simple and intuitive design, making it easy for anyone to use, even
            without technical experience.
          </p>

          <div className="flex justify-center mt-2 mb-4">
            <MoreHorizontal className="text-neutral-400" />
          </div>

          <div className="flex justify-center mt-8">
            <div className="flex items-end space-x-12">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-neutral-200 rounded-full mb-2"></div>
                <div className="w-12 h-3 bg-neutral-200 rounded-full"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-neutral-200 rounded-full mb-2"></div>
                <div className="w-12 h-3 bg-neutral-200 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4 mt-12">
            <Video className="h-5 w-5 text-neutral-500" />
            <Mic className="h-5 w-5 text-neutral-500" />
            <MessageSquare className="h-5 w-5 text-neutral-500" />
            <MonitorSmartphone className="h-5 w-5 text-neutral-500" />
          </div>
        </Card>
      </div>
    </div>
  );
}
