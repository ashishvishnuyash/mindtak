'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/shared/navbar';
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
  Loader2
  
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { MentalHealthReport } from '@/types';
import { auth, db } from '@/lib/firebase';
import { withAuth } from '@/components/auth/with-auth';
import { useCallback } from 'react';

function EmployeeDashboard() {
  const { user, loading: userLoading } = useUser();
  const [reports, setReports] = useState<MentalHealthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <Navbar user={user || undefined} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Brain className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Welcome back, {user.first_name || user.email}!
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  Monitor your mental wellness and track your progress over time.
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="bg-white/60 backdrop-blur-sm hover:bg-green-50 border-green-200"
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <Link href="/employee/reports/new">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow"
                    >
                      <Heart className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">New Wellness Check</h3>
                      <p className="text-sm text-gray-600">Record your current state</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors ml-auto" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <Link href="/employee/chat">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow"
                    >
                      <MessageSquare className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">AI Assistant</h3>
                      <p className="text-sm text-gray-600">Chat with our wellness AI</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors ml-auto" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <Link href="/employee/reports">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow"
                    >
                      <TrendingUp className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">View Reports</h3>
                      <p className="text-sm text-gray-600">Track your progress</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors ml-auto" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Smile className="h-4 w-4 mr-2 text-blue-500" />
                  Current Mood
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg"
                >
                  <Smile className="h-6 w-6 text-white" />
                </motion.div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {latestReport ? latestReport.mood_rating : '-'}/10
                  </div>
                  <Progress 
                    value={latestReport ? latestReport.mood_rating * 10 : 0} 
                    className="w-full h-2 mt-2" 
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                  Stress Level
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-2xl shadow-lg"
                >
                  <AlertTriangle className="h-6 w-6 text-white" />
                </motion.div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {latestReport ? latestReport.stress_level : '-'}/10
                  </div>
                  <Progress 
                    value={latestReport ? latestReport.stress_level * 10 : 0} 
                    className="w-full h-2 mt-2" 
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Battery className="h-4 w-4 mr-2 text-green-500" />
                  Energy Level
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-2xl shadow-lg"
                >
                  <Battery className="h-6 w-6 text-white" />
                </motion.div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {latestReport ? latestReport.energy_level : '-'}/10
                  </div>
                  <Progress 
                    value={latestReport ? latestReport.energy_level * 10 : 0} 
                    className="w-full h-2 mt-2" 
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-purple-500" />
                  Overall Wellness
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg"
                >
                  <Brain className="h-6 w-6 text-white" />
                </motion.div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900">
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
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wellness Trend Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900">
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
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      </motion.div>
                      <p className="text-lg font-medium mb-2">No reports yet</p>
                      <p className="text-sm mb-4">Create your first wellness check to see trends.</p>
                      <Link href="/employee/reports/new">
                        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Create Report
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Reports */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <span>Recent Reports</span>
                  </div>
                  <Link href="/employee/reports">
                    <Button variant="outline" size="sm" className="bg-white/60 backdrop-blur-sm hover:bg-green-50 border-green-200">
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
                      <motion.div 
                        key={report.id} 
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Wellness: {report.overall_wellness}/10
                          </p>
                        </div>
                        <Badge className={getRiskLevelBadge(report.risk_level)}>
                          {report.risk_level.toUpperCase()}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    </motion.div>
                    <p className="text-lg font-medium text-gray-500 mb-4">No reports yet</p>
                    <Link href="/employee/reports/new">
                      <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create Your First Report
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Wellness Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Daily Wellness Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Heart className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  </motion.div>
                  <h3 className="font-semibold text-gray-900 mb-2">Take Breaks</h3>
                  <p className="text-sm text-gray-600">
                    Take a 5-minute break every hour to refresh your mind.
                  </p>
                </motion.div>
                <motion.div 
                  className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Brain className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  </motion.div>
                  <h3 className="font-semibold text-gray-900 mb-2">Practice Mindfulness</h3>
                  <p className="text-sm text-gray-600">
                    Try 5 minutes of deep breathing or meditation.
                  </p>
                </motion.div>
                <motion.div 
                  className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  </motion.div>
                  <h3 className="font-semibold text-gray-900 mb-2">Connect</h3>
                  <p className="text-sm text-gray-600">
                    Reach out to our AI assistant or a colleague for support.
                  </p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default withAuth(EmployeeDashboard, ['employee']);