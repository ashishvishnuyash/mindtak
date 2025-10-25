'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  Heart, 
  Brain, 
  Zap, 
  Briefcase, 
  Scale, 
  AlertTriangle, 
  Target, 
  Moon,
  Save, 
  ArrowLeft,
  Shield,
  Users
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Link from 'next/link';
import { withAuth } from '@/components/auth/with-auth';
import { toast } from 'sonner';
import { signOut } from 'firebase/auth';

interface ReportData {
  stress_level: number;
  mood_rating: number;
  energy_level: number;
  work_satisfaction: number;
  work_life_balance: number;
  anxiety_level: number;
  confidence_level: number;
  sleep_quality: number;
  leadership_pressure: number;
  team_support_confidence: number;
  comments: string;
  employee_id: string;
  role: string;
}

function ManagerPersonalNewReportPage() {
  const router = useRouter();
  const { user } = useUser();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [reportData, setReportData] = useState<ReportData>({
    stress_level: 5,
    mood_rating: 5,
    energy_level: 5,
    work_satisfaction: 5,
    work_life_balance: 5,
    anxiety_level: 5,
    confidence_level: 5,
    sleep_quality: 5,
    leadership_pressure: 5,
    team_support_confidence: 5,
    comments: '', 
    employee_id: user?.id || '',
    role: 'manager',
  });

  const totalSteps = 5;

  const updateMetric = (key: keyof ReportData, value: number | string) => {
    setReportData(prev => ({ ...prev, [key]: value }));
  };

  const calculateOverallWellness = () => {
    const positiveMetrics = [
      reportData.mood_rating,
      reportData.energy_level,
      reportData.work_satisfaction,
      reportData.work_life_balance,
      reportData.confidence_level,
      reportData.sleep_quality,
      reportData.team_support_confidence
    ];
    
    const negativeMetrics = [
      11 - reportData.stress_level, // Invert stress
      11 - reportData.anxiety_level, // Invert anxiety
      11 - reportData.leadership_pressure // Invert pressure
    ];
    
    const allMetrics = [...positiveMetrics, ...negativeMetrics];
    const average = allMetrics.reduce((sum, metric) => sum + metric, 0) / allMetrics.length;
    
    return Math.round(average * 10) / 10;
  };

  const calculateRiskLevel = (): 'low' | 'medium' | 'high' => {
    const riskFactors = [
      reportData.stress_level >= 8 ? 2 : reportData.stress_level >= 6 ? 1 : 0,
      reportData.anxiety_level >= 8 ? 2 : reportData.anxiety_level >= 6 ? 1 : 0,
      reportData.leadership_pressure >= 8 ? 2 : reportData.leadership_pressure >= 6 ? 1 : 0,
      reportData.mood_rating <= 3 ? 2 : reportData.mood_rating <= 5 ? 1 : 0,
      reportData.energy_level <= 3 ? 1 : 0,
      reportData.work_satisfaction <= 3 ? 1 : 0,
      reportData.sleep_quality <= 3 ? 1 : 0,
      reportData.confidence_level <= 3 ? 1 : 0,
      reportData.team_support_confidence <= 3 ? 1 : 0,
    ];

    const totalRisk = riskFactors.reduce((sum, factor) => sum + factor, 0);

    if (totalRisk >= 7) return 'high';
    if (totalRisk >= 4) return 'medium';
    return 'low';
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const overallWellness = calculateOverallWellness();
    const riskLevel = calculateRiskLevel();

    const reportToSave = {
      ...reportData,
      overall_wellness: overallWellness,
      risk_level: riskLevel,
      created_at: new Date().toISOString(),
      company_id: user?.company_id || '',
      employee_id: user?.id || '',
      role: 'manager',
    };

    try {
      await addDoc(collection(db, 'mental_health_reports'), reportToSave);
      toast.success('Personal wellness report saved successfully!');
      router.push('/manager/personal');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error:', err);
      toast.error('Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Emotional Wellbeing';
      case 2: return 'Work & Life Balance';
      case 3: return 'Physical & Mental State';
      case 4: return 'Leadership Challenges';
      case 5: return 'Additional Notes';
      default: return '';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Heart className="h-6 w-6 text-red-500" />
                <Label className="text-lg font-medium">How is your mood today?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.mood_rating]}
                  onValueChange={(value) => updateMetric('mood_rating', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Very Low (1)</span>
                  <span className="font-medium text-lg">{reportData.mood_rating}/10</span>
                  <span>Excellent (10)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                <Label className="text-lg font-medium">What's your stress level?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.stress_level]}
                  onValueChange={(value) => updateMetric('stress_level', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>No Stress (1)</span>
                  <span className="font-medium text-lg">{reportData.stress_level}/10</span>
                  <span>Very High (10)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Brain className="h-6 w-6 text-purple-500" />
                <Label className="text-lg font-medium">How anxious do you feel?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.anxiety_level]}
                  onValueChange={(value) => updateMetric('anxiety_level', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Very Calm (1)</span>
                  <span className="font-medium text-lg">{reportData.anxiety_level}/10</span>
                  <span>Very Anxious (10)</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Briefcase className="h-6 w-6 text-blue-500" />
                <Label className="text-lg font-medium">How satisfied are you with your work?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.work_satisfaction]}
                  onValueChange={(value) => updateMetric('work_satisfaction', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Very Unsatisfied (1)</span>
                  <span className="font-medium text-lg">{reportData.work_satisfaction}/10</span>
                  <span>Very Satisfied (10)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Scale className="h-6 w-6 text-green-500" />
                <Label className="text-lg font-medium">How's your work-life balance?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.work_life_balance]}
                  onValueChange={(value) => updateMetric('work_life_balance', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Very Poor (1)</span>
                  <span className="font-medium text-lg">{reportData.work_life_balance}/10</span>
                  <span>Excellent (10)</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Zap className="h-6 w-6 text-yellow-500" />
                <Label className="text-lg font-medium">What's your energy level?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.energy_level]}
                  onValueChange={(value) => updateMetric('energy_level', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Exhausted (1)</span>
                  <span className="font-medium text-lg">{reportData.energy_level}/10</span>
                  <span>Very Energetic (10)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Target className="h-6 w-6 text-indigo-500" />
                <Label className="text-lg font-medium">How confident do you feel?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.confidence_level]}
                  onValueChange={(value) => updateMetric('confidence_level', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Very Low (1)</span>
                  <span className="font-medium text-lg">{reportData.confidence_level}/10</span>
                  <span>Very Confident (10)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Moon className="h-6 w-6 text-gray-500" />
                <Label className="text-lg font-medium">How was your sleep quality?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.sleep_quality]}
                  onValueChange={(value) => updateMetric('sleep_quality', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Very Poor (1)</span>
                  <span className="font-medium text-lg">{reportData.sleep_quality}/10</span>
                  <span>Excellent (10)</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-red-500" />
                <Label className="text-lg font-medium">How much pressure do you feel from leadership responsibilities?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.leadership_pressure]}
                  onValueChange={(value) => updateMetric('leadership_pressure', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>No Pressure (1)</span>
                  <span className="font-medium text-lg">{reportData.leadership_pressure}/10</span>
                  <span>Overwhelming (10)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-blue-500" />
                <Label className="text-lg font-medium">How confident do you feel in supporting your team's mental health?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.team_support_confidence]}
                  onValueChange={(value) => updateMetric('team_support_confidence', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Not Confident (1)</span>
                  <span className="font-medium text-lg">{reportData.team_support_confidence}/10</span>
                  <span>Very Confident (10)</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-medium mb-4 block">
                Additional thoughts or comments (optional)
              </Label>
              <Textarea
                placeholder="Share any additional thoughts about your mental health, leadership challenges, team dynamics, or anything else you'd like to note..."
                value={reportData.comments}
                onChange={(e) => updateMetric('comments', e.target.value)}
                rows={6}
                className="w-full"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">Report Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Mood: {reportData.mood_rating}/10</div>
                <div>Stress: {reportData.stress_level}/10</div>
                <div>Energy: {reportData.energy_level}/10</div>
                <div>Work Satisfaction: {reportData.work_satisfaction}/10</div>
                <div>Work-Life Balance: {reportData.work_life_balance}/10</div>
                <div>Anxiety: {reportData.anxiety_level}/10</div>
                <div>Confidence: {reportData.confidence_level}/10</div>
                <div>Sleep Quality: {reportData.sleep_quality}/10</div>
                <div>Leadership Pressure: {reportData.leadership_pressure}/10</div>
                <div>Team Support Confidence: {reportData.team_support_confidence}/10</div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Overall Wellness: {calculateOverallWellness()}/10
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Risk Level: {calculateRiskLevel().toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to create a wellness report.</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 lg:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link href="/manager/personal">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100">New Wellness Report</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Personal Assessment</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <ThemeToggle size="sm" />
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-200 px-2 sm:px-3"
                onClick={async () => {
                  try {
                    await signOut(auth);
                    router.push('/auth/login');
                  } catch (error) {
                    console.error('Logout error:', error);
                    router.push('/auth/login');
                  }
                }}
              >
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Personal Wellness Assessment</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Take a moment to reflect on your current mental and emotional state as a leader.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="w-full" />
        </div>

        {/* Form Card */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{getStepTitle(currentStep)}</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Report
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Privacy Notice:</strong> Your personal wellness data is encrypted and stored securely. 
            This is separate from your team management data. Only you can view your individual reports. 
            Your personal wellness information is never shared with your organization.
          </p>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ManagerPersonalNewReportPage, ['manager']);