'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  TrendingUp, 
  Calendar, 
  Plus,
  ArrowLeft,
  Shield,
  Brain,
  Heart,
  Battery,
  AlertTriangle,
  Smile,
  BarChart3,
  Download,
  Filter,
  Search,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useUser } from '@/hooks/use-user';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { MentalHealthReport } from '@/types';
import { withAuth } from '@/components/auth/with-auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { signOut } from 'firebase/auth';

function ManagerPersonalReportsPage() {
  const { user, loading: userLoading } = useUser();
  const [reports, setReports] = useState<MentalHealthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const router = useRouter();

  const fetchReports = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const reportsRef = collection(db, 'mental_health_reports');
      const q = query(
        reportsRef, 
        where('employee_id', '==', user.id),
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

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getFilteredReports = () => {
    const now = new Date();
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return reports.filter(report => new Date(report.created_at) >= cutoffDate);
  };

  const filteredReports = getFilteredReports();

  const chartData = filteredReports.slice(0, 10).reverse().map((report) => ({
    date: new Date(report.created_at).toLocaleDateString(),
    mood: report.mood_rating,
    stress: 11 - report.stress_level, // Invert for better visualization
    energy: report.energy_level,
    wellness: report.overall_wellness,
  }));

  const averageStats = filteredReports.length > 0 ? {
    mood: Math.round(filteredReports.reduce((sum, r) => sum + (r.mood_rating || 0), 0) / filteredReports.length * 10) / 10,
    stress: Math.round(filteredReports.reduce((sum, r) => sum + (r.stress_level || 0), 0) / filteredReports.length * 10) / 10,
    energy: Math.round(filteredReports.reduce((sum, r) => sum + (r.energy_level || 0), 0) / filteredReports.length * 10) / 10,
    wellness: Math.round(filteredReports.reduce((sum, r) => sum + (r.overall_wellness || 0), 0) / filteredReports.length * 10) / 10,
  } : { mood: 0, stress: 0, energy: 0, wellness: 0 };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Loader2 className="h-16 w-16 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading your wellness analytics...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 lg:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link href="/manager/personal">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Analytics</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Your Wellness Reports</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button variant="outline" size="sm" className="hidden lg:flex text-green-600 border-green-200 bg-green-50 text-xs px-2 sm:px-3">
                Personal Analytics
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
              Personal Wellness Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              Track your personal wellness journey as a leader. Monitor trends, identify patterns, and make data-driven decisions about your mental health.
            </p>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => router.push('/manager/personal/reports/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-green-200 text-green-600 hover:bg-green-50"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        {filteredReports.length > 0 ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Average Mood</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{averageStats.mood}/10</p>
                    </div>
                    <Smile className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Average Energy</p>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100">{averageStats.energy}/10</p>
                    </div>
                    <Battery className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">Average Stress</p>
                      <p className="text-3xl font-bold text-red-900 dark:text-red-100">{averageStats.stress}/10</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Overall Wellness</p>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{averageStats.wellness}/10</p>
                    </div>
                    <Brain className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Trend Chart */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span>Wellness Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    <span>Average Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: 'Mood', value: averageStats.mood, fill: '#3B82F6' },
                      { name: 'Energy', value: averageStats.energy, fill: '#10B981' },
                      { name: 'Stress', value: averageStats.stress, fill: '#EF4444' },
                      { name: 'Wellness', value: averageStats.wellness, fill: '#8B5CF6' },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Bar dataKey="value" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Reports List */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <span>Recent Reports ({filteredReports.length})</span>
                  </div>
                  <Button variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-50">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports.slice(0, 10).map((report) => (
                    <div 
                      key={report.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(report.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400">Mood</p>
                            <p className="font-semibold text-blue-600">{report.mood_rating}/10</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400">Energy</p>
                            <p className="font-semibold text-green-600">{report.energy_level}/10</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400">Stress</p>
                            <p className="font-semibold text-red-600">{report.stress_level}/10</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400">Wellness</p>
                            <p className="font-semibold text-purple-600">{report.overall_wellness}/10</p>
                          </div>
                        </div>
                      </div>
                      <Badge className={getRiskBadgeColor(report.risk_level || 'low')}>
                        {(report.risk_level || 'low').toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Analytics Data</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first wellness report to see detailed analytics.</p>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => router.push('/manager/personal/reports/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default withAuth(ManagerPersonalReportsPage, ['manager']);