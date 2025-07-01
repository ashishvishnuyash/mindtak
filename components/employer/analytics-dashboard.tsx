'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Brain,
  Heart,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
} from 'lucide-react';

export interface TeamMetrics {
  totalEmployees: number;
  activeEmployees: number;
  averageWellness: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  engagementRate: number;
  responseRate: number;
}

export interface DepartmentMetrics {
  name: string;
  employeeCount: number;
  averageWellness: number;
  averageStress: number;
  riskLevel: 'low' | 'medium' | 'high';
  trend: 'up' | 'down' | 'stable';
}

export interface TrendData {
  date: string;
  wellness: number;
  stress: number;
  engagement: number;
  responseRate: number;
}

export interface RiskAlert {
  id: string;
  level: 'medium' | 'high' | 'critical';
  department: string;
  description: string;
  affectedEmployees: number;
  timestamp: Date;
  actionRequired: boolean;
}

export interface AnalyticsDashboardProps {
  teamMetrics: TeamMetrics;
  departmentMetrics: DepartmentMetrics[];
  trendData: TrendData[];
  riskAlerts: RiskAlert[];
  onExportData: () => void;
  onRefreshData: () => void;
}

const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color,
  format = 'number'
}: {
  title: string;
  value: number;
  change?: number;
  icon: React.ElementType;
  color: string;
  format?: 'number' | 'percentage' | 'decimal';
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage': return `${val}%`;
      case 'decimal': return val.toFixed(1);
      default: return val.toString();
    }
  };

  const getChangeColor = (change?: number) => {
    if (!change) return 'text-gray-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return null;
    return change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
              </div>
            </div>
            {change !== undefined && (
              <div className={`flex items-center space-x-1 ${getChangeColor(change)}`}>
                {getChangeIcon(change)}
                <span className="text-sm font-medium">
                  {Math.abs(change).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const RiskAlertCard = ({ alert }: { alert: RiskAlert }) => {
  const getAlertColor = (level: RiskAlert['level']) => {
    switch (level) {
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'high': return 'border-orange-200 bg-orange-50';
      case 'critical': return 'border-red-200 bg-red-50';
    }
  };

  const getAlertIcon = (level: RiskAlert['level']) => {
    switch (level) {
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  const getBadgeColor = (level: RiskAlert['level']) => {
    switch (level) {
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={getAlertColor(alert.level)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {getAlertIcon(alert.level)}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge className={getBadgeColor(alert.level)}>
                    {alert.level.toUpperCase()}
                  </Badge>
                  <span className="text-sm font-medium text-gray-900">
                    {alert.department}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-600">
                  <span>{alert.affectedEmployees} employees affected</span>
                  <span>{new Date(alert.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            {alert.actionRequired && (
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Review
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DepartmentCard = ({ department }: { department: DepartmentMetrics }) => {
  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <div className="h-4 w-4" />; // Empty space
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{department.name}</h3>
          {getTrendIcon(department.trend)}
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Employees</span>
            <span className="font-medium">{department.employeeCount}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Avg Wellness</span>
            <span className="font-medium">{department.averageWellness.toFixed(1)}/10</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Avg Stress</span>
            <span className="font-medium">{department.averageStress.toFixed(1)}/10</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Risk Level</span>
            <Badge className={getRiskColor(department.riskLevel)}>
              {department.riskLevel.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function AnalyticsDashboard({
  teamMetrics,
  departmentMetrics,
  trendData,
  riskAlerts,
  onExportData,
  onRefreshData,
}: AnalyticsDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('wellness');

  const riskData = [
    { name: 'Low Risk', value: teamMetrics.riskDistribution.low, color: '#10B981' },
    { name: 'Medium Risk', value: teamMetrics.riskDistribution.medium, color: '#F59E0B' },
    { name: 'High Risk', value: teamMetrics.riskDistribution.high, color: '#EF4444' },
  ];

  const departmentChartData = departmentMetrics.map(dept => ({
    name: dept.name,
    wellness: dept.averageWellness,
    stress: dept.averageStress,
    employees: dept.employeeCount,
  }));

  const criticalAlerts = riskAlerts.filter(alert => alert.level === 'critical');
  const highAlerts = riskAlerts.filter(alert => alert.level === 'high');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into your team's mental health and wellness trends.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={onRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={onExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {(criticalAlerts.length > 0 || highAlerts.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span>Urgent Attention Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {criticalAlerts.map(alert => (
                  <RiskAlertCard key={alert.id} alert={alert} />
                ))}
                {highAlerts.slice(0, 2).map(alert => (
                  <RiskAlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Employees"
          value={teamMetrics.totalEmployees}
          icon={Users}
          color="bg-blue-500"
        />
        <MetricCard
          title="Average Wellness"
          value={teamMetrics.averageWellness}
          icon={Brain}
          color="bg-green-500"
          format="decimal"
        />
        <MetricCard
          title="Engagement Rate"
          value={teamMetrics.engagementRate}
          icon={Heart}
          color="bg-purple-500"
          format="percentage"
        />
        <MetricCard
          title="Response Rate"
          value={teamMetrics.responseRate}
          icon={Activity}
          color="bg-orange-500"
          format="percentage"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departmentMetrics.map(dept => (
                  <SelectItem key={dept.name} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wellness">Wellness</SelectItem>
                <SelectItem value="stress">Stress</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Wellness Trends Over Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="wellness"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  name="Wellness"
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                  name="Engagement"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5" />
              <span>Risk Level Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {riskData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Department Comparison</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={departmentChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Bar dataKey="wellness" fill="#10B981" name="Avg Wellness" />
              <Bar dataKey="stress" fill="#EF4444" name="Avg Stress" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Details */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Department Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departmentMetrics.map((department, index) => (
            <motion.div
              key={department.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <DepartmentCard department={department} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* All Risk Alerts */}
      {riskAlerts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk Alerts</h2>
          <div className="space-y-4">
            {riskAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RiskAlertCard alert={alert} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Privacy & Confidentiality</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• All employee data is anonymized and aggregated to protect individual privacy</p>
                <p>• Personal identifiers and individual responses are never displayed</p>
                <p>• Only statistical trends and patterns are shown for organizational insights</p>
                <p>• All data is encrypted and stored securely in compliance with privacy regulations</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}