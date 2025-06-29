import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

function generatePrompt(content: string, tone: string, platform: string) {
  return `You are an expert tweet refinement engine. Strictly follow these rules:
        [CRITICAL RULES]
        1. NEVER use emojis, hashtags, or markdown - strictly prohibited
        2. NO NEW CONTENT: Never add motivational phrases, opinions, advise or commentary. It's strict rule
        3. NEVER add new content - only refine what's provided
        4. ALWAYS maintain original intent while enhancing clarity
        5. STRICT length limit: Max 280 characters (hard stop)
        6. NEVER mention your actions or process - output only the refined tweet no other bullshit
        7. If the user provides you with a tweet, your task is to refine it, not comment on it or make it longer than the original tweet.

        [PROCESS]
        1. PRIMARY FOCUS: Content refinement - make this drive all changes
        2. TONE: Convert to ${tone} tone while preserving message
        3. ACTION: Execute ${platform} action to optimize for ${platform}
        - Formatting: Logical line breaks, remove fluff
        - Improving: Boost impact using mindset, tighten phrasing no commentary and opinions
        - Correcting: Fix errors, improve readability

        [OUTPUT REQUIREMENTS]
        - Multi-line format unless user specifies single-line
        - Preserve original formatting style when possible
        - Remove redundant phrases while keeping core message
        - Use active voice and concise language

        [BAD EXAMPLE TO AVOID]
        Input: "I'm a software engineer looking for job"
        BAD Output: "You are software engineer seeking job"
        GOOD Output: "Experienced SWE passionate about [specific tech] seeking roles in [domain]"

        [INPUT TO REFINE]
        "${content}"

        [FINAL INSTRUCTIONS]
        1. Analyze input against core prompt (${content})
        2. Apply ${tone} tone and ${platform} action
        3. Generate ONLY the refined tweet meeting all rules
        4. Validate against all constraints before outputting`;
}

async function generateCaption(content: string, tone: string, platform: string) {
  const prompt = generatePrompt(content, tone, platform);

  const result = await ai.models.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      }
    ],
    model: "gemini-2.5-flash",
  });

  const response = result.text;
  return response?.trim() || "";
}

export async function POST(request: NextRequest) {
  try {
    const {
      content,
      tone = "engaging",
      platform = "twitter",
    } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const caption = await generateCaption(content, tone, platform);

    return NextResponse.json({ caption });
  } catch (error: any) {
    console.error("Error in caption generation:", error);

    const errorResponse = error.message?.includes("API key")
      ? {
          error:
            "Gemini API key is missing or invalid. Please configure it properly.",
        }
      : { error: error.message || "An unexpected error occurred." };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const content = request.nextUrl.searchParams.get("content");
    const tone = request.nextUrl.searchParams.get("tone") || "engaging";
    const platform = request.nextUrl.searchParams.get("platform") || "twitter";

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const caption = await generateCaption(content, tone, platform);

    return NextResponse.json({ caption });
  } catch (error: any) {
    console.error("Error in caption generation:", error);

    const errorResponse = error.message?.includes("API key")
      ? {
          error:
            "Gemini API key is missing or invalid. Please configure it properly.",
        }
      : { error: error.message || "An unexpected error occurred." };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
