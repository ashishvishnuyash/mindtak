'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Download,
  Printer,
  FileText,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3,
  Loader2,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { Navbar } from '@/components/shared/navbar';
import { PDFExportService, extractChartElements, generateAnalyticsFromReports } from '@/lib/pdf-export-service';
import type { MentalHealthReport, User } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  teal: '#14B8A6'
};

interface ExportReportData {
  reports: MentalHealthReport[];
  employees: User[];
  analytics: {
    totalReports: number;
    avgWellness: number;
    riskDistribution: { [key: string]: number };
    departmentStats: { [key: string]: any };
    trendData: any[];
  };
  config: {
    title: string;
    subtitle?: string;
    dateRange: { start: string; end: string };
    filters?: any;
  };
}

export default function ExportReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [data, setData] = useState<ExportReportData | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadReportData();
    }
  }, [user, userLoading, router]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Get parameters from URL
      const reportType = searchParams.get('type') || 'company';
      const dateRange = searchParams.get('range') || '30d';
      const department = searchParams.get('department') || 'all';
      const riskLevel = searchParams.get('risk') || 'all';
      
      if (!user?.company_id) {
        toast.error('Company information not found');
        return;
      }

      // Calculate date range
      const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Fetch employees
      const employeesQuery = query(
        collection(db, 'users'),
        where('company_id', '==', user.company_id)
      );
      const employeesSnapshot = await getDocs(employeesQuery);
      const employees = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];

      // Fetch reports
      const reportsQuery = query(
        collection(db, 'mental_health_reports'),
        where('company_id', '==', user.company_id)
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      const allReports = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MentalHealthReport[];

      // Filter reports by date range
      const filteredReports = allReports.filter(report => {
        const reportDate = new Date(report.created_at);
        return reportDate >= startDate && reportDate <= endDate;
      });

      // Apply additional filters
      let finalReports = filteredReports;
      
      // For employee reports, only show current user's reports
      if (reportType === 'employee') {
        finalReports = finalReports.filter(report => report.employee_id === user.id);
      } else if (department !== 'all') {
        const deptEmployees = employees.filter(emp => emp.department === department);
        const deptEmployeeIds = deptEmployees.map(emp => emp.id);
        finalReports = finalReports.filter(report => deptEmployeeIds.includes(report.employee_id));
      }
      
      if (riskLevel !== 'all') {
        finalReports = finalReports.filter(report => report.risk_level === riskLevel);
      }

      // Generate analytics
      const analytics = generateAnalyticsFromReports(finalReports, employees);

      // Create report config
      const config = {
        title: `${reportType === 'company' ? 'Company' : 'Team'} Wellness Report`,
        subtitle: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        filters: {
          department: department !== 'all' ? [department] : undefined,
          riskLevel: riskLevel !== 'all' ? [riskLevel] : undefined
        }
      };

      setData({
        reports: finalReports,
        employees,
        analytics,
        config
      });

    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!data || !reportRef.current) return;

    try {
      setExporting(true);
      
      // Extract chart elements
      const chartElements = extractChartElements('report-content');
      
      // Generate PDF
      const pdfService = new PDFExportService();
      const pdfBlob = await pdfService.generateReportPDF(
        {
          title: data.config.title,
          subtitle: data.config.subtitle,
          includeCharts: true,
          includeRawData: true,
          includeAnalytics: true,
          dateRange: data.config.dateRange,
          filters: data.config.filters
        },
        {
          reports: data.reports,
          employees: data.employees,
          analytics: data.analytics
        },
        chartElements
      );

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wellness-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PDF report downloaded successfully!');

    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF report');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load report data</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{data.config.title}</h1>
              <p className="text-gray-600 mt-2">{data.config.subtitle}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleExportPDF}
                disabled={exporting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export PDF
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="border-gray-300"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                onClick={loadReportData}
                variant="outline"
                className="border-gray-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div id="report-content" ref={reportRef} className="space-y-8">
          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{data.analytics.totalReports}</div>
                  <div className="text-sm text-gray-600">Total Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{data.analytics.avgWellness.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Avg Wellness Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{data.analytics.riskDistribution.high || 0}</div>
                  <div className="text-sm text-gray-600">High Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{data.analytics.riskDistribution.medium || 0}</div>
                  <div className="text-sm text-gray-600">Medium Risk</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Wellness Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Wellness Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div data-chart-title="Wellness Trends Over Time" className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.analytics.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="mood" stroke={COLORS.primary} strokeWidth={2} />
                      <Line type="monotone" dataKey="stress" stroke={COLORS.danger} strokeWidth={2} />
                      <Line type="monotone" dataKey="energy" stroke={COLORS.success} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Risk Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Level Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div data-chart-title="Risk Level Distribution" className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(data.analytics.riskDistribution).map(([level, count]) => ({
                          name: level.charAt(0).toUpperCase() + level.slice(1),
                          value: count
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(data.analytics.riskDistribution).map(([level], index) => (
                          <Cell key={`cell-${index}`} fill={
                            level === 'high' ? COLORS.danger :
                            level === 'medium' ? COLORS.warning :
                            COLORS.success
                          } />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Department Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Department Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div data-chart-title="Department Wellness Comparison" className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(data.analytics.departmentStats).map(([dept, stats]) => ({
                      department: dept,
                      wellness: stats.avgWellness || 0,
                      employees: stats.count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="wellness" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Report Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div data-chart-title="Daily Report Volume" className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.analytics.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="reports" stroke={COLORS.purple} fill={COLORS.purple} fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Risk Level Breakdown</h3>
                  <div className="space-y-3">
                    {Object.entries(data.analytics.riskDistribution).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            level === 'high' ? 'destructive' :
                            level === 'medium' ? 'default' :
                            'secondary'
                          }>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{count} reports</div>
                          <div className="text-sm text-gray-600">
                            {((count as number / data.analytics.totalReports) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Department Performance</h3>
                  <div className="space-y-3">
                    {Object.entries(data.analytics.departmentStats).map(([dept, stats]) => (
                      <div key={dept} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{dept}</span>
                          <span className="text-sm text-gray-600">{stats.count} employees</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={stats.avgWellness ? (stats.avgWellness / 10) * 100 : 0} 
                            className="flex-1"
                          />
                          <span className="text-sm font-medium w-12 text-right">
                            {stats.avgWellness?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Employee</th>
                      <th className="text-left py-2">Mood</th>
                      <th className="text-left py-2">Stress</th>
                      <th className="text-left py-2">Energy</th>
                      <th className="text-left py-2">Wellness</th>
                      <th className="text-left py-2">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.reports.slice(0, 10).map((report) => {
                      const employee = data.employees.find(emp => emp.id === report.employee_id);
                      return (
                        <tr key={report.id} className="border-b">
                          <td className="py-2">{new Date(report.created_at).toLocaleDateString()}</td>
                          <td className="py-2">
                            {employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown'}
                          </td>
                          <td className="py-2">{report.mood_rating}</td>
                          <td className="py-2">{report.stress_level}</td>
                          <td className="py-2">{report.energy_level}</td>
                          <td className="py-2">{report.overall_wellness}</td>
                          <td className="py-2">
                            <Badge variant={
                              report.risk_level === 'high' ? 'destructive' :
                              report.risk_level === 'medium' ? 'default' :
                              'secondary'
                            }>
                              {report.risk_level}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {data.reports.length > 10 && (
                  <div className="text-center mt-4 text-gray-600">
                    ... and {data.reports.length - 10} more reports
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
          }
          
          .container {
            max-width: none !important;
            padding: 0 !important;
          }
          
          .card {
            break-inside: avoid;
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
        }
      `}</style>
    </div>
  );
}
