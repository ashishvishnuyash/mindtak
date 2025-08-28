import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client only when needed
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  return new OpenAI({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert the file to the format expected by OpenAI
    const openai = getOpenAIClient();
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'json',
    });

    return NextResponse.json({
      text: transcription.text
    });

  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: error.message },
      { status: 500 }
    );
  }
}
