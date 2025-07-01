'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  Meh,
  Phone,
  PhoneOff,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/hooks/use-user';
import { AvatarSystem, useAvatarController, mapEmotionToAvatar } from '@/components/avatar/avatar-system';
import { GeminiLiveConversation } from '@/lib/ai/gemini-live';
import { emotionDetector } from '@/lib/ai/emotion-detection';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date | string;
  emotion_detected?: string;
  sentiment_score?: number;
}

export default function EmployeeChatPage() {
  const { user, loading: userLoading } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [liveConversation, setLiveConversation] = useState<GeminiLiveConversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const avatarController = useAvatarController();

  // Audio recording setup
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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

    // Initialize emotion detection
    emotionDetector.initialize();

    // Cleanup on unmount
    return () => {
      if (liveConversation) {
        liveConversation.disconnect();
      }
      stopAudioProcessing();
    };
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
        employee_id: user.id,
        session_type: 'text',
        created_at: serverTimestamp(),
      });

      setSessionId(newSessionDoc.id);

      // Add welcome message
      const welcomeMessageContent = `Hello ${user.first_name || 'there'}! I'm your AI wellness assistant. I'm here to listen, provide support, and help you with your mental health journey. How are you feeling today?`;
      
      const welcomeMessage: ChatMessage = {
        id: uuidv4(),
        content: welcomeMessageContent,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);

      // Set avatar to empathetic state
      avatarController.updateEmotion('empathetic', 0.7);
      avatarController.setSpeaking(true);

      // Simulate AI speaking
      setTimeout(() => {
        avatarController.setSpeaking(false);
        avatarController.setListening(true);
      }, 3000);

      // Add message to Firestore
      const messagesRef = collection(db, 'chat_sessions', newSessionDoc.id, 'messages');
      await addDoc(messagesRef, {
        session_id: newSessionDoc.id,
        content: welcomeMessageContent,
        sender: 'ai',
        timestamp: serverTimestamp(),
      });

      // Set up real-time listener for messages in this session
      const q = query(messagesRef, orderBy('timestamp'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesData: ChatMessage[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            content: data.content,
            sender: data.sender,
            timestamp: data.timestamp?.toDate() || new Date(),
            emotion_detected: data.emotion_detected,
            sentiment_score: data.sentiment_score,
          };
        });
        setMessages(messagesData);
      });

      // Return cleanup function
      return () => unsubscribe();

    } catch (error: any) {
      console.error('Error creating chat session:', error);
      toast.error('Failed to initialize chat');
    }
  };

  const initializeLiveConversation = async () => {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      toast.error('Gemini API key not configured');
      return;
    }

    setIsConnecting(true);

    try {
      // Get user's emotional state from recent reports
      const emotionalState = await getUserEmotionalState();

      const conversation = new GeminiLiveConversation({
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        voiceName: 'Zephyr',
        onMessage: (message) => {
          // Add AI text response to chat
          if (sessionId) {
            addMessageToChat(message, 'ai');
          }
          
          // Update avatar to speaking state
          avatarController.setSpeaking(true);
          avatarController.setListening(false);
          
          // After AI response, set back to listening
          setTimeout(() => {
            avatarController.setSpeaking(false);
            avatarController.setListening(true);
          }, 1000);
        },
        onError: (error) => {
          console.error('Live conversation error:', error);
          toast.error(`Voice chat error: ${error}`);
          setIsVoiceMode(false);
          setIsConnected(false);
        },
        onConnectionChange: (connected) => {
          setIsConnected(connected);
          setIsConnecting(false);
          if (!connected && isVoiceMode) {
            setIsVoiceMode(false);
            toast.info('Voice chat disconnected');
          }
        },
        onEmotionDetected: (emotion) => {
          // Update avatar emotion based on AI's detected emotion
          const avatarEmotion = mapEmotionToAvatar(emotion);
          avatarController.updateEmotion(avatarEmotion, emotion.confidence || 0.5);
        }
      });

      // Create conversation context
      const context = {
        employeeId: user!.id,
        sessionId: sessionId!,
        conversationHistory: messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: new Date(msg.timestamp),
          emotionData: msg.emotion_detected ? {
            primaryEmotion: msg.emotion_detected,
            sentimentScore: msg.sentiment_score
          } : undefined
        })),
        emotionalState: {
          primaryEmotion: emotionalState.primaryEmotion,
          confidence: 0.7,
          sentiment: emotionalState.sentiment,
          stressLevel: emotionalState.stressLevel,
          engagementLevel: emotionalState.engagementLevel
        },
        riskLevel: emotionalState.riskLevel
      };

      await conversation.connect(context);
      setLiveConversation(conversation);
      setIsVoiceMode(true);
      toast.success('Voice chat connected!');

      // Start audio recording
      startAudioRecording();

    } catch (error) {
      console.error('Failed to initialize live conversation:', error);
      toast.error('Failed to connect voice chat');
      setIsConnecting(false);
      setIsVoiceMode(false);
    }
  };

  const getUserEmotionalState = async () => {
    try {
      // Get user's recent reports to determine emotional state
      const reportsRef = collection(db, 'mental_health_reports');
      const q = query(reportsRef, 
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reports = querySnapshot.docs.map(doc => doc.data());
      
      if (reports.length > 0) {
        const latestReport = reports[0];
        
        return {
          primaryEmotion: latestReport.mood_rating > 7 ? 'happy' : 
                         latestReport.stress_level > 7 ? 'stressed' : 'neutral',
          sentiment: latestReport.mood_rating > 6 ? 'positive' : 
                    latestReport.mood_rating < 4 ? 'negative' : 'neutral',
          stressLevel: latestReport.stress_level || 5,
          engagementLevel: latestReport.energy_level || 5,
          riskLevel: latestReport.risk_level || 'low'
        };
      }
      
      // Default values if no reports found
      return {
        primaryEmotion: 'neutral',
        sentiment: 'neutral',
        stressLevel: 5,
        engagementLevel: 5,
        riskLevel: 'low'
      };
    } catch (error) {
      console.error('Error getting user emotional state:', error);
      return {
        primaryEmotion: 'neutral',
        sentiment: 'neutral',
        stressLevel: 5,
        engagementLevel: 5,
        riskLevel: 'low'
      };
    }
  };

  const disconnectLiveConversation = async () => {
    if (liveConversation) {
      await liveConversation.disconnect();
      setLiveConversation(null);
    }
    setIsVoiceMode(false);
    setIsConnected(false);
    stopAudioRecording();
    toast.info('Voice chat disconnected');
  };

  const addMessageToChat = async (content: string, sender: 'user' | 'ai', emotionData?: any) => {
    if (!sessionId) return;

    try {
      const messagesRef = collection(db, 'chat_sessions', sessionId, 'messages');
      await addDoc(messagesRef, {
        content,
        sender,
        emotion_detected: emotionData?.primaryEmotion,
        sentiment_score: emotionData?.sentimentScore,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding message to chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !sessionId || loading) return;

    const userMessage = currentMessage;
    setCurrentMessage('');
    setLoading(true);

    try {
      // Analyze emotion in user message
      const emotionData = await emotionDetector.analyzeTextEmotion(userMessage);
      
      // Update avatar based on user emotion
      const avatarEmotion = mapEmotionToAvatar(emotionData);
      avatarController.updateEmotion(avatarEmotion, emotionData.confidence);
      
      // Add user message to chat
      await addMessageToChat(userMessage, 'user', emotionData);

      if (isVoiceMode && liveConversation && isConnected) {
        // Send to Gemini Live
        avatarController.setListening(false);
        avatarController.setSpeaking(true);
        await liveConversation.sendMessage(userMessage, emotionData);
      } else {
        // Use fallback AI response
        const aiResponse = await generateAIResponse(userMessage, emotionData);
        
        // Simulate typing delay
        setTimeout(async () => {
          await addMessageToChat(aiResponse, 'ai');
          setLoading(false);
          
          // Update avatar to speaking state
          avatarController.setSpeaking(true);
          avatarController.setListening(false);
          
          // After AI response, set back to listening
          setTimeout(() => {
            avatarController.setSpeaking(false);
            avatarController.setListening(true);
          }, 2000);
        }, 1000 + Math.random() * 1000);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setLoading(false);
    }
  };

  const generateAIResponse = async (userMessage: string, emotionData: any) => {
    try {
      // Call the Gemini API endpoint
      const response = await fetch('/api/ai/gemini-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      
      // Generate contextual responses based on emotion
      const responses = {
        happy: [
          "I'm glad to hear you're feeling positive! What's been going well for you?",
          "That's wonderful to hear! Positive emotions are so important for our wellbeing. Would you like to share more about what's making you feel this way?"
        ],
        sad: [
          "I'm sorry to hear you're feeling down. Would you like to talk about what's bothering you?",
          "It sounds like you're going through a difficult time. Remember that it's okay to feel sad sometimes. Is there anything specific that's troubling you?"
        ],
        angry: [
          "I can sense you're feeling frustrated. Would it help to talk through what's causing these feelings?",
          "It seems like something has upset you. Sometimes expressing our feelings can help us process them better. Would you like to share more?"
        ],
        anxious: [
          "I notice you might be feeling anxious. Let's take a moment to breathe together. Would that help?",
          "Anxiety can be challenging to deal with. Is there something specific that's making you feel this way?"
        ],
        stressed: [
          "It sounds like you're under a lot of pressure. What's contributing to your stress right now?",
          "I can understand feeling overwhelmed. Let's break down what's causing your stress and see if we can find some solutions together."
        ],
        neutral: [
          "Thank you for sharing that with me. How has your day been overall?",
          "I appreciate you opening up. Is there anything specific you'd like to discuss about your wellbeing today?"
        ]
      };

      // Select response based on detected emotion
      const emotion = data.primaryEmotion?.toLowerCase() || emotionData.primaryEmotion?.toLowerCase() || 'neutral';
      const emotionCategory = Object.keys(responses).find(key => emotion.includes(key)) || 'neutral';
      const emotionResponses = responses[emotionCategory as keyof typeof responses];
      const response = emotionResponses[Math.floor(Math.random() * emotionResponses.length)];

      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "I'm having trouble processing that right now. How are you feeling today?";
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Create analyzer for audio levels
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      // Connect microphone to analyzer
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up data handling
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) return;
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        
        if (liveConversation && isConnected) {
          try {
            await liveConversation.sendAudio(arrayBuffer);
          } catch (error) {
            console.error('Failed to send audio:', error);
          }
        }
        
        audioChunksRef.current = [];
      };
      
      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
      // Start audio level monitoring
      startAudioLevelMonitoring();
      
    } catch (error) {
      console.error('Failed to start audio recording:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    stopAudioProcessing();
  };

  const startAudioLevelMonitoring = () => {
    if (!analyserRef.current) return;
    
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (!analyserRef.current) return;
      
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const normalizedLevel = average / 255; // Normalize to 0-1
      
      setAudioLevel(normalizedLevel);
      
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };
    
    updateAudioLevel();
  };

  const stopAudioProcessing = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setAudioLevel(0);
    setIsRecording(false);
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopAudioRecording();
    } else {
      startAudioRecording();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Wellness Assistant</h1>
          <p className="text-gray-600 mt-2">
            Chat with our AI assistant for mental health support and guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="lg:col-span-1">
            <Card className="h-[500px] overflow-hidden">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <span>Wellness Assistant</span>
                  </div>
                  <Badge className={isConnected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                    {isConnected ? 'Connected' : 'Online'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <div className="h-full w-full">
                  <AvatarSystem 
                    state={avatarController.state} 
                    audioLevel={audioLevel}
                    className="h-full"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Voice Mode Controls */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Voice Interaction</h3>
                    <p className="text-sm text-gray-600">Talk directly with the AI assistant</p>
                  </div>
                  <Button
                    variant={isVoiceMode ? "default" : "outline"}
                    size="sm"
                    onClick={isVoiceMode ? disconnectLiveConversation : initializeLiveConversation}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : isVoiceMode ? (
                      <PhoneOff className="h-4 w-4 mr-2" />
                    ) : (
                      <Phone className="h-4 w-4 mr-2" />
                    )}
                    <span>
                      {isConnecting ? 'Connecting...' : isVoiceMode ? 'End Voice Chat' : 'Start Voice Chat'}
                    </span>
                  </Button>
                </div>
                
                {isVoiceMode && (
                  <div className="mt-4 flex items-center justify-center">
                    <Button
                      variant={isRecording ? "destructive" : "outline"}
                      size="lg"
                      className="rounded-full w-16 h-16 flex items-center justify-center"
                      onClick={toggleVoiceRecording}
                    >
                      {isRecording ? (
                        <MicOff className="h-6 w-6" />
                      ) : (
                        <Mic className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-6 w-6 text-blue-600" />
                    <span>Wellness Assistant</span>
                  </div>
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
                          {typeof message.timestamp === 'string' 
                            ? new Date(message.timestamp).toLocaleTimeString() 
                            : message.timestamp.toLocaleTimeString()}
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
                    placeholder={isVoiceMode ? "Type or use voice..." : "Type your message..."}
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
                    {isVoiceMode && (
                      <Button
                        variant={isRecording ? "destructive" : "ghost"}
                        size="sm"
                        onClick={toggleVoiceRecording}
                        disabled={!isConnected}
                      >
                        {isRecording ? (
                          <MicOff className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    )}
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
          </div>
        </div>
      </div>
    </div>
  );
}