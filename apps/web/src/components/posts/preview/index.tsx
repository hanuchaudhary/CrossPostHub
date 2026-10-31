import type { Platform } from "@/lib/types";

import type { PostPreviewProps } from "./common";
import { InstagramPreview } from "./instagram";
import { LinkedInPreview } from "./linkedin";
import { TwitterPreview } from "./twitter";

export function PostPreview({
  platform,
  ...props
}: PostPreviewProps & { platform: Platform }) {
  switch (platform) {
    case "linkedin":
      return <LinkedInPreview {...props} />;
    case "twitter":
      return <TwitterPreview {...props} />;
    case "instagram":
      return <InstagramPreview {...props} />;
  }
}
