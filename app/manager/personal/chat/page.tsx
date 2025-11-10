"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AvatarController, useTTSLipSync } from "@/components/avatar";
import AvatarSettings, { useAvatarSettings } from "@/components/avatar/AvatarSettings";
import { ThemeToggle } from '@/components/ui/theme-toggle';
import Link from 'next/link';

import {
  Send,
  Bot,
  User,
  PhoneOff,
  Loader2,
  FileText,
  Sparkles,
  Phone,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Play,
  Pause,
  Search,
  Menu,
  Brain,
  Paperclip,
  Image as ImageIcon,
  X,
  Upload,
  UserCircle,
  Settings,
  CheckCircle,
  ArrowLeft,
  Shield,
  MessageSquare,
  Heart,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { toast } from "sonner";
import type { ChatMessage } from "@/types/index";
import ReactMarkdown from "react-markdown";
import { DeepConversationToggle } from "@/components/shared/ai-provider-selector";

import {
  collection,
  doc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { signOut } from 'firebase/auth';
import { withAuth } from '@/components/auth/with-auth';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Audio recording utilities
class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000);
      return true;
    } catch (error) {
      console.error("Error starting recording:", error);
      return false;
    }
  }

  async stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === "recording";
  }
}

// The final report structure
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
  session_type: "text" | "voice";
  session_duration: number;
  key_insights: string[];
  recommendations: string[];
}

// Helper function to calculate risk level based on report data
const calculateRiskLevel = (
  report: WellnessReport
): "low" | "medium" | "high" => {
  const riskFactors = [
    report.stress_score >= 8 ? 2 : report.stress_score >= 6 ? 1 : 0,
    report.anxious_level >= 8 ? 2 : report.anxious_level >= 6 ? 1 : 0,
    report.mood <= 3 ? 2 : report.mood <= 5 ? 1 : 0,
    report.energy_level <= 3 ? 1 : 0,
    report.work_satisfaction <= 3 ? 1 : 0,
    report.sleep_quality <= 3 ? 1 : 0,
    report.confident_level <= 3 ? 1 : 0,
  ];

  const totalRisk = riskFactors.reduce((sum, factor) => sum + factor, 0);

  if (totalRisk >= 6) return "high";
  if (totalRisk >= 3) return "medium";
  return "low";
};

