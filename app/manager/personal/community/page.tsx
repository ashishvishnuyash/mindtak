'use client';

import { useUser } from '@/hooks/use-user';
import { withAuth } from '@/components/auth/with-auth';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Brain, 
  ArrowLeft, 
  Shield, 
  Users,
  MessageSquare,
  Heart,
  TrendingUp,
  Clock,
  User,
  Globe,
  Lock,
  Plus,
  Eye,
  ThumbsUp,
  MessageCircle
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

function ManagerPersonalCommunityPage() {
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
          <p className="text-lg text-gray-600">Loading community...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const communityGroups = [
    {
      name: 'Leadership Wellness Circle',
      description: 'A safe space for managers to discuss leadership challenges and wellness strategies',
      members: 127,
      posts: 45,
      category: 'Leadership',
      privacy: 'private',
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    {
      name: 'Work-Life Balance Masters',
      description: 'Share tips and experiences on maintaining healthy work-life boundaries',
      members: 89,
      posts: 32,
      category: 'Balance',
      privacy: 'public',
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    {
      name: 'Stress Management for Leaders',
      description: 'Techniques and support for managing leadership stress and pressure',
      members: 156,
      posts: 67,
      category: 'Stress',
      privacy: 'private',
      color: 'bg-red-50 border-red-200 text-red-700'
    },
    {
      name: 'Mindful Management',
      description: 'Incorporating mindfulness and meditation into leadership practices',
      members: 73,
      posts: 28,
      category: 'Mindfulness',
      privacy: 'public',
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    }
  ];

  const recentPosts = [
    {
      author: 'Anonymous Manager',
      title: 'How do you handle team burnout while managing your own stress?',
      preview: 'I\'ve been struggling with my team showing signs of burnout, and I\'m feeling overwhelmed trying to support them while...',
      replies: 12,
      likes: 8,
      time: '2 hours ago',
      group: 'Leadership Wellness Circle'
    },
    {
      author: 'Anonymous Leader',
      title: 'Successful work-life boundary strategies that actually work',
      preview: 'After years of struggling with boundaries, I\'ve found some strategies that have really helped me maintain...',
      replies: 23,
      likes: 15,
      time: '4 hours ago',
      group: 'Work-Life Balance Masters'
    },
    {
      author: 'Anonymous Executive',
      title: 'Dealing with imposter syndrome in leadership roles',
      preview: 'Even after years in management, I sometimes feel like I don\'t belong or that I\'m not qualified enough...',
      replies: 18,
      likes: 22,
      time: '6 hours ago',
      group: 'Leadership Wellness Circle'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-950 dark:via-slate-900 dark:to-teal-950 text-gray-900 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/20 dark:bg-emerald-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-teal-300/20 dark:bg-teal-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <div className="border-b border-white/20 dark:border-gray-800/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 lg:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link href="/manager/personal">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100">Community</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Leadership Support Network</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button variant="outline" size="sm" className="hidden lg:flex text-teal-600 border-teal-200 bg-teal-50 text-xs px-2 sm:px-3">
                Community
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Leadership Community
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              Connect with fellow managers in a safe, anonymous environment. Share experiences, get support, and learn from other leaders facing similar challenges.
            </p>
          </motion.div>
        </div>

        {/* Privacy Notice */}
        <div className="mb-8">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Lock className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Anonymous & Confidential</h3>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    All community interactions are anonymous. Your identity is protected, and discussions remain confidential. 
                    Share openly in a judgment-free environment designed for leadership wellness support.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Community Groups */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Community Groups</h2>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>

            <div className="space-y-6">
              {communityGroups.map((group, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className={`${group.color} border-2 hover:shadow-lg transition-all duration-300 cursor-pointer`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{group.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {group.privacy === 'private' ? <Lock className="h-3 w-3 mr-1" /> : <Globe className="h-3 w-3 mr-1" />}
                              {group.privacy}
                            </Badge>
                          </div>
                          <p className="text-sm mb-4">{group.description}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{group.members} members</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{group.posts} posts</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-white/80 hover:bg-white">
                          {group.category}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" className="bg-white/80 hover:bg-white">
                        Join Group
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Recent Discussions</h2>
            
            <div className="space-y-4">
              {recentPosts.map((post, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                            <User className="h-4 w-4 text-gray-500" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{post.author}</p>
                            <Badge variant="outline" className="text-xs">{post.group}</Badge>
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                            {post.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {post.preview}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <ThumbsUp className="h-3 w-3" />
                                <span>{post.likes}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="h-3 w-3" />
                                <span>{post.replies}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{post.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Community Stats */}
            <Card className="mt-6 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border border-teal-200 dark:border-teal-700">
              <CardHeader>
                <CardTitle className="flex items-center text-teal-900 dark:text-teal-100">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Community Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-teal-700 dark:text-teal-300">Active Members</span>
                    <span className="font-semibold text-teal-900 dark:text-teal-100">445</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-teal-700 dark:text-teal-300">Posts This Week</span>
                    <span className="font-semibold text-teal-900 dark:text-teal-100">127</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-teal-700 dark:text-teal-300">Support Given</span>
                    <span className="font-semibold text-teal-900 dark:text-teal-100">892</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="mt-6 space-y-3">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Start New Discussion
              </Button>
              <Button variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Browse All Posts
              </Button>
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="mt-8">
          <Card className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                Community Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Be Respectful</h4>
                  <p>Treat all community members with respect and empathy. We're all here to support each other.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Stay Anonymous</h4>
                  <p>Protect your privacy and others'. Avoid sharing identifying information about yourself or your company.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Share Constructively</h4>
                  <p>Focus on helpful, constructive contributions that support leadership wellness and growth.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Seek Professional Help</h4>
                  <p>For serious mental health concerns, please consult with qualified professionals.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ManagerPersonalCommunityPage, ['manager']);