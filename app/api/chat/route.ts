// app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ChatMessage } from '@/types/index';
import { getRecentReports, generateReportsAnalytics, formatReportsForAI, getPersonalHistory, formatPersonalHistoryForAI } from '@/lib/reports-service';

// Psychological Assessment Data
const ASSESSMENT_DATA = {
  personality_profiler: {
    questions: {
      1: "Does your mood fluctuate?",
      2: "Do you bother too much about what others think of you?",
      3: "Do you like talking much?",
      4: "If you make a commitment to someone, do you abide by it irrespective of discomfort?",
      5: "Do you sometimes feel under the weather?",
      6: "If you become broke/bankrupt will it bother you?",
      7: "Are you a happy go lucky person?",
      8: "Do you desire for more than the effort you put in for anything?",
      9: "Do you get anxious easily?",
      10: "Are you curious to try drugs that may be dangerous otherwise?",
      11: "Do you like making new friends?",
      12: "Have you put blame on someone for your own mistake?",
      13: "Are you a sensitive person?",
      14: "Do you prefer having your own way out rather than following a code of conduct?",
      15: "Do you like partying?",
      16: "Are you well behaved and good mannered?",
      17: "Do you often feel offended for no reason?",
      18: "Do you like abiding by rules and remaining neat and clean?",
      19: "Do you like approaching new people?",
      20: "Have you ever stolen anything?",
      21: "Do you get anxious easily?",
      22: "Do you think getting married is futile?",
      23: "Can you bring life to a boring party?",
      24: "Have you ever broken or misplaced something that did not belong to you?",
      25: "Do you overthink and worry a lot?",
      26: "Do you like working in teams?",
      27: "Do you like to take a back seat during social events?",
      28: "Does it keep bothering you if the work you have does is incorrect or has errors?",
      29: "Have you ever backbitten about someone?",
      30: "Are you a high on nerves person?",
      31: "Do you think people expend a lot of time in making future investments?",
      32: "Do you like spending time with people?",
      33: "Were you difficult to handle as a child to your parents?",
      34: "Does an awkward experience keep bothering you even after it is over?",
      35: "Do you try to be polite to people?",
      36: "Do you like a lot of hustle and bustle around you?",
      37: "Have you ever broken rules during any game/sport?",
      38: "Do you suffer from overthinking and nervousness?",
      39: "Do you like to dominate others?",
      40: "Have you ever misused someone's decency?",
      41: "Do you interact less, when with other people?",
      42: "Do you mostly feel alone?",
      43: "Do you prefer following rules set by the society or be a master of you wishes?",
      44: "Are you considered to be an upbeat person by others?",
      45: "Do you follow what you say?",
      46: "Do you often feel embarrassed and guilty?",
      47: "Do you sometimes procrastinate?",
      48: "Can you initiate and bring life to a party?"
    },
    scoring: {
      "Non-Conformist": { "yes": [10, 14, 22, 31, 39], "no": [2, 6, 18, 26, 28, 35, 43] },
      "Sociable": { "yes": [3, 7, 11, 15, 19, 23, 32, 36, 44, 48], "no": [27, 41] },
      "Emotionally Unstable": { "yes": [1, 5, 9, 13, 17, 21, 25, 30, 34, 38, 42, 46], "no": [] },
      "Socially Desirable": { "yes": [4, 16], "no": [8, 12, 20, 24, 29, 33, 37, 40, 45, 47] }
    },
    interpretations: {
      "Sociable": "High scores indicate an outgoing, impulsive, and uninhibited personality. These individuals enjoy social gatherings, have many friends, and prefer excitement and activity.",
      "Unsociable": "Low scores on Sociable dimensions suggest a quiet, retiring, and studious nature. They tend to be reserved, prefer a well-planned life, and keep feelings controlled.",
      "Emotionally Unstable": "High scores indicate strong emotional lability and over-responsiveness. They tend to experience worries and anxieties, especially under stress.",
      "Non-Conformist": "High scores suggest tendencies towards being cruel, inhumane, socially indifferent, hostile, and aggressive. They may lack empathy and act disruptively.",
      "Socially Desirable": "This scale measures the tendency to 'fake good' or provide socially acceptable answers rather than true ones. A high score may indicate the other results are not fully valid."
    }
  },
  self_efficacy_scale: {
    questions: [
      "I can solve tedious problems with sincere efforts.",
      "If someone disagrees with me, I can still manage to get what I want with ease.",
      "It is easy for me to remain focused on my objectives and achieve my goals.",
      "I have the caliber of dealing efficiently and promptly with obstacles and adversities.",
      "I am resourceful and competent enough to handle unpredictable events and situations.",
      "I can solve problems with ease if I put in requisite effort.",
      "I can remain relaxed even in wake of adversity due to my coping skills.",
      "I can generate alternative solutions with ease even when I come across problematic situations.",
      "If I find myself in a catch twenty two situation, I can still manage finding a solution.",
      "I am mostly capable of handling anything that crosses my path."
    ],
    scoring_instructions: "Please rate each statement on a scale of 1 to 4, where 1 is 'Not at all true', 2 is 'Hardly true', 3 is 'Moderately true', and 4 is 'Exactly true'.",
    interpretation: "The total score will be the sum of your ratings for all 10 items (ranging from 10-40). A higher score indicates higher Self-Efficacy. High self-efficacy is a belief in one's own ability to meet challenges and complete tasks successfully. It is associated with self-confidence, willingness to take risks, resilience, and strong motivation."
  }
};

