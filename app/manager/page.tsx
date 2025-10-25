'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Building,
  ArrowRight,
  Brain,
  Users,
  BarChart3,
  MessageSquare,
  Heart,
  TrendingUp,
  Shield,
  LogOut,
  Sparkles,
  Award,
  AlertTriangle
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { auth } from '@/lib/firebase';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function ManagerSelectionPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [demoUser, setDemoUser] = useState<any>(null);

  // Use either real user or demo user
  const currentUser = user || demoUser;

  useEffect(() => {
    // Check if this is demo mode (no real authentication)
    if (!userLoading && !user) {
      // Create a demo user for the manager selection
      const demoDemoUser = {
        id: 'demo-manager-123',
        email: 'demo.manager@company.com',
        first_name: 'Demo',
        last_name: 'Manager',
        role: 'manager',
        company_id: 'demo-company-123',
        department: 'Management'
      };
      setDemoUser(demoDemoUser);
    }
  }, [user, userLoading]);

  if (userLoading && !demoUser) {
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
          <p className="text-lg text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const dashboardOptions = [
    {
      id: 'personal',
      title: 'Personal Dashboard',
      description: 'Your personal wellness overview, AI friend, and wellness tools',
      icon: User,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700',
      features: [
        'Personal wellness tracking',
        'AI mental health support',
        'Community & gamification',
        'Personal analytics & insights'
      ],
      route: '/manager/personal'
    },
    {
      id: 'management',
      title: 'Management Dashboard',
      description: 'Team management, analytics, and organizational insights',
      icon: Building,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700',
      features: [
        'Team management & oversight',
        'Employee wellness tracking',
        'Organizational analytics',
        'Team reports & insights'
      ],
      route: '/manager/dashboard'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">WellnessHub</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manager Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs sm:text-sm px-2 sm:px-3">
                {currentUser.role?.charAt(0).toUpperCase() + currentUser.role?.slice(1)}
              </Badge>
              <ThemeToggle size="sm" />
              <Button 
                variant="outline" 
                size="sm" 
                className="text-green-600 border-green-200"
                onClick={() => {
                  if (user) {
                    // Real user - sign out from Firebase
                    auth.signOut();
                    router.push('/auth/login');
                  } else {
                    // Demo user - go back to demo login
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

      <div className="max-w-6xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4 leading-tight">
            Welcome back, {currentUser.first_name || currentUser.email}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose your dashboard view to access your personal wellness tools or manage your team's wellness program.
          </p>
        </motion.div>

        {/* Dashboard Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {dashboardOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card
                className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer ${option.color.replace('text-', 'border-').replace('bg-', 'border-')} h-full`}
                onClick={() => router.push(option.route)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${option.color}`}>
                    <option.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{option.title}</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400">{option.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Key Features:</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      {option.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full" size="lg">
                    <span>Access {option.title}</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/50 dark:to-green-950/50 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Dual Dashboard Experience
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get the best of both worlds with separate personal wellness and team management insights
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Personal Wellness</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track your own mental health</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Team Management</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monitor team wellness</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Real-time Analytics</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Live updates and insights</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}