'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
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
  Award
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { MentalHealthReport } from '@/types';
import { auth, db } from '@/lib/firebase';
import { withAuth } from '@/components/auth/with-auth';
import { useCallback } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

function EmployeeDashboard() {
  const { user, loading: userLoading } = useUser();
  const [reports, setReports] = useState<MentalHealthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState({ 
    averageMood: 0,
    averageStress: 0,
    averageEnergy: 0,
    reportsCount: 0,
    lastReportDate: null as string | null,
  });
  const router = useRouter();


  const fetchReports = useCallback(async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available');
        setLoading(false);
        return;
      }
      // Fetch reports from Firestore where employee_id matches current user's ID
      const reportsRef = collection(db, 'mental_health_reports');
      const q = query(reportsRef, where('employee_id', '==', user.id));
      const querySnapshot = await getDocs(q);

      console.log('Query snapshot size:', querySnapshot.size);

      const fetchedReports: MentalHealthReport[] = querySnapshot.docs.map((doc: any) => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          // Ensure created_at is a string
          created_at: data.created_at || new Date().toISOString()
        } as MentalHealthReport;
      });

      console.log('Fetched reports:', fetchedReports.length);

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
        // Set default stats when no reports
        setStats({
          averageMood: 0,
          averageStress: 0,
          averageEnergy: 0,
          reportsCount: 0,
          lastReportDate: null,
        });
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Set default stats on error
      setStats({
        averageMood: 0,
        averageStress: 0,
        averageEnergy: 0,
        reportsCount: 0,
        lastReportDate: null,
      });
      setReports([]);
    } finally {
      // Always set loading to false
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user, fetchReports]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
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
          <p className="text-lg text-gray-600">Loading your wellness dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
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
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Wellness Hub</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Employee Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button variant="outline" size="sm" className="text-green-600 border-green-200 bg-green-50 text-xs sm:text-sm px-2 sm:px-3">
                Engineering
              </Button>
              <Button variant="outline" size="sm" className="p-2">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="p-2">
                <User className="h-4 w-4" />
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
              Welcome back, {user.first_name || user.email}!
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 font-light leading-relaxed max-w-full sm:max-w-2xl">
              Monitor your mental wellness and track your progress over time with our advanced analytics.
            </p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-4 sm:space-x-6 md:space-x-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab('Overview')}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'Overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <Link href="/employee/reports">
              <button className="pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors">
                Analytics
              </button>
            </Link>
            <Link href="/employee/chat">
              <button className="pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors">
                AI Friend
              </button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Link href="/employee/reports/new">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group">
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
          </Link>

          <Link href="/employee/chat">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-2xl">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 transition-colors">AI Assistant</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Chat with our wellness AI</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors ml-auto" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/employee/reports">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group">
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
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                <Smile className="h-4 w-4 mr-2 text-blue-500" />
                Current Mood
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <Smile className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {latestReport ? latestReport.mood_rating : '-'}/10
                </div>
                <Progress 
                  value={latestReport ? latestReport.mood_rating * 10 : 0} 
                  className="w-full h-2 mt-2" 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                Stress Level
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-3">
              <div className="bg-orange-100 p-3 rounded-2xl">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {latestReport ? latestReport.stress_level : '-'}/10
                </div>
                <Progress 
                  value={latestReport ? latestReport.stress_level * 10 : 0} 
                  className="w-full h-2 mt-2" 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                <Battery className="h-4 w-4 mr-2 text-green-500" />
                Energy Level
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-2xl">
                <Battery className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {latestReport ? latestReport.energy_level : '-'}/10
                </div>
                <Progress 
                  value={latestReport ? latestReport.energy_level * 10 : 0} 
                  className="w-full h-2 mt-2" 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                <Brain className="h-4 w-4 mr-2 text-purple-500" />
                Overall Wellness
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-2xl">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {latestReport ? latestReport.overall_wellness : '-'}/10
                </div>
                {wellnessStatus && (
                  <Badge className={`${wellnessStatus.textColor} bg-opacity-20 mt-2`}>
                    {wellnessStatus.label}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

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
                    <Link href="/employee/reports/new">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create Report
                      </Button>
                    </Link>
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
                <Link href="/employee/reports">
                  <Button variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-50">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.slice(0, 5).map((report, index) => (
                    <div 
                      key={report.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Wellness: {report.overall_wellness}/10
                        </p>
                      </div>
                      <Badge className={getRiskLevelBadge(safeRiskLevel(report.risk_level))}>
                        {safeRiskLevel(report.risk_level).toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-500 mb-4">No reports yet</p>
                  <Link href="/employee/reports/new">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Your First Report
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Wellness Tips */}
        <div className="mt-8">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Daily Wellness Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <Heart className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Take Breaks</h3>
                  <p className="text-sm text-gray-600">
                    Take a 5-minute break every hour to refresh your mind.
                  </p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
                  <Brain className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Practice Mindfulness</h3>
                  <p className="text-sm text-gray-600">
                    Try 5 minutes of deep breathing or meditation.
                  </p>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                  <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Connect</h3>
                  <p className="text-sm text-gray-600">
                    Reach out to our AI assistant or a colleague for support.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAuth(EmployeeDashboard, ['employee']);