// Initialize OpenAI client only when needed
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  return new OpenAI({ apiKey });
}

// Perplexity AI configuration
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

interface WellnessReport {
  mood: number;
  stress_score: number;
  anxious_level: number;
  work_satisfaction: number;
  work_life_balance: number;
  energy_level: number;
  confident_level: number;
  sleep_quality: number;
  complete_report: string;
  session_type: 'text' | 'voice';
  session_duration: number;
  key_insights: string[];
  recommendations: string[];
}

// Assessment Functions
function getAssessmentQuestions(testName: string): string {
  const normalizedTestName = testName.toLowerCase().replace(/\s+/g, '_');

  if (!(normalizedTestName in ASSESSMENT_DATA)) {
    return `Assessment '${testName}' not found. Available assessments are: ${Object.keys(ASSESSMENT_DATA).map(k => k.replace('_', ' ')).join(', ')}`;
  }

  const test = ASSESSMENT_DATA[normalizedTestName as keyof typeof ASSESSMENT_DATA];
  let output = `Great! Here are the questions for the ${testName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}.\n\n`;

  if ('scoring_instructions' in test) {
    output += test.scoring_instructions + "\n\n";
  }

  if (normalizedTestName === 'personality_profiler') {
    output += "Please answer 'yes' or 'no' to each question:\n\n";
    const questions = test.questions as Record<number, string>;
    for (const [num, question] of Object.entries(questions)) {
      output += `${num}. ${question}\n`;
    }
  } else if (normalizedTestName === 'self_efficacy_scale') {
    const questions = test.questions as string[];
    questions.forEach((question, index) => {
      output += `${index + 1}. ${question}\n`;
    });
  }

  output += "\nPlease take your time to answer and then provide your responses when you're ready for interpretation.";
  return output;
}

