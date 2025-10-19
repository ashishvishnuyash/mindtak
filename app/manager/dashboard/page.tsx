'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { ManagerDashboard } from '@/components/hierarchy/manager-dashboard';
import { withAuth } from '@/components/auth/with-auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Shield, 
  ArrowRight, 
  FileText, 
  BarChart3,
  Users,
  Building
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import type { User } from '@/types/index';

function ManagerDashboardPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const handleViewTeamMember = (employee: User) => {
    // Navigate to team member's profile or reports
    router.push(`/manager/team-member/${employee.id}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/auth/login');
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Loader2 className="h-16 w-16 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => router.push('/auth/login')}>
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-green-600 transition-colors">Wellness Hub</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manager Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button variant="outline" size="sm" className="text-green-600 border-green-200 bg-green-50 text-xs sm:text-sm px-2 sm:px-3">
                Management
              </Button>
              <Button variant="outline" size="sm" className="p-2">
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="p-2">
                <BarChart3 className="h-4 w-4" />
              </Button>
              <ThemeToggle size="sm" />
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-200"
                onClick={handleLogout}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent mb-3 sm:mb-4 tracking-tight leading-tight">
              Manager Dashboard
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 font-light leading-relaxed max-w-full sm:max-w-2xl">
              Manage your team and track their wellness progress with comprehensive insights and analytics.
            </p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-4 sm:space-x-6 md:space-x-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <button className="pb-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium">
              Dashboard
            </button>
            <Link href="/manager/wellness-hub">
              <button className="pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors">
                Wellness Toolkit
              </button>
            </Link>
            <Link href="/manager/org-chart">
              <button className="pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors">
                Org Chart
              </button>
            </Link>
            <Link href="/manager/team-reports">
              <button className="pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors">
                Team Reports
              </button>
            </Link>
          </div>
        </div>

        {/* Manager Dashboard Component */}
        <ManagerDashboard 
          manager={user} 
          onViewTeamMember={handleViewTeamMember}
        />
      </div>
    </div>
  );
}

export default withAuth(ManagerDashboardPage, ['manager', 'admin']);
