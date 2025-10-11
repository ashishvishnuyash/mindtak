'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Navbar } from '@/components/shared/navbar';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Loader2,
  Sparkles,
  Brain,
  Heart,
  Battery,
  Smile,
  ArrowRight,
  Download
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { MentalHealthReport } from '@/types';

// Extend MentalHealthReport locally to include metrics fields for type safety
interface UIMentalHealthReport extends MentalHealthReport {
  metrics?: {
    emotional_tone: number;
    stress_anxiety: number;
    motivation_engagement: number;
    social_connectedness: number;
    self_esteem: number;
    assertiveness: number;
    work_life_balance_metric: number;
    cognitive_functioning: number;
    emotional_regulation: number;
    substance_use: number;
  };
  metrics_explanation?: {
    emotional_tone: string;
    stress_anxiety: string;
    motivation_engagement: string;
    social_connectedness: string;
    self_esteem: string;
    assertiveness: string;
    work_life_balance_metric: string;
    cognitive_functioning: string;
    emotional_regulation: string;
    substance_use: string;
  };
}

export default function EmployeeReportsPage() {
  const { user, loading: userLoading } = useUser();
  const [reports, setReports] = useState<UIMentalHealthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const router = useRouter();

  // Wrap fetchReports in useCallback
  const fetchReports = useCallback(async () => {
    if (!user) return;
    try {
      setRefreshing(true);
      const reportsCollection = collection(db, 'mental_health_reports');
      const q = query(
        reportsCollection,
        where('employee_id', '==', user.id)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UIMentalHealthReport[];
      // Sort by created_at in JavaScript to avoid Firestore index requirements
      const sortedData = data.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setReports(sortedData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, db]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
      return;
    }

    if (user?.role !== 'employee') {
      return;
    }

    if (user) {
      fetchReports();
    }
  }, [user, userLoading, router, fetchReports]);

  const getRiskLevelBadge = (riskLevel: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'bg-green-100 text-green-700 border-green-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-red-100 text-red-700 border-red-200',
    };
    const icons = {
      low: <CheckCircle className="h-3 w-3" />,
      medium: <Clock className="h-3 w-3" />,
      high: <AlertTriangle className="h-3 w-3" />,
    };
    return (
      <Badge className={`${colors[riskLevel]} flex items-center space-x-1`}>
        {icons[riskLevel]}
        <span>{riskLevel?.toUpperCase()}</span>
      </Badge>
    );
  };

  const exportMyReports = async () => {
    try {
      // Build query parameters for the export page
      const params = new URLSearchParams({
        type: 'employee',
        range: '30d',
        risk: filterRisk
      });
      
      // Redirect to the export page
      router.push(`/export/report?${params.toString()}`);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' ||
      report.comments?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(report.created_at).toLocaleDateString().includes(searchTerm);

    const matchesRisk = filterRisk === 'all' || report.risk_level === filterRisk;

    return matchesSearch && matchesRisk;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'wellness-high':
        return b.overall_wellness - a.overall_wellness;
      case 'wellness-low':
        return a.overall_wellness - b.overall_wellness;
      case 'stress-high':
        return b.stress_level - a.stress_level;
      case 'stress-low':
        return a.stress_level - b.stress_level;
      default: // newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  if (userLoading || loading) {
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
          <p className="text-lg text-gray-600">Loading your wellness reports...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Wellness Hub</h1>
                <p className="text-sm text-gray-500">Employee Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button variant="outline" size="sm" className="text-green-600 border-green-200 bg-green-50 text-xs sm:text-sm px-2 sm:px-3">
                Engineering
              </Button>
              <Button variant="outline" size="sm" className="p-2">
                <Calendar className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="p-2">
                <Heart className="h-4 w-4" />
              </Button>
              <ThemeToggle size="sm" />
              <Button 
                variant="outline" 
                size="sm" 
                className="text-green-600 border-green-200"
                onClick={() => {
                  auth.signOut();
                  router.push('/auth/login');
                }}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-600 mb-3 sm:mb-4 leading-tight">My Wellness Reports</h1>
          <p className="text-gray-600">
            Track your mental health journey and view your progress over time.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-4 sm:space-x-6 md:space-x-8 border-b border-gray-200 overflow-x-auto">
            <Link href="/employee/dashboard">
              <button className="pb-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium transition-colors">
                Overview
              </button>
            </Link>
            <button className="pb-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium">
              Analytics
            </button>
            <Link href="/employee/chat">
              <button className="pb-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium transition-colors">
                AI Friend
              </button>
            </Link>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button
              onClick={fetchReports}
              variant="outline"
              size="sm"
              className="border-green-200 text-green-600 hover:bg-green-50"
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <Button
              onClick={exportMyReports}
              variant="outline"
              size="sm"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export My Reports
            </Button>
          </div>
          <Link href="/employee/reports/new">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <div>
          <Card className="mb-8 bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <Select value={filterRisk} onValueChange={setFilterRisk}>
                  <SelectTrigger className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="wellness-high">Highest Wellness</SelectItem>
                    <SelectItem value="wellness-low">Lowest Wellness</SelectItem>
                    <SelectItem value="stress-high">Highest Stress</SelectItem>
                    <SelectItem value="stress-low">Lowest Stress</SelectItem>
                  </SelectContent>
                </Select>

                <div className="text-sm text-gray-600 flex items-center">
                  <span>{filteredReports.length} of {reports.length} reports</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        {sortedReports.length > 0 ? (
          <motion.div
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {sortedReports.map((report, index) => {
              const previousReport = sortedReports[index + 1] as UIMentalHealthReport | undefined;
              const r = report as UIMentalHealthReport;
              return (
                <motion.div key={r.id} variants={itemVariants}>
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg"
                          >
                            <Calendar className="h-6 w-6 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {new Date(report.created_at).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(report.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {getRiskLevelBadge(report.risk_level)}
                          <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">
                              {report.overall_wellness}/10
                            </div>
                            <div className="text-sm text-gray-600">Overall Wellness</div>
                          </div>
                        </div>
                      </div>

                      {/* Main Metrics Grid - replaced with AI Metrics */}
                      {r.metrics ? (
                        <div className="mb-6">
                          <h4 className="text-md font-semibold text-green-700 mb-2 flex items-center">
                            <Sparkles className="h-4 w-4 mr-2" />AI Metrics Breakdown
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(r.metrics).map(([key, value]) => {
                              const explanations = r.metrics_explanation || {};
                              const labels: Record<string, string> = {
                                emotional_tone: 'Emotional Tone',
                                stress_anxiety: 'Stress & Anxiety',
                                motivation_engagement: 'Motivation & Engagement',
                                social_connectedness: 'Social Connectedness',
                                self_esteem: 'Self-Esteem',
                                assertiveness: 'Assertiveness',
                                work_life_balance_metric: 'Work-Life Balance',
                                cognitive_functioning: 'Cognitive Functioning',
                                emotional_regulation: 'Emotional Regulation',
                                substance_use: 'Substance Use',
                              };
                              const colors = [
                                'bg-green-100 text-green-800',
                                'bg-yellow-100 text-yellow-800',
                                'bg-orange-100 text-orange-800',
                                'bg-red-100 text-red-800',
                              ];
                              return (
                                <div key={key} className={`rounded-lg border p-3 ${colors[Number(value)] || ''}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium">{labels[key] || key}</span>
                                    <span className="font-bold text-lg">{String(value)}/3</span>
                                  </div>
                                  <div className="text-xs text-gray-700">
                                    {(explanations as Record<string, string>)[key] || ''}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        // Fallback: show old metrics if new metrics are not present
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <motion.div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300" whileHover={{ scale: 1.02, y: -2 }}>
                              <div className="flex items-center justify-center space-x-1 mb-2">
                                <Smile className="h-5 w-5 text-blue-600" />
                                <span className="text-xl font-semibold text-blue-700">{report.mood_rating}/10</span>
                                {previousReport && getTrendIcon(report.mood_rating, previousReport.mood_rating)}
                              </div>
                              <div className="text-sm text-blue-600 font-medium">Mood</div>
                            </motion.div>
                            <motion.div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 hover:shadow-md transition-all duration-300" whileHover={{ scale: 1.02, y: -2 }}>
                              <div className="flex items-center justify-center space-x-1 mb-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <span className="text-xl font-semibold text-red-700">{report.stress_level}/10</span>
                                {previousReport && getTrendIcon(report.stress_level, report.stress_level)}
                              </div>
                              <div className="text-sm text-red-600 font-medium">Stress</div>
                            </motion.div>
                            <motion.div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300" whileHover={{ scale: 1.02, y: -2 }}>
                              <div className="flex items-center justify-center space-x-1 mb-2">
                                <Battery className="h-5 w-5 text-green-600" />
                                <span className="text-xl font-semibold text-green-700">{report.energy_level}/10</span>
                                {previousReport && getTrendIcon(report.energy_level, previousReport.energy_level)}
                              </div>
                              <div className="text-sm text-green-600 font-medium">Energy</div>
                            </motion.div>
                            <motion.div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300" whileHover={{ scale: 1.02, y: -2 }}>
                              <div className="flex items-center justify-center space-x-1 mb-2">
                                <Heart className="h-5 w-5 text-purple-600" />
                                <span className="text-xl font-semibold text-purple-700">{report.work_satisfaction}/10</span>
                                {previousReport && getTrendIcon(report.work_satisfaction, previousReport.work_satisfaction)}
                              </div>
                              <div className="text-sm text-purple-600 font-medium">Work Satisfaction</div>
                            </motion.div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            <div className="text-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                              <div className="text-lg font-semibold text-gray-700">{report.work_life_balance}/10</div>
                              <div className="text-xs text-gray-600">Work-Life Balance</div>
                            </div>
                            <div className="text-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                              <div className="text-lg font-semibold text-gray-700">{report.anxiety_level}/10</div>
                              <div className="text-xs text-gray-600">Anxiety</div>
                            </div>
                            <div className="text-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                              <div className="text-lg font-semibold text-gray-700">{report.confidence_level}/10</div>
                              <div className="text-xs text-gray-600">Confidence</div>
                            </div>
                            <div className="text-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                              <div className="text-lg font-semibold text-gray-700">{report.sleep_quality}/10</div>
                              <div className="text-xs text-gray-600">Sleep Quality</div>
                            </div>
                          

                            
                          </div>
                        </>
                      )}

                      {/* Comments */}
                      {report.comments && (
                        <motion.div
                          className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                            <Brain className="h-4 w-4 mr-2" />
                            Personal Notes:
                          </h4>
                          <p className="text-sm text-blue-600">{report.comments}</p>
                        </motion.div>
                      )}

                      {/* AI Analysis */}
                      {report.ai_analysis && (
                        <motion.div
                          className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center">
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI Insights:
                          </h4>
                          <p className="text-sm text-green-600">{report.ai_analysis}</p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                </motion.div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Reports Found</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  {searchTerm || filterRisk !== 'all'
                    ? 'No reports match your current filters. Try adjusting your search criteria.'
                    : 'You haven\'t created any wellness reports yet. Start tracking your mental health today!'
                  }
                </p>
                {!searchTerm && filterRisk === 'all' && (
                  <Link href="/employee/reports/new">
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg px-8 py-3 text-lg">
                      <Sparkles className="h-5 w-5 mr-2" />
                      Create Your First Report
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}