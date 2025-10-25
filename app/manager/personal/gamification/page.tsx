'use client';

import { useUser } from '@/hooks/use-user';
import { withAuth } from '@/components/auth/with-auth';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Brain, 
  ArrowLeft, 
  Shield, 
  Award,
  Trophy,
  Star,
  Target,
  Zap,
  Crown,
  Medal,
  Gift,
  TrendingUp
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

function ManagerPersonalGamificationPage() {
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
          <p className="text-lg text-gray-600">Loading gamification...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const achievements = [
    { name: 'Wellness Warrior', description: 'Complete 5 wellness reports', icon: Trophy, earned: true, points: 100 },
    { name: 'Leadership Mentor', description: 'Support team wellness for 30 days', icon: Crown, earned: true, points: 200 },
    { name: 'Stress Buster', description: 'Maintain low stress levels for a week', icon: Zap, earned: false, points: 150 },
    { name: 'Balance Master', description: 'Achieve work-life balance score of 8+', icon: Star, earned: false, points: 175 },
    { name: 'Team Champion', description: 'Help 10 team members improve wellness', icon: Medal, earned: false, points: 250 },
    { name: 'Mindful Leader', description: 'Complete 30 days of mindfulness practice', icon: Brain, earned: false, points: 300 }
  ];

  const challenges = [
    {
      name: 'Weekly Wellness Check',
      description: 'Complete wellness reports for 7 consecutive days',
      progress: 3,
      total: 7,
      reward: '50 points + Consistency Badge',
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    {
      name: 'Leadership Resilience',
      description: 'Maintain high confidence levels while managing team stress',
      progress: 1,
      total: 5,
      reward: '100 points + Resilient Leader Badge',
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    {
      name: 'Team Wellness Champion',
      description: 'Encourage team members to complete wellness activities',
      progress: 2,
      total: 10,
      reward: '200 points + Team Champion Badge',
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    }
  ];

  const totalPoints = achievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0);
  const level = Math.floor(totalPoints / 100) + 1;
  const nextLevelPoints = level * 100;
  const progressToNextLevel = ((totalPoints % 100) / 100) * 100;

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
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                <Award className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100">Gamification</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Wellness Achievements</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button variant="outline" size="sm" className="hidden lg:flex text-yellow-600 border-yellow-200 bg-yellow-50 text-xs px-2 sm:px-3">
                Level {level}
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              Leadership Wellness Gamification
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              Earn points, unlock achievements, and level up your leadership wellness journey. Make personal growth fun and engaging!
            </p>
          </motion.div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-700">
            <CardContent className="p-6 text-center">
              <Crown className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">Level {level}</div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Leadership Level</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700">
            <CardContent className="p-6 text-center">
              <Star className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalPoints}</div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Total Points</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700">
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{achievements.filter(a => a.earned).length}</div>
              <p className="text-sm text-green-700 dark:text-green-300">Achievements</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700">
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{challenges.length}</div>
              <p className="text-sm text-purple-700 dark:text-purple-300">Active Challenges</p>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Level Progress</h3>
              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                {nextLevelPoints - totalPoints} points to Level {level + 1}
              </Badge>
            </div>
            <Progress value={progressToNextLevel} className="w-full h-3" />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
              <span>Level {level}</span>
              <span>{totalPoints} / {nextLevelPoints} points</span>
              <span>Level {level + 1}</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Challenges */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Active Challenges</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {challenges.map((challenge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className={`${challenge.color} border-2 hover:shadow-lg transition-all duration-300`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{challenge.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{challenge.description}</p>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{challenge.progress}/{challenge.total}</span>
                      </div>
                      <Progress value={(challenge.progress / challenge.total) * 100} className="w-full" />
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg">
                      <p className="text-sm font-medium">Reward: {challenge.reward}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className={`border-2 hover:shadow-lg transition-all duration-300 ${
                  achievement.earned 
                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-700' 
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                }`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      achievement.earned 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      <achievement.icon className={`h-8 w-8 ${
                        achievement.earned 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                    </div>
                    <h3 className={`font-semibold mb-2 ${
                      achievement.earned 
                        ? 'text-green-900 dark:text-green-100' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {achievement.name}
                    </h3>
                    <p className={`text-sm mb-3 ${
                      achievement.earned 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                    <Badge variant={achievement.earned ? 'default' : 'outline'} className={
                      achievement.earned 
                        ? 'bg-green-600 text-white' 
                        : 'text-gray-500 border-gray-300'
                    }>
                      {achievement.points} points
                    </Badge>
                    {achievement.earned && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          Earned!
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700">
            <CardContent className="p-8">
              <Gift className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Keep Growing Your Leadership Wellness!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                Complete wellness reports, engage with your team, and practice self-care to unlock more achievements and level up your leadership journey.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/manager/personal/reports/new">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Create Wellness Report
                  </Button>
                </Link>
                <Link href="/manager/personal/chat">
                  <Button variant="outline">
                    <Brain className="h-4 w-4 mr-2" />
                    Chat with AI Coach
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ManagerPersonalGamificationPage, ['manager']);