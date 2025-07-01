import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { audio } = await request.json();

    if (!audio || typeof audio !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request. Audio data is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_SPEECH_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Speech API key not configured' },
        { status: 500 }
      );
    }

    // Prepare the request to Google Speech-to-Text API
    const response = await fetch('https://speech.googleapis.com/v1/speech:recognize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'en-US',
          model: 'default',
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: false
        },
        audio: {
          content: audio
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Speech-to-Text API error:', errorData);
      return NextResponse.json(
        { error: 'Speech-to-Text API error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract transcription from response
    const transcription = data.results
      ?.map((result: any) => result.alternatives[0]?.transcript)
      .join(' ') || '';

    return NextResponse.json({ transcription });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}