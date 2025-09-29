'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/shared/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  BarChart3,
  Download,
  Loader2,
  Target,
  Clock,
  UserCheck,
  Building,
  ArrowRight,
  Plus,
  Sparkles,
  Heart,
  Shield,
  Zap,
  CheckCircle,
  Star,
  Eye,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import type { DashboardStats, MentalHealthReport, User } from '@/types/index';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { withAuth } from '@/components/auth/with-auth';

function EmployerDashboardPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReports, setRecentReports] = useState<MentalHealthReport[]>([]);
  const [employees, setEmployees] = useState<Array<{
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    department?: string;
    position?: string;
    status?: string;
    company_id?: string;
    role?: string;
    [key: string]: any;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!userLoading && user && user.company_id) {
      initializeDashboard();
    }
  }, [user, userLoading]);

  const initializeDashboard = async () => {
    if (!user?.company_id) {
      toast.error('Company information not found.');
      return;
    }

    try {
      setLoading(true);
      await Promise.all([
        loadEmployees(),
        loadDashboardStats(),
        loadRecentReports()
      ]);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await initializeDashboard();
    setRefreshing(false);
    toast.success('Dashboard refreshed!');
  };

  const loadEmployees = async () => {
    if (!user?.company_id) return;

    try {
      const employeesQuery = query(
        collection(db, 'users'),
        where('company_id', '==', user.company_id),
        where('role', '==', 'employee')
      );

      const unsubscribe = onSnapshot(employeesQuery, (snapshot) => {
        const employeesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Array<{
          id: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          department?: string;
          position?: string;
          status?: string;
          [key: string]: any;
        }>;
        setEmployees(employeesData);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadDashboardStats = async () => {
    if (!user?.company_id) return;

    try {
      // Get all company users (employees, managers, etc.)
      const allUsersQuery = query(
        collection(db, 'users'),
        where('company_id', '==', user.company_id)
      );
      const allUsersSnapshot = await getDocs(allUsersQuery);
      const allUsers = allUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];

      // Filter employees
      const employees = allUsers.filter(u => u.role === 'employee');
      const managers = allUsers.filter(u => u.role === 'manager');
      const totalEmployees = employees.length;

      // Get active sessions count
      const activeSessionsQuery = query(
        collection(db, 'chat_sessions'),
        where('company_id', '==', user.company_id),
        where('status', '==', 'active')
      );
      const activeSessionsSnapshot = await getDocs(activeSessionsQuery);
      const activeSessions = activeSessionsSnapshot.size;

      // Get all reports for comprehensive analysis
      const reportsQuery = query(
        collection(db, 'mental_health_reports'),
        where('company_id', '==', user.company_id)
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      const allReports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MentalHealthReport[];

      // Filter reports by date ranges
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const recentReports = allReports.filter(report =>
        new Date(report.created_at) >= thirtyDaysAgo
      );
      const weeklyReports = allReports.filter(report =>
        new Date(report.created_at) >= sevenDaysAgo
      );

      const completedReports = recentReports.length;

      // Calculate comprehensive wellness metrics
      let totalWellnessScore = 0;
      let totalMoodScore = 0;
      let totalStressScore = 0;
      let totalEnergyScore = 0;
      let highRiskCount = 0;
      let mediumRiskCount = 0;
      let lowRiskCount = 0;

      recentReports.forEach(report => {
        totalWellnessScore += report.overall_wellness || 0;
        totalMoodScore += report.mood_rating || 0;
        totalStressScore += report.stress_level || 0;
        totalEnergyScore += report.energy_level || 0;

        switch (report.risk_level) {
          case 'high':
            highRiskCount++;
            break;
          case 'medium':
            mediumRiskCount++;
            break;
          case 'low':
            lowRiskCount++;
            break;
        }
      });

      const averageWellnessScore = completedReports > 0 ? totalWellnessScore / completedReports : 0;
      const averageMoodScore = completedReports > 0 ? totalMoodScore / completedReports : 0;
      const averageStressScore = completedReports > 0 ? totalStressScore / completedReports : 0;
      const averageEnergyScore = completedReports > 0 ? totalEnergyScore / completedReports : 0;

      // Calculate trend (compare last 7 days vs previous 7 days)
      const previousWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const previousWeekReports = allReports.filter(report => {
        const reportDate = new Date(report.created_at);
        return reportDate >= previousWeekStart && reportDate < sevenDaysAgo;
      });

      const currentWeekAvg = weeklyReports.length > 0
        ? weeklyReports.reduce((sum, r) => sum + (r.overall_wellness || 0), 0) / weeklyReports.length
        : 0;
      const previousWeekAvg = previousWeekReports.length > 0
        ? previousWeekReports.reduce((sum, r) => sum + (r.overall_wellness || 0), 0) / previousWeekReports.length
        : 0;

      let wellnessTrend: 'improving' | 'stable' | 'declining' = 'stable';
      if (currentWeekAvg > previousWeekAvg + 0.5) {
        wellnessTrend = 'improving';
      } else if (currentWeekAvg < previousWeekAvg - 0.5) {
        wellnessTrend = 'declining';
      }

      // Calculate department breakdown
      const departmentStats: { [key: string]: { employeeCount: number; reportCount: number; avgWellness: number; highRisk: number } } = {};
      employees.forEach(employee => {
        const dept = employee.department || 'Unassigned';
        if (!departmentStats[dept]) {
          departmentStats[dept] = {
            employeeCount: 0,
            reportCount: 0,
            avgWellness: 0,
            highRisk: 0
          };
        }
        departmentStats[dept].employeeCount++;

        const employeeReports = recentReports.filter(r => r.employee_id === employee.id);
        departmentStats[dept].reportCount += employeeReports.length;

        if (employeeReports.length > 0) {
          const deptWellness = employeeReports.reduce((sum, r) => sum + (r.overall_wellness || 0), 0) / employeeReports.length;
          departmentStats[dept].avgWellness = deptWellness;
          departmentStats[dept].highRisk += employeeReports.filter(r => r.risk_level === 'high').length;
        }
      });

      setStats({
        total_employees: totalEmployees,
        total_managers: managers.length,
        active_sessions: activeSessions,
        completed_reports: completedReports,
        average_wellness_score: Math.round(averageWellnessScore * 10) / 10,
        average_mood_score: Math.round(averageMoodScore * 10) / 10,
        average_stress_score: Math.round(averageStressScore * 10) / 10,
        average_energy_score: Math.round(averageEnergyScore * 10) / 10,
        high_risk_employees: highRiskCount,
        medium_risk_employees: mediumRiskCount,
        low_risk_employees: lowRiskCount,
        wellness_trend: wellnessTrend,
        department_stats: departmentStats,
        weekly_reports: weeklyReports.length,
        participation_rate: totalEmployees > 0 ? Math.round((recentReports.length / totalEmployees) * 100) : 0,
        last_updated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  const loadRecentReports = async () => {
    if (!user?.company_id) return;

    try {
      const reportsQuery = query(
        collection(db, 'mental_health_reports'),
        where('company_id', '==', user.company_id)
      );

      const unsubscribe = onSnapshot(reportsQuery, (snapshot) => {
        const reportsData: MentalHealthReport[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<MentalHealthReport, 'id'>
        }));

        // Sort by created_at in JavaScript and limit to 5
        const sortedReports = reportsData
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);

        setRecentReports(sortedReports);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error loading recent reports:', error);
      setRecentReports([]);
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <Activity className="h-4 w-4 text-yellow-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportReports = async () => {
    if (!user?.company_id) return;

    try {
      toast.info('Preparing report export...');

      const response = await fetch('/api/employer/export-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: user.company_id,
          time_range: timeRange
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export reports');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wellness-reports-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Reports exported successfully!');
    } catch (error) {
      console.error('Error exporting reports:', error);
      toast.error('Failed to export reports.');
    }
  };

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
            <Loader2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          </motion.div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={floatingAnimation}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 2 }
          }}
        />
      </div>

      <Navbar user={user || undefined} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  animate={floatingAnimation}
                  className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Building className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Employer Dashboard</h1>
                  <p className="text-lg text-gray-600 mt-1">
                    Monitor your team's wellness and mental health insights
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white/80 backdrop-blur-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={refreshing}
                  className="bg-white/80 backdrop-blur-sm hover:bg-green-50 hover:text-green-600"
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
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={exportReports}
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm hover:bg-green-50 hover:text-green-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Reports
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Team</CardTitle>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Users className="h-5 w-5 text-green-600" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats?.total_employees || 0}</div>
                <p className="text-sm text-gray-600">
                  {stats?.total_managers || 0} managers, {stats?.total_employees || 0} employees
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Participation Rate</CardTitle>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Activity className="h-5 w-5 text-blue-600" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats?.participation_rate || 0}%</div>
                <p className="text-sm text-gray-600">
                  {stats?.completed_reports || 0} reports this month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Average Wellness</CardTitle>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Target className="h-5 w-5 text-purple-600" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-3xl font-bold text-gray-900">{stats?.average_wellness_score || 0}/10</div>
                  {stats?.wellness_trend && getTrendIcon(stats.wellness_trend)}
                </div>
                <p className="text-sm text-gray-600">
                  Team wellness score
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">High Risk</CardTitle>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats?.high_risk_employees || 0}</div>
                <p className="text-sm text-gray-600">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Additional Metrics Row */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Average Mood</CardTitle>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Heart className="h-5 w-5 text-green-500" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats?.average_mood_score || 0}/10</div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                  <motion.div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000"
                    initial={{ width: 0 }}
                    animate={{ width: `${((stats?.average_mood_score || 0) / 10) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Average Stress</CardTitle>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Zap className="h-5 w-5 text-red-500" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats?.average_stress_score || 0}/10</div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                  <motion.div
                    className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                    initial={{ width: 0 }}
                    animate={{ width: `${((stats?.average_stress_score || 0) / 10) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Average Energy</CardTitle>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Star className="h-5 w-5 text-yellow-500" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats?.average_energy_score || 0}/10</div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                  <motion.div
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-1000"
                    initial={{ width: 0 }}
                    animate={{ width: `${((stats?.average_energy_score || 0) / 10) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* High Risk Alert */}
        <AnimatePresence>
          {stats && stats.high_risk_employees > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-900">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <AlertTriangle className="h-6 w-6 mr-3" />
                    </motion.div>
                    High Risk Employees Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-800 mb-4">
                    {stats.high_risk_employees} employee{stats.high_risk_employees > 1 ? 's' : ''}
                    {stats.high_risk_employees > 1 ? ' have' : ' has'} been flagged as high risk.
                    Consider reaching out for additional support.
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                      onClick={() => router.push('/employer/reports?filter=high-risk')}
                    >
                      View High Risk Reports
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {/* Recent Reports */}
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">Recent Wellness Reports</span>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/employer/reports')}
                      className="bg-white/60 hover:bg-green-50 hover:text-green-600"
                    >
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </motion.div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentReports.length > 0 ? (
                  <div className="space-y-4">
                    {recentReports.map((report, index) => {
                      const employee = employees.find(emp => emp.id === report.employee_id);
                      return (
                        <motion.div
                          key={report.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-green-50 hover:to-emerald-50 transition-all duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                        >
                          <div className="flex items-center space-x-3">
                            <motion.div
                              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.6 }}
                            >
                              <UserCheck className="h-6 w-6 text-white" />
                            </motion.div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {employee?.department || 'No Department'} • {formatDate(report.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">Wellness: {report.overall_wellness}/10</p>
                              <Badge variant={getRiskBadgeColor(report.risk_level)} className="text-xs">
                                {report.risk_level} risk
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.div
                      animate={floatingAnimation}
                      className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    >
                      <BarChart3 className="h-8 w-8 text-white" />
                    </motion.div>
                    <p className="text-lg text-gray-600 mb-2">No wellness reports yet</p>
                    <p className="text-sm text-gray-500">Reports will appear here as employees complete wellness sessions</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: Plus, label: 'Add New Employee', route: '/employer/employees/new', color: 'text-green-600' },
                  { icon: BarChart3, label: 'View Analytics', route: '/employer/analytics', color: 'text-blue-600' },
                  { icon: Users, label: 'Manage Employees', route: '/employer/employees', color: 'text-purple-600' },
                  { icon: Download, label: 'Export Reports', action: exportReports, color: 'text-orange-600' }
                ].map((action, index) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      className="w-full justify-start bg-white/60 hover:bg-green-50 hover:text-green-600 transition-all duration-300"
                      variant="outline"
                      onClick={action.action || (() => router.push(action.route!))}
                    >
                      <action.icon className={`h-4 w-4 mr-3 ${action.color}`} />
                      {action.label}
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Team Overview */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-bold text-gray-900">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Building className="h-6 w-6 mr-3 text-green-600" />
                  </motion.div>
                  Team Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Total Team Members', value: (stats?.total_employees || 0) + (stats?.total_managers || 0) },
                    { label: 'Active Sessions', value: stats?.active_sessions || 0 },
                    { label: 'Reports This Month', value: stats?.completed_reports || 0 },
                    { label: 'Participation Rate', value: `${stats?.participation_rate || 0}%` },
                    { label: 'High Risk', value: stats?.high_risk_employees || 0, badge: true }
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-green-50 hover:to-emerald-50 transition-all duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      {item.badge ? (
                        <Badge variant={stats?.high_risk_employees ? 'destructive' : 'default'}>
                          {item.value}
                        </Badge>
                      ) : (
                        <span className="font-semibold text-gray-900">{item.value}</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Department Breakdown */}
            {stats?.department_stats && Object.keys(stats.department_stats).length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold text-gray-900">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <BarChart3 className="h-6 w-6 mr-3 text-blue-600" />
                    </motion.div>
                    Department Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.department_stats).map(([dept, deptStats], index) => (
                      <motion.div
                        key={dept}
                        className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-cyan-50 transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-gray-900">{dept}</h4>
                          <Badge variant="outline" className="bg-white/80">{deptStats.employeeCount} employees</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Avg Wellness:</span>
                            <span className="font-semibold text-gray-900">{Math.round(deptStats.avgWellness * 10) / 10}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Reports:</span>
                            <span className="font-semibold text-gray-900">{deptStats.reportCount}</span>
                          </div>
                        </div>
                        {deptStats.avgWellness > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <motion.div
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-1000"
                              initial={{ width: 0 }}
                              animate={{ width: `${(deptStats.avgWellness / 10) * 100}%` }}
                            />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default withAuth(EmployerDashboardPage, ['employer', 'admin', 'hr']);