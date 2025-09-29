'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Navbar } from '@/components/shared/navbar';
import { ManagerDashboard } from '@/components/hierarchy/manager-dashboard';
import { withAuth } from '@/components/auth/with-auth';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import type { User } from '@/types/index';

function ManagerDashboardPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const handleViewTeamMember = (employee: User) => {
    // Navigate to team member's profile or reports
    router.push(`/manager/team-member/${employee.id}`);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Loader2 className="h-16 w-16 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar user={undefined} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You must be logged in to access this page.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <Navbar user={user} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ManagerDashboard 
          manager={user} 
          onViewTeamMember={handleViewTeamMember}
        />
      </div>
    </div>
  );
}

export default withAuth(ManagerDashboardPage, ['manager', 'admin']);
