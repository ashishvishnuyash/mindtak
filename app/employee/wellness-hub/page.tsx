'use client';

import { useUser } from '@/hooks/use-user';
import { withAuth } from '@/components/auth/with-auth';
import WellnessHub from '@/components/wellness-hub/WellnessHub';
import { motion } from 'framer-motion';
import { Loader2, Brain } from 'lucide-react';

function EmployeeWellnessHubPage() {
  const { user, loading } = useUser();

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
          <p className="text-lg text-gray-600">Loading wellness hub...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <WellnessHub userRole="employee" userId={user.id} />;
}

export default withAuth(EmployeeWellnessHubPage, ['employee']);