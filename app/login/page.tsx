'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Users,
  Building,
  Shield,
  ArrowLeft,
  User,
  Crown
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  const handleRoleLogin = (role: string) => {
    // For demo purposes, we'll simulate login by redirecting to appropriate dashboard
    // In a real app, this would handle actual authentication

    switch (role) {
      case 'employee':
        router.push('/employee/chat');
        break;
      case 'manager':
        router.push('/manager');
        break;
      case 'employer':
        router.push('/employer/dashboard');
        break;
      case 'hr':
        router.push('/employer/analytics');
        break;
      default:
        router.push('/employee/chat');
    }
  };

  const roles = [
    {
      id: 'employee',
      title: 'Employee',
      description: 'Access personal wellness dashboard and AI chat',
      icon: User,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700',
      features: ['Personal wellness tracking', 'AI mental health support', 'Confidential reporting', 'Progress visualization']
    },
    {
      id: 'manager',
      title: 'Manager',
      description: 'Manage your team and view team wellness analytics',
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700',
      features: ['Team dashboard', 'Direct reports management', 'Team wellness analytics', 'Organization chart']
    },
    {
      id: 'employer',
      title: 'Employer',
      description: 'Full company analytics and employee management',
      icon: Building,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700',
      features: ['Company-wide analytics', 'Employee management', 'Department insights', 'Risk assessment']
    },
    {
      id: 'hr',
      title: 'HR Admin',
      description: 'Human resources and compliance management',
      icon: Shield,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-700',
      features: ['HR analytics', 'Compliance reporting', 'Employee privacy management', 'Policy insights']
    }
  ];

  const selectedRoleData = roles.find(role => role.id === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
            <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">WellnessHub</span>
            </Link>
            <div className="flex items-center space-x-2">
              <ThemeToggle size="sm" />
              <Link href="/">
                <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base px-2 sm:px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
            {selectedRole ? `${selectedRoleData?.title} Login` : 'Choose Your Role'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {selectedRole
              ? `Access your ${selectedRoleData?.title.toLowerCase()} dashboard and features`
              : 'Select your role to access the appropriate dashboard and features'
            }
          </p>
        </div>

        {selectedRole ? (
          // Single role view
          <div className="max-w-md mx-auto">
            <Card className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300 ${selectedRoleData?.color.replace('text-', 'border-').replace('bg-', 'border-')}`}>
              <CardHeader className="text-center">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${selectedRoleData?.color}`}>
                  {selectedRoleData?.icon && <selectedRoleData.icon className="h-8 w-8" />}
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">{selectedRoleData?.title}</CardTitle>
                <p className="text-gray-600 dark:text-gray-400">{selectedRoleData?.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Available Features:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    {selectedRoleData?.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handleRoleLogin(selectedRole)}
                  >
                    Continue as {selectedRoleData?.title}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => setSelectedRole('')}
                  >
                    Choose Different Role
                  </Button>
                </div>

                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    Demo Mode - No Authentication Required
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Role selection grid
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {roles.map((role) => (
              <Card
                key={role.id}
                className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer ${role.color.replace('text-', 'border-').replace('bg-', 'border-')} hover:scale-105`}
                onClick={() => setSelectedRole(role.id)}
              >
                <CardHeader className="text-center">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${role.color}`}>
                    <role.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{role.title}</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400">{role.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    {role.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                  <Button className="w-full mt-4" variant="outline">
                    Select {role.title}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Demo Notice */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-4">
                <Crown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Demo Mode</h3>
              </div>
              <p className="text-blue-700 dark:text-blue-300 mb-4">
                This is a demonstration version. No authentication is required - simply select your role to explore the features.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs sm:text-sm">
                <Badge variant="outline" className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600">No Login Required</Badge>
                <Badge variant="outline" className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600">Full Feature Access</Badge>
                <Badge variant="outline" className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600">Sample Data</Badge>
                <Badge variant="outline" className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600">Interactive Demo</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
