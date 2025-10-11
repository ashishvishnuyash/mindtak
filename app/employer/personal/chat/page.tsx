'use client';

// Type declarations for Web Speech API
declare global {
    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof SpeechRecognition;
    }
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
}

interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
    error: string;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    length: number;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

declare var SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
};

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/use-user';
import {
    Brain,
    ArrowLeft,
    Send,
    MessageSquare,
    User as UserIcon,
    Bot,
    Heart,
    Sparkles,
    Loader2,
    LogOut,
    Mic,
    MicOff
} from 'lucide-react';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import InteractiveAvatarDemo from '@/components/avatar/InteractiveAvatarDemo';

interface ChatMessage {
    id: string;
    message: string;
    sender: 'user' | 'ai';
    timestamp: any;
    user_id: string;
    session_id: string;
}

export default function EmployerPersonalChatPage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');
    const [isListening, setIsListening] = useState(false);
    const [demoUser, setDemoUser] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognition = useRef<SpeechRecognition | null>(null);

    // Create demo user if no real user
    useEffect(() => {
        if (!userLoading && !user) {
            const demoDemoUser = {
                id: 'demo-employer-123',
                email: 'demo.employer@company.com',
                first_name: 'Demo',
                last_name: 'Employer',
                role: 'employer',
                company_id: 'demo-company-123',
                department: 'Management'
            };
            setDemoUser(demoDemoUser);
        }
    }, [user, userLoading]);

    // Use either real user or demo user
    const currentUser = user || demoUser;

    useEffect(() => {
        if (currentUser) {
            initializeChat();
        }
    }, [currentUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Initialize speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.interimResults = false;
            recognition.current.lang = 'en-US';

            recognition.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputMessage(transcript);
                setIsListening(false);
            };

            recognition.current.onerror = () => {
                setIsListening(false);
                toast.error('Speech recognition error. Please try again.');
            };

            recognition.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const initializeChat = async () => {
        if (!currentUser) return;

        // Generate a session ID for this chat
        const newSessionId = `personal_${currentUser.id}_${Date.now()}`;
        setSessionId(newSessionId);

        if (user) {
            // Real user - set up Firebase listener
            const messagesRef = collection(db, 'chat_messages');
            const q = query(
                messagesRef,
                where('user_id', '==', currentUser.id),
                where('session_id', '==', newSessionId),
                orderBy('timestamp', 'asc')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const chatMessages: ChatMessage[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as ChatMessage));
                setMessages(chatMessages);
            });

            // Add welcome message
            await addDoc(collection(db, 'chat_messages'), {
                message: `Hello ${currentUser.first_name || 'there'}! I'm your personal AI wellness companion. I'm here to support your mental health journey as a leader. How are you feeling today?`,
                sender: 'ai',
                timestamp: serverTimestamp(),
                user_id: currentUser.id,
                session_id: newSessionId,
                company_id: currentUser.company_id || ''
            });

            return unsubscribe;
        } else {
            // Demo user - add welcome message directly
            const welcomeMessage: ChatMessage = {
                id: 'demo-welcome-1',
                message: `Hello ${currentUser.first_name || 'there'}! I'm your personal AI wellness companion. I'm here to support your mental health journey as a leader. How are you feeling today?`,
                sender: 'ai',
                timestamp: new Date(),
                user_id: currentUser.id,
                session_id: newSessionId
            };
            setMessages([welcomeMessage]);
            return undefined;
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || !currentUser || !sessionId || loading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setLoading(true);

        try {
            // Add user message
            const userChatMessage: ChatMessage = {
                id: `user-${Date.now()}`,
                message: userMessage,
                sender: 'user',
                timestamp: new Date(),
                user_id: currentUser.id,
                session_id: sessionId
            };

            if (user) {
                // Real user - save to Firebase
                await addDoc(collection(db, 'chat_messages'), {
                    message: userMessage,
                    sender: 'user',
                    timestamp: serverTimestamp(),
                    user_id: currentUser.id,
                    session_id: sessionId,
                    company_id: currentUser.company_id || ''
                });
            } else {
                // Demo user - add to local state
                setMessages(prev => [...prev, userChatMessage]);
            }

            // Generate AI response
            const response = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    user_id: currentUser.id,
                    session_id: sessionId,
                    user_role: 'employer',
                    context: 'personal_wellness'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get AI response');
            }

            const data = await response.json();

            // Add AI response
            const aiChatMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                message: data.response,
                sender: 'ai',
                timestamp: new Date(),
                user_id: currentUser.id,
                session_id: sessionId
            };

            if (user) {
                // Real user - save to Firebase
                await addDoc(collection(db, 'chat_messages'), {
                    message: data.response,
                    sender: 'ai',
                    timestamp: serverTimestamp(),
                    user_id: currentUser.id,
                    session_id: sessionId,
                    company_id: currentUser.company_id || ''
                });
            } else {
                // Demo user - add to local state
                setMessages(prev => [...prev, aiChatMessage]);
            }

        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleListening = () => {
        if (!recognition.current) {
            toast.error('Speech recognition not supported in this browser.');
            return;
        }

        if (isListening) {
            recognition.current.stop();
            setIsListening(false);
        } else {
            recognition.current.start();
            setIsListening(true);
        }
    };

    if (userLoading && !demoUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Brain className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-lg text-gray-600">Loading your AI companion...</p>
                </motion.div>
            </div>
        );
    }

    if (!currentUser) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden transition-colors duration-300">
            {/* Header */}
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8">
                    <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <Button variant="ghost" size="sm" className="p-2" onClick={() => router.push('/employer/personal')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Wellness Companion</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Personal Support</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs sm:text-sm px-2 sm:px-3">
                                Personal Chat
                            </Badge>
                            <ThemeToggle size="sm" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8 py-6 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                    {/* Chat Section */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm h-full flex flex-col">
                            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                                    <Bot className="h-5 w-5 text-green-500" />
                                    <span>Your Personal AI Companion</span>
                                    <Badge variant="secondary" className="ml-auto">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                                        Online
                                    </Badge>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col p-0">
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    <AnimatePresence>
                                        {messages.map((message, index) => (
                                            <motion.div
                                                key={message.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user'
                                                        ? 'bg-blue-500'
                                                        : 'bg-green-500'
                                                        }`}>
                                                        {message.sender === 'user' ? (
                                                            <UserIcon className="h-4 w-4 text-white" />
                                                        ) : (
                                                            <Bot className="h-4 w-4 text-white" />
                                                        )}
                                                    </div>
                                                    <div className={`rounded-2xl px-4 py-2 ${message.sender === 'user'
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                                        }`}>
                                                        <p className="text-sm">{message.message}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {loading && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-start"
                                        >
                                            <div className="flex items-start space-x-2">
                                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                                    <Bot className="h-4 w-4 text-white" />
                                                </div>
                                                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                                                    <div className="flex space-x-1">
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                                    {/* Scrollable Options Bar */}
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
                                            {/* Voice Recognition Toggle */}
                                            <Button
                                                variant={isListening ? "default" : "outline"}
                                                size="sm"
                                                onClick={toggleListening}
                                                disabled={loading}
                                                className="flex-shrink-0 px-3 py-2 text-xs font-medium whitespace-nowrap"
                                            >
                                                {isListening ? (
                                                    <>
                                                        <MicOff className="h-4 w-4 mr-1" />
                                                        Stop Listening
                                                    </>
                                                ) : (
                                                    <>
                                                        <Mic className="h-4 w-4 mr-1" />
                                                        Voice Input
                                                    </>
                                                )}
                                            </Button>

                                            {/* Attach Files */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.multiple = true;
                                                    input.accept = 'image/*,.txt,.pdf,.doc,.docx';
                                                    input.onchange = (e) => {
                                                        const files = Array.from((e.target as HTMLInputElement).files || []);
                                                        if (files.length > 0) {
                                                            toast.success(`${files.length} file(s) selected for upload`);
                                                            // Handle file upload logic here
                                                        }
                                                    };
                                                    input.click();
                                                }}
                                                disabled={loading}
                                                className="flex-shrink-0 px-3 py-2 text-xs font-medium whitespace-nowrap"
                                            >
                                                <Brain className="h-4 w-4 mr-1" />
                                                Attach Files
                                            </Button>

                                            {/* Deep Conversation Mode */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    toast.info("🚀 Deep Conversation mode provides enhanced AI analysis with real-time wellness data.", {
                                                        duration: 4000,
                                                    });
                                                }}
                                                disabled={loading}
                                                className="flex-shrink-0 px-3 py-2 text-xs font-medium whitespace-nowrap text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                            >
                                                <Sparkles className="h-4 w-4 mr-1" />
                                                Deep Conversation
                                            </Button>

                                            {/* Clear Chat */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setMessages([]);
                                                    initializeChat();
                                                    toast.success("Chat cleared and restarted");
                                                }}
                                                disabled={loading}
                                                className="flex-shrink-0 px-3 py-2 text-xs font-medium whitespace-nowrap text-orange-600 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                            >
                                                <MessageSquare className="h-4 w-4 mr-1" />
                                                Clear Chat
                                            </Button>

                                            {/* Export Chat */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const chatData = messages.map(msg => `${msg.sender.toUpperCase()}: ${msg.message}`).join('\n\n');
                                                    const blob = new Blob([chatData], { type: 'text/plain' });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `wellness-chat-${new Date().toISOString().split('T')[0]}.txt`;
                                                    a.click();
                                                    URL.revokeObjectURL(url);
                                                    toast.success("Chat exported successfully");
                                                }}
                                                disabled={loading || messages.length === 0}
                                                className="flex-shrink-0 px-3 py-2 text-xs font-medium whitespace-nowrap"
                                            >
                                                <Send className="h-4 w-4 mr-1" />
                                                Export Chat
                                            </Button>

                                            {/* Logout */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    if (user) {
                                                        auth.signOut();
                                                        router.push('/auth/login');
                                                    } else {
                                                        router.push('/login');
                                                    }
                                                }}
                                                className="flex-shrink-0 px-3 py-2 text-xs font-medium whitespace-nowrap text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <LogOut className="h-4 w-4 mr-1" />
                                                Logout
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Message Input Area */}
                                    <div className="p-4">
                                        <form onSubmit={handleSendMessage} className="flex space-x-2">
                                            <Input
                                                value={inputMessage}
                                                onChange={(e) => setInputMessage(e.target.value)}
                                                placeholder="Share your thoughts or ask for wellness advice..."
                                                disabled={loading}
                                                className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500 rounded-xl text-gray-900 dark:text-gray-100"
                                            />
                                            <Button
                                                type="submit"
                                                disabled={loading || !inputMessage.trim()}
                                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl px-6"
                                            >
                                                {loading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Send className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </form>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            Press Enter to send. Use the options above for additional features.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Avatar Section */}
                    <div className="lg:col-span-1">
                        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                                    <Sparkles className="h-5 w-5 text-purple-500" />
                                    <span>AI Avatar</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                                <div className="flex-1 flex items-center justify-center">
                                    <InteractiveAvatarDemo />
                                </div>

                                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Heart className="h-4 w-4 text-red-500" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Wellness Tip</span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        As a leader, remember that taking care of your own mental health sets a positive example for your team. Your wellbeing matters too!
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}