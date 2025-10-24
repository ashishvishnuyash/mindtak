'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, Building2, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WellnessHubLanding() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const isFormValid = formData.name.trim() && formData.email.trim() && formData.company.trim();

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Thank You!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              We've received your information and will reach out to you soon with a personalized pitch for our Wellness Hub platform.
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700">
                Diltak.ai
              </span>
            </Link>

            <Link href="/">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Wellness Hub Access
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Get personalized access to our enterprise wellness platform. We'll reach out with a tailored solution for your organization.
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company Name
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Enter your company name"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700 hover:from-amber-700 hover:via-lime-700 hover:to-emerald-800 text-white py-3 mt-6"
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Get Personalized Access'
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                  <p>By submitting this form, you agree to be contacted by our team regarding Diltak.ai's Wellness Hub platform.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">AI-Powered Analytics</p>
            </div>

            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Enterprise Security</p>
            </div>

            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">24/7 Support</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}