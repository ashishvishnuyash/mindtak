'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    Brain,
    TrendingUp,
    Calendar,
    MessageSquare,
    AlertTriangle,
    Heart,
    Battery,
    Smile,
    Sparkles,
    Zap,
    Star,
    ArrowRight,
    RefreshCw,
    Loader2,
    Bell,
    User,
    LogOut,
    BarChart3,
    BookOpen,
    Clock,
    Award,
    Building,
    ArrowLeft
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import type { MentalHealthReport } from '@/types';
import { auth, db } from '@/lib/firebase';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from 'sonner';

function EmployerPersonalDashboard() {
    const { user, loading: userLoading } = useUser();
    const [reports, setReports] = useState<MentalHealthReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');
    const [demoUser, setDemoUser] = useState<any>(null);
    const [stats, setStats] = useState({
        averageMood: 0,
        averageStress: 0,
        averageEnergy: 0,
        reportsCount: 0,
        lastReportDate: null as string | null,
    });
    const router = useRouter();

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

    const fetchReports = useCallback(async () => {
        try {
            if (!currentUser?.id) {
                console.log('No user ID available');
                setLoading(false);
                return;
            }

            // Set up real-time listener for reports
            const reportsRef = collection(db, 'mental_health_reports');
            const q = query(reportsRef, where('employee_id', '==', currentUser.id));

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                console.log('Real-time update - Query snapshot size:', querySnapshot.size);

                const fetchedReports: MentalHealthReport[] = querySnapshot.docs.map((doc: any) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        created_at: data.created_at || new Date().toISOString()
                    } as MentalHealthReport;
                });

                console.log('Real-time fetched reports:', fetchedReports.length);

                // Sort reports by created_at in JavaScript (descending order)
                const sortedReports = fetchedReports.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );

                // Limit to 10 most recent reports
                const limitedReports = sortedReports.slice(0, 10);
                setReports(limitedReports);

                // Calculate stats
                if (limitedReports.length > 0) {
                    const totalMood = limitedReports.reduce((sum: number, report: MentalHealthReport) => sum + (report.mood_rating || 0), 0);
                    const totalStress = limitedReports.reduce((sum: number, report: MentalHealthReport) => sum + (report.stress_level || 0), 0);
                    const totalEnergy = limitedReports.reduce((sum: number, report: MentalHealthReport) => sum + (report.energy_level || 0), 0);

                    setStats({
                        averageMood: Math.round(totalMood / limitedReports.length),
                        averageStress: Math.round(totalStress / limitedReports.length),
                        averageEnergy: Math.round(totalEnergy / limitedReports.length),
                        reportsCount: limitedReports.length,
                        lastReportDate: limitedReports[0].created_at,
                    });
                } else {
                    setStats({
                        averageMood: 0,
                        averageStress: 0,
                        averageEnergy: 0,
                        reportsCount: 0,
                        lastReportDate: null,
                    });
                }

                setLoading(false);
                setRefreshing(false);
            }, (error) => {
                console.error('Error in real-time listener:', error);
                setStats({
                    averageMood: 0,
                    averageStress: 0,
                    averageEnergy: 0,
                    reportsCount: 0,
                    lastReportDate: null,
                });
                setReports([]);
                setLoading(false);
                setRefreshing(false);
            });

            // Return cleanup function
            return unsubscribe;
        } catch (error) {
            console.error('Error setting up real-time listener:', error);
            setStats({
                averageMood: 0,
                averageStress: 0,
                averageEnergy: 0,
                reportsCount: 0,
                lastReportDate: null,
            });
            setReports([]);
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        if (currentUser) {
            fetchReports().then((cleanup) => {
                if (cleanup) {
                    unsubscribe = cleanup;
                }
            });
        }

        // Cleanup function
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [currentUser, fetchReports]);

    const handleRefresh = async () => {
        setRefreshing(true);
        toast.info('Refreshing your wellness data...');
        // The real-time listener will automatically update the data
        setTimeout(() => {
            setRefreshing(false);
            toast.success('Dashboard refreshed!');
        }, 1000);
    };

    const getWellnessStatus = (score: number): { label: string; color: string; textColor: string } => {
        if (score >= 8) return { label: 'Excellent', color: 'bg-green-500', textColor: 'text-green-700' };
        if (score >= 6) return { label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-700' };
        if (score >= 4) return { label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
        return { label: 'Needs Attention', color: 'bg-red-500', textColor: 'text-red-700' };
    };

    const getRiskLevelBadge = (riskLevel: 'low' | 'medium' | 'high') => {
        const colors = {
            low: 'bg-green-100 text-green-700',
            medium: 'bg-yellow-100 text-yellow-700',
            high: 'bg-red-100 text-red-700',
        };
        return colors[riskLevel];
    };

    const safeRiskLevel = (value: any): 'low' | 'medium' | 'high' => {
        if (value === 'medium' || value === 'high') return value;
        return 'low';
    };

    const chartData = reports.slice(0, 7).reverse().map((report, index) => ({
        date: new Date(report.created_at).toLocaleDateString(),
        mood: report.mood_rating,
        stress: 11 - report.stress_level, // Invert stress for better visualization
        energy: report.energy_level,
        wellness: report.overall_wellness,
    }));

    if ((userLoading && !demoUser) || loading) {
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
                    <p className="text-lg text-gray-600">Loading your personal wellness dashboard...</p>
                </motion.div>
            </div>
        );
    }

    if (!currentUser) {
        return null;
    }

    const latestReport = reports[0];
    const wellnessStatus = latestReport ? getWellnessStatus(latestReport.overall_wellness) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden transition-colors duration-300">
            {/* Header */}
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8">
                    <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <Button variant="ghost" size="sm" className="p-2" onClick={() => router.push('/employer')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Wellness</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Your Personal Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <Button variant="outline" size="sm" className="text-green-600 border-green-200 bg-green-50 text-xs sm:text-sm px-2 sm:px-3">
                                Personal View
                            </Button>
                            <Button
                                onClick={handleRefresh}
                                variant="outline"
                                size="sm"
                                disabled={refreshing}
                                className="border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 bg-white dark:bg-gray-800"
                            >
                                {refreshing ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                    </motion.div>
                                ) : (
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                )}
                                Refresh
                            </Button>
                            <Button variant="outline" size="sm" className="p-2">
                                <Bell className="h-4 w-4" />
                            </Button>
                            <ThemeToggle size="sm" />
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200"
                                onClick={() => {
                                    if (user) {
                                        auth.signOut();
                                        router.push('/auth/login');
                                    } else {
                                        router.push('/login');
                                    }
                                }}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
                {/* Welcome Section */}
                <div className="mb-8 sm:mb-10 lg:mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent mb-3 sm:mb-4 tracking-tight leading-tight">
                            Your Personal Wellness Journey
                        </h1>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 font-light leading-relaxed max-w-full sm:max-w-2xl">
                            Track your mental wellness and monitor your personal progress with real-time updates and AI-powered insights.
                        </p>
                    </motion.div>
                </div>

                {/* Tab Navigation */}
                <div className="mb-8">
                    <div className="flex space-x-4 sm:space-x-6 md:space-x-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('Overview')}
                            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${activeTab === 'Overview'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => router.push('/employer/personal/reports')}
                            className="pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
                        >
                            Analytics
                        </button>
                        <button
                            onClick={() => router.push('/employee/chat')}
                            className="pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
                        >
                            AI Friend
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <Card 
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                        onClick={() => router.push('/employer/personal/reports/new')}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="bg-blue-100 p-3 rounded-2xl">
                                    <Heart className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">New Wellness Check</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Record your current state</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors ml-auto" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card 
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                        onClick={() => router.push('/employee/chat')}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="bg-green-100 p-3 rounded-2xl">
                                    <MessageSquare className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 transition-colors">AI Assistant</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Chat with your wellness AI</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors ml-auto" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card 
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                        onClick={() => router.push('/employer/personal/reports')}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="bg-purple-100 p-3 rounded-2xl">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 transition-colors">View Reports</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Track your progress</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors ml-auto" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Interactive Stats Overview */}
                {latestReport ? (
                    <div className="mb-6 sm:mb-8">
                        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                        Current Wellness Snapshot
                                    </h2>
                                    <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => router.push('/employer/personal/reports')}>
                                        View Interactive Analytics
                                        <BarChart3 className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {/* Mood */}
                                    <motion.div
                                        className="text-center"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="relative w-20 h-20 mx-auto mb-2">
                                            <svg className="w-20 h-20 transform -rotate-90">
                                                <circle
                                                    cx="40"
                                                    cy="40"
                                                    r="36"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    className="text-gray-200 dark:text-gray-700"
                                                />
                                                <motion.circle
                                                    cx="40"
                                                    cy="40"
                                                    r="36"
                                                    stroke="#3B82F6"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeDasharray={226}
                                                    strokeDashoffset={226 - (latestReport.mood_rating / 10) * 226}
                                                    initial={{ strokeDashoffset: 226 }}
                                                    animate={{ strokeDashoffset: 226 - (latestReport.mood_rating / 10) * 226 }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <Smile className="h-4 w-4 text-blue-600 mb-1" />
                                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                    {latestReport.mood_rating}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Mood</p>
                                    </motion.div>

                                    {/* Energy */}
                                    <motion.div
                                        className="text-center"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="relative w-20 h-20 mx-auto mb-2">
                                            <svg className="w-20 h-20 transform -rotate-90">
                                                <circle
                                                    cx="40"
                                                    cy="40"
                                                    r="36"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    className="text-gray-200 dark:text-gray-700"
                                                />
                                                <motion.circle
                                                    cx="40"
                                                    cy="40"
                                                    r="36"
                                                    stroke="#10B981"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeDasharray={226}
                                                    strokeDashoffset={226 - (latestReport.energy_level / 10) * 226}
                                                    initial={{ strokeDashoffset: 226 }}
                                                    animate={{ strokeDashoffset: 226 - (latestReport.energy_level / 10) * 226 }}
                                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <Battery className="h-4 w-4 text-green-600 mb-1" />
                                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                    {latestReport.energy_level}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Energy</p>
                                    </motion.div>

                                    {/* Stress (inverted) */}
                                    <motion.div
                                        className="text-center"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="relative w-20 h-20 mx-auto mb-2">
                                            <svg className="w-20 h-20 transform -rotate-90">
                                                <circle
                                                    cx="40"
                                                    cy="40"
                                                    r="36"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    className="text-gray-200 dark:text-gray-700"
                                                />
                                                <motion.circle
                                                    cx="40"
                                                    cy="40"
                                                    r="36"
                                                    stroke="#EF4444"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeDasharray={226}
                                                    strokeDashoffset={226 - (latestReport.stress_level / 10) * 226}
                                                    initial={{ strokeDashoffset: 226 }}
                                                    animate={{ strokeDashoffset: 226 - (latestReport.stress_level / 10) * 226 }}
                                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <AlertTriangle className="h-4 w-4 text-red-600 mb-1" />
                                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                    {latestReport.stress_level}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Stress</p>
                                    </motion.div>

                                    {/* Overall Wellness */}
                                    <motion.div
                                        className="text-center"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="relative w-20 h-20 mx-auto mb-2">
                                            <svg className="w-20 h-20 transform -rotate-90">
                                                <circle
                                                    cx="40"
                                                    cy="40"
                                                    r="36"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    className="text-gray-200 dark:text-gray-700"
                                                />
                                                <motion.circle
                                                    cx="40"
                                                    cy="40"
                                                    r="36"
                                                    stroke="#8B5CF6"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeDasharray={226}
                                                    strokeDashoffset={226 - (latestReport.overall_wellness / 10) * 226}
                                                    initial={{ strokeDashoffset: 226 }}
                                                    animate={{ strokeDashoffset: 226 - (latestReport.overall_wellness / 10) * 226 }}
                                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <Brain className="h-4 w-4 text-purple-600 mb-1" />
                                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                    {latestReport.overall_wellness}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Wellness</p>
                                        {wellnessStatus && (
                                            <Badge className={`${wellnessStatus.textColor} bg-opacity-20 mt-1 text-xs`}>
                                                {wellnessStatus.label}
                                            </Badge>
                                        )}
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <CardContent className="p-6 text-center">
                                <Smile className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                <div className="text-lg font-semibold text-gray-400 dark:text-gray-500">No Data</div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Mood</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <CardContent className="p-6 text-center">
                                <Battery className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                <div className="text-lg font-semibold text-gray-400 dark:text-gray-500">No Data</div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Energy</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <CardContent className="p-6 text-center">
                                <AlertTriangle className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                <div className="text-lg font-semibold text-gray-400 dark:text-gray-500">No Data</div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Stress</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <CardContent className="p-6 text-center">
                                <Brain className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                <div className="text-lg font-semibold text-gray-400 dark:text-gray-500">No Data</div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Wellness</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    {/* Wellness Trend Chart */}
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                                <TrendingUp className="h-5 w-5 text-blue-500" />
                                <span>Wellness Trends (Last 7 Reports)</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis domain={[0, 10]} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="mood" stroke="#3B82F6" strokeWidth={2} name="Mood" />
                                        <Line type="monotone" dataKey="stress" stroke="#F59E0B" strokeWidth={2} name="Stress (Inverted)" />
                                        <Line type="monotone" dataKey="energy" stroke="#10B981" strokeWidth={2} name="Energy" />
                                        <Line type="monotone" dataKey="wellness" stroke="#8B5CF6" strokeWidth={2} name="Overall Wellness" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                                    <div className="text-center">
                                        <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                        <p className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No reports yet</p>
                                        <p className="text-sm mb-4">Create your first wellness check to see trends.</p>
                                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => router.push('/employer/personal/reports/new')}>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Create Report
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Reports */}
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5 text-purple-500" />
                                    <span>Recent Reports</span>
                                </div>
                                <Button variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-50" onClick={() => router.push('/employer/personal/reports')}>
                                    View All
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {reports.length > 0 ? (
                                <div className="space-y-4">
                                    {reports.slice(0, 5).map((report, index) => (
                                        <div
                                            key={report.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300"
                                        >
                                            <div>
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <Badge className={getRiskLevelBadge(safeRiskLevel(report.risk_level))}>
                                                        {report.risk_level || 'low'}
                                                    </Badge>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(report.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Wellness: {report.overall_wellness}/10
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(report.created_at).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                    <p className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No reports yet</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Start tracking your wellness journey today.</p>
                                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => router.push('/employer/personal/reports/new')}>
                                        <Heart className="h-4 w-4 mr-2" />
                                        Create First Report
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default EmployerPersonalDashboard;