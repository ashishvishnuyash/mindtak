'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from 'recharts';
import {
  Heart,
  Brain,
  Zap,
  Moon,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Target,
  Activity,
  Smile,
  MessageSquare,
  Bell,
  Settings,
} from 'lucide-react';

export interface WellnessMetrics {
  moodRating: number;
  stressLevel: number;
  energyLevel: number;
  sleepQuality: number;
  workSatisfaction: number;
  socialConnection: number;
  workLifeBalance: number;
  overallWellness: number;
}

export interface WellnessTrend {
  date: string;
  metrics: WellnessMetrics;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface WellnessInsight {
  id: string;
  type: 'positive' | 'warning' | 'recommendation';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface WellnessDashboardProps {
  currentMetrics: WellnessMetrics;
  weeklyTrend: WellnessTrend[];
  monthlyPattern: WellnessTrend[];
  insights: WellnessInsight[];
  onStartChat: () => void;
  onCreateReport: () => void;
  onViewReports: () => void;
}

const MetricCard = ({ 
  title, 
  value, 
  maxValue = 10, 
  icon: Icon, 
  color, 
  trend, 
  description 
}: {
  title: string;
  value: number;
  maxValue?: number;
  icon: React.ElementType;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}) => {
  const percentage = (value / maxValue) * 100;
  
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getColorClass = (value: number, maxValue: number) => {
    const ratio = value / maxValue;
    if (ratio >= 0.8) return 'text-green-600';
    if (ratio >= 0.6) return 'text-blue-600';
    if (ratio >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                {description && (
                  <p className="text-sm text-gray-600">{description}</p>
                )}
              </div>
            </div>
            {getTrendIcon()}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-3xl font-bold ${getColorClass(value, maxValue)}`}>
                {value.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">/ {maxValue}</span>
            </div>
            
            <Progress 
              value={percentage} 
              className="h-2"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const InsightCard = ({ insight }: { insight: WellnessInsight }) => {
  const getIcon = () => {
    switch (insight.type) {
      case 'positive': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'recommendation': return <Target className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (insight.type) {
      case 'positive': return 'border-green-200';
      case 'warning': return 'border-yellow-200';
      case 'recommendation': return 'border-blue-200';
    }
  };

  const getBgColor = () => {
    switch (insight.type) {
      case 'positive': return 'bg-green-50';
      case 'warning': return 'bg-yellow-50';
      case 'recommendation': return 'bg-blue-50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${getBorderColor()} ${getBgColor()}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {getIcon()}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
              {insight.actionable && (
                <Badge variant="outline" className="text-xs">
                  Actionable
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function WellnessDashboard({
  currentMetrics,
  weeklyTrend,
  monthlyPattern,
  insights,
  onStartChat,
  onCreateReport,
  onViewReports,
}: WellnessDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month'>('week');
  const [selectedMetric, setSelectedMetric] = useState<keyof WellnessMetrics>('overallWellness');

  const chartData = selectedTimeframe === 'week' ? weeklyTrend : monthlyPattern;

  const radarData = [
    { metric: 'Mood', value: currentMetrics.moodRating, fullMark: 10 },
    { metric: 'Energy', value: currentMetrics.energyLevel, fullMark: 10 },
    { metric: 'Sleep', value: currentMetrics.sleepQuality, fullMark: 10 },
    { metric: 'Work Satisfaction', value: currentMetrics.workSatisfaction, fullMark: 10 },
    { metric: 'Social Connection', value: currentMetrics.socialConnection, fullMark: 10 },
    { metric: 'Work-Life Balance', value: currentMetrics.workLifeBalance, fullMark: 10 },
  ];

  const getOverallStatus = () => {
    const overall = currentMetrics.overallWellness;
    if (overall >= 8) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (overall >= 6) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (overall >= 4) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Needs Attention', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const status = getOverallStatus();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wellness Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Track your mental health journey and discover insights about your wellbeing.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button onClick={onStartChat} className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Chat with AI</span>
          </Button>
          <Button variant="outline" onClick={onCreateReport}>
            <Heart className="h-4 w-4 mr-2" />
            New Check-in
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Overall Wellness: {currentMetrics.overallWellness.toFixed(1)}/10
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={`${status.bg} ${status.color} border-0`}>
                      {status.label}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Based on your recent check-ins
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-2">Last updated</div>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onCreateReport}>
            <CardContent className="p-6 text-center">
              <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Daily Check-in</h3>
              <p className="text-sm text-gray-600">Record your current wellness state</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onStartChat}>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">AI Support</h3>
              <p className="text-sm text-gray-600">Chat with your wellness assistant</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onViewReports}>
            <CardContent className="p-6 text-center">
              <Activity className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">View Progress</h3>
              <p className="text-sm text-gray-600">See your wellness journey</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Mood Rating"
          value={currentMetrics.moodRating}
          icon={Smile}
          color="bg-yellow-500"
          description="How you're feeling today"
        />
        <MetricCard
          title="Stress Level"
          value={10 - currentMetrics.stressLevel} // Invert for better UX
          icon={Brain}
          color="bg-red-500"
          description="Your current stress state"
        />
        <MetricCard
          title="Energy Level"
          value={currentMetrics.energyLevel}
          icon={Zap}
          color="bg-orange-500"
          description="Physical and mental energy"
        />
        <MetricCard
          title="Sleep Quality"
          value={currentMetrics.sleepQuality}
          icon={Moon}
          color="bg-purple-500"
          description="How well you slept"
        />
        <MetricCard
          title="Social Connection"
          value={currentMetrics.socialConnection}
          icon={Users}
          color="bg-green-500"
          description="Feeling connected to others"
        />
        <MetricCard
          title="Work-Life Balance"
          value={currentMetrics.workLifeBalance}
          icon={Target}
          color="bg-blue-500"
          description="Balance between work and personal life"
        />
      </div>

      {/* Charts Section */}
      <Tabs value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as 'week' | 'month')}>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Wellness Trends</h2>
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Wellness Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="metrics.overallWellness"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    name="Overall Wellness"
                  />
                  <Area
                    type="monotone"
                    dataKey="metrics.moodRating"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.3}
                    name="Mood"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Current Wellness Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} />
                  <Radar
                    name="Current"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </Tabs>

      {/* Insights Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <InsightCard insight={insight} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Upcoming Check-ins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Upcoming Check-ins</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Daily Wellness Check</p>
                  <p className="text-sm text-gray-600">Scheduled for tomorrow at 9:00 AM</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Heart className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Weekly Reflection</p>
                  <p className="text-sm text-gray-600">Scheduled for Friday at 5:00 PM</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}