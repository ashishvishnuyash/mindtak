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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">D</span>
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700">Diltak.ai</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <Link href="/">
                <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2">
                  Home
                </Button>
              </Link>

              {/* Products Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center space-x-1 px-3 py-2"
                  onClick={toggleProducts}
                >
                  <span>Products</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} />
                </Button>

                {isProductsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <Link href="/wellness-hub">
                        <div className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                          Wellness Hub
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link href="#wellness">
                <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2">
                  Solutions
                </Button>
              </Link>

              <Link href="#advantage">
                <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2">
                  About
                </Button>
              </Link>

              <Link href="#faq">
                <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2">
                  FAQ
                </Button>
              </Link>

              <Button
                variant="ghost"
                className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2"
                onClick={openContactModal}
              >
                Contact
              </Button>

              <ThemeToggle />
            </div>

            {/* Mobile Navigation - Hamburger Menu */}
            <div className="lg:hidden flex items-center space-x-2">
              <ThemeToggle size="sm" />
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
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                  <div className="flex flex-col space-y-2">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                        Home
                      </Button>
                    </Link>

                    {/* Mobile Products Section */}
                    <div>
                      <Button
                        variant="ghost"
                        className="w-full justify-between text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 py-3"
                        onClick={toggleMobileProducts}
                      >
                        <span>Products</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isMobileProductsOpen ? 'rotate-180' : ''}`} />
                      </Button>
                      
                      {isMobileProductsOpen && (
                        <div className="ml-4 mt-2 space-y-1">
                          <Link href="/wellness-hub" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 py-2">
                              Wellness Hub
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>

                    <Link href="#wellness" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                        Solutions
                      </Button>
                    </Link>

                    <Link href="#advantage" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                        About
                      </Button>
                    </Link>

                    <Link href="#faq" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                        FAQ
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3"
                      onClick={() => {
                        openContactModal();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Contact
                    </Button>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3">
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
        className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-white dark:bg-gray-800"
        whileInView={sectionVariants}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            <div className="text-left order-2 lg:order-1">
              <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 leading-tight"
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
              <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed text-gray-600 dark:text-gray-400 max-w-full lg:max-w-lg mb-6 sm:mb-8">
                Advanced AI-powered analytics platform delivering predictive mental health insights for Fortune 500 companies, universities, and healthcare systems.
              </p>

              {/* Quote Section */}
              <div className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 sm:pl-6 mb-6 sm:mb-8">
                <p className="text-gray-700 dark:text-gray-300 italic text-base sm:text-lg">
                  &quot;Emotional support, guidance, and wellness aid&quot;
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 space-y-3 sm:space-y-0 mb-6 sm:mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">3K+ Lives Impacted</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">10+ Countries</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                <Link href="/wellness-hub" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700 hover:from-amber-700 hover:via-lime-700 hover:to-emerald-800 text-white px-6 sm:px-8 py-3 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base">
                    <span>EXPLORE PLATFORM</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex justify-center items-center order-1 lg:order-2">
              {/* Hero Image - Robot */}
              <motion.div
                className="relative w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-[200px] sm:h-[280px] md:h-[350px] lg:h-[400px] xl:h-[500px] rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-xl mx-auto"
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
              >
                <motion.div
                  className="relative w-full h-full"
                  animate={{
                    y: [-10, 10, -10],
                    rotate: [0, 2, -2, 0],
                    scale: [1, 1.01, 1]
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
                    sizes="(max-width: 640px) 280px, (max-width: 768px) 384px, (max-width: 1024px) 448px, (max-width: 1280px) 512px, 576px"
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
        className="py-12 sm:py-16 md:py-20 lg:py-24 bg-yellow-50 dark:bg-gray-800"
        whileInView={sectionVariants}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Left side - AI Brain Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative w-full aspect-square max-w-[300px] sm:max-w-[400px] lg:max-w-[500px] mx-auto rounded-full overflow-hidden bg-yellow-50 dark:bg-gray-700 shadow-2xl">
                <Image
                  src="/images/tech_robot_with_screen.png"
                  alt="AI Brain with neural networks and digital interface"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 300px, (max-width: 1024px) 400px, 500px"
                />
              </div>
            </div>

            {/* Right side - Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 leading-tight">
                The Diltak AI <span className="text-green-600">Advantage</span>
              </h2>

              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed">
                Unlike traditional wellness solutions, Diltak AI delivers enterprise-grade mental health intelligence through scientifically validated algorithms and predictive analytics, enabling organizations to proactively support workforce resilience at scale. Get the best guidance and talk to someone who understands your Mental Health status. Therapy is like cleaning that messy drawer - you keep what matters and let go of what doesn&apos;t.
              </p>

              {/* Advantage List */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Reduce mental health-related absences by up to 40%</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Decrease employee turnover through predictive intervention</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Enable evidence-based mental health program ROI measurement</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Deploy organization-wide early warning systems</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Achieve seamless integration with enterprise HR platforms</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Expert-led meditations and mindfulness tools for better sleep</span>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Completely anonymous support - no stigma, no limits</span>
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
        className="py-12 sm:py-16 md:py-20 lg:py-24 bg-yellow-50 dark:bg-gray-800"
        whileInView={sectionVariants}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">Frequently Asked Questions</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">Still have more questions? Don&apos;t hesitate to contact us at <a href="mailto:info@diltak.ai" className="text-green-600 hover:underline">info@diltak.ai</a>!</p>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 flex items-center space-x-2 mx-auto text-sm sm:text-base"
              onClick={openContactModal}
            >
              <span>Contact Us</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                <CardHeader
                  className="cursor-pointer p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 text-left">{faq.question}</h3>
                    <div className="flex-shrink-0">
                      {openFaq === index ? (
                        <Minus className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                      ) : (
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {openFaq === index && (
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Have questions? We&apos;re here to help.</h3>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-3"
                onClick={openContactModal}
              >
                Contact
              </Button>
              <Button
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3"
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