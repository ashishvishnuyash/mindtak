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

    // Convert webm blob to a proper File object with correct MIME type
    // OpenAI Whisper API requires the file to have a proper extension and MIME type
    let fileToTranscribe: File = audioFile;

    // If the file is a webm blob, ensure it has the correct properties
    if (audioFile.type === 'audio/webm' || audioFile.name.endsWith('.webm')) {
      // Create a new File object with explicit webm extension and MIME type
      fileToTranscribe = new File(
        [audioFile],
        audioFile.name || 'recording.webm',
        {
          type: 'audio/webm',
          lastModified: Date.now()
        }
      );
    } else if (!audioFile.name || !audioFile.type) {
      // If file doesn't have name or type, try to infer from blob
      const blob = audioFile as unknown as Blob;
      const fileName = audioFile.name || `recording.${blob.type.includes('webm') ? 'webm' : 'wav'}`;
      const mimeType = blob.type || 'audio/webm';
      
      fileToTranscribe = new File(
        [blob],
        fileName,
        {
          type: mimeType,
          lastModified: Date.now()
        }
      );
    }

    // Convert the file to the format expected by OpenAI
    const openai = getOpenAIClient();
    const transcription = await openai.audio.transcriptions.create({
      file: fileToTranscribe,
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