function interpretPersonalityProfiler(answers: Record<string, string>): string {
  const scores = {
    "Non-Conformist": 0,
    "Sociable": 0,
    "Emotionally Unstable": 0,
    "Socially Desirable": 0
  };

  const scoringRules = ASSESSMENT_DATA.personality_profiler.scoring;

  for (const [dimension, rules] of Object.entries(scoringRules)) {
    let score = 0;

    // Count "yes" answers
    for (const qNum of rules.yes || []) {
      if (answers[qNum.toString()]?.toLowerCase() === 'yes') {
        score += 1;
      }
    }

    // Count "no" answers
    for (const qNum of rules.no || []) {
      if (answers[qNum.toString()]?.toLowerCase() === 'no') {
        score += 1;
      }
    }

    scores[dimension as keyof typeof scores] = score;
  }

  const interpretations = ASSESSMENT_DATA.personality_profiler.interpretations;
  let result = "Based on your answers, here is your personality profile:\n\n";

  for (const [dimension, score] of Object.entries(scores)) {
    result += `**${dimension} Score: ${score}**\n`;

    if (dimension === "Sociable") {
      const interp = score > 5 ? interpretations.Sociable : interpretations.Unsociable;
      result += `Interpretation: ${interp}\n\n`;
    } else if (dimension in interpretations) {
      result += `Interpretation: ${interpretations[dimension as keyof typeof interpretations]}\n\n`;
    }
  }

  return result;
}

function interpretSelfEfficacyScale(scores: number[]): string {
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const maxScore = 40;
  const minScore = 10;

  let interpretation = `Your Self-Efficacy Scale Results:\n\n`;
  interpretation += `Total Score: ${totalScore} out of ${maxScore}\n\n`;

  if (totalScore >= 32) {
    interpretation += "**High Self-Efficacy**: You have strong confidence in your ability to handle challenges and achieve your goals. You likely approach difficult tasks as challenges to master rather than threats to avoid.";
  } else if (totalScore >= 24) {
    interpretation += "**Moderate Self-Efficacy**: You have reasonable confidence in your abilities, though there may be some areas where you could develop stronger self-belief. You generally handle challenges well but might sometimes doubt yourself.";
  } else {
    interpretation += "**Lower Self-Efficacy**: You may benefit from building more confidence in your abilities. Consider focusing on past successes and developing coping strategies to handle challenges more effectively.";
  }

  interpretation += `\n\n${ASSESSMENT_DATA.self_efficacy_scale.interpretation}`;

  return interpretation;
}

export async function POST(request: NextRequest) {
  try {
    const {
      messages,
      endSession,
      sessionType = 'text',
      sessionDuration = 0,
      userId,
      companyId,
      deepSearch = false,
      aiProvider = 'openai', // 'openai' or 'perplexity'
      assessmentType,
      assessmentAnswers
    } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Handle assessment requests
    if (assessmentType === 'get_questions') {
      const lastMessage = messages[messages.length - 1];
      const testName = extractTestName(lastMessage.content);
      if (testName) {
        const questions = getAssessmentQuestions(testName);
        return NextResponse.json({
          type: 'assessment_questions',
          data: {
            content: questions,
            sender: 'ai',
            testName: testName
          }
        });
      }
    }

    if (assessmentType === 'interpret_results' && assessmentAnswers) {
      const { testName, answers } = assessmentAnswers;
      let interpretation = '';

      if (testName === 'personality_profiler') {
        interpretation = interpretPersonalityProfiler(answers);
      } else if (testName === 'self_efficacy_scale') {
        interpretation = interpretSelfEfficacyScale(answers);
      }

      return NextResponse.json({
        type: 'assessment_results',
        data: {
          content: interpretation,
          sender: 'ai',
          testName: testName
        }
      });
    }

    if (endSession) {
      return await generateWellnessReport(messages, sessionType, sessionDuration);
    } else {
      return await generateChatResponse(messages, sessionType, userId, companyId, deepSearch, aiProvider);
    }

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to extract test name from user message
function extractTestName(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('personality') || lowerMessage.includes('profiler')) {
    return 'personality_profiler';
  }

  if (lowerMessage.includes('self efficacy') || lowerMessage.includes('self-efficacy') || lowerMessage.includes('efficacy')) {
    return 'self_efficacy_scale';
  }

  return null;
}

// Helper function to parse personality profiler answers
function parsePersonalityAnswers(message: string): Record<string, string> | null {
  const answers: Record<string, string> = {};

  // Try to parse numbered yes/no answers
  const lines = message.split('\n');
  for (const line of lines) {
    const match = line.match(/(\d+)[\.\)]\s*(yes|no)/i);
    if (match) {
      answers[match[1]] = match[2].toLowerCase();
    }
  }

  // Alternative parsing for different formats
  if (Object.keys(answers).length === 0) {
    const yesNoPattern = /(yes|no)/gi;
    const matches = message.match(yesNoPattern);
    if (matches && matches.length >= 10) { // At least some answers
      matches.forEach((answer, index) => {
        answers[(index + 1).toString()] = answer.toLowerCase();
      });
    }
  }

  return Object.keys(answers).length > 0 ? answers : null;
}

