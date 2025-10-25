'use client';

import { useUser } from '@/hooks/use-user';
import { withAuth } from '@/components/auth/with-auth';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Brain, 
  ArrowLeft, 
  Shield, 
  Sparkles,
  Target,
  TrendingUp,
  Heart,
  Users,
  Clock,
  Lightbulb,
  CheckCircle
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

function ManagerPersonalRecommendationsPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) {
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
          <p className="text-lg text-gray-600">Loading recommendations...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const recommendations = [
    {
      category: 'Leadership Wellness',
      icon: Shield,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      items: [
        'Schedule regular one-on-ones with your team to reduce communication stress',
        'Block 30 minutes daily for strategic thinking and planning',
        'Practice delegation to reduce your workload and develop your team',
        'Set clear boundaries between work and personal time'
      ]
    },
    {
      category: 'Stress Management',
      icon: Heart,
      color: 'bg-red-50 border-red-200 text-red-700',
      items: [
        'Try the 4-7-8 breathing technique during stressful moments',
        'Take a 5-minute walk between meetings to reset your mind',
        'Use the Pomodoro technique for focused work sessions',
        'Practice saying "no" to non-essential commitments'
      ]
    },
    {
      category: 'Team Support',
      icon: Users,
      color: 'bg-green-50 border-green-200 text-green-700',
      items: [
        'Check in with team members about their workload and wellbeing',
        'Recognize and celebrate team achievements regularly',
        'Create psychological safety for open communication',
        'Provide growth opportunities and learning resources'
      ]
    },
    {
      category: 'Personal Development',
      icon: TrendingUp,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      items: [
        'Read leadership books for 15 minutes daily',
        'Join a leadership peer group or mastermind',
        'Seek feedback from your team and peers regularly',
        'Invest in executive coaching or mentoring'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100">AI Recommendations</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Personalized Leadership Tips</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button variant="outline" size="sm" className="hidden lg:flex text-indigo-600 border-indigo-200 bg-indigo-50 text-xs px-2 sm:px-3">
                Recommendations
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Personalized Leadership Recommendations
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              AI-powered recommendations tailored to your leadership style and wellness needs. These suggestions are based on best practices for manager wellbeing.
            </p>
          </motion.div>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {recommendations.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className={`${category.color} border-2 hover:shadow-lg transition-all duration-300`}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <category.icon className="h-6 w-6 mr-3" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start space-x-3 p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700">
            <CardContent className="p-6 text-center">
              <Lightbulb className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Get More Tips</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Chat with our AI for personalized recommendations
              </p>
              <Link href="/manager/personal/chat">
                <Button variant="outline" size="sm" className="bg-white/80 hover:bg-white">
                  Chat with AI
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700">
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Track Progress</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Create wellness reports to track your improvement
              </p>
              <Link href="/manager/personal/reports/new">
                <Button variant="outline" size="sm" className="bg-white/80 hover:bg-white">
                  Create Report
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Daily Reminders</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Set up daily wellness reminders and check-ins
              </p>
              <Button variant="outline" size="sm" className="bg-white/80 hover:bg-white">
                Set Reminders
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Note:</strong> These recommendations are AI-generated suggestions based on general leadership wellness best practices. 
            For personalized advice, consider consulting with a professional coach or counselor.
          </p>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ManagerPersonalRecommendationsPage, ['manager']);