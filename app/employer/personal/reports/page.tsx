'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/use-user';
import {
    Brain,
    TrendingUp,
    Calendar,
    ArrowLeft,
    Plus,
    Filter,
    Download,
    RefreshCw,
    BarChart3,
    Heart,
    Battery,
    AlertTriangle,
    Smile,
    User,
    LogOut
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { MentalHealthReport } from '@/types';
import InteractiveAnalytics from '@/components/analytics/InteractiveAnalytics';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function EmployerPersonalReportsPage() {
    const { user, loading: userLoading } = useUser();
    const [reports, setReports] = useState<MentalHealthReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [demoUser, setDemoUser] = useState<any>(null);
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

    useEffect(() => {
        if (currentUser) {
            fetchReports();
        }
    }, [currentUser]);

    const fetchReports = async () => {
        if (!currentUser?.id) return;

        try {
            setLoading(true);
            const reportsRef = collection(db, 'mental_health_reports');
            const q = query(
                reportsRef,
                where('employee_id', '==', currentUser.id),
                orderBy('created_at', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const fetchedReports: MentalHealthReport[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                created_at: doc.data().created_at || new Date().toISOString()
            } as MentalHealthReport));

            setReports(fetchedReports);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchReports();
    };

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
                    <p className="text-lg text-gray-600">Loading your reports...</p>
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
                                <BarChart3 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Analytics</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Your Wellness Reports</p>
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
                                className="border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
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

            <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8 py-6 sm:py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent mb-4 leading-tight">
                            Your Personal Analytics
                        </h1>
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                            Explore your wellness journey with interactive charts and detailed insights.
                        </p>
                    </motion.div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => router.push('/employer/personal/reports/new')}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Report
                        </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Interactive Analytics Component */}
                {reports.length > 0 ? (
                    <InteractiveAnalytics
                        data={{
                            mood_rating: reports[0]?.mood_rating || 0,
                            stress_level: reports[0]?.stress_level || 0,
                            energy_level: reports[0]?.energy_level || 0,
                            work_satisfaction: reports[0]?.work_satisfaction || 7,
                            work_life_balance: reports[0]?.work_life_balance || 7,
                            anxiety_level: reports[0]?.anxiety_level || 3,
                            confidence_level: reports[0]?.confidence_level || 7,
                            sleep_quality: reports[0]?.sleep_quality || 7,
                            overall_wellness: reports[0]?.overall_wellness || 0
                        }}
                        showComparison={reports.length > 1}
                        previousData={reports.length > 1 ? {
                            mood_rating: reports[1]?.mood_rating || 0,
                            stress_level: reports[1]?.stress_level || 0,
                            energy_level: reports[1]?.energy_level || 0,
                            work_satisfaction: reports[1]?.work_satisfaction || 7,
                            work_life_balance: reports[1]?.work_life_balance || 7,
                            anxiety_level: reports[1]?.anxiety_level || 3,
                            confidence_level: reports[1]?.confidence_level || 7,
                            sleep_quality: reports[1]?.sleep_quality || 7,
                            overall_wellness: reports[1]?.overall_wellness || 0
                        } : undefined}
                    />
                ) : (
                    <div className="text-center py-12">
                        <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Analytics Data</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first wellness report to see detailed analytics.</p>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => router.push('/employer/personal/reports/new')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Report
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}