// Helper function to parse self-efficacy scale answers
function parseSelfEfficacyAnswers(message: string): number[] | null {
  const scores: number[] = [];

  // Try to parse numbered ratings (1-4)
  const lines = message.split('\n');
  for (const line of lines) {
    const match = line.match(/(\d+)[\.\)]\s*([1-4])/);
    if (match) {
      scores.push(parseInt(match[2]));
    }
  }

  // Alternative parsing for different formats
  if (scores.length === 0) {
    const numberPattern = /[1-4]/g;
    const matches = message.match(numberPattern);
    if (matches && matches.length >= 5) { // At least some answers
      matches.forEach(score => {
        const num = parseInt(score);
        if (num >= 1 && num <= 4) {
          scores.push(num);
        }
      });
    }
  }

  return scores.length > 0 ? scores : null;
}

// Perplexity AI API call function
async function callPerplexityAPI(messages: any[], systemPrompt: string, maxTokens: number = 300) {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('Perplexity API key not configured');
  }

  // Format messages properly for Perplexity API
  // Ensure alternating user/assistant pattern after system message
  const formattedMessages = [{ role: 'system', content: systemPrompt }];

  // Add conversation history, ensuring proper alternation
  // Perplexity requires strict alternating pattern: user -> assistant -> user -> assistant
  let lastRole = 'system';

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const currentRole = message.role;

    // If we have consecutive messages from the same role, we need to handle it
    if (currentRole === lastRole && lastRole !== 'system') {
      // Skip consecutive messages from the same role, or merge them
      if (formattedMessages.length > 1) {
        // Merge with the previous message of the same role
        const lastMessage = formattedMessages[formattedMessages.length - 1];
        lastMessage.content += '\n' + message.content;
        continue;
      }
    }

    // Ensure we start with a user message after system
    if (formattedMessages.length === 1 && currentRole !== 'user') {
      // If the first message after system is not from user, skip or convert it
      if (currentRole === 'assistant') {
        continue; // Skip assistant messages at the beginning
      }
    }

    formattedMessages.push({
      role: currentRole,
      content: message.content
    });

    lastRole = currentRole;
  }

  // Ensure we end with a user message for Perplexity to respond to
  if (formattedMessages.length > 1 && formattedMessages[formattedMessages.length - 1].role !== 'user') {
    // If the last message is not from user, we might need to add a prompt
    // But in most cases, this should not happen in a chat flow
  }

  const requestBody = {
    model: 'sonar',
    messages: formattedMessages,
    max_tokens: maxTokens,
    temperature: 0.7,
    top_p: 0.9,
    search_domain_filter: ["pubmed.ncbi.nlm.nih.gov", "who.int", "mayoclinic.org", "webmd.com", "healthline.com"],
    return_citations: true,
    search_recency_filter: "month",
    top_k: 0,
    stream: false,
    presence_penalty: 0,
    frequency_penalty: 1
  };

  console.log('Perplexity API Request:', {
    url: PERPLEXITY_API_URL,
    hasApiKey: !!PERPLEXITY_API_KEY,
    apiKeyPrefix: PERPLEXITY_API_KEY?.substring(0, 10) + '...',
    model: requestBody.model,
    messageCount: formattedMessages.length,
    messageRoles: formattedMessages.map(m => m.role)
  });

  const response = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    console.error('Perplexity API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
      headers: Object.fromEntries(response.headers.entries())
    });

    throw new Error(`Perplexity API error: ${response.status} - ${errorData.error?.message || errorData.message || 'Unknown error'}`);
  }

  const result = await response.json();
  console.log('Perplexity API Success:', {
    hasChoices: !!result.choices,
    choicesLength: result.choices?.length,
    hasCitations: !!result.citations,
    citationsLength: result.citations?.length
  });

  return result;
}

