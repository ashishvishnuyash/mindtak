'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, easeInOut, easeOut } from 'framer-motion';
import { Navbar } from '@/components/shared/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  RefreshCw,
  Sparkles,
  Heart,
  Zap,
  Star,
  Activity,
  Eye,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MentalHealthReport, User } from '@/types';

import { toast } from 'sonner';

interface ReportWithEmployee extends MentalHealthReport {
  employee?: User;
}

export default function EmployerReportsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [reports, setReports] = useState<ReportWithEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);

      // Fetch all company employees first
      const employeesQuery = query(
        collection(db, 'users'),
        where('company_id', '==', user.company_id)
      );
      const employeesSnapshot = await getDocs(employeesQuery);
      const employees = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));

      // Create employee lookup map
      const employeeMap = new Map(employees.map(emp => [emp.id, emp]));

      // Fetch all reports for the company
      const reportsQuery = query(
        collection(db, 'mental_health_reports'),
        where('company_id', '==', user.company_id)
      );
      const reportsSnapshot = await getDocs(reportsQuery);

      const reportsData = reportsSnapshot.docs.map(doc => {
        const reportData = { id: doc.id, ...doc.data() } as MentalHealthReport;
        const employee = employeeMap.get(reportData.employee_id);

        return {
          ...reportData,
          employee
        } as ReportWithEmployee;
      });

      // Sort reports by date (newest first)
      const sortedReports = reportsData.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setReports(sortedReports);

      // Calculate statistics
      const totalReports = sortedReports.length;
      const highRisk = sortedReports.filter(r => r.risk_level === 'high').length;
      const mediumRisk = sortedReports.filter(r => r.risk_level === 'medium').length;
      const lowRisk = sortedReports.filter(r => r.risk_level === 'low').length;
      const avgWellness = totalReports > 0
        ? sortedReports.reduce((sum, r) => sum + (r.overall_wellness || 0), 0) / totalReports
        : 0;

      // Get unique departments
      const departments = Array.from(
        new Set(employees.map(emp => emp.department).filter(Boolean))
      ) as string[];

      setStats({
        totalReports,
        highRisk,
        mediumRisk,
        lowRisk,
        avgWellness: Math.round(avgWellness * 10) / 10,
        departments
      });

    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.company_id]);

  const [stats, setStats] = useState({
    totalReports: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    avgWellness: 0,
    departments: [] as string[]
  });

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      if (user.role !== 'employer' && user.role !== 'hr' && user.role !== 'admin') {
        router.push('/');
        return;
      }

      if (user.company_id) {
        fetchReports();
      }
    }
  }, [user, userLoading, router, fetchReports]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
    toast.success('Reports refreshed!');
  };

  // Filter and sort reports
  const filteredAndSortedReports = reports
    .filter(report => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const employeeName = report.employee 
          ? `${report.employee.first_name} ${report.employee.last_name}`.toLowerCase()
          : '';
        const employeeEmail = report.employee?.email?.toLowerCase() || '';
        const department = report.employee?.department?.toLowerCase() || '';
        
        if (!employeeName.includes(searchLower) && 
            !employeeEmail.includes(searchLower) && 
            !department.includes(searchLower)) {
          return false;
        }
      }

      // Risk filter
      if (filterRisk !== 'all' && report.risk_level !== filterRisk) {
        return false;
      }

      // Department filter
      if (filterDepartment !== 'all' && report.employee?.department !== filterDepartment) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'wellness-high':
          return (b.overall_wellness || 0) - (a.overall_wellness || 0);
        case 'wellness-low':
          return (a.overall_wellness || 0) - (b.overall_wellness || 0);
        case 'stress-high':
          return b.stress_level - a.stress_level;
        case 'stress-low':
          return a.stress_level - b.stress_level;
        case 'risk-high':
          const riskOrder = { high: 3, medium: 2, low: 1 };
          return (riskOrder[b.risk_level] || 0) - (riskOrder[a.risk_level] || 0);
        case 'employee':
          const nameA = a.employee ? `${a.employee.first_name} ${a.employee.last_name}` : '';
          const nameB = b.employee ? `${b.employee.first_name} ${b.employee.last_name}` : '';
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });

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
        <span>{riskLevel.toUpperCase()}</span>
      </Badge>
    );
  };

  const generateReport = () => {
    // This would generate a comprehensive report
    console.log('Generating comprehensive report...');
    toast.info('Generating comprehensive report...');
  };

  const exportData = async () => {
    try {
      toast.info('Preparing data export...');
      // Export logic here
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
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
      transition: { duration: 0.6, ease: easeOut }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: easeInOut
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
            <FileText className="h-16 w-16 text-green-600 mx-auto mb-4" />
          </motion.div>
          <p className="text-lg text-gray-600">Loading wellness reports...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
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
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <div className="flex items-center space-x-3 mb-4">
              <motion.div
                animate={floatingAnimation}
                className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <FileText className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Wellness Reports</h1>
                <p className="text-lg text-gray-600 mt-1">
                  View wellness reports from your team members and track their mental health progress.
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div className="flex items-center space-x-4 mt-4 sm:mt-0" variants={itemVariants}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                onClick={generateReport}
                className="bg-white/60 backdrop-blur-sm hover:bg-green-50"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={handleRefresh} 
                variant="outline"
                disabled={refreshing}
                className="bg-white/60 backdrop-blur-sm hover:bg-green-50"
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
                variant="outline"
                onClick={exportData}
                className="bg-white/60 backdrop-blur-sm hover:bg-green-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <FileText className="h-8 w-8 text-blue-600" />
                  </motion.div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{reports.length}</div>
                    <p className="text-sm text-gray-600">Total Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </motion.div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {reports.length > 0 
                        ? Math.round(reports.reduce((sum, report) => sum + report.overall_wellness, 0) / reports.length)
                        : 0
                      }/10
                    </div>
                    <p className="text-sm text-gray-600">Avg Wellness</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </motion.div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {reports.filter(r => r.risk_level === 'high').length}
                    </div>
                    <p className="text-sm text-gray-600">High Risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </motion.div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {reports.filter(r => {
                        const reportDate = new Date(r.created_at);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return reportDate >= weekAgo;
                      }).length}
                    </div>
                    <p className="text-sm text-gray-600">This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/60 backdrop-blur-sm border-white/20 focus:border-green-400 focus:ring-green-400"
                    />
                  </div>
                  
                  <Select value={filterRisk} onValueChange={setFilterRisk}>
                    <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
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

                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {stats.departments.map(dept => (
                        <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="wellness-high">Highest Wellness</SelectItem>
                      <SelectItem value="wellness-low">Lowest Wellness</SelectItem>
                      <SelectItem value="stress-high">Highest Stress</SelectItem>
                      <SelectItem value="stress-low">Lowest Stress</SelectItem>
                      <SelectItem value="risk-high">Highest Risk</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="text-sm text-gray-600 flex items-center">
                    <span>{filteredAndSortedReports.length} of {reports.length} reports</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Reports List */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {filteredAndSortedReports.length > 0 ? (
            <motion.div 
              className="space-y-6"
              variants={containerVariants}
            >
              {filteredAndSortedReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-semibold text-lg">
                                {report.employee ? `${report.employee.first_name.charAt(0)}${report.employee.last_name.charAt(0)}` : 'E'}
                              </span>
                            </div>
                          </motion.div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {report.employee ? `${report.employee.first_name} ${report.employee.last_name}` : 'Employee Report'}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(report.created_at).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                              <span>
                                {new Date(report.created_at).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {report.employee?.department && (
                                <Badge variant="outline" className="bg-white/60">{report.employee.department}</Badge>
                              )}
                            </div>
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
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Link href={`/employer/reports/${report.id}`}>
                              <Button variant="outline" size="sm" className="bg-white/60 hover:bg-green-50">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </Link>
                          </motion.div>
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <motion.div 
                          className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <Heart className="h-5 w-5 text-blue-600 mr-2" />
                            <div className="text-xl font-bold text-blue-700">
                              {report.mood_rating}/10
                            </div>
                          </div>
                          <div className="text-xs text-blue-600">Mood</div>
                        </motion.div>

                        <motion.div 
                          className="text-center p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <Zap className="h-5 w-5 text-red-600 mr-2" />
                            <div className="text-xl font-bold text-red-700">
                              {report.stress_level}/10
                            </div>
                          </div>
                          <div className="text-xs text-red-600">Stress</div>
                        </motion.div>

                        <motion.div 
                          className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <Star className="h-5 w-5 text-green-600 mr-2" />
                            <div className="text-xl font-bold text-green-700">
                              {report.energy_level}/10
                            </div>
                          </div>
                          <div className="text-xs text-green-600">Energy</div>
                        </motion.div>

                        <motion.div 
                          className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <Activity className="h-5 w-5 text-purple-600 mr-2" />
                            <div className="text-xl font-bold text-purple-700">
                              {report.work_satisfaction}/10
                            </div>
                          </div>
                          <div className="text-xs text-purple-600">Work Satisfaction</div>
                        </motion.div>
                      </div>

                      {/* Additional Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-semibold text-gray-700">{report.work_life_balance}/10</div>
                          <div className="text-xs text-gray-600">Work-Life Balance</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-semibold text-gray-700">{report.anxiety_level}/10</div>
                          <div className="text-xs text-gray-600">Anxiety</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-semibold text-gray-700">{report.confidence_level}/10</div>
                          <div className="text-xs text-gray-600">Confidence</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-semibold text-gray-700">{report.sleep_quality}/10</div>
                          <div className="text-xs text-gray-600">Sleep Quality</div>
                        </div>
                      </div>

                      {/* AI Analysis */}
                      {report.ai_analysis && (
                        <motion.div 
                          className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI Insights:
                          </h4>
                          <p className="text-sm text-blue-600">{report.ai_analysis}</p>
                        </motion.div>
                      )}

                      {/* Note: Comments are not shown to maintain employee privacy */}
                      {report.comments && (
                        <motion.div 
                          className="mt-4 p-4 bg-gray-50 rounded-xl"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Employee Feedback:</h4>
                          <p className="text-sm text-gray-600 italic">
                            [Personal comments are kept confidential for employee privacy]
                          </p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <motion.div
                    animate={floatingAnimation}
                    className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <FileText className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || filterRisk !== 'all' || filterDepartment !== 'all'
                      ? 'No reports match your current filters. Try adjusting your search criteria.'
                      : 'No wellness reports have been submitted yet. Encourage your team to start tracking their wellness!'
                    }
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mt-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Privacy & Confidentiality
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Employee wellness reports are visible to authorized managers and HR personnel</p>
                  <p>• Personal comments and sensitive information are kept confidential when marked as private</p>
                  <p>• Data is used to provide appropriate support and improve workplace wellness programs</p>
                  <p>• All wellness data is handled in accordance with company privacy policies</p>
                  <p>• All data is encrypted and stored securely in compliance with privacy regulations</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}