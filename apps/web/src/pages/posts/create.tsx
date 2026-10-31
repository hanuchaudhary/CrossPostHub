import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";

import { useComposer } from "@/components/posts/composer";

import SchedulePage from "./schedule";

// Preserve old bookmarks while opening the shared dialog over the calendar.
export default function CreatePage() {
  const open = useComposer();
  const [params] = useSearchParams();
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    const value = params.get("date");
    const date = value
      ? new Date(value.includes("T") ? value : `${value}T12:00`)
      : undefined;
    open(date && Number.isFinite(date.getTime()) ? date : undefined);
  }, [open, params]);
  return <SchedulePage />;
}
