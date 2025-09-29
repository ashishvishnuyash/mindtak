'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { 
  Users, 
  Heart, 
  Brain, 
  Shield, 
  TrendingUp, 
  Clock,
  Star,
  CheckCircle,
  Zap,
  Target
} from 'lucide-react';

const WellnessStats = () => {
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

  const numberVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8 }
    }
  };

  const stats = [
    {
      icon: Users,
      number: "3K+",
      label: "Lives Impacted",
      description: "Individuals who have improved their mental health",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50"
    },
    {
      icon: Heart,
      number: "98%",
      label: "Satisfaction Rate",
      description: "Users report positive outcomes",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50"
    },
    {
      icon: Brain,
      number: "24/7",
      label: "AI Support",
      description: "Always available mental health assistance",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50"
    },

    {
      icon: TrendingUp,
      number: "85%",
      label: "Improvement Rate",
      description: "Users show measurable progress",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50"
    },

    {
      icon: Target,
      number: "10+",
      label: "Countries",
      description: "Global reach and impact",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50"
    }
  ];

  const achievements = [
    {
      title: "ISO 27001 Certified",
      description: "Information security management",
      icon: Shield
    },
    {
      title: "GDPR Compliant",
      description: "European data protection standards",
      icon: CheckCircle
    },
    {
      title: "DPDP Act Certified",
      description: "Healthcare privacy protection",
      icon: Shield
    },
    {
      title: "SOC 2 Type II",
      description: "Security and availability controls",
      icon: CheckCircle
    }
  ];

  return (
    <motion.section 
      className="py-20 bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white"
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
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Trusted by Thousands Worldwide
          </h2>
          <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
            Our platform has helped thousands of people improve their mental health 
            with proven results and industry-leading security.
          </p>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              className="group"
            >
              <Card className="h-full bg-white/10 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardContent className="p-8 text-center">
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                    variants={numberVariants}
                  >
                    <stat.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  <motion.div 
                    className="text-4xl font-bold mb-2"
                    variants={numberVariants}
                  >
                    {stat.number}
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold mb-2">{stat.label}</h3>
                  <p className="text-blue-100 text-sm">{stat.description}</p>
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
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8">
            <h3 className="text-3xl font-bold mb-4">
              Join Our Growing Community
            </h3>
            <p className="text-green-100 mb-8 max-w-2xl mx-auto text-lg">
              Start your mental health journey today with our comprehensive platform 
              trusted by hundreds of thousands of people worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <button className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-lg">
                  Start Free Trial
                </button>
              </Link>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors text-lg">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default WellnessStats;
