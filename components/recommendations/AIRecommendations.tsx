'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { 
  Brain, 
  Play, 
  Clock, 
  Star, 
  Target, 
  Heart, 
  Zap, 
  Moon,
  RefreshCw,
  CheckCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/hooks/use-user';

interface AIRecommendation {
  id: string;
  recommendation_type: 'meditation' | 'journaling' | 'breathing' | 'exercise' | 'sleep' | 'nutrition' | 'social' | 'work_life_balance';
  title: string;
  description: string;
  instructions: string[];
  duration_minutes: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  mood_targets: string[];
  wellness_metrics_affected: string[];
  ai_generated: boolean;
  personalized_for_user: boolean;
  created_at: string;
  completed_at?: string;
  user_feedback?: 'helpful' | 'not_helpful' | 'neutral';
  effectiveness_score?: number;
}


export default function AIRecommendations() {
  const { user } = useUser();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [completedRecommendations, setCompletedRecommendations] = useState<string[]>([]);

  const getRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: user.id,
          company_id: user.company_id,
          current_mood: 5, // Default neutral mood
          current_stress: 5, // Default neutral stress
          current_energy: 5, // Default neutral energy
          time_available: 15
        })
      });

      const result = await response.json();

      if (result.success) {
        setRecommendations(result.recommendations);
        toast.success('Personalized recommendations generated based on your chat history!');
      } else {
        toast.error('Failed to generate recommendations');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('An error occurred while generating recommendations');
    } finally {
      setLoading(false);
    }
  };

  const completeRecommendation = async (recommendationId: string) => {
    setCompletedRecommendations(prev => [...prev, recommendationId]);
    toast.success('Great job completing this recommendation!');
    
    // Here you would typically send completion data to the backend
    // and update user's wellness metrics
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'meditation': return <Brain className="h-6 w-6" />;
      case 'journaling': return <Target className="h-6 w-6" />;
      case 'breathing': return <Heart className="h-6 w-6" />;
      case 'exercise': return <Zap className="h-6 w-6" />;
      case 'sleep': return <Moon className="h-6 w-6" />;
      default: return <Sparkles className="h-6 w-6" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'meditation': return 'bg-purple-100 text-purple-600';
      case 'journaling': return 'bg-blue-100 text-blue-600';
      case 'breathing': return 'bg-green-100 text-green-600';
      case 'exercise': return 'bg-orange-100 text-orange-600';
      case 'sleep': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  useEffect(() => {
    getRecommendations();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI-Powered Wellness Recommendations
        </h1>
        <p className="text-gray-600">
          Personalized activities based on your past 7 days of conversations and current mood. Today's chat gets priority!
        </p>
      </div>

      {/* Get Recommendations Button */}
      <div className="flex justify-center">
        <Button
          onClick={getRecommendations}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Analyzing Your Chat History...
            </>
          ) : (
            <>
              <Brain className="h-5 w-5 mr-2" />
              Get AI Recommendations
            </>
          )}
        </Button>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`h-full ${completedRecommendations.includes(rec.id) ? 'bg-green-50 border-green-200' : 'hover:shadow-lg'} transition-all duration-300`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${getRecommendationColor(rec.recommendation_type)}`}>
                    {getRecommendationIcon(rec.recommendation_type)}
                  </div>
                  <Badge className={getDifficultyColor(rec.difficulty_level)}>
                    {rec.difficulty_level}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{rec.title}</CardTitle>
                <p className="text-sm text-gray-600">{rec.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Duration and Metrics */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{rec.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span>{rec.wellness_metrics_affected.length} metrics</span>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Instructions:</h4>
                  <ol className="text-sm text-gray-600 space-y-1">
                    {rec.instructions.slice(0, 3).map((instruction, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-blue-500 font-bold">{idx + 1}.</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                    {rec.instructions.length > 3 && (
                      <li className="text-gray-500 italic">...and {rec.instructions.length - 3} more steps</li>
                    )}
                  </ol>
                </div>

                {/* Mood Targets */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Targets:</h4>
                  <div className="flex flex-wrap gap-1">
                    {rec.mood_targets.map((target, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {target.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => completeRecommendation(rec.id)}
                  disabled={completedRecommendations.includes(rec.id)}
                  className={`w-full ${
                    completedRecommendations.includes(rec.id)
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {completedRecommendations.includes(rec.id) ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Activity
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {recommendations.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Recommendations Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Set your mood levels above and click "Update Recommendations" to get personalized wellness activities.
            </p>
            <Button onClick={getRecommendations} className="bg-blue-600 hover:bg-blue-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Recommendations
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Progress Summary */}
      {completedRecommendations.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-900">Your Progress</h3>
              <Badge className="bg-blue-100 text-blue-700">
                {completedRecommendations.length} completed
              </Badge>
            </div>
            <Progress 
              value={(completedRecommendations.length / recommendations.length) * 100} 
              className="h-2"
            />
            <p className="text-sm text-blue-700 mt-2">
              Keep up the great work! Completing wellness activities regularly helps improve your overall well-being.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
