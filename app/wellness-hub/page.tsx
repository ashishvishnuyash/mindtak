'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WellnessHubRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect immediately to login page
    router.push('/auth/login');
  }, [router]);

  // Show a simple loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
      </div>
    </div>
  );
}