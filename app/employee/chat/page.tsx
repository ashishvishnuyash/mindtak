'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Heart,
  Brain,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { toast } from 'sonner';
import type { ChatMessage, ChatSession } from '@/types/index';

import {
  collection,
  doc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function EmployeeChatPage() {

  const generateAIResponse = (userMessage: string) => {
    const message = userMessage.toLowerCase();
    
    // Simple emotion detection
    let emotion = 'neutral';
    let sentiment = 0;
    
    if (message.includes('sad') || message.includes('depressed') || message.includes('down')) {
      emotion = 'sad';
      sentiment = -0.7;
    } else if (message.includes('angry') || message.includes('frustrated') || message.includes('mad')) {
      emotion = 'angry';
      sentiment = -0.5;
    } else if (message.includes('happy') || message.includes('good') || message.includes('great')) {
      emotion = 'happy';
      sentiment = 0.8;
    } else if (message.includes('anxious') || message.includes('worried') || message.includes('nervous')) {
      emotion = 'anxious';
      sentiment = -0.6;
    } else if (message.includes('stressed') || message.includes('overwhelmed')) {
      emotion = 'stressed';
      sentiment = -0.8;
    }

    // Generate contextual responses
    const responses = {
      sad: [
        "I'm sorry to hear you're feeling sad. It's completely normal to have these feelings. Would you like to talk about what's been bothering you?",
        "Sadness is a natural emotion, and it's okay to feel this way. Remember that these feelings are temporary. What usually helps you feel better?",
        "I understand you're going through a difficult time. Sometimes talking about it can help. I'm here to listen without judgment."
      ],
      angry: [
        "I can sense you're feeling frustrated. Anger is a valid emotion. What's been causing these feelings?",
        "It sounds like something has really upset you. Would you like to share what happened? Sometimes expressing anger in a safe space can be helpful.",
        "I hear that you're angry. Let's work through this together. What would help you feel more calm right now?"
      ],
      happy: [
        "It's wonderful to hear you're feeling good! What's been going well for you lately?",
        "I'm glad you're in a positive mood! Celebrating good moments is important for our mental health.",
        "That's great to hear! Positive emotions are so valuable. What's been bringing you joy?"
      ],
      anxious: [
        "I understand you're feeling anxious. Anxiety can be overwhelming, but you're not alone. What's been on your mind?",
        "Anxiety is very common, and it's brave of you to acknowledge it. Have you tried any breathing exercises or grounding techniques?",
        "I hear that you're feeling worried. Let's take this one step at a time. What specific thoughts are causing you anxiety?"
      ],
      stressed: [
        "Stress can be really challenging to deal with. What's been the main source of your stress lately?",
        "I understand you're feeling overwhelmed. It's important to take breaks and practice self-care. What usually helps you relax?",
        "Stress affects us all differently. You're taking a positive step by talking about it. What support do you need right now?"
      ],
      neutral: [
        "Thank you for sharing that with me. How has your day been overall?",
        "I appreciate you opening up. Is there anything specific you'd like to discuss about your mental health?",
        "I'm here to support you. What's been on your mind lately regarding your wellbeing?",
        "How are you taking care of yourself these days? Self-care is so important for mental health."
      ]
    };

    const emotionResponses = responses[emotion as keyof typeof responses] || responses.neutral;
    const response = emotionResponses[Math.floor(Math.random() * emotionResponses.length)];

    return {
      content: response,
      emotion,
      sentiment
    };
  };
  const { user, loading: userLoading } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (user?.role !== 'employee') {
      router.push('/employer/dashboard');
      return;
    }

    if (user) {
      initializeChat();
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    if (!user) return;

    try {
      // Create a new chat session
      const sessionRef = collection(db, 'chat_sessions');
      const newSessionDoc = await addDoc(sessionRef, {
          employee_id: user!.id,
          session_type: 'text',
          created_at: serverTimestamp(),
      });

      setSessionId(newSessionDoc.id);

      // Add welcome message to the session subcollection
      const messagesRef = collection(db, 'chat_sessions', newSessionDoc.id, 'messages');
      const welcomeMessageContent = `Hello ${user!.first_name || 'there'}! I'm your AI wellness assistant. I'm here to listen, provide support, and help you with your mental health journey. How are you feeling today?`;
      
      await addDoc(messagesRef, {
        session_id: newSessionDoc.id,
        content: welcomeMessageContent,
        sender: 'ai',
        timestamp: serverTimestamp(),
      });

      // Set up real-time listener for messages in this session
      const q = query(messagesRef, orderBy('timestamp'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesData: ChatMessage[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<ChatMessage, 'id'>,
          timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString(), // Convert Firestore Timestamp to ISO string
        }));
        setMessages(messagesData);
      });

      // Cleanup listener on unmount
      return () => unsubscribe();

    } catch (error: any) {
        console.error('Error creating chat session:', error);
      toast.error('Failed to initialize chat');
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !sessionId || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      session_id: sessionId,
      content: currentMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setLoading(true);

    if (!sessionId) {
        toast.error("Chat session not initialized.");
        setLoading(false);
        return;
    }

    try {
      // Save user message to database
      const messagesRef = collection(db, 'chat_sessions', sessionId, 'messages');
      await addDoc(messagesRef, {
          content: userMessage.content,
          sender: 'user', // Use 'user' as the sender identifier
          timestamp: serverTimestamp(),
      });

      // Simulate AI response (in a real app, this would call an AI service)
      const aiResponse = generateAIResponse(userMessage.content);
      
      setTimeout(() => {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          session_id: sessionId,
          content: aiResponse.content, // Use 'ai' as the sender identifier
          sender: 'ai', 
          emotion_detected: aiResponse.emotion,
          sentiment_score: aiResponse.sentiment,
          timestamp: new Date().toISOString(),
        };

        // Save AI message to database
        // This message will be added to the state by the real-time listener
        addDoc(messagesRef, {
            session_id: sessionId,
            content: aiMessage.content,
            sender: 'ai',
            emotion_detected: aiMessage.emotion_detected,
            sentiment_score: aiMessage.sentiment_score,
          });
        setLoading(false);
      }, 1000 + Math.random() * 2000); // Simulate thinking time

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setLoading(false);
    }
  };

  const getEmotionIcon = (emotion?: string) => {
    switch (emotion) {
      case 'happy': return <Smile className="h-4 w-4 text-green-500" />;
      case 'sad': return <Frown className="h-4 w-4 text-blue-500" />;
      case 'angry': return <Frown className="h-4 w-4 text-red-500" />;
      case 'anxious': return <Brain className="h-4 w-4 text-yellow-500" />;
      case 'stressed': return <Brain className="h-4 w-4 text-orange-500" />;
      default: return <Meh className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSentimentBadge = (score?: number) => {
    if (!score) return null;
    
    if (score > 0.3) return <Badge className="bg-green-100 text-green-700">Positive</Badge>;
    if (score < -0.3) return <Badge className="bg-red-100 text-red-700">Negative</Badge>;
    return <Badge className="bg-gray-100 text-gray-700">Neutral</Badge>;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Wellness Assistant</h1>
          <p className="text-gray-600 mt-2">
            Chat with our AI assistant for mental health support and guidance.
          </p>
        </div>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-blue-600" />
              <span>Wellness Assistant</span>
              <Badge className="bg-green-100 text-green-700">Online</Badge>
            </CardTitle>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`rounded-lg p-3 ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    
                    {message.sender === 'ai' && (message.emotion_detected || message.sentiment_score) && (
                      <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200">
                        {message.emotion_detected && (
                          <div className="flex items-center space-x-1">
                            {getEmotionIcon(message.emotion_detected)}
                            <span className="text-xs text-gray-600 capitalize">
                              {message.emotion_detected}
                            </span>
                          </div>
                        )}
                        {getSentimentBadge(message.sentiment_score)}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="flex space-x-3 max-w-[80%]">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Type your message..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !currentMessage.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" disabled>
                  <Mic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <Heart className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Confidential Support</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your conversations are private and encrypted. This AI assistant provides general wellness support 
                and is not a replacement for professional mental health care. If you're experiencing a crisis, 
                please contact emergency services or a mental health professional immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
            <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Stress Management</h3>
            <p className="text-sm text-gray-600">Learn coping strategies</p>
          </Card>
          
          <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
            <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Mood Tracking</h3>
            <p className="text-sm text-gray-600">Monitor your emotions</p>
          </Card>
          
          <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
            <Smile className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Wellness Tips</h3>
            <p className="text-sm text-gray-600">Daily self-care advice</p>
          </Card>
        </div>
      </div>
    </div>
  );
}