import { type NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

    const prompt = `Generate only the caption for: "${content}". 
      The caption must:
      - Be optimized for ${platform} (appropriate length, format, and style)
      - Have a ${tone} tone
      - Be concise and engaging
      - Include relevant hashtags if appropriate for the platform
      - Stay under 280 characters for Twitter, or appropriate length for other platforms
      
      DO NOT include any prefixes like "Here's your caption:" or "Refined caption:". 
      Return ONLY the caption text itself.`;

    const caption = await groq.chat.completions
      .create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content:
              "You are a social media caption expert who creates engaging, platform-appropriate captions. Return only the caption text without any prefixes or explanations.",
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

    let cleanedCaption = caption.choices[0].message.content?.trim();
    if (!caption.choices || caption.choices.length === 0) {
      cleanedCaption = cleanedCaption?.replace(
        /^(here'?s?( your| the)?|refined|enhanced) caption:?\s*/i,
        ""
      );
      cleanedCaption = cleanedCaption?.replace(/^caption:?\s*/i, "");
    }

    return NextResponse.json({ caption: cleanedCaption });
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
    const tone = request.nextUrl.searchParams.get("tone") || "engaging";
    const platform = request.nextUrl.searchParams.get("platform") || "twitter";

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const prompt = `Enhance and refine this caption: "${content}"
      
      Create an improved version that:
      - Is optimized for ${platform}
      - Has a ${tone} tone
      - Is concise and compelling
      - Includes appropriate hashtags if relevant to the platform
      - Follows platform best practices (character limits, formatting)
      
      DO NOT include any prefixes like "Here's your enhanced caption:" or "Refined caption:".
      Return ONLY the enhanced caption text itself.`;

    const caption = await groq.chat.completions
      .create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content:
              "You are a social media expert who enhances captions to be engaging and platform-appropriate. Return only the enhanced caption without any prefixes or explanations.",
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

    let cleanedCaption = caption.choices[0].message.content?.trim();
    if (!caption.choices || caption.choices.length === 0) {
      cleanedCaption = cleanedCaption?.replace(
        /^(here'?s?( your| the)?|refined|enhanced) caption:?\s*/i,
        ""
      );
      cleanedCaption = cleanedCaption?.replace(/^caption:?\s*/i, "");
    }
    return NextResponse.json({ caption: cleanedCaption });
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
