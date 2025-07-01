import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request. Text is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    Analyze the following text for emotional content and provide a detailed analysis in JSON format.
    
    Text: "${text}"
    
    Please return a JSON object with the following structure:
    {
      "primaryEmotion": "string", // The main emotion detected (e.g., happy, sad, angry, anxious, stressed, neutral)
      "confidence": number, // Confidence score between 0-1
      "sentiment": "positive" | "negative" | "neutral", // Overall sentiment
      "sentimentScore": number, // Score between -1 (negative) and 1 (positive)
      "stressIndicators": string[], // List of words or phrases indicating stress
      "riskLevel": "low" | "medium" | "high", // Estimated risk level based on emotional content
      "emotionBreakdown": { // Percentage breakdown of detected emotions
        "happy": number,
        "sad": number,
        "angry": number,
        "anxious": number,
        "stressed": number,
        "neutral": number
      }
    }
    
    Only return the JSON object, no additional text.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const textResponse = response.text();

    // Extract JSON from the response
    let jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to parse emotion analysis' },
        { status: 500 }
      );
    }

    const jsonStr = jsonMatch[0];
    const emotionData = JSON.parse(jsonStr);

    return NextResponse.json(emotionData);
  } catch (error) {
    console.error('Gemini emotion analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze emotions' },
      { status: 500 }
    );
  }
}