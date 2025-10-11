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
      className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          variants={itemVariants}
        >
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Comprehensive Mental Health
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              & Wellness Solutions
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            From AI-powered support to expert consultations, we provide everything you need 
            for your mental health and wellness journey.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
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
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
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
          className="mt-16 text-center"
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Start Your Wellness Journey?
            </h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Join thousands of people who have transformed their mental health with our comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <button className="bg-white text-green-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                  Get Started Free
                </button>
              </Link>
              <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
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
