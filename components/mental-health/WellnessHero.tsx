'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Heart, 
  Brain, 
  Shield, 
  Sparkles, 
  Users, 
  CheckCircle,
  ArrowRight,
  Play,
  Star
} from 'lucide-react';

const WellnessHero = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity
    }
  };

  return (
      <motion.section 
        className="relative overflow-hidden bg-white py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-40 -right-40 w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
            animate={floatingAnimation}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"
            animate={{
              ...floatingAnimation,
              transition: { ...floatingAnimation.transition, delay: 2 }
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div variants={fadeInUp} className="space-y-8">
              <div className="space-y-4">
                <motion.div 
                  className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Trusted by 3k+ People</span>
                </motion.div>

                <motion.h1 
                  className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight"
                  variants={fadeInUp}
                >
                  Complete Mind-Body
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                    Wellness Platform
                  </span>
                </motion.h1>

                <motion.p 
                  className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed"
                  variants={fadeInUp}
                >
                  Consult top doctors, psychologists, dietitians, and wellness experts.
                  Get personalized care with 100% secure consultations.
                </motion.p>
              </div>

              {/* Trust Indicators */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                variants={fadeInUp}
              >
                <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Secure & Private</p>
                    <p className="text-sm text-gray-600">End-to-end encryption</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Expert Panel</p>
                    <p className="text-sm text-gray-600">MBBS, MD, PhD Certified</p>
                  </div>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeInUp}
              >
                <Link href="/demo">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-gray-300 hover:border-green-600 hover:text-green-600 px-8 py-4 text-lg font-semibold"
                >
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Content - Feature Cards */}
            <motion.div 
              className="space-y-6"
              variants={staggerContainer}
            >
              {/* Main Feature Card */}
              <motion.div variants={fadeInUp}>
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                        <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">AI-Powered Support</h3>
                        <p className="text-gray-600">24/7 Mental Health Assistant</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                        <span className="text-gray-700 text-sm sm:text-base">Instant emotional support</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                        <span className="text-gray-700 text-sm sm:text-base">Personalized therapy sessions</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                        <span className="text-gray-700 text-sm sm:text-base">Mood tracking & insights</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Secondary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div variants={fadeInUp}>
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-lg rounded-xl p-4 sm:p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Wellness</h4>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600">Holistic health approach</p>
                  </Card>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-lg rounded-xl p-4 sm:p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Star className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Expert Care</h4>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600">Certified professionals</p>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
  );
};

export default WellnessHero;
