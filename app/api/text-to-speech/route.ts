import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, voice } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum length is 5000 characters.' },
        { status: 400 }
      );
    }

    // Check if ElevenLabs API key is available
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured. Please add ELEVENLABS_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Default to a male teen voice - using a voice ID that sounds like a male teenager
    // Free tier voices available: Adam, Antoni, Arnold, Bella, Domi, Elli, Josh, Rachel, Sam, etc.
    // For a male teen voice on free tier, we'll use "pNInz6obpgDQGcFmaJgB" (Adam) - a young male voice
    // Alternative free tier male voices: "ErXwobaYiN019PkySvjV" (Antoni), "TxGEqnHWrfWFTfGW9XjX" (Josh)
    // Note: Premium voices like Ethan and Brayden require Creator tier or above
    const voiceId = voice || process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Adam - Free tier young male voice

    // Call ElevenLabs Text-to-Speech API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_turbo_v2_5', // Updated to latest turbo model (recommended for real-time applications)
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('ElevenLabs TTS API error:', errorData);
      let errorMessage = 'Failed to generate speech';
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.detail?.message || errorMessage;
      } catch {
        // Use default error message
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer();

    // Return the audio data with appropriate headers
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Text-to-speech error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}