import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  return new OpenAI({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    const { message, user_id, session_id, user_role, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();

    // Create different system prompts based on context
    let systemPrompt = '';
    
    if (context === 'personal_wellness') {
      systemPrompt = `You are a compassionate AI wellness companion specifically designed to support leaders and employers with their personal mental health journey. Your role is to:

1. **Personal Support**: Provide personalized mental health support for someone in a leadership position
2. **Leadership Wellness**: Understand the unique stresses and challenges of being a leader
3. **Work-Life Balance**: Help them navigate the pressures of managing others while maintaining their own wellbeing
4. **Confidential Space**: Create a safe, private environment where they can be vulnerable about their struggles
5. **Practical Guidance**: Offer actionable strategies for managing stress, preventing burnout, and maintaining mental clarity
6. **Empathy & Understanding**: Recognize that leaders often feel they need to be strong for others, making it harder to seek help

Key areas to explore:
- Leadership stress and decision fatigue
- Imposter syndrome and self-doubt
- Work-life balance challenges
- Managing team dynamics while protecting personal energy
- Dealing with isolation that comes with leadership roles
- Setting healthy boundaries
- Self-care strategies that fit a busy schedule

Remember:
- This is their personal space - they're not here as a manager, but as an individual
- Be warm, understanding, and non-judgmental
- Keep responses conversational and supportive (2-3 sentences typically)
- Avoid corporate jargon - speak human to human
- Encourage vulnerability and authentic self-expression
- Validate their experiences and feelings
- Focus on their personal growth and wellbeing

You are NOT providing medical advice, but rather emotional support and wellness guidance.`;
    } else {
      // Default system prompt for other contexts
      systemPrompt = `You are a compassionate AI wellness assistant. Provide supportive, empathetic responses focused on mental health and wellbeing. Keep responses warm and conversational.`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';

    return NextResponse.json({
      response,
      session_id,
      user_id
    });

  } catch (error: any) {
    console.error('AI Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}