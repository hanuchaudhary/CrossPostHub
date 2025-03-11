import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const createGenAIClient = (): GoogleGenerativeAI | null => {
  return process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;
};

export async function POST(request: NextRequest) {
  const genAI = createGenAIClient();

  try {
    if (!genAI) {
      return NextResponse.json(
        { error: "Gemini API key is missing or invalid." },
        { status: 500 }
      );
    }

    const {
      content,
      tone = "engaging", // Default tone is "engaging"
      platform = "twitter", // Default platform is "LinkedIn"
    } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prompt tailored for a single, concise caption
    const prompt = `Write a single, engaging caption for the following content: "${content}". 
                        The caption should be suitable for ${platform} and have a ${tone} tone. 
                        Keep it concise and under 150 characters.`;

    const result = await model.generateContent(prompt);

    const cleanText = result.response
      .text()
      .replace(/^#+\s*/gm, "") // Remove header markers
      .replace(/[*_~`]/g, "") // Remove common Markdown formatting
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remove link markdown
      .trim();

    if (!cleanText) {
      return NextResponse.json(
        { error: "Failed to generate content" },
        { status: 500 }
      );
    }

    return NextResponse.json({ caption: cleanText });
  } catch (error: any) {
    console.error("Error in Gemini AI caption generation:", error);

    const errorResponse = error.message.includes("API key is missing")
      ? {
          error:
            "Gemini API key is missing or invalid. Please configure it properly.",
        }
      : { error: error.message || "An unexpected error occurred." };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
