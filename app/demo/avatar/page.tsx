'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Brain, Mic, Volume2, Eye, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the LipSyncDemo to avoid SSR issues
const LipSyncDemo = dynamic(
  () => import('@/components/avatar/LipSyncDemo'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading 3D Avatar Demo...</p>
        </div>
      </div>
    )
  }
);

export default function AvatarDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <motion.header
        className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
              >
                <Brain className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-2xl font-bold text-gray-900">3D Avatar + Lip Sync Demo</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/demo">
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-50">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Demos</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Interactive 3D Avatar with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Real-Time Lip Sync
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Experience our advanced 3D avatar system with real-time lip synchronization. 
            Test microphone input, text-to-speech, and interactive animations.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Mic className="h-12 w-12 mx-auto mb-4 text-red-600" />
              <h3 className="font-semibold text-gray-900 mb-2">Microphone Lip Sync</h3>
              <p className="text-sm text-gray-600">Real-time mouth animation from your voice</p>
            </motion.div>

            <motion.div
              className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Volume2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold text-gray-900 mb-2">Text-to-Speech</h3>
              <p className="text-sm text-gray-600">Synchronized speech with lip animation</p>
            </motion.div>

            <motion.div
              className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Eye className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-2">Interactive Avatar</h3>
              <p className="text-sm text-gray-600">Mouse tracking and emotion animations</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Demo Component */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Try the Interactive Demo
              </CardTitle>
              <p className="text-gray-600">
                Test all lip sync features with the controls below
              </p>
            </CardHeader>
            <CardContent>
              <Suspense fallback={
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading 3D Avatar Demo...</p>
                  </div>
                </div>
              }>
                <LipSyncDemo />
              </Suspense>
            </CardContent>
          </Card>
        </motion.div>

        {/* Implementation Guide */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 text-center">
                Implementation Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lip Sync Features</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Real-time microphone analysis</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Text-to-speech synchronization</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Audio file playback sync</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Viseme-based animation</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Smooth transitions</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Avatar Features</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Interactive 3D model</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Emotion-based animations</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Mouse head tracking</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Breathing animation</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Auto blinking</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">
                  This demo showcases the complete avatar system integrated into the employee chat interface.
                </p>
                <Link href="/employee/chat">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                    Try in Employee Chat
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}