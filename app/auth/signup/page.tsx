'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  ArrowLeft,
  Mail,
  Lock,
  User,
  Building,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Heart,
  Zap,
  Star,
  Shield,
  CheckCircle,
  Users,
  TrendingUp
} from 'lucide-react';

import { toast } from 'sonner';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employer',
    companyName: '',
    companySize: '',
    industry: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;

      // Generate unique company ID
      const companyId = `company_${user.uid}`;

      // Create company document in Firestore
      const companyRef = doc(db, 'companies', companyId);
      await setDoc(companyRef, {
        id: companyId,
        name: formData.companyName,
        size: formData.companySize || 'Not specified',
        industry: formData.industry || 'Not specified',
        owner_id: user.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Create employer user profile in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: 'employer',
        company_id: companyId,
        company_name: formData.companyName,
        is_active: true,
        hierarchy_level: 0,
        can_view_team_reports: true,
        can_manage_employees: true,
        can_approve_leaves: true,
        is_department_head: true,
        skip_level_access: true,
        direct_reports: [],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      toast.success('Account created successfully!');
      router.push('/employer/dashboard');

    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific Firebase Auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please choose a stronger password.');
          break;
        default:
          setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-3xl"
          animate={floatingAnimation}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 2 }
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Brain className="h-8 w-8 text-blue-400" />
              </motion.div>
              <span className="text-2xl font-bold text-gray-900">MindCare</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <motion.div
          className="w-full max-w-2xl"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Hero Section */}
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <motion.div
              animate={floatingAnimation}
              className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Brain className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
              Start Your Wellness Journey
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Create your company account and begin transforming workplace mental health with AI-powered insights.
            </p>
          </motion.div>

          {/* Main Form Card */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Create Employer Account</CardTitle>
                <p className="text-gray-600">Register your company to start managing employee wellness</p>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSignUp} className="space-y-6">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-500/20 border border-red-400 text-red-300 p-4 rounded-xl text-sm"
                    >
                      <AlertDescription>{error}</AlertDescription>
                    </motion.div>
                  )}

                  {/* Personal Information */}
                  <motion.div variants={itemVariants}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-green-500" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-gray-700">First Name *</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                          disabled={loading}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-gray-700">Last Name *</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Contact Information */}
                  <motion.div variants={itemVariants}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-blue-500" />
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john.doe@company.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Company Information */}
                  <motion.div variants={itemVariants}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Building className="h-5 w-5 mr-2 text-purple-500" />
                      Company Information
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-gray-700">Company Name *</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="companyName"
                            placeholder="Acme Corporation"
                            value={formData.companyName}
                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                            className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="companySize" className="text-gray-700">Company Size</Label>
                          <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                            <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-10">1-10 employees</SelectItem>
                              <SelectItem value="11-50">11-50 employees</SelectItem>
                              <SelectItem value="51-200">51-200 employees</SelectItem>
                              <SelectItem value="201-500">201-500 employees</SelectItem>
                              <SelectItem value="500+">500+ employees</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="industry" className="text-gray-700">Industry</Label>
                          <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                            <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500">
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Technology">Technology</SelectItem>
                              <SelectItem value="Healthcare">Healthcare</SelectItem>
                              <SelectItem value="Finance">Finance</SelectItem>
                              <SelectItem value="Education">Education</SelectItem>
                              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="Retail">Retail</SelectItem>
                              <SelectItem value="Consulting">Consulting</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-gray-700">Your Role</Label>
                        <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                          <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employer">Employer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>

                  {/* Security */}
                  <motion.div variants={itemVariants}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-orange-500" />
                      Security
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700">Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter password (min 6 characters)"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="pl-10 pr-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                            disabled={loading}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={loading}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className="pl-10 pr-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                            disabled={loading}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={loading}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Additional Information */}
                <motion.div className="mt-8 space-y-6" variants={itemVariants}>
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      After Registration
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Once your company account is created, you can add employees through the Employee Management section in your dashboard and start tracking their wellness journey.
                    </p>
                  </div>

                  {/* Features Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                      <Heart className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <h5 className="font-semibold text-gray-900 text-sm mb-2">AI Wellness Chat</h5>
                      <p className="text-gray-600 text-xs">Personalized mental health support</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                      <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <h5 className="font-semibold text-gray-900 text-sm mb-2">Analytics Dashboard</h5>
                      <p className="text-gray-600 text-xs">Comprehensive wellness insights</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                      <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <h5 className="font-semibold text-gray-900 text-sm mb-2">Team Management</h5>
                      <p className="text-gray-600 text-xs">Organize and monitor your team</p>
                    </div>
                  </div>
                  
                  <div className="text-center text-sm">
                    <span className="text-gray-600">Already have an account? </span>
                    <Link href="/auth/login" className="text-green-600 hover:underline font-medium">
                      Sign in
                    </Link>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}