async function generateChatResponse(messages: ChatMessage[], sessionType: string, userId?: string, companyId?: string, deepSearch: boolean = false, aiProvider: string = 'openai') {
  try {
    // Get company-wide reports context
    let reportsContext = '';
    if (companyId) {
      try {
        const recentReports = await getRecentReports(companyId, 7);
        const analytics = generateReportsAnalytics(recentReports);
        reportsContext = formatReportsForAI(recentReports, analytics);
      } catch (error) {
        console.error('Error fetching reports context:', error);
        // Continue without reports context if there's an error
      }
    }

    // Get personal history context
    let personalContext = '';
    if (userId && companyId) {
      try {
        const personalHistory = await getPersonalHistory(userId, companyId, 30);
        personalContext = formatPersonalHistoryForAI(personalHistory);
      } catch (error) {
        console.error('Error fetching personal history:', error);
        // Continue without personal context if there's an error
      }
    }

    // Prepare conversation context
    const conversationHistory = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }));



    // Check if user is asking for psychological assessments
    const lastUserMessage = messages.filter(m => m.sender === 'user').pop()?.content.toLowerCase() || '';
    const isAssessmentRequest = lastUserMessage.includes('test') || lastUserMessage.includes('assessment') ||
      lastUserMessage.includes('personality') || lastUserMessage.includes('efficacy') ||
      lastUserMessage.includes('profiler') || lastUserMessage.includes('quiz');

    let systemPrompt = `You are a compassionate AI wellness assistant and psychological assessment facilitator conducting a ${sessionType} mental health check-in. Your role is to:

1. Create a safe, non-judgmental space for the user to share their feelings
2. Ask thoughtful follow-up questions to understand their mental state
3. Show empathy and validate their experiences
4. Gently explore topics like mood, stress, work satisfaction, energy levels, sleep, and confidence
5. Keep responses conversational and supportive (2-3 sentences max)
6. Avoid giving medical advice - focus on emotional support and active listening
7. ${sessionType === 'voice' ? 'Keep responses concise since this is a voice conversation' : 'You can be slightly more detailed in text conversations'}
8. **PSYCHOLOGICAL ASSESSMENTS**: You can offer and facilitate psychological assessments including:
   - Personality Profiler (48 yes/no questions assessing sociability, emotional stability, conformity, and social desirability)
   - Self-Efficacy Scale (10 questions rated 1-4 assessing confidence in handling challenges)

ASSESSMENT GUIDELINES:
- When users express interest in taking a test or assessment, offer available options
- Explain what each assessment measures before starting
- If they want to take the Personality Profiler, tell them you'll provide 48 yes/no questions
- If they want the Self-Efficacy Scale, tell them you'll provide 10 statements to rate 1-4
- Always include the disclaimer: "I am an AI assistant and not a substitute for professional psychological evaluation. These assessments are for self-reflection purposes only."
- After providing questions, wait for their answers before interpreting results
- When interpreting results, be supportive and constructive, focusing on self-awareness and growth

${personalContext ? `
PERSONAL HISTORY CONTEXT:
You have access to this user's previous wellness sessions and reports. Use this to provide continuity and personalized support:

${personalContext}

