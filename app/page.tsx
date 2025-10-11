"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Check,
  ChevronRight,
  Plus,
  Minus,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { motion } from 'framer-motion';
import WellnessHero from '@/components/mental-health/WellnessHero';
import WellnessFeatures from '@/components/mental-health/WellnessFeatures';
import WellnessResources from '@/components/mental-health/WellnessResources';
import WellnessStats from '@/components/mental-health/WellnessStats';
import { useModal } from '@/contexts/modal-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openContactModal, openComingSoonModal } = useModal();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const toggleProducts = () => {
    setIsProductsOpen(!isProductsOpen);
  };

  const toggleMobileProducts = () => {
    setIsMobileProductsOpen(!isMobileProductsOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
    <div className="min-h-screen bg-yellow-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">D</span>
              </div>
              <span className="text-base sm:text-lg md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700">Diltak.ai</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <Link href="/">
                <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                  Home
                </Button>
              </Link>

              {/* Products Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center space-x-1"
                  onClick={toggleProducts}
                >
                  <span>Products</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} />
                </Button>

                {isProductsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <Link href="/auth/login">
                        <div className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                          Wellness Hub
                        </div>
                      </Link>
                      <div
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={openComingSoonModal}
                      >
                        AI Friend
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link href="#wellness">
                <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                  Solutions
                </Button>
              </Link>

              <Link href="#advantage">
                <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                  About
                </Button>
              </Link>

              <Link href="#faq">
                <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                  FAQ
                </Button>
              </Link>

              <Button
                variant="ghost"
                className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={openContactModal}
              >
                Contact
              </Button>

              <ThemeToggle />
            </div>

            {/* Mobile Navigation - Hamburger Menu */}
            <div className="md:hidden flex items-center space-x-2">
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
              <ThemeToggle size="sm" />
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <div className="flex flex-col space-y-3">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                        Home
                      </Button>
                    </Link>

                    {/* Mobile Products Section */}
                    <div>
                      <Button
                        variant="ghost"
                        className="w-full justify-between text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={toggleMobileProducts}
                      >
                        <span>Products</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isMobileProductsOpen ? 'rotate-180' : ''}`} />
                      </Button>
                      
                      {isMobileProductsOpen && (
                        <div className="ml-4 mt-2 space-y-2">
                          <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                              Wellness Hub
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => {
                              openComingSoonModal();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            AI Friend
                          </Button>
                        </div>
                      )}
                    </div>

                    <Link href="#wellness" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                        Solutions
                      </Button>
                    </Link>

                    <Link href="#advantage" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                        About
                      </Button>
                    </Link>

                    <Link href="#faq" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                        FAQ
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      onClick={() => {
                        openContactModal();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Contact
                    </Button>

                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                          Login
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        className="relative overflow-hidden py-20 sm:py-32 bg-white dark:bg-gray-800"
        whileInView={sectionVariants}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            <div className="text-left">
              <motion.h1
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 leading-tight"
                variants={titleVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.span
                  variants={wordVariants}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700"
                >
                  Well-Being Reimagined
                </motion.span>
              </motion.h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-6 sm:leading-8 text-gray-600 dark:text-gray-400 max-w-full lg:max-w-lg mb-6 sm:mb-8">
                Advanced AI-powered analytics platform delivering predictive mental health insights for Fortune 500 companies, universities, and healthcare systems.
              </p>

              {/* Quote Section */}
              <div className="border-l-4 border-gray-300 dark:border-gray-600 pl-6 mb-8">
                <p className="text-gray-700 dark:text-gray-300 italic text-lg">
                  &quot;Emotional support, guidance, and wellness aid&quot;
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col space-y-3 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">3K+ Lives Impacted</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">10+ Countries</span>
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
                className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl h-[250px] sm:h-[350px] lg:h-[450px] xl:h-[600px] rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-xl mx-auto"
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
              >
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
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* The Diltak AI Advantage Section */}
      <motion.section
        id="advantage"
        className="py-20 bg-yellow-50 dark:bg-gray-800"
        whileInView={sectionVariants}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-12 items-center">
            {/* Left side - AI Brain Image */}
            <div className="relative">
              <div className="relative w-full aspect-square max-w-[500px] mx-auto rounded-full overflow-hidden bg-yellow-50 dark:bg-gray-700">
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
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 leading-tight">
                The Diltak AI <span className="text-green-600">Advantage</span>
              </h2>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Unlike traditional wellness solutions, Diltak AI delivers enterprise-grade mental health intelligence through scientifically validated algorithms and predictive analytics, enabling organizations to proactively support workforce resilience at scale. Get the best guidance and talk to someone who understands your Mental Health status. Therapy is like cleaning that messy drawer - you keep what matters and let go of what doesn&apos;t.
              </p>

              {/* Advantage List */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Reduce mental health-related absences by up to 40%</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Decrease employee turnover through predictive intervention</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Enable evidence-based mental health program ROI measurement</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Deploy organization-wide early warning systems</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Achieve seamless integration with enterprise HR platforms</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Expert-led meditations and mindfulness tools for better sleep</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Completely anonymous support - no stigma, no limits</span>
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
        className="py-20 bg-yellow-50 dark:bg-gray-800"
        whileInView={sectionVariants}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">Frequently Asked Questions</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Still have more questions? Don&apos;t hesitate to contact us at <a href="mailto:info@diltak.ai" className="text-green-600 hover:underline">info@diltak.ai</a>!</p>
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
              <Card key={index} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                <CardHeader
                  className="cursor-pointer p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{faq.question}</h3>
                    {openFaq === index ? (
                      <Minus className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Plus className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </CardHeader>
                {openFaq === index && (
                  <CardContent className="p-6 pt-0">
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Have questions? We&apos;re here to help.</h3>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={openContactModal}
              >
                Contact
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                asChild
              >
                <a href="mailto:info@diltak.ai">
                  Email Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}