function ManagerPersonalChatPage() {
  const { user, loading: userLoading } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<WellnessReport | null>(
    null
  );

  // Voice/Call state
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isAvatarMode, setIsAvatarMode] = useState(true);

  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);

  const [audioEnabled, setAudioEnabled] = useState(true);

  // Avatar state
  const [currentAvatarEmotion, setCurrentAvatarEmotion] = useState<string>("");

  // Avatar Settings
  const { config: avatarConfig, updateConfig: updateAvatarConfig, isOpen: isSettingsOpen, toggleSettings } = useAvatarSettings();
  
  // Enhanced TTS with lip sync
  const { speak: speakWithLipSync, stop: stopTTS, isPlaying: isTTSPlaying } = useTTSLipSync();
  const [currentTTSText, setCurrentTTSText] = useState<string>("");
  const [lastAIMessage, setLastAIMessage] = useState<string>("");

  // File upload state
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deep Conversation state
  const [deepConversation, setDeepConversation] = useState(true);

  const [processingAudio, setProcessingAudio] = useState(false);

  // Options panel state
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const audioRecorderRef = useRef<AudioRecorder>(new AudioRecorder());
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Allow demo access without authentication
    if (!userLoading) {
      if (!user) {
        // Demo mode - continue without user
        console.log("Demo mode: No authentication required");
      }
    }
    if (user) {
      (async () => {
        await initializeChat();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Call timer
  useEffect(() => {
    if (isVoiceMode && callStartTime) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(
          Math.floor((Date.now() - callStartTime.getTime()) / 1000)
        );
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isVoiceMode, callStartTime]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Enhanced TTS with lip sync
  const speakText = async (text: string) => {
    if (!audioEnabled) return;
    
    // Stop any current speech
    stopTTS();
    window.speechSynthesis.cancel();
    
    setCurrentTTSText(text);
    setIsSpeaking(true);
    
    if (isAvatarMode) {
      // Use enhanced TTS with lip sync
      try {
        await speakWithLipSync(text, {
          rate: 0.9,
          pitch: 1.0,
          volume: 1.0
        });
      } catch (error) {
        console.error('Enhanced TTS Error:', error);
        // Fallback to regular TTS
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      // Regular TTS for non-avatar mode
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      synthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processAudioMessage = async (audioBlob: Blob) => {
    try {
      // Convert audio to text using Whisper API
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const transcriptionResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!transcriptionResponse.ok) {
        throw new Error("Failed to transcribe audio");
      }
      const { text } = await transcriptionResponse.json();
      if (text.trim()) {
        setCurrentMessage(text);
        await handleSendMessage(text);
      } else {
        toast.error("No speech detected in recording");
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      toast.error("Failed to process audio message");
    }
  };

  // Call controls
  const startCall = () => {
    setIsVoiceMode(true);
    setCallStartTime(new Date());
    setCallDuration(0);
    toast.success("Voice call started - Click microphone to record");
  };

  const endCall = async () => {
    setIsVoiceMode(false);
    setCallStartTime(null);
    setCallDuration(0);

    setIsRecording(false);
    setIsSpeaking(false);
    setProcessingAudio(false);

    // Stop any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    toast.info("Call ended - generating report...");
    await handleEndSession();
  };

  // Format call duration
  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const initializeChat = async () => {
    if (!user) return;

    try {
      // Create a new chat session
      const sessionRef = collection(db, "chat_sessions");
      const newSessionDoc = await addDoc(sessionRef, {
        employee_id: user!.id,
        company_id: user!.company_id || "default",
        session_type: "text_analysis",
        status: "active",
        created_at: serverTimestamp(),
        report: null,
      });

      setSessionId(newSessionDoc.id);

      // Add welcome message from AI
      const welcomeMessageContent = `Hi ${user!.first_name || "there"}! How have you been feeling?`;
      await addMessageToDb(welcomeMessageContent, "ai", newSessionDoc.id);

      // Set up real-time listener for messages
      const messagesQuery = query(
        collection(db, "chat_sessions", newSessionDoc.id, "messages"),
        orderBy("timestamp")
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData: ChatMessage[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ChatMessage, "id">),
          timestamp:
            doc.data().timestamp?.toDate().toISOString() ||
            new Date().toISOString(),
        }));
        setMessages(messagesData);
      });

      return () => unsubscribe();
    } catch (error: any) {
      console.error("Error creating chat session:", error);
      toast.error("Failed to initialize chat session.");
    }
  };

  const addMessageToDb = async (
    content: string,
    sender: "user" | "ai",
    currentSessionId: string
  ) => {
    if (!currentSessionId) return;
    try {
      const messagesRef = collection(
        db,
        "chat_sessions",
        currentSessionId,
        "messages"
      );
      await addDoc(messagesRef, {
        content,
        sender,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding message to DB:", error);
      toast.error("Could not save message.");
    }
  }; 
 // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);

    // Clear the input
    if (event.target) {
      event.target.value = '';
    }
  };

  const processFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const supportedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'text/plain', 'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (file.size > maxSize) {
        errors.push(`${file.name} is too large (max 10MB)`);
        return;
      }

      if (!supportedTypes.includes(file.type)) {
        errors.push(`${file.name} has unsupported file type`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      toast.error(`Some files couldn't be added: ${errors.join(', ')}`);
    }

    if (validFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...validFiles]);
      toast.success(`Added ${validFiles.length} file(s)`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    toast.info('File removed');
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Function to render message content with file attachments
  const renderMessageContent = (content: string) => {
    // Check if message contains file attachment indicators
    const fileAttachmentRegex = /📎\s+([^\n,]+)/g;
    const hasAttachments = fileAttachmentRegex.test(content);

    if (hasAttachments) {
      const parts = content.split('\n\nAttached files:');
      const messageText = parts[0];
      const fileList = parts[1];

      return (
        <div>
          {messageText && (
            <div className="prose prose-sm max-w-none mb-2">
              <ReactMarkdown>{messageText}</ReactMarkdown>
            </div>
          )}
          {fileList && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <div className="flex items-center space-x-1 text-gray-600">
                <Paperclip className="h-3 w-3" />
                <span className="font-medium">Attachments:</span>
              </div>
              <div className="mt-1 text-gray-700">{fileList}</div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  };

  const handleSendMessage = async (messageText?: string) => {
    const messageContent = messageText || currentMessage;
    if ((!messageContent.trim() && attachedFiles.length === 0) || !sessionId || loading || sessionEnded) return;

    setCurrentMessage("");
    setLoading(true);

    // Create message content with file info
    let fullMessageContent = messageContent;
    if (attachedFiles.length > 0) {
      const fileList = attachedFiles.map(f => `📎 ${f.name}`).join(', ');
      fullMessageContent = messageContent ? `${messageContent}\n\nAttached files: ${fileList}` : `Attached files: ${fileList}`;
    }

    // Add user message to DB immediately for optimistic UI update
    await addMessageToDb(fullMessageContent, "user", sessionId);

    try {
      // Note: we fetch the latest messages from state to ensure the API gets the full context
      const messageHistoryForApi = [
        ...messages,
        {
          id: "temp",
          session_id: sessionId,
          sender: "user",
          content: messageContent,
          timestamp: new Date().toISOString(),
        },
      ];

      let response;

      if (attachedFiles.length > 0) {
        // Handle file upload
        const formData = new FormData();

        // Add JSON data
        formData.append('data', JSON.stringify({
          messages: messageHistoryForApi,
          sessionType: isVoiceMode ? "voice" : "text",
          userId: user?.id,
          companyId: user?.company_id,
          deepSearch: deepConversation,
          aiProvider: deepConversation ? "perplexity" : "openai",
          context: 'manager_personal_wellness',
        }));

        // Add files
        attachedFiles.forEach(file => {
          formData.append('files', file);
        });

        response = await fetch("/api/chat", {
          method: "POST",
          body: formData,
        });

        // Clear attached files after sending
        setAttachedFiles([]);
      } else {
        // Regular text message
        response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: messageHistoryForApi,
            sessionType: isVoiceMode ? "voice" : "text",
            userId: user?.id,
            companyId: user?.company_id,
            deepSearch: deepConversation,
            aiProvider: deepConversation ? "perplexity" : "openai",
            context: 'manager_personal_wellness',
          }),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to get response from AI.");
      }

      const result = await response.json();

      if (result.type === "message") {
        await addMessageToDb(result.data.content, "ai", sessionId);
        
        // Store the last AI message for lip sync
        setLastAIMessage(result.data.content);

        // Set avatar emotion based on message content
        if (isAvatarMode) {
          // Simple emotion detection
          const content = result.data.content.toLowerCase();
          if (content.includes('happy') || content.includes('great') || content.includes('excellent')) {
            setCurrentAvatarEmotion('HAPPY');
          } else if (content.includes('angry') || content.includes('upset') || content.includes('frustrated')) {
            setCurrentAvatarEmotion('ANGRY');
          } else if (content.includes('laugh') || content.includes('funny') || content.includes('haha')) {
            setCurrentAvatarEmotion('LAUGHING');
          } else if (content.includes('congratulations') || content.includes('well done') || content.includes('bravo')) {
            setCurrentAvatarEmotion('CLAPPING');
          } else if (content.includes('success') || content.includes('achievement') || content.includes('accomplish')) {
            setCurrentAvatarEmotion('VICTORY');
          } else {
            setCurrentAvatarEmotion('IDLE');
          }
        }
        // Speak the AI response in voice mode or avatar mode
        if ((isVoiceMode || isAvatarMode) && audioEnabled) {
          speakText(result.data.content);
        }
      } else {
        // This case should not happen during a normal conversation
        console.warn("Received a report unexpectedly. Treating as a message.");
        await addMessageToDb(JSON.stringify(result.data), "ai", sessionId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred while communicating with the AI.");
      // Optionally add the error message back to the chat for the user
      await addMessageToDb(
        "Sorry, I encountered an error. Please try again.",
        "ai",
        sessionId
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId || loading || sessionEnded || !user) return;

    toast.info("Analyzing conversation and generating comprehensive wellness report...");
    setLoading(true);

    try {
      // Calculate conversation metrics
      const sessionDuration = callDuration || 
        Math.floor((Date.now() - (callStartTime?.getTime() || Date.now())) / 1000);
      
      const messageCount = messages.length;
      const userMessages = messages.filter(m => m.sender === 'user');
      const aiMessages = messages.filter(m => m.sender === 'ai');
      
      // Extract conversation content for analysis
      const conversationContent = messages.map(m => 
        `${m.sender === 'user' ? 'User' : 'AI'}: ${m.content}`
      ).join('\n');

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          endSession: true,
          sessionType: isVoiceMode ? "voice" : "text",
          sessionDuration,
          conversationAnalysis: true,
          conversationMetrics: {
            totalMessages: messageCount,
            userMessages: userMessages.length,
            aiMessages: aiMessages.length,
            sessionDuration,
            hasAttachments: messages.some(m => m.content.includes('📎')),
            voiceMode: isVoiceMode,
            avatarMode: isAvatarMode
          },
          userId: user?.id,
          companyId: user?.company_id,
          context: 'manager_personal_wellness',
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate comprehensive report from AI.");
      }

      const result = await response.json();

      if (result.type === "report") {
        const report = result.data as WellnessReport;
        const sessionDuration = callDuration ||
          Math.floor(
            (Date.now() - (callStartTime?.getTime() || Date.now())) / 1000
          );

        // Create comprehensive conversation data
        const conversationData = {
          sessionId,
          employeeId: user.id,
          companyId: user.company_id || "default",
          sessionType: isVoiceMode ? "voice" : "text",
          sessionDuration,
          messageCount,
          userMessageCount: userMessages.length,
          aiMessageCount: aiMessages.length,
          conversationContent,
          hasAttachments: messages.some(m => m.content.includes('📎')),
          avatarMode: isAvatarMode,
          voiceMode: isVoiceMode,
          startTime: callStartTime?.toISOString() || new Date().toISOString(),
          endTime: new Date().toISOString(),
          messages: messages.map(m => ({
            sender: m.sender,
            content: m.content,
            timestamp: m.timestamp
          }))
        };

        // Update the chat session with comprehensive data
        const sessionDocRef = doc(db, "chat_sessions", sessionId);
        await updateDoc(sessionDocRef, {
          report: report,
          status: "completed",
          completed_at: serverTimestamp(),
          session_type: isVoiceMode ? "voice" : "text",
          duration: sessionDuration,
          conversationData: conversationData,
          messageCount: messageCount,
          analysisComplete: true
        });

        // Save comprehensive mental health report
        const mentalHealthReport = {
          employee_id: user.id,
          company_id: user.company_id || "default",
          stress_level: Math.max(1, Math.min(10, Math.round(report.stress_score))),
          mood_rating: Math.max(1, Math.min(10, Math.round(report.mood))),
          energy_level: Math.max(1, Math.min(10, Math.round(report.energy_level))),
          work_satisfaction: Math.max(1, Math.min(10, Math.round(report.work_satisfaction))),
          work_life_balance: Math.max(1, Math.min(10, Math.round(report.work_life_balance))),
          anxiety_level: Math.max(1, Math.min(10, Math.round(report.anxious_level))),
          confidence_level: Math.max(1, Math.min(10, Math.round(report.confident_level))),
          sleep_quality: Math.max(1, Math.min(10, Math.round(report.sleep_quality))),
          overall_wellness: Math.max(
            1,
            Math.min(
              10,
              Math.round(
                (report.mood +
                  report.energy_level +
                  report.work_satisfaction +
                  report.work_life_balance +
                  report.confident_level +
                  report.sleep_quality +
                  (11 - report.stress_score) +
                  (11 - report.anxious_level)) /
                8
              )
            )
          ),
          comments: `Comprehensive AI-generated report from ${isVoiceMode ? "voice" : "text"} conversation session - Manager Personal Wellness`,
          ai_analysis: report.complete_report || "Comprehensive conversation analysis completed",
          sentiment_score: Math.max(0, Math.min(1, report.mood / 10)),
          emotion_tags: Array.isArray(report.key_insights) ? report.key_insights : [],
          risk_level: calculateRiskLevel(report),
          session_type: isVoiceMode ? "voice" : "text",
          session_duration: sessionDuration,
          conversation_metrics: {
            totalMessages: messageCount,
            userMessages: userMessages.length,
            aiMessages: aiMessages.length,
            hasAttachments: messages.some(m => m.content.includes('📎')),
            avatarMode: isAvatarMode,
            voiceMode: isVoiceMode
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        try {
          await addDoc(
            collection(db, "mental_health_reports"),
            mentalHealthReport
          );
          console.log("Comprehensive mental health report saved successfully");
        } catch (saveError) {
          console.error("Error saving mental health report:", saveError);
          toast.error("Report generated but failed to save. Please contact support.");
        }

        // Save conversation data separately for detailed analysis
        try {
          await addDoc(
            collection(db, "conversation_analyses"),
            conversationData
          );
          console.log("Conversation analysis data saved successfully");
        } catch (conversationError) {
          console.error("Error saving conversation analysis:", conversationError);
        }

        setGeneratedReport(report);
        setSessionEnded(true);
        toast.success("Comprehensive wellness report generated and saved successfully!");

        // Update gamification streak and points
        await updateGamificationStreak(sessionDuration, messageCount);
      } else {
        throw new Error("AI did not return a valid report format.");
      }
    } catch (error) {
      console.error("Error ending session and generating comprehensive report:", error);
      toast.error("Could not generate your comprehensive report. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const updateGamificationStreak = async (sessionDuration: number, messageCount: number) => {
    if (!user) return;

    try {
      const response = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'conversation_complete',
          employee_id: user.id,
          company_id: user.company_id,
          data: {
            sessionDuration,
            messageCount,
            sessionType: isVoiceMode ? 'voice' : 'text',
            avatarMode: isAvatarMode
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        // Show success message with points earned
        if (result.points_earned > 0) {
          toast.success(`🎉 ${result.message} (+${result.points_earned} points!)`);
        } else {
          toast.success(result.message);
        }
        
        // Show new badges if any
        if (result.new_badges && result.new_badges.length > 0) {
          setTimeout(() => {
            toast.success(`🏆 You earned ${result.new_badges.length} new badge(s)!`, {
              duration: 5000
            });
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error updating gamification streak:', error);
      // Don't show error to user as this is a background operation
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Enhanced recording functionality with lip sync feedback
  const startRecording = async () => {
    const success = await audioRecorderRef.current.startRecording();
    if (success) {
      setIsRecording(true);
      if (isAvatarMode && !isVoiceMode) {
        toast.success("Microphone test started - speak to see lip sync");
      } else {
        toast.success("Recording started");
      }
    } else {
      toast.error(
        "Failed to start recording. Please check microphone permissions."
      );
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setProcessingAudio(true);
    const audioBlob = await audioRecorderRef.current.stopRecording();

    if (audioBlob) {
      await processAudioMessage(audioBlob);
    } else {
      toast.error("Failed to process audio recording");
    }

    setProcessingAudio(false);
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-colors duration-300 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 lg:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link href="/manager/personal">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100">AI Wellness Companion</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Personal Support for Leaders</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button variant="outline" size="sm" className="hidden lg:flex text-green-600 border-green-200 bg-green-50 text-xs px-2 sm:px-3">
                Personal Chat
              </Button>
              <Link href="/manager/dashboard" className="hidden lg:block">
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs sm:text-sm px-2 sm:px-3">
                  <Shield className="h-3 w-3 mr-1" />
                  Management Dashboard
                </Button>
              </Link>
              <ThemeToggle size="sm" />
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-200 px-2 sm:px-3"
                onClick={async () => {
                  try {
                    await signOut(auth);
                    router.push('/auth/login');
                  } catch (error) {
                    console.error('Logout error:', error);
                    router.push('/auth/login');
                  }
                }}
              >
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 lg:px-8 flex-shrink-0">
        <div className="flex space-x-3 sm:space-x-4 md:space-x-6 lg:space-x-8 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => router.push('/manager/personal')}
            className="pb-2 sm:pb-3 lg:pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0"
          >
            Overview
          </button>
          <button
            onClick={() => router.push('/manager/personal/reports')}
            className="pb-2 sm:pb-3 lg:pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0"
          >
            Analytics
          </button>
          <button className="pb-2 sm:pb-3 lg:pb-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0">
            AI Friend
          </button>
        </div>
      </div>

      {/* Full Screen Chat Container */}
      <div className="flex flex-col flex-1 relative">
        {/* Responsive Layout - Split on desktop, overlay on mobile */}
        <div className="flex flex-1 min-h-0 relative">
          {/* Chat Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`flex flex-col ${
              isAvatarMode 
                ? 'w-full lg:w-1/2 relative z-20' // Full width on mobile, half on desktop, z-20 for layering above avatar
                : 'w-full'
            } transition-all duration-300 ${
              isAvatarMode 
                ? 'mobile-chat-overlay lg:bg-white lg:dark:bg-gray-900' // Mobile overlay with avatar background
                : 'bg-white dark:bg-gray-900'
            }`}
          >
            {/* Chat Header - Modern Clean Design */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 sm:px-6 py-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-gray-900 dark:text-gray-100 font-medium text-base truncate">Wellness Assistant</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Always here to listen</p>
                  </div>
                </div>

                {/* Status Indicators and Controls */}
                <div className="flex items-center space-x-2">
                  {isVoiceMode && (
                    <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                      {isRecording && (
                        <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          <span className="hidden sm:inline font-medium">Recording</span>
                        </div>
                      )}
                      {isSpeaking && !isRecording && (
                        <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          <span className="hidden sm:inline font-medium">Speaking</span>
                        </div>
                      )}
                      {!isRecording && !isSpeaking && (
                        <span className="font-mono font-medium">{formatCallDuration(callDuration)}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Voice Call Toggle Button - Clean Icon Style */}
                  {!sessionEnded && !isVoiceMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={startCall}
                      disabled={loading}
                      className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Start voice call"
                    >
                      <Phone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </Button>
                  )}
                  
                  {/* End Call Button - Clean Icon Style */}
                  {!sessionEnded && isVoiceMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={endCall}
                      disabled={loading}
                      className="h-8 w-8 p-0 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="End voice call"
                    >
                      <PhoneOff className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                  )}

                  {/* Settings Menu */}
                  {!sessionEnded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOptionsPanel(!showOptionsPanel)}
                      className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="More options"
                    >
                      <Menu className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </Button>
                  )}
                </div>
              </div>
            </div>    
        {/* Chat Messages - Clean Modern Layout */}
            <div className={`flex-1 overflow-y-auto chat-scrollbar px-4 sm:px-6 py-6 h-full ${
              isAvatarMode 
                ? 'bg-transparent lg:bg-white lg:dark:bg-gray-900' 
                : 'bg-white dark:bg-gray-900'
            }`}>
              {messages.length === 0 && !loading && (
                <div className="flex items-center justify-center h-full min-h-[calc(100vh-16rem)] px-4">
                  <motion.div
                    className="text-center max-w-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Logo */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                      How can I help you today?
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-base mb-8">
                      I&apos;m your AI wellness assistant for leaders. Share your thoughts, challenges, or anything on your mind.
                    </p>
                    
                    {/* Suggestion Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                      {[
                        { icon: "💬", text: "I'd like to talk about my day" },
                        { icon: "🎯", text: "Help me with leadership stress" },
                        { icon: "😊", text: "I want to improve my wellbeing" },
                        { icon: "🎙️", text: "Start a voice conversation" },
                      ].map((suggestion, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * i }}
                          onClick={() => {
                            if (i === 3) {
                              startCall();
                            } else {
                              setCurrentMessage(suggestion.text);
                            }
                          }}
                          className="p-4 text-left bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{suggestion.icon}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{suggestion.text}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Your conversations are confidential and designed to support your mental wellbeing
                    </p>
                  </motion.div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-6 ${message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`flex items-start space-x-3 max-w-[85%] sm:max-w-[75%] ${
                      message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    {/* Avatar - Minimal */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === "user" 
                        ? "bg-blue-600" 
                        : "bg-gradient-to-br from-purple-500 to-blue-500"
                    }`}>
                      {message.sender === "user" ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-white" />
                      )}
                    </div>

                    {/* Message Bubble - Clean ChatGPT Style */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`rounded-2xl px-4 py-3 ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {message.sender === "ai" ? (
                        <div>
                          {renderMessageContent(message.content)}
                          {deepConversation && false && (
                            <div className="flex items-center justify-end mt-2 pt-2 border-t border-gray-100">
                              <div className="flex items-center space-x-1 text-xs text-blue-600">
                                <Search className="h-3 w-3" />
                                <span>Deep Conversation</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        renderMessageContent(message.content)
                      )}
                    </motion.div>
                  </div>
                </div>
              ))}

              {/* AI Typing / Audio Processing */}
              {(loading || processingAudio) && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-[75%]">
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                      <AvatarFallback>
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white rounded-xl px-3 py-2 sm:p-3 border shadow-sm">
                      <div className="flex space-x-1 items-center">
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-blue-500" />
                        <span className="text-xs text-gray-500">
                          {processingAudio
                            ? "Processing audio..."
                            : deepConversation
                              ? "Searching latest info..."
                              : "AI is thinking..."}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Session Report */}
              {sessionEnded && generatedReport && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="p-2 sm:p-4">
                    <CardTitle className="text-base sm:text-lg text-green-900 flex items-center">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Session Complete!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-4 space-y-4">
                    <p className="text-green-800 text-sm sm:text-base">
                      Your leadership wellness report has been generated and saved.
                    </p>

                    <div className="prose prose-sm max-w-none bg-white p-3 sm:p-4 rounded-md border">
                      <ReactMarkdown>
                        {generatedReport?.complete_report || "Report generated successfully"}
                      </ReactMarkdown>
                    </div>

                    {generatedReport?.key_insights && generatedReport.key_insights.length > 0 && (
                      <div className="bg-blue-50 p-2 sm:p-3 rounded-md">
                        <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">
                          Key Leadership Insights:
                        </h4>
                        <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                          {generatedReport.key_insights.map(
                            (insight, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                {insight}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {generatedReport?.recommendations && generatedReport.recommendations.length > 0 && (
                      <div className="bg-purple-50 p-2 sm:p-3 rounded-md">
                        <h4 className="font-medium text-purple-900 mb-2 text-sm sm:text-base">
                          Leadership Recommendations:
                        </h4>
                        <ul className="text-xs sm:text-sm text-purple-800 space-y-1">
                          {generatedReport.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-gray-500 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex flex-col space-y-1">
                      <span>
                        Session Type: {generatedReport?.session_type || "text"} • Duration:{" "}
                        {Math.floor((generatedReport?.session_duration || 0) / 60)}m{" "}
                        {(generatedReport?.session_duration || 0) % 60}s
                      </span>
                        <div className="flex items-center space-x-2 text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs">Leadership wellness analysis completed</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push("/manager/personal/reports")}
                      >
                        View All Reports
                      </Button>
                    </div>

                    <p className="text-xs text-gray-500">
                      This report is confidential and intended to help you track
                      your leadership well-being.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div ref={messagesEndRef} />
            </div>   
         {/* Chat Input Area - Clean Modern Design */}
            <div className={`border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 ${
              isAvatarMode 
                ? 'bg-white/95 lg:bg-white dark:bg-gray-900/95 lg:dark:bg-gray-900 backdrop-blur-sm' 
                : 'bg-white dark:bg-gray-900'
            }`}>
              {/* File Attachments Preview */}
              {attachedFiles.length > 0 && (
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center">
                      <Paperclip className="h-4 w-4 mr-1" />
                      {attachedFiles.length} file(s) attached
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachedFiles([])}
                      className="text-blue-600 hover:text-blue-800 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-2 py-1 rounded border text-xs"
                      >
                        <FileText className="h-3 w-3 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 truncate max-w-32">
                          {file.name}
                        </span>
                        <span className="text-gray-500">
                          ({formatFileSize(file.size)})
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-4 w-4 p-0 hover:bg-red-100 flex-shrink-0"
                        >
                          <X className="h-2 w-2 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Input Container */}
              <div className="relative">
                {/* Mobile Avatar Mode Indicator */}
                {isAvatarMode && (
                  <div className="lg:hidden absolute -top-8 left-0 right-0 flex justify-center">
                    <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs flex items-center space-x-1 backdrop-blur-sm">
                      <UserCircle className="h-3 w-3" />
                      <span>3D Avatar Background Active</span>
                    </div>
                  </div>
                )}

                {/* Input Container - Modern ChatGPT Style */}
                <div className="relative max-w-4xl mx-auto">
                  <div className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors">
                    {/* Attachment Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOptionsPanel(!showOptionsPanel)}
                      disabled={loading || sessionEnded}
                      className="h-10 w-10 p-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-transparent flex-shrink-0 ml-2"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>

                    {/* Text Input */}
                    <input
                      type="text"
                      placeholder={isVoiceMode ? "Speak or type your message..." : "Message Wellness Assistant..."}
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading || sessionEnded}
                      className="flex-1 bg-transparent border-none outline-none px-3 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    />

                    {/* Right Side Controls */}
                    <div className="flex items-center space-x-1 mr-2 flex-shrink-0">
                      {/* Microphone Button - Voice Mode */}
                      {(isVoiceMode || currentMessage.length === 0) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleRecording}
                          disabled={loading || sessionEnded}
                          className={`h-9 w-9 p-0 rounded-full transition-all ${
                            isRecording 
                              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
                              : isVoiceMode
                                ? 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {isRecording ? (
                            <Square className="h-4 w-4" />
                          ) : (
                            <Mic className="h-4 w-4" />
                          )}
                        </Button>
                      )}

                      {/* Send Button - Only when there's text */}
                      {currentMessage.length > 0 && (
                        <Button
                          onClick={() => handleSendMessage()}
                          disabled={loading || sessionEnded}
                          className="h-9 w-9 p-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Drag and Drop Overlay */}
                {dragOver && (
                  <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center z-20">
                    <div className="text-center">
                      <Upload className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                        Drop files here
                      </p>
                    </div>
                  </div>
                )}
              </div>        
      {/* Options Dropdown Panel */}
              {showOptionsPanel && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 bg-transparent z-30"
                    onClick={() => setShowOptionsPanel(false)}
                  />

                  {/* Options Panel */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-16 left-0 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-40 overflow-hidden"
                  >
                    <div className="p-4 space-y-3">
                      {/* Add Files */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          openFileDialog();
                          setShowOptionsPanel(false);
                        }}
                        disabled={loading || sessionEnded}
                        className="w-full justify-start text-left p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <Paperclip className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Add photos & files</span>
                        </div>
                      </Button>

                      {/* Add Images */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.multiple = true;
                          input.accept = 'image/*';
                          input.onchange = (e) => handleFileSelect(e as any);
                          input.click();
                          setShowOptionsPanel(false);
                        }}
                        disabled={loading || sessionEnded}
                        className="w-full justify-start text-left p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Add images</span>
                        </div>
                      </Button>

                      {/* Deep Conversation */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          toast.info("🚀 Deep Conversation is coming soon! This exciting feature will provide enhanced AI analysis with real-time data, advanced reasoning capabilities, and deeper contextual understanding for more meaningful conversations.", {
                            duration: 6000,
                            style: {
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '16px',
                              fontSize: '14px',
                              padding: '20px',
                              boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
                              maxWidth: '400px',
                            },
                          });
                          setShowOptionsPanel(false);
                        }}
                        disabled={loading || sessionEnded}
                        className="w-full justify-start text-left p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Search className="h-4 w-4 text-white animate-pulse" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Deep conversation</span>
                            <div className="text-xs text-purple-600 dark:text-purple-400">Coming Soon</div>
                          </div>
                        </div>
                      </Button>

                      {/* Divider */}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                      {/* Avatar Options */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-3">
                          Avatar & Voice
                        </div>

                        {/* Enable/Disable Avatar */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsAvatarMode(!isAvatarMode);
                            toast.success(isAvatarMode ? "Avatar disabled" : "Avatar enabled");
                            setShowOptionsPanel(false);
                          }}
                          disabled={loading || sessionEnded}
                          className="w-full justify-start text-left p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              <UserCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {isAvatarMode ? "Disable avatar" : "Enable avatar"}
                              </span>
                              {isAvatarMode && (
                                <div className="text-xs text-green-600 dark:text-green-400">Active</div>
                              )}
                            </div>
                          </div>
                        </Button>

                        {/* Avatar Settings */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toggleSettings();
                            setShowOptionsPanel(false);
                          }}
                          disabled={loading || sessionEnded}
                          className="w-full justify-start text-left p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Avatar settings</span>
                          </div>
                        </Button>

                        {/* Test Microphone */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (isRecording) {
                              stopRecording();
                            } else {
                              startRecording();
                            }
                            setShowOptionsPanel(false);
                          }}
                          disabled={loading || sessionEnded}
                          className="w-full justify-start text-left p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              <Mic className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Test microphone</span>
                              {isRecording && (
                                <div className="text-xs text-red-600 dark:text-red-400">Recording...</div>
                              )}
                            </div>
                          </div>
                        </Button>

                        {/* Test TTS Settings */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const testText = "Hello! This is a test of the text-to-speech system for managers.";
                            speakText(testText);
                            setShowOptionsPanel(false);
                          }}
                          disabled={loading || sessionEnded || isSpeaking}
                          className="w-full justify-start text-left p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              <Volume2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Test TTS settings</span>
                              {isSpeaking && (
                                <div className="text-xs text-blue-600 dark:text-blue-400">Speaking...</div>
                              )}
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.txt,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </motion.div>     
     {/* Avatar Section - Background on mobile, Split Screen on desktop */}
          {isAvatarMode && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="fixed inset-0 lg:relative lg:w-1/2 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-900/40 dark:via-purple-900/40 dark:to-pink-900/40 lg:bg-gradient-to-br lg:from-gray-900 lg:via-gray-800 lg:to-gray-900 flex flex-col overflow-hidden z-10 lg:z-auto"
            >
              {/* Mobile Avatar Background Indicator */}
              <div className="lg:hidden absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border-b border-white/20 px-4 py-2 z-30">
                <div className="flex items-center justify-center space-x-2 text-white/90">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">3D Avatar Background</span>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Avatar Header - Hidden on mobile, visible on desktop */}
              <div className="hidden lg:flex bg-black/20 backdrop-blur-sm border-b border-gray-700/50 p-4 items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <UserCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">AI Avatar</h3>
                    <p className="text-gray-300 text-sm">Interactive Wellness Assistant</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSettings}
                    className="text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAvatarMode(false)}
                    className="text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Avatar Display */}
              <div className="flex-1 flex items-center justify-center relative bg-gradient-to-br from-purple-200/30 to-blue-200/30 lg:bg-transparent"
                   style={{
                     backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
                   }}>
                <div className="relative w-full h-full flex items-center justify-center">
                  <AvatarController
                    emotion={currentAvatarEmotion}
                    speaking={isSpeaking}
                    message={currentTTSText}
                    scale={1.0}
                    interactive={true}
                    showEnvironment={true}
                    enableFloating={true}
                    quality="high"
                  />
                  
                  {/* Avatar Status Overlay - Repositioned for mobile */}
                  <div className="absolute top-4 left-4 right-4 lg:top-4 lg:left-4 lg:right-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {isRecording && (
                          <div className="flex items-center space-x-2 bg-red-500/20 backdrop-blur-sm px-2 py-1 lg:px-3 lg:py-1 rounded-full">
                            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-red-300 text-xs font-medium hidden lg:inline">Listening</span>
                            <span className="text-red-300 text-xs font-medium lg:hidden">🎤</span>
                          </div>
                        )}
                        {isSpeaking && (
                          <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm px-2 py-1 lg:px-3 lg:py-1 rounded-full">
                            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-green-300 text-xs font-medium hidden lg:inline">Speaking</span>
                            <span className="text-green-300 text-xs font-medium lg:hidden">💬</span>
                          </div>
                        )}
                        {processingAudio && (
                          <div className="flex items-center space-x-2 bg-yellow-500/20 backdrop-blur-sm px-2 py-1 lg:px-3 lg:py-1 rounded-full">
                            <Loader2 className="w-2 h-2 lg:w-3 lg:h-3 text-yellow-300 animate-spin" />
                            <span className="text-yellow-300 text-xs font-medium hidden lg:inline">Processing</span>
                            <span className="text-yellow-300 text-xs font-medium lg:hidden">⚡</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAudioEnabled(!audioEnabled)}
                          className="text-gray-300 hover:text-white hover:bg-white/10 w-6 h-6 lg:w-8 lg:h-8 p-0"
                        >
                          {audioEnabled ? (
                            <Volume2 className="h-3 w-3 lg:h-4 lg:w-4" />
                          ) : (
                            <VolumeX className="h-3 w-3 lg:h-4 lg:w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Avatar Controls - Hidden on mobile, visible on desktop */}
                  <div className="hidden lg:block absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleRecording}
                        disabled={loading || sessionEnded}
                        className={`w-12 h-12 rounded-full ${
                          isRecording 
                            ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                            : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        {isRecording ? (
                          <Square className="h-5 w-5" />
                        ) : (
                          <Mic className="h-5 w-5" />
                        )}
                      </Button>
                      
                      {isSpeaking && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleSpeaking}
                          className="w-12 h-12 rounded-full bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                        >
                          <Pause className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Mobile Avatar Indicator - Only visible on mobile */}
                  <div className="lg:hidden absolute bottom-4 left-4 bg-purple-600/80 text-white px-3 py-2 rounded-xl text-xs backdrop-blur-sm z-10 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <UserCircle className="h-4 w-4" />
                      <span className="font-medium">Avatar: {currentAvatarEmotion || 'IDLE'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Avatar Settings Modal */}
      <AvatarSettings 
        config={avatarConfig}
        onConfigChange={updateAvatarConfig}
        isOpen={isSettingsOpen}
        onToggle={toggleSettings}
      />

      {/* End Conversation Confirmation Modal */}
      {showEndConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md mx-4 shadow-2xl"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneOff className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                End Conversation?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This will generate your wellness report and end the current session. You can always start a new conversation later.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEndConfirmation(false)}
                  className="flex-1"
                >
                  Continue Chat
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowEndConfirmation(false);
                    handleEndSession();
                  }}
                  className="flex-1"
                >
                  End & Generate Report
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default withAuth(ManagerPersonalChatPage, ['manager']);