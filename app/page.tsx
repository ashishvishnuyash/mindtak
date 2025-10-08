"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Brain,
  Shield,
  TrendingUp,
  Users,
  MessageSquare,
  BarChart3,
  Building,
  UserCheck,
  Heart,
  Lightbulb,
  User,
  Check,
  ChevronRight,
  Plus,
  Minus,
  ChevronDown
} from 'lucide-react';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { motion } from 'framer-motion';
import WellnessHero from '@/components/mental-health/WellnessHero';
import WellnessFeatures from '@/components/mental-health/WellnessFeatures';
import WellnessResources from '@/components/mental-health/WellnessResources';
import WellnessStats from '@/components/mental-health/WellnessStats';
import { useModal } from '@/contexts/modal-context';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const { openContactModal, openComingSoonModal } = useModal();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const toggleProducts = () => {
    setIsProductsOpen(!isProductsOpen);
  };

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const titleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const faqs = [
    {
      question: "What is Diltak.ai?",
      answer: "Diltak.ai is an AI-powered mental health analytics platform designed for enterprises, educational institutions, and healthcare providers. We offer comprehensive emotional well-being solutions with real-time analytics and personalized support."
    },
    {
      question: "How does Diltak.ai help organizations?",
      answer: "Diltak.ai helps organizations by providing real-time emotional intelligence, comprehensive wellness analytics, and AI-driven support tools that boost workforce resilience, productivity, and retention."
    },
    {
      question: "Is Diltak.ai available for white-label integration?",
      answer: "Yes, Diltak.ai offers white-label solutions that can be seamlessly integrated into your existing platforms and branded according to your organization's needs."
    },
    {
      question: "Is Diltak.ai compliant with data privacy standards?",
      answer: "Absolutely. Diltak.ai follows industry-leading security measures with end-to-end encryption to protect all sensitive data."
    },
    {
      question: "How is Diltak.ai different from traditional wellness apps?",
      answer: "Diltak.ai goes beyond traditional wellness apps by offering AI-powered emotional intelligence, real-time analytics, and comprehensive organizational insights that traditional apps cannot provide."
    },
    {
      question: "Can Diltak.ai integrate with our existing systems?",
      answer: "Yes, Diltak.ai offers flexible API integration options that can connect with your existing HR systems, communication platforms, and other workplace tools."
    },
    {
      question: "Can we see a live demo or try a pilot?",
      answer: "Absolutely! We offer live demos and pilot programs to help you experience the full capabilities of Diltak.ai before making a decision."
    },
    {
      question: "How does Diltak.ai improve ROI for enterprises?",
      answer: "Diltak.ai improves ROI by reducing absenteeism, increasing productivity, improving employee retention, and providing data-driven insights for better organizational decision-making."
    }
  ];

  return (
    <div className="min-h-screen bg-yellow-50 text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700">Diltak.ai</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/">
                <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
                  Home
                </Button>
              </Link>

              {/* Products Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:bg-gray-100 flex items-center space-x-1"
                  onClick={toggleProducts}
                >
                  <span>Products</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} />
                </Button>

                {isProductsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <Link href="/auth/login">
                        <div className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                          Wellness Hub
                        </div>
                      </Link>
                      <div 
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={openComingSoonModal}
                      >
                        AI Friend
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link href="#wellness">
                <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
                  Solutions
                </Button>
              </Link>

              <Link href="#advantage">
                <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
                  About
                </Button>
              </Link>

              <Link href="#faq">
                <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
                  FAQ
                </Button>
              </Link>

              <Button 
                variant="ghost" 
                className="text-gray-700 hover:bg-gray-100"
                onClick={openContactModal}
              >
                Contact
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        className="relative overflow-hidden py-20 sm:py-32 bg-white"
        whileInView={sectionVariants}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <motion.h1
                className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl xl:text-7xl mb-6 leading-tight"
                variants={titleVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.span
                  variants={wordVariants}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700"
                >
                  Organizational Well-Being Reimagined
                </motion.span>
              </motion.h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 max-w-lg mb-8">
                Advanced AI-powered analytics platform delivering predictive mental health insights for Fortune 500 companies, universities, and healthcare systems.
              </p>

              {/* Quote Section */}
              <div className="border-l-4 border-gray-300 pl-6 mb-8">
                <p className="text-gray-700 italic text-lg">
                  &quot;Emotional support, guidance, and wellness aid&quot;
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col space-y-3 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">3K+ Lives Impacted</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">10+ Countries</span>
                </div>

              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                <Link href="/demo">
                  <Button size="lg" className="bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700 hover:from-amber-700 hover:via-lime-700 hover:to-emerald-800 text-white px-8 py-3 flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300">
                    <span>EXPLORE PLATFORM</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex justify-center items-center">
              {/* Hero Image - Robot */}
              <motion.div
                className="relative w-full max-w-full sm:max-w-lg xl:max-w-xl h-[300px] sm:h-[500px] xl:h-[600px] rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl"
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
              >
                {/* Animated Background Glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-green-400/10 to-green-400/10"
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                <motion.div
                  className="relative w-full h-full"
                  animate={{ 
                    y: [-15, 15, -15],
                    rotate: [0, 3, -3, 0],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <Image
                    src="/images/robot_image_with_wires.png"
                    alt="AI Robot with digital interface representing mental health analytics"
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
                
                {/* Enhanced Floating Elements */}
                <motion.div
                  className="absolute top-4 right-4 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg"
                  animate={{ 
                    scale: [1, 1.8, 1],
                    opacity: [0.4, 1, 0.4],
                    y: [-5, 5, -5],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity,
                    delay: 0.5
                  }}
                />
                <motion.div
                  className="absolute bottom-6 left-6 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg"
                  animate={{
                    scale: [1, 1.6, 1],
                    opacity: [0.3, 1, 0.3],
                    x: [-3, 3, -3],
                    rotate: [0, -180, -360]
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    delay: 1
                  }}
                />
                <motion.div
                  className="absolute top-1/2 left-4 w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg"
                  animate={{ 
                    scale: [1, 1.7, 1],
                    opacity: [0.4, 1, 0.4],
                    y: [-8, 8, -8],
                    x: [-2, 2, -2]
                  }}
                  transition={{ 
                    duration: 2.8, 
                    repeat: Infinity,
                    delay: 1.5
                  }}
                />

                {/* Additional Floating Particles */}
                <motion.div
                  className="absolute top-8 left-8 w-1.5 h-1.5 bg-green-400 rounded-full"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.8, 0.2],
                    y: [-10, 10, -10],
                    x: [-5, 5, -5]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    delay: 0.8
                  }}
                />
                <motion.div
                  className="absolute bottom-8 right-8 w-2 h-2 bg-green-400 rounded-full"
                  animate={{ 
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0.9, 0.3],
                    y: [-6, 6, -6],
                    x: [-4, 4, -4]
                  }}
                  transition={{ 
                    duration: 3.2, 
                    repeat: Infinity,
                    delay: 2
                  }}
                />

                {/* Pulsing Ring Effects */}
                <motion.div
                  className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-green-400/30 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.1, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.5
                  }}
                  style={{ transform: 'translate(-50%, -50%)' }}
                />
                <motion.div
                  className="absolute top-1/2 left-1/2 w-24 h-24 border border-blue-400/20 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.05, 0.2]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: 1
                  }}
                  style={{ transform: 'translate(-50%, -50%)' }}
                />

                {/* Data Stream Lines */}
                <motion.div
                  className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.5
                  }}
                />
                <motion.div
                  className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-t from-transparent via-green-400 to-transparent"
                  animate={{
                    y: ['-100%', '100%'],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: 1.2
                  }}
                />

                {/* Corner Glow Effects */}
                <motion.div
                  className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-green-400/20 to-transparent rounded-bl-full"
                  animate={{
                    opacity: [0.2, 0.6, 0.2],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: 0.3
                  }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-green-400/20 to-transparent rounded-tr-full"
                  animate={{
                    opacity: [0.2, 0.6, 0.2],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: 1.5
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* The Diltak AI Advantage Section */}
      <motion.section
        id="advantage"
        className="py-20 bg-yellow-50"
        whileInView={sectionVariants}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-12 items-center">
            {/* Left side - AI Brain Image */}
            <div className="relative">
              <div className="relative w-full aspect-square max-w-[500px] mx-auto rounded-full overflow-hidden bg-yellow-50">
                <Image
                  src="/images/tech_robot_with_screen.png"
                  alt="AI Brain with neural networks and digital interface"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right side - Content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                The Diltak AI <span className="text-green-600">Advantage</span>
              </h2>

              <p className="text-lg text-gray-600 mb-8">
                Unlike traditional wellness solutions, Diltak AI delivers enterprise-grade mental health intelligence through scientifically validated algorithms and predictive analytics, enabling organizations to proactively support workforce resilience at scale. Get the best guidance and talk to someone who understands your Mental Health status. Therapy is like cleaning that messy drawer - you keep what matters and let go of what doesn&apos;t.
              </p>

              {/* Advantage List */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Reduce mental health-related absences by up to 40%</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Decrease employee turnover through predictive intervention</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Enable evidence-based mental health program ROI measurement</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Deploy organization-wide early warning systems</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Achieve seamless integration with enterprise HR platforms</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Expert-led meditations and mindfulness tools for better sleep</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Completely anonymous support - no stigma, no limits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>


      {/* Enhanced Mental Health & Wellness Section */}
      <div id="wellness">
        <WellnessHero />
      </div>
      
      {/* Comprehensive Wellness Features */}
      <WellnessFeatures />
      
      
      {/* Wellness Resources & Tools */}
      <WellnessResources />
      
      {/* Trust & Statistics */}
      <WellnessStats />

      {/* FAQ Section */}
      <motion.section
        id="faq"
        className="py-20 bg-yellow-50"
        whileInView={sectionVariants}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 mb-8">Still have more questions? Don&apos;t hesitate to contact us at <a href="mailto:info@diltak.ai" className="text-green-600 hover:underline">info@diltak.ai</a>!</p>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 flex items-center space-x-2"
              onClick={openContactModal}
            >
              <span>Contact Us</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader
                  className="cursor-pointer p-6 hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                    {openFaq === index ? (
                      <Minus className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Plus className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </CardHeader>
                {openFaq === index && (
                  <CardContent className="p-6 pt-0">
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Have questions? We&apos;re here to help.</h3>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={openContactModal}
              >
                Contact
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={openContactModal}
              >
                Email Us
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
