'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useModal } from '@/contexts/modal-context';
import { auth } from '@/lib/firebase';
import {
  ChevronDown,
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Brain
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
  const { openContactModal } = useModal();
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleProducts = () => {
    setIsProductsOpen(!isProductsOpen);
  };

  const toggleMobileProducts = () => {
    setIsMobileProductsOpen(!isMobileProductsOpen);
  };

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

            {/* Wellness Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center space-x-1 px-3 py-2"
                onClick={toggleProducts}
              >
                <span>Wellness</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} />
              </Button>

              {isProductsOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <Link href="/employee/wellness-hub">
                      <div className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                        Wellness Hub
                      </div>
                    </Link>
                    <Link href="/employee/support">
                      <div className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                        Support
                      </div>
                    </Link>
                    <Link href="/employee/recommendations">
                      <div className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                        Recommendations
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/employee/community">
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2">
                Community
              </Button>
            </Link>

            <Link href="/employee/gamification">
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2">
                Rewards
              </Button>
            </Link>

            <Button
              variant="ghost"
              className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2"
              onClick={openContactModal}
            >
              Contact
            </Button>

            {/* User Actions */}
            <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-gray-700 pl-4">
              <Button variant="outline" size="sm" className="p-2">
                <Bell className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" className="p-2">
                <User className="h-4 w-4" />
              </Button>

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

                  {/* Mobile Wellness Section */}
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 py-3"
                      onClick={toggleMobileProducts}
                    >
                      <span>Wellness</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isMobileProductsOpen ? 'rotate-180' : ''}`} />
                    </Button>
                    
                    {isMobileProductsOpen && (
                      <div className="ml-4 mt-2 space-y-1">
                        <Link href="/employee/wellness-hub" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 py-2">
                            Wellness Hub
                          </Button>
                        </Link>
                        <Link href="/employee/support" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 py-2">
                            Support
                          </Button>
                        </Link>
                        <Link href="/employee/recommendations" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 py-2">
                            Recommendations
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  <Link href="/employee/community" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                      Community
                    </Button>
                  </Link>

                  <Link href="/employee/gamification" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                      Rewards
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3"
                    onClick={() => {
                      openContactModal();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Contact
                  </Button>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    {user && (
                      <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                        Welcome, {user.first_name || user.email}
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                    </div>

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