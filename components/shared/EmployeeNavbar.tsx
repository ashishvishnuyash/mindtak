'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

import { auth } from '@/lib/firebase';
import {
  Menu,
  X,
  LogOut
} from 'lucide-react';

interface EmployeeNavbarProps {
  user?: {
    first_name?: string;
    last_name?: string;
    email: string;
    role?: string;
    company_name?: string;
  };
}

export default function EmployeeNavbar({ user }: EmployeeNavbarProps) {
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    auth.signOut();
    router.push('/auth/login');
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">D</span>
            </div>
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700">Diltak.ai</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <Link href="/employee/dashboard">
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2">
                Dashboard
              </Button>
            </Link>

            <Link href="/employee/chat">
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2">
                AI Chat
              </Button>
            </Link>

            <Link href="/employee/reports">
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2">
                Reports
              </Button>
            </Link>

            <Link href="/employee/wellness-hub">
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2">
                Wellness
              </Button>
            </Link>

            {/* User Actions */}
            <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-gray-700 pl-4">
              <ThemeToggle size="sm" />

              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 px-3"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span>Logout</span>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation - Hamburger Menu */}
          <div className="lg:hidden flex items-center space-x-2">
            <ThemeToggle size="sm" />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex flex-col space-y-2">
                  <Link href="/employee/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                      Dashboard
                    </Button>
                  </Link>

                  <Link href="/employee/chat" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                      AI Chat
                    </Button>
                  </Link>

                  <Link href="/employee/reports" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                      Reports
                    </Button>
                  </Link>

                  <Link href="/employee/wellness-hub" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                      Wellness
                    </Button>
                  </Link>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    {user && (
                      <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                        Welcome, {user.first_name || user.email}
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}