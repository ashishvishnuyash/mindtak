'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import {
  Menu,
  X,
  LogOut,
  Bell,
  User
} from 'lucide-react';

interface EmployeeNavbarProps {
  user?: {
    first_name?: string;
    last_name?: string;
    email: string;
    role?: string;
    company_name?: string;
  };
  onNavigate?: () => void; // Callback to close avatar before navigation
}

export default function EmployeeNavbar({ user, onNavigate }: EmployeeNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(); // Close avatar first
    }
    setTimeout(() => {
      router.push(path);
    }, 100); // Small delay to ensure avatar closes first
  };

  const handleSignOut = async () => {
    if (onNavigate) {
      onNavigate(); // Close avatar first
    }
    // Firebase signout
    const error = await signOut(auth).catch((err) => err);
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
      router.push('/');
    }
  };

  return (
    <header className="border-b border-gray-200/60 dark:border-gray-700/60 bg-white/98 dark:bg-gray-900/98 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-500 via-lime-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <span className="text-white font-bold text-xs sm:text-sm drop-shadow-sm">D</span>
            </div>
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700 drop-shadow-sm">Diltak.ai</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
            <Button 
              variant="ghost" 
              onClick={() => handleNavigation('/employee/dashboard')}
              className={`text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-sm ${
                pathname === '/employee/dashboard' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-700 dark:text-blue-300 shadow-sm' : ''
              }`}>
              Dashboard
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => handleNavigation('/employee/chat')}
              className={`text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-sm ${
                pathname === '/employee/chat' ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-700 dark:text-green-300 shadow-sm' : ''
              }`}>
              AI Chat
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => handleNavigation('/employee/reports')}
              className={`text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-purple-900/30 dark:hover:to-violet-900/30 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-sm ${
                pathname === '/employee/reports' ? 'bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40 text-purple-700 dark:text-purple-300 shadow-sm' : ''
              }`}>
              Reports
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => handleNavigation('/employee/wellness-hub')}
              className={`text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-teal-900/30 dark:hover:to-cyan-900/30 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-sm ${
                pathname === '/employee/wellness-hub' ? 'bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 text-teal-700 dark:text-teal-300 shadow-sm' : ''
              }`}>
              Wellness
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => handleNavigation('/employee/community')}
              className={`text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-orange-900/30 dark:hover:to-amber-900/30 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-sm ${
                pathname === '/employee/community' ? 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 text-orange-700 dark:text-orange-300 shadow-sm' : ''
              }`}>
              Community
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => handleNavigation('/employee/support')}
              className={`text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-red-900/30 dark:hover:to-pink-900/30 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-sm ${
                pathname === '/employee/support' ? 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/40 dark:to-pink-900/40 text-red-700 dark:text-red-300 shadow-sm' : ''
              }`}>
              Support
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => handleNavigation('/employee/recommendations')}
              className={`text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-sm ${
                pathname === '/employee/recommendations' ? 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm' : ''
              }`}>
              Recommendations
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => handleNavigation('/employee/gamification')}
              className={`text-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-yellow-900/30 dark:hover:to-orange-900/30 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-sm ${
                pathname === '/employee/gamification' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 text-yellow-700 dark:text-yellow-300 shadow-sm' : ''
              }`}>
              Gamification
            </Button>

            {/* User Actions */}
            <div className="flex items-center space-x-3 border-l border-gray-200/60 dark:border-gray-700/60 pl-4 ml-2">
              <Button variant="outline" size="sm" className="p-2 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 transition-all duration-200 hover:shadow-sm">
                <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </Button>
              
              <ThemeToggle size="sm" />

              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 border-red-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:bg-gradient-to-r dark:hover:from-red-950/20 dark:hover:to-pink-950/20 hover:border-red-300 dark:hover:border-red-600 px-3 font-medium transition-all duration-200 hover:shadow-sm"
                onClick={handleSignOut}
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
              className="p-2 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-700 rounded-lg transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </Button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-700/60 shadow-xl z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex flex-col space-y-1">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleNavigation('/employee/dashboard');
                    }}
                    className={`w-full justify-start text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 py-3 rounded-lg font-medium transition-all duration-200 ${
                      pathname === '/employee/dashboard' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-700 dark:text-blue-300' : ''
                    }`}>
                    Dashboard
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleNavigation('/employee/chat');
                    }}
                    className={`w-full justify-start text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 py-3 rounded-lg font-medium transition-all duration-200 ${
                      pathname === '/employee/chat' ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-700 dark:text-green-300' : ''
                    }`}>
                    AI Chat
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleNavigation('/employee/reports');
                    }}
                    className={`w-full justify-start text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-purple-900/30 dark:hover:to-violet-900/30 py-3 rounded-lg font-medium transition-all duration-200 ${
                      pathname === '/employee/reports' ? 'bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40 text-purple-700 dark:text-purple-300' : ''
                    }`}>
                    Reports
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleNavigation('/employee/wellness-hub');
                    }}
                    className={`w-full justify-start text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-teal-900/30 dark:hover:to-cyan-900/30 py-3 rounded-lg font-medium transition-all duration-200 ${
                      pathname === '/employee/wellness-hub' ? 'bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 text-teal-700 dark:text-teal-300' : ''
                    }`}>
                    Wellness
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleNavigation('/employee/community');
                    }}
                    className={`w-full justify-start text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-orange-900/30 dark:hover:to-amber-900/30 py-3 rounded-lg font-medium transition-all duration-200 ${
                      pathname === '/employee/community' ? 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 text-orange-700 dark:text-orange-300' : ''
                    }`}>
                    Community
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleNavigation('/employee/support');
                    }}
                    className={`w-full justify-start text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-red-900/30 dark:hover:to-pink-900/30 py-3 rounded-lg font-medium transition-all duration-200 ${
                      pathname === '/employee/support' ? 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/40 dark:to-pink-900/40 text-red-700 dark:text-red-300' : ''
                    }`}>
                    Support
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleNavigation('/employee/recommendations');
                    }}
                    className={`w-full justify-start text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 py-3 rounded-lg font-medium transition-all duration-200 ${
                      pathname === '/employee/recommendations' ? 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300' : ''
                    }`}>
                    Recommendations
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleNavigation('/employee/gamification');
                    }}
                    className={`w-full justify-start text-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-yellow-900/30 dark:hover:to-orange-900/30 py-3 rounded-lg font-medium transition-all duration-200 ${
                      pathname === '/employee/gamification' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 text-yellow-700 dark:text-yellow-300' : ''
                    }`}>
                    Gamification
                  </Button>

                  <div className="pt-4 border-t border-gray-200/60 dark:border-gray-700/60 space-y-3">
                    {user && (
                      <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg">
                        Welcome, {user.first_name || user.email}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 transition-all duration-200">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-600 transition-all duration-200">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 border-red-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:bg-gradient-to-r dark:hover:from-red-950/20 dark:hover:to-pink-950/20 hover:border-red-300 dark:hover:border-red-600 font-medium transition-all duration-200"
                      onClick={() => {
                        handleSignOut();
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