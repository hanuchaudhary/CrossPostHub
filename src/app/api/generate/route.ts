import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const {
      content,
      tone = "exciting", // Default tone is "exciting"
      platform = "twitter", // Default platform is "twitter"
    } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const prompt = `Generate only the caption for: "${content}". 
      Imagine a developer sharing their project with passion. The caption must:
      - Be for ${platform} (e.g., hashtags/emojis for Twitter, polished for LinkedIn).
      - Be exciting, simple, professional, with a human touch (like a dev hyped about their work).
      - Stay under 150 characters, including spaces, hashtags, and mentions.
      - Capture the joy of building something new.
      - Include no explanations, just the caption.
      Twitter example: "Revamping my app’s core! 🚀 Join the beta! #DevLife #Coding @user"
      LinkedIn example: "Proud to launch my app’s new feature! Months of work. 💻 #Tech #Development @user"`;

    const caption = await groq.chat.completions
      .create({
        model: "llama3-8b-8192", // You can also use "llama3-70b-8192" for better results
        messages: [
          {
            role: "system",
            content:
              "You are a passionate developer who writes exciting, simple, professional social media captions with a human touch.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      })
      .catch((error) => {
        console.error("Groq API Error:", error);
        throw new Error("Failed to generate response from AI");
      });

    return NextResponse.json({ caption: caption.choices[0].message.content });
  } catch (error: any) {
    console.error("Error in caption generation:", error);

    const errorResponse = error.message.includes("API key is missing")
      ? {
          error:
            "Groq API key is missing or invalid. Please configure it properly.",
        }
      : { error: error.message || "An unexpected error occurred." };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const content = request.nextUrl.searchParams.get("content");
    const tone = request.nextUrl.searchParams.get("tone") || "exciting"; // Default tone is "exciting"
    const platform = request.nextUrl.searchParams.get("platform") || "twitter"; // Default platform is "twitter"

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const prompt = `Refine and output only the caption for: "${content}". 
      Picture a developer perfecting their post about their work. The caption must:
      - Be for ${platform} (e.g., hashtags/emojis for Twitter, professional for LinkedIn).
      - Be exciting, simple, professional, with a human touch (like a dev stoked about their project).
      - Stay under 150 characters, including spaces, hashtags, and mentions.
      - Highlight the thrill of creating something awesome.
      - Include no explanations, just the caption.
      Twitter example: "New tool alert! 🔥 Built for devs, by devs. #DevTools #Programming @user"
      LinkedIn example: "Excited to share my new dev tool! Built with passion. 💻 #Tech #Development @user"`;

    const caption = await groq.chat.completions
      .create({
        model: "llama3-8b-8192", // You can also use "llama3-70b-8192" for better results
        messages: [
          {
            role: "system",
            content:
              "You are a passionate developer who refines social media captions to be exciting, simple, and professional with a human touch.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      })
      .catch((error) => {
        console.error("Groq API Error:", error);
        throw new Error("Failed to generate response from AI");
      });
    return NextResponse.json({ caption: caption.choices[0].message.content });
  } catch (error: any) {
    console.error("Error in caption generation:", error);

    const errorResponse = error.message.includes("API key is missing")
      ? {
          error:
            "Groq API key is missing or invalid. Please configure it properly.",
        }
      : { error: error.message || "An unexpected error occurred." };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
