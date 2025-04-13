import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(request: NextRequest) {
  try {
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

    const prompt = `Write a single, engaging caption for the following content: "${content}". 
  The caption should be suitable for ${platform} and have a ${tone} tone. 
  Keep it concise and under 150 characters.`;

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    if (!groq) {
      return NextResponse.json(
        { error: "Groq API key is missing or invalid." },
        { status: 500 }
      );
    }

    const caption = await groq.chat.completions
      .create({
        model: "llama3-8b-8192", // You can also use "llama3-70b-8192" for better results
        messages: [
          {
            role: "system",
            content:
              "You are a creative assistant that generates engaging social media captions.",
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

    console.log("Generated caption:", caption);

    return NextResponse.json({ caption: caption.choices[0].message.content });
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

export async function GET(request: NextRequest) {
  try {
    const content = request.nextUrl.searchParams.get("content");
    const tone = request.nextUrl.searchParams.get("tone") || "engaging"; // Default tone is "engaging"
    const platform = request.nextUrl.searchParams.get("platform") || "twitter"; // Default platform is "LinkedIn"

    console.log("GET request parameters:", {
      content,
      tone,
      platform,
    });

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const prompt = `Enhance the following caption to make it more engaging and impactful: "${content}". 
    Ensure the caption is suitable for ${platform}, maintains a ${tone} tone.`

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    if (!groq) {
      return NextResponse.json(
        { error: "Groq API key is missing or invalid." },
        { status: 500 }
      );
    }

    const caption = await groq.chat.completions
      .create({
        model: "llama3-8b-8192", // You can also use "llama3-70b-8192" for better results
        messages: [
          {
            role: "system",
            content:
              "You are a creative assistant that generates engaging social media captions.",
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

    console.log("Generated caption:", caption);

    return NextResponse.json({ caption: caption.choices[0].message.content });
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
