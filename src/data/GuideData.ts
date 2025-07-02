export const guideContent = {
  features: {
    title: "All Features & How to Use",
    content: [
      {
        feature: "Connect Social Media Accounts",
        description: "Link your Twitter/X, LinkedIn, Instagram, and Threads accounts securely using OAuth authentication.",
        howTo: "Go to Dashboard → Click 'Connect' next to each platform → Authenticate with your social media account"
      },
      {
        feature: "Create & Compose Posts",
        description: "Write posts with text, add images, and format your content with our built-in editor.",
        howTo: "Click 'Create Post' → Write your content → Add images → Use formatting tools → Preview your post"
      },
      {
        feature: "AI-Powered Content Generation",
        description: "Generate engaging post content using AI assistance for different platforms and tones.",
        howTo: "In post editor → Click AI assistant → Choose content type → Select tone → Generate content → Edit as needed"
      },
      {
        feature: "Rich Text Editor",
        description: "Format your posts with bold, italic, lists, and other styling options.",
        howTo: "In post editor → Select text → Use formatting toolbar → Add emojis, mentions, hashtags"
      },
      {
        feature: "Multi-Platform Posting",
        description: "Post to multiple social media platforms simultaneously with one click.",
        howTo: "Create post → Select target platforms → Customize content per platform → Click 'Post Now'"
      },
      {
        feature: "Post Scheduling",
        description: "Schedule your posts for optimal engagement times across different platforms.",
        howTo: "Create post → Click 'Schedule' → Select date and time → Choose timezone → Confirm schedule"
      },
      {
        feature: "Image Upload & Management",
        description: "Upload multiple images, crop, resize, and optimize them for each social platform.",
        howTo: "In post editor → Click 'Add Image' → Upload or drag & drop → Crop/resize → Apply to platforms"
      },
      {
        feature: "Preview Posts",
        description: "See exactly how your posts will look on each platform before publishing.",
        howTo: "Create post → Click 'Preview' → Switch between platform views → Make adjustments"
      },
      {
        feature: "Post Analytics",
        description: "Track performance of your posts across all connected platforms (Pro plan).",
        howTo: "Dashboard → Analytics tab → View metrics → Filter by platform/date → Export reports"
      },
      {
        feature: "Account Management",
        description: "Manage connected accounts, revoke access, and update permissions.",
        howTo: "Dashboard → Connected Accounts → Hover over account → Click 'Disconnect' or 'Settings'"
      }
    ]
  },
  stepByStepGuide: {
    title: "Step-by-Step Usage Guide",
    steps: [
      {
        step: "1. Connect Your Accounts",
        description: "Start by connecting your social media accounts",
        details: "Click 'Connect' next to Twitter, LinkedIn, Instagram, or Threads. You'll be redirected to authenticate securely with each platform."
      },
      {
        step: "2. Create Your First Post",
        description: "Click the 'Create Post' button to start composing",
        details: "Write your content, add images, and use our formatting tools. The editor supports rich text, emojis, and mentions."
      },
      {
        step: "3. Use AI Assistant (Optional)",
        description: "Let AI help generate engaging content",
        details: "Click the AI icon, describe what you want to post about, select tone and style, then customize the generated content."
      },
      {
        step: "4. Select Target Platforms",
        description: "Choose which platforms to post to",
        details: "Toggle on/off each connected platform. You can customize the content differently for each platform if needed."
      },
      {
        step: "5. Preview Your Posts",
        description: "See how your post will look on each platform",
        details: "Click 'Preview' to see platform-specific formatting, character limits, and image display."
      },
      {
        step: "6. Post or Schedule",
        description: "Publish immediately or schedule for later",
        details: "Click 'Post Now' for immediate publishing, or 'Schedule' to set a specific date and time for optimal engagement."
      }
    ],
    createPostImageLight: "https://res.cloudinary.com/da7huzv0t/image/upload/v1739040707/cross/yhigggolltakewqzffyq.png",
    createPostImageDark: "https://res.cloudinary.com/da7huzv0t/image/upload/v1739040707/cross/rpxsnpauqreztq0trb7u.png",
    previewImageLight: "https://res.cloudinary.com/da7huzv0t/image/upload/v1739040708/cross/ed4yhsvx003rjyvslgnk.png",
    previewImageDark: "https://res.cloudinary.com/da7huzv0t/image/upload/v1739040708/cross/ffayzvdqydoeokpikxrb.png"
  },
  securityFaq: {
    title: "Security & Privacy FAQ",
    faqs: [
      {
        question: "Do you store my social media passwords?",
        answer: "<strong>No, absolutely not.</strong> We never see or store your passwords. When you connect your accounts, you authenticate directly with Twitter, LinkedIn, etc. They give us a secure 'access token' that lets us post on your behalf - but we never get your actual login credentials."
      },
      {
        question: "What exactly do you store in your database?",
        answer: "We store encrypted OAuth access tokens (not passwords) that social media platforms provide. These tokens are like temporary keys that allow us to post content you create. All tokens are encrypted using industry-standard AES-256 encryption before storage."
      },
      {
        question: "Can I revoke access anytime?",
        answer: "<strong>Yes, instantly.</strong> You can disconnect any platform from your dashboard, which immediately deletes the stored tokens. You can also revoke access directly from your social media platform's app settings (Twitter → Settings → Apps, LinkedIn → Privacy → Apps, etc.)."
      },
      {
        question: "Why not use browser cookies instead?",
        answer: "Cookies would be less secure and wouldn't work across devices. Our database approach with encryption ensures your accounts stay connected securely, even when you switch devices or clear your browser. This is the industry standard used by major social media management tools."
      },
      {
        question: "How is this different from other apps like Buffer or Hootsuite?",
        answer: "We use the exact same OAuth security standards as Buffer, Hootsuite, Later, and all major social media tools. This is the industry-standard approach for social media management platforms. The alternative would be storing passwords (which would be far less secure) or requiring you to reconnect every time (which would be impractical)."
      }
    ]
  }
};
