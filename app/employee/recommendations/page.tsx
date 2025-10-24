'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import EmployeeNavbar from '@/components/shared/EmployeeNavbar';
import { Button } from '@/components/ui/button';
import { Brain, ArrowRight } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { auth } from '@/lib/firebase';
import AIRecommendations from '@/components/recommendations/AIRecommendations';

export default function EmployeeRecommendationsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
      return;
    }

    if (user?.role !== 'employee') {
      return;
    }
  }, [user, userLoading, router]);

  if (userLoading) {
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
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading AI recommendations...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden transition-colors duration-300">
      <EmployeeNavbar user={user} />

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 lg:px-8">
        <div className="flex space-x-3 sm:space-x-4 md:space-x-6 lg:space-x-8 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => router.push('/employee/dashboard')}
            className="pb-2 sm:pb-3 lg:pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0"
          >
            Overview
          </button>
          <button
            onClick={() => router.push('/employee/reports')}
            className="pb-2 sm:pb-3 lg:pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0"
          >
            Analytics
          </button>
          <button
            onClick={() => router.push('/employee/chat')}
            className="pb-2 sm:pb-3 lg:pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0"
          >
            AI Friend
          </button>
          <button
            onClick={() => router.push('/employee/support')}
            className="pb-2 sm:pb-3 lg:pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0"
          >
            Support
          </button>
          <button className="pb-2 sm:pb-3 lg:pb-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0">
            Recommendations
          </button>
          <button
            onClick={() => router.push('/employee/gamification')}
            className="pb-2 sm:pb-3 lg:pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0"
          >
            Gamification
          </button>
          <button
            onClick={() => router.push('/employee/community')}
            className="pb-2 sm:pb-3 lg:pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0"
          >
            Community
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <AIRecommendations />
      </div>
    </div>
  );
}


