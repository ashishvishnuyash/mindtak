'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { 
  Brain, 
  Heart, 
  Shield, 
  Users, 
  Clock, 
  Smartphone,
  MessageSquare,
  Activity,
  Zap,
  Target,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

const WellnessFeatures = () => {
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
      transition: { duration: 0.6 }
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI Mental Health Assistant",
      description: "24/7 emotional support with advanced AI that understands your needs",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      features: ["Instant Support", "Mood Analysis", "Personalized Insights"]
    },
    {
      icon: Users,
      title: "Expert Professionals",
      description: "Connect with certified psychologists, psychiatrists, and wellness experts",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      features: ["Licensed Therapists", "Video Consultations", "Follow-up Care"]
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Platform with end-to-end encryption for complete confidentiality",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50",
      features: ["Secure Storage", "Anonymous Support", "End-to-end Encryption"]
    },
    {
      icon: Activity,
      title: "Wellness Tracking",
      description: "Monitor your mental health journey with comprehensive analytics and insights",
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50",
      features: ["Progress Tracking", "Mood Charts", "Goal Setting"]
    },
    {
      icon: MessageSquare,
      title: "Therapeutic Conversations",
      description: "Engage in meaningful conversations that help you process emotions and thoughts",
      color: "from-indigo-500 to-blue-500",
      bgColor: "from-indigo-50 to-blue-50",
      features: ["CBT Techniques", "Mindfulness", "Coping Strategies"]
    },
    {
      icon: Target,
      title: "Personalized Care Plans",
      description: "Get customized treatment plans based on your unique needs and goals",
      color: "from-teal-500 to-green-500",
      bgColor: "from-teal-50 to-green-50",
      features: ["Custom Plans", "Goal Setting", "Progress Monitoring"]
    }
  ];

  return (
    <motion.section 
      className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-gray-900 transition-colors duration-300"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          variants={itemVariants}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
            Comprehensive Mental Health
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              & Wellness Solutions
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            From AI-powered support to expert consultations, we provide everything you need 
            for your mental health and wellness journey.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              className="group"
            >
              <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className={`h-1 bg-gradient-to-r ${feature.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="mt-12 sm:mt-16 text-center"
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
              Ready to Start Your Wellness Journey?
            </h3>
            <p className="text-green-100 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
              Join thousands of people who have transformed their mental health with our comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/demo" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 px-6 sm:px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base">
                  Get Started Free
                </button>
              </Link>
              <button className="w-full sm:w-auto border-2 border-white dark:border-gray-300 text-white dark:text-gray-300 px-6 sm:px-8 py-3 rounded-xl font-semibold hover:bg-white/10 dark:hover:bg-gray-700/20 transition-colors text-sm sm:text-base">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default WellnessFeatures;
