'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/hooks/use-user';
import {
  Brain,
  ArrowLeft,
  Heart,
  Battery,
  AlertTriangle,
  Smile,
  Save,
  User,
  LogOut
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function NewPersonalReportPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [demoUser, setDemoUser] = useState<any>(null);

  // Create demo user if no real user
  useEffect(() => {
    if (!userLoading && !user) {
      const demoDemoUser = {
        id: 'demo-employer-123',
        email: 'demo.employer@company.com',
        first_name: 'Demo',
        last_name: 'Employer',
        role: 'employer',
        company_id: 'demo-company-123',
        department: 'Management'
      };
      setDemoUser(demoDemoUser);
    }
  }, [user, userLoading]);

  // Use either real user or demo user
  const currentUser = user || demoUser;
  
  const [formData, setFormData] = useState({
    mood_rating: [7],
    energy_level: [7],
    stress_level: [3],
    overall_wellness: [7],
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      const reportData = {
        employee_id: currentUser.id,
        company_id: currentUser.company_id || '',
        mood_rating: formData.mood_rating[0],
        energy_level: formData.energy_level[0],
        stress_level: formData.stress_level[0],
        overall_wellness: formData.overall_wellness[0],
        notes: formData.notes,
        risk_level: formData.overall_wellness[0] >= 7 ? 'low' : formData.overall_wellness[0] >= 4 ? 'medium' : 'high',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (user) {
        // Real user - save to Firebase
        await addDoc(collection(db, 'mental_health_reports'), reportData);
        toast.success('Wellness report saved successfully!');
      } else {
        // Demo user - simulate save
        toast.success('Demo: Wellness report saved successfully!');
      }
      router.push('/employer/personal');
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (userLoading && !demoUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="h-16 w-16 text-green-600 mx-auto mb-4" />
          </motion.div>
          <p className="text-lg text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button variant="ghost" size="sm" className="p-2" onClick={() => router.push('/employer/personal')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">New Wellness Check</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Personal Report</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <ThemeToggle size="sm" />
              <Button 
                variant="outline" 
                size="sm" 
                className="text-green-600 border-green-200"
                onClick={() => {
                  if (user) {
                    auth.signOut();
                    router.push('/auth/login');
                  } else {
                    router.push('/login');
                  }
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-4 leading-tight">
            How are you feeling today?
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8">
            Take a moment to reflect on your current mental and emotional state.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Mood Rating */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                <Smile className="h-5 w-5 text-blue-500" />
                <span>Mood Rating</span>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                How would you rate your overall mood today?
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Slider
                  value={formData.mood_rating}
                  onValueChange={(value) => setFormData({ ...formData, mood_rating: value })}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Very Low (1)</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    Current: {formData.mood_rating[0]}
                  </span>
                  <span>Excellent (10)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Energy Level */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                <Battery className="h-5 w-5 text-green-500" />
                <span>Energy Level</span>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                How energetic do you feel right now?
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Slider
                  value={formData.energy_level}
                  onValueChange={(value) => setFormData({ ...formData, energy_level: value })}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Exhausted (1)</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    Current: {formData.energy_level[0]}
                  </span>
                  <span>Very Energetic (10)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stress Level */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Stress Level</span>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                How stressed do you feel today?
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Slider
                  value={formData.stress_level}
                  onValueChange={(value) => setFormData({ ...formData, stress_level: value })}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>No Stress (1)</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    Current: {formData.stress_level[0]}
                  </span>
                  <span>Very Stressed (10)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Wellness */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                <Brain className="h-5 w-5 text-purple-500" />
                <span>Overall Wellness</span>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                How would you rate your overall mental wellness today?
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Slider
                  value={formData.overall_wellness}
                  onValueChange={(value) => setFormData({ ...formData, overall_wellness: value })}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Poor (1)</span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    Current: {formData.overall_wellness[0]}
                  </span>
                  <span>Excellent (10)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Additional Notes</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Any additional thoughts or context you'd like to share? (Optional)
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Share any thoughts, concerns, or positive moments from your day..."
                className="min-h-[100px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => router.push('/employer/personal')}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Save className="h-4 w-4" />
                </motion.div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}