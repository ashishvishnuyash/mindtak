'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  ArrowLeft,
  Mail,
  User,
  Building,
  Loader2,
  Shield,
  Sparkles,
  Heart,
  ArrowRight,
  CheckCircle,
  Users,
  BarChart3,
  Zap,
  Globe
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WellnessHubLandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: ''
  });
  const [focusedField, setFocusedField] = useState<string>('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Wellness Hub Interest Form submitted:', formData);
      toast.success('Thank you for your interest! Redirecting to login...');

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } catch (error) {
      setError('Something went wrong. Please try again.');
      toast.error('Something went wrong. Please try again.');
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

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analytics',
      description: 'Advanced mental health insights and predictive analytics',
      color: 'text-green-600'
    },
    {
      icon: Users,
      title: 'Team Wellness',
      description: 'Comprehensive workforce mental health monitoring',
      color: 'text-blue-600'
    },
    {
      icon: BarChart3,
      title: 'Real-time Reports',
      description: 'Instant organizational wellness dashboards',
      color: 'text-purple-600'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'HIPAA-compliant data protection and privacy',
      color: 'text-red-600'
    },
    {
      icon: Zap,
      title: 'Instant Deployment',
      description: 'Quick integration with existing HR systems',
      color: 'text-yellow-600'
    },
    {
      icon: Globe,
      title: 'Global Scale',
      description: 'Multi-location workforce support and analytics',
      color: 'text-indigo-600'
    }
  ];

  const benefits = [
    'Reduce mental health-related absences by up to 40%',
    'Decrease employee turnover through predictive intervention',
    'Enable evidence-based mental health program ROI measurement',
    'Deploy organization-wide early warning systems',
    'Achieve seamless integration with enterprise HR platforms',
    'Access 24/7 AI-powered mental health support'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={floatingAnimation}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 2 }
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl"
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 1 }
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-colors duration-300"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                animate={floatingAnimation}
                className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center"
              >
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </motion.div>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">Diltak.ai</span>
            </Link>
            <div className="flex items-center space-x-2">
              <ThemeToggle size="sm" />
              <Link href="/">
                <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-600 dark:hover:text-green-400 px-2 sm:px-3 py-2 text-sm sm:text-base">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Form */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="max-w-md mx-auto lg:mx-0 order-2 lg:order-1"
          >
            <motion.div variants={itemVariants} className="text-center lg:text-left mb-6 sm:mb-8">
              <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-green-200 dark:border-green-700 mb-4 sm:mb-6">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Enterprise Wellness Platform</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                Transform Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                  Workplace Wellness
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Get personalized insights into your organization's mental health landscape with AI-powered analytics and predictive wellness solutions.
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <motion.div
                    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Get Started Today</CardTitle>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Tell us about your organization and we'll create a personalized wellness solution</p>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {error && (
                      <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
                        <AlertDescription className="text-red-700 dark:text-red-300 text-sm">{error}</AlertDescription>
                      </Alert>
                    )}

                    <motion.div
                      className="space-y-2"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <Label htmlFor="name" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 transition-colors ${focusedField === 'name' ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                          }`} />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField('')}
                          className={`pl-8 sm:pl-10 text-sm sm:text-base py-2 sm:py-3 transition-all duration-300 ${focusedField === 'name'
                            ? 'border-green-500 dark:border-green-400 ring-2 ring-green-200 dark:ring-green-800'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                          disabled={loading}
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 transition-colors ${focusedField === 'email' ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                          }`} />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your work email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField('')}
                          className={`pl-8 sm:pl-10 text-sm sm:text-base py-2 sm:py-3 transition-all duration-300 ${focusedField === 'email'
                            ? 'border-green-500 dark:border-green-400 ring-2 ring-green-200 dark:ring-green-800'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                          disabled={loading}
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <Label htmlFor="company" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Company Name
                      </Label>
                      <div className="relative">
                        <Building className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 transition-colors ${focusedField === 'company' ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                          }`} />
                        <Input
                          id="company"
                          type="text"
                          placeholder="Enter your company name"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          onFocus={() => setFocusedField('company')}
                          onBlur={() => setFocusedField('')}
                          className={`pl-8 sm:pl-10 text-sm sm:text-base py-2 sm:py-3 transition-all duration-300 ${focusedField === 'company'
                            ? 'border-green-500 dark:border-green-400 ring-2 ring-green-200 dark:ring-green-800'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                          disabled={loading}
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 sm:py-3 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={loading}
                      >
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="flex items-center justify-center"
                          >
                            <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-sm sm:text-base">Redirecting to Login...</span>
                          </motion.div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <span>Access Wellness Hub</span>
                            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                        )}
                      </Button>
                    </motion.div>

                    <p className="text-xs text-gray-500 text-center">
                      By submitting this form you agree to our{' '}
                      <a href="#" className="text-green-600 hover:underline">
                        Privacy Policy
                      </a>
                    </p>
                  </motion.form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Right Side - Features & Benefits */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="order-1 lg:order-2"
          >
            <motion.div variants={itemVariants} className="space-y-6 sm:space-y-8">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                  Enterprise-Grade Mental Health Analytics
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
                  Transform your workplace wellness programs with AI-powered insights and comprehensive mental health analytics.
                </p>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 sm:gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300"
                  >
                    <feature.icon className={`h-5 w-5 sm:h-6 sm:w-6 mb-2 ${feature.color} dark:brightness-125`} />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-xs sm:text-sm">{feature.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Benefits List */}
              <motion.div
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 sm:p-6"
                variants={itemVariants}
              >
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 text-sm sm:text-base">Key Benefits</h3>
                <div className="space-y-2 sm:space-y-3">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start space-x-2 sm:space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}