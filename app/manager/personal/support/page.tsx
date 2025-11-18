'use client';

import { useUser } from '@/hooks/use-user';
import { withAuth } from '@/components/auth/with-auth';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Brain, 
  ArrowLeft, 
  Shield, 
  Phone, 
  MessageSquare, 
  AlertTriangle, 
  Heart, 
  Users, 
  Clock, 
  ExternalLink,
  Mail,
  Video,
  Calendar
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

function ManagerPersonalSupportPage() {
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
          <p className="text-lg text-gray-600">Loading support resources...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const emergencyContacts = [
    {
      name: 'National Suicide Prevention Lifeline',
      number: '988',
      description: '24/7 crisis support',
      type: 'emergency'
    },
    {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      description: 'Free 24/7 crisis counseling',
      type: 'text'
    },
    {
      name: 'SAMHSA National Helpline',
      number: '1-800-662-4357',
      description: 'Mental health and substance abuse',
      type: 'phone'
    }
  ];

  const supportResources = [
    {
      title: 'Leadership Stress Management',
      description: 'Specialized resources for managing the unique stresses of leadership roles',
      icon: Shield,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      actions: [
        { label: 'Access Resources', type: 'link' },
        { label: 'Schedule Consultation', type: 'calendar' }
      ]
    },
    {
      title: 'Executive Coaching',
      description: 'Professional coaching services for leadership development and wellness',
      icon: Users,
      color: 'bg-green-50 border-green-200 text-green-700',
      actions: [
        { label: 'Find a Coach', type: 'link' },
        { label: 'Book Session', type: 'calendar' }
      ]
    },
    {
      title: 'Peer Support Network',
      description: 'Connect with other managers facing similar challenges',
      icon: MessageSquare,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      actions: [
        { label: 'Join Network', type: 'link' },
        { label: 'Find Groups', type: 'link' }
      ]
    },
    {
      title: 'Work-Life Balance Counseling',
      description: 'Professional guidance on maintaining healthy boundaries as a leader',
      icon: Heart,
      color: 'bg-red-50 border-red-200 text-red-700',
      actions: [
        { label: 'Schedule Session', type: 'calendar' },
        { label: 'Learn More', type: 'link' }
      ]
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
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100">Support & Resources</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Leadership Wellness Support</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button variant="outline" size="sm" className="hidden lg:flex text-red-600 border-red-200 bg-red-50 text-xs px-2 sm:px-3">
                Support Center
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4">
              Leadership Support & Resources
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              Access specialized support resources designed for managers and leaders. Your mental health matters, and seeking help is a sign of strength.
            </p>
          </motion.div>
        </div>

        {/* Emergency Support */}
        <div className="mb-8">
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center text-red-900 dark:text-red-100">
                <AlertTriangle className="h-6 w-6 mr-3 text-red-600" />
                Emergency Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-800 dark:text-red-200 mb-4">
                If you're experiencing a mental health crisis or having thoughts of self-harm, please reach out immediately:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-700">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{contact.name}</h4>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">{contact.number}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{contact.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {supportResources.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className={`${resource.color} border-2 hover:shadow-lg transition-all duration-300`}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <resource.icon className="h-6 w-6 mr-3" />
                    {resource.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{resource.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {resource.actions.map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant="outline"
                        size="sm"
                        className="bg-white/80 hover:bg-white"
                      >
                        {action.type === 'calendar' && <Calendar className="h-4 w-4 mr-2" />}
                        {action.type === 'link' && <ExternalLink className="h-4 w-4 mr-2" />}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Internal Support */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <MessageSquare className="h-6 w-6 mr-3 text-green-600" />
                AI Wellness Companion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Chat with our AI companion designed specifically for leadership challenges and personal wellness.
              </p>
              <Link href="/manager/personal/chat">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Chat Session
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <Phone className="h-6 w-6 mr-3 text-blue-600" />
                Employee Assistance Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Access confidential counseling and support services through your company's EAP.
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Call EAP Hotline
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Video className="h-4 w-4 mr-2" />
                  Schedule Video Session
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Self-Care Resources */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
              <Heart className="h-6 w-6 mr-3 text-pink-600" />
              Leadership Self-Care Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Mindfulness for Leaders</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Meditation and mindfulness practices designed for busy executives.
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Access Resources
                </Button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Time Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Strategies for managing time and reducing overwhelm in leadership roles.
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Learn Strategies
                </Button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Leadership Resilience</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Building emotional resilience and managing leadership stress.
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Build Resilience
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Disclaimer:</strong> These resources are for informational purposes and do not replace professional medical advice. 
            If you're experiencing a mental health crisis, please contact emergency services or a mental health professional immediately.
          </p>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ManagerPersonalSupportPage, ['manager']);