Use this personal history to:
- Reference previous conversations naturally ("Last time we talked about...")
- Track progress and acknowledge improvements or concerns
- Build on previous insights and recommendations
- Provide personalized follow-up questions
- Celebrate progress or offer additional support for ongoing challenges
- Remember recurring themes and patterns in their wellness journey
` : ''}

${reportsContext ? `
COMPANY WELLNESS CONTEXT:
You also have access to recent wellness data from the user's company. Use this context to provide more personalized support and identify patterns, but NEVER reveal specific details about other employees. You can reference general trends like "I notice stress levels have been higher across the company lately" or "Many team members have been reporting similar challenges."

${reportsContext}

Use this information to:
- Provide context-aware support
- Identify if the user's experience aligns with company trends
- Offer relevant insights without breaching privacy
- Suggest company-wide wellness initiatives when appropriate
` : ''}

Remember: This is a wellness check-in, not therapy. Be warm, understanding, and help them reflect on their current state. Use both personal and company context to provide the most supportive and relevant conversation possible.`;

    // Add deep search context for Perplexity
    if (deepSearch && aiProvider === 'perplexity') {
      systemPrompt += `

DEEP SEARCH MODE: You have access to real-time web search capabilities. When the user asks questions about mental health topics, wellness strategies, or current research, use your web search to provide up-to-date, evidence-based information. Always cite your sources and focus on reputable health organizations and recent research.`;
    }

    // Handle assessment requests directly
    if (isAssessmentRequest) {
      const testName = extractTestName(lastUserMessage);
      if (testName) {
        const questions = getAssessmentQuestions(testName);
        return NextResponse.json({
          type: 'assessment_questions',
          data: {
            content: `I am an AI assistant and not a substitute for professional psychological evaluation. These assessments are for self-reflection purposes only.\n\n${questions}`,
            sender: 'ai',
            testName: testName
          }
        });
      }
    }

    // Check if user is providing assessment answers
    const isAnswerPattern = /^\d+[\.\)]\s*(yes|no|\d+)/i.test(lastUserMessage) ||
      lastUserMessage.includes('1.') || lastUserMessage.includes('1)') ||
      /answer[s]?.*:/i.test(lastUserMessage);

    if (isAnswerPattern && conversationHistory.length > 2) {
      // Look for previous assessment questions in conversation
      const previousMessages = messages.slice(-10); // Check last 10 messages
      const hasPersonalityQuestions = previousMessages.some(m =>
        m.content.includes('Does your mood fluctuate?') || m.content.includes('personality_profiler')
      );
      const hasSelfEfficacyQuestions = previousMessages.some(m =>
        m.content.includes('I can solve tedious problems') || m.content.includes('self_efficacy_scale')
      );

      if (hasPersonalityQuestions || hasSelfEfficacyQuestions) {
        const testType = hasPersonalityQuestions ? 'personality_profiler' : 'self_efficacy_scale';
        let interpretation = '';

        if (testType === 'personality_profiler') {
          const answers = parsePersonalityAnswers(lastUserMessage);
          if (answers) {
            interpretation = interpretPersonalityProfiler(answers);
          }
        } else if (testType === 'self_efficacy_scale') {
          const answers = parseSelfEfficacyAnswers(lastUserMessage);
          if (answers) {
            interpretation = interpretSelfEfficacyScale(answers);
          }
        }

        if (interpretation) {
          return NextResponse.json({
            type: 'assessment_results',
            data: {
              content: interpretation,
              sender: 'ai',
              testName: testType
            }
          });
        }
      }
    }

    let aiResponse: string | undefined;

    if (aiProvider === 'perplexity' && deepSearch) {
      try {
        // Use Perplexity for deep search capabilities
        const perplexityResponse = await callPerplexityAPI(
          conversationHistory,
          systemPrompt,
          sessionType === 'voice' ? 150 : 300
        );
        aiResponse = perplexityResponse.choices[0]?.message?.content || undefined;
      } catch (perplexityError) {
        console.error('Perplexity API failed, falling back to OpenAI:', perplexityError);
        // Fallback to OpenAI if Perplexity fails
        const openai = getOpenAIClient();
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt + '\n\nNote: Deep search is temporarily unavailable, providing response based on training data.' },
            ...conversationHistory
          ],
          temperature: 0.7,
          max_tokens: sessionType === 'voice' ? 150 : 300,
        });
        const fallbackResponse = completion.choices[0]?.message?.content;
        aiResponse = fallbackResponse ? fallbackResponse + '\n\n*Note: Deep search temporarily unavailable - response based on existing knowledge.*' : undefined;
      }
    } else {
      // Use OpenAI (default)
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory
        ],
        temperature: 0.7,
        max_tokens: sessionType === 'voice' ? 150 : 300,
      });
      const openaiResponse = completion.choices[0]?.message?.content;
      aiResponse = openaiResponse ?? undefined;
    }

    if (!aiResponse) {
      throw new Error('No response generated from AI');
    }

    return NextResponse.json({
      type: 'message',
      data: {
        content: aiResponse,
        sender: 'ai'
      }
    });

  } catch (error: any) {
    console.error('Error generating chat response:', error);
    throw error;
  }
}

