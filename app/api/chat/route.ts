import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// simple rate-limit (per server instance)
let lastCallTime = 0;

export async function POST(req: Request) {
  try {
    const now = Date.now();
    if (now - lastCallTime < 1500) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }
    lastCallTime = now;

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash", // ✅ stable & correct
    });

    const result = await model.generateContent(message);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