async function generateWellnessReport(messages: ChatMessage[], sessionType: string, sessionDuration: number): Promise<NextResponse> {
  try {
    // Extract user messages for analysis
    const userMessages = messages
      .filter(msg => msg.sender === 'user')
      .map(msg => msg.content)
      .join('\n');

    const analysisPrompt = `Analyze this ${sessionType} wellness conversation and generate a comprehensive mental health report. The conversation lasted ${Math.floor(sessionDuration / 60)} minutes and ${sessionDuration % 60} seconds.

User's responses:
${userMessages}

Generate a JSON report with the following structure:
{
  "mood": [1-10 scale],
  "stress_score": [1-10 scale, where 10 is highest stress],
  "anxious_level": [1-10 scale],
  "work_satisfaction": [1-10 scale],
  "work_life_balance": [1-10 scale],
  "energy_level": [1-10 scale],
  "confident_level": [1-10 scale],
  "sleep_quality": [1-10 scale],
  "complete_report": "A comprehensive 2-3 paragraph analysis of the user's mental state, key concerns, and overall wellness",
  "session_type": "${sessionType}",
  "session_duration": ${sessionDuration},
  "key_insights": ["3-5 key insights about the user's mental state"],
  "recommendations": ["3-5 specific, actionable recommendations for improving wellness"]
}

Guidelines:
- Base scores on actual conversation content
- If information is missing, use reasonable estimates based on available data
- Be empathetic and constructive in the complete_report
- Make recommendations specific and actionable
- Consider the ${sessionType} format in your analysis
- Focus on patterns and themes in their responses`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a mental health analysis AI. Provide accurate, empathetic assessments based on conversation data. Always respond with valid JSON.' },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No analysis generated from AI');
    }

    // Parse the JSON response
    let report: WellnessReport;
    try {
      report = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiResponse);
      // Fallback report if JSON parsing fails
      report = {
        mood: 5,
        stress_score: 5,
        anxious_level: 5,
        work_satisfaction: 5,
        work_life_balance: 5,
        energy_level: 5,
        confident_level: 5,
        sleep_quality: 5,
        complete_report: "Unable to generate detailed analysis due to processing error. Please try again or contact support.",
        session_type: sessionType as 'text' | 'voice',
        session_duration: sessionDuration,
        key_insights: ["Analysis temporarily unavailable"],
        recommendations: ["Please try another session for detailed recommendations"]
      };
    }

    return NextResponse.json({
      type: 'report',
      data: report
    });

  } catch (error: any) {
    console.error('Error generating wellness report:', error);
    throw error;
  }
}
