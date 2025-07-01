import * as tf from '@tensorflow/tfjs';

export interface EmployeeMetrics {
  employeeId: string;
  timestamp: Date;
  moodRating: number;
  stressLevel: number;
  energyLevel: number;
  workSatisfaction: number;
  workLifeBalance: number;
  sleepQuality: number;
  socialConnection: number;
  workload: number;
  conversationFrequency: number;
  emotionalVariability: number;
}

export interface BurnoutPrediction {
  riskScore: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high';
  timeToRisk: number; // days
  confidence: number;
  contributingFactors: string[];
  recommendations: Intervention[];
}

export interface EngagementForecast {
  predictedEngagement: number; // 0-10
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  timeframe: number; // days
  influencingFactors: string[];
}

export interface RiskProfile {
  employeeId: string;
  currentRiskLevel: 'low' | 'medium' | 'high';
  burnoutRisk: number;
  engagementLevel: number;
  stressFactors: string[];
  protectiveFactors: string[];
  historicalTrends: TrendData[];
}

export interface Intervention {
  type: 'immediate' | 'short_term' | 'long_term';
  category: 'stress_management' | 'workload' | 'social_support' | 'professional_help';
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: number; // 0-1
}

export interface TrendData {
  metric: string;
  values: number[];
  timestamps: Date[];
  trend: 'up' | 'down' | 'stable';
  changeRate: number;
}

export class WellnessPredictionEngine {
  private burnoutModel: tf.LayersModel | null = null;
  private engagementModel: tf.LayersModel | null = null;
  private riskAssessmentModel: tf.LayersModel | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load pre-trained models
      this.burnoutModel = await tf.loadLayersModel('/models/burnout-prediction.json');
      this.engagementModel = await tf.loadLayersModel('/models/engagement-forecast.json');
      this.riskAssessmentModel = await tf.loadLayersModel('/models/risk-assessment.json');
      
      this.isInitialized = true;
      console.log('Predictive analytics models loaded successfully');
    } catch (error) {
      console.error('Failed to load predictive models:', error);
      // Initialize with rule-based fallbacks
      this.isInitialized = true;
    }
  }

  async predictBurnoutRisk(employeeMetrics: EmployeeMetrics[]): Promise<BurnoutPrediction> {
    if (!this.isInitialized) await this.initialize();

    try {
      if (this.burnoutModel && employeeMetrics.length >= 7) {
        return await this.mlBurnoutPrediction(employeeMetrics);
      } else {
        return this.ruleBasedBurnoutPrediction(employeeMetrics);
      }
    } catch (error) {
      console.error('Burnout prediction failed:', error);
      return this.getDefaultBurnoutPrediction();
    }
  }

  async forecastEngagement(employeeMetrics: EmployeeMetrics[]): Promise<EngagementForecast> {
    if (!this.isInitialized) await this.initialize();

    try {
      if (this.engagementModel && employeeMetrics.length >= 14) {
        return await this.mlEngagementForecast(employeeMetrics);
      } else {
        return this.ruleBasedEngagementForecast(employeeMetrics);
      }
    } catch (error) {
      console.error('Engagement forecast failed:', error);
      return this.getDefaultEngagementForecast();
    }
  }

  async assessRisk(employeeMetrics: EmployeeMetrics[]): Promise<RiskProfile> {
    if (!this.isInitialized) await this.initialize();

    const latest = employeeMetrics[employeeMetrics.length - 1];
    if (!latest) {
      throw new Error('No metrics available for risk assessment');
    }

    const burnoutPrediction = await this.predictBurnoutRisk(employeeMetrics);
    const engagementForecast = await this.forecastEngagement(employeeMetrics);
    const trends = this.analyzeTrends(employeeMetrics);

    return {
      employeeId: latest.employeeId,
      currentRiskLevel: this.calculateCurrentRiskLevel(latest, burnoutPrediction),
      burnoutRisk: burnoutPrediction.riskScore,
      engagementLevel: engagementForecast.predictedEngagement,
      stressFactors: this.identifyStressFactors(employeeMetrics),
      protectiveFactors: this.identifyProtectiveFactors(employeeMetrics),
      historicalTrends: trends
    };
  }

  async recommendInterventions(riskProfile: RiskProfile): Promise<Intervention[]> {
    const interventions: Intervention[] = [];

    // Immediate interventions for high risk
    if (riskProfile.currentRiskLevel === 'high') {
      interventions.push({
        type: 'immediate',
        category: 'professional_help',
        description: 'Schedule a check-in with mental health professional or EAP counselor',
        priority: 'high',
        estimatedImpact: 0.8
      });

      if (riskProfile.stressFactors.includes('workload')) {
        interventions.push({
          type: 'immediate',
          category: 'workload',
          description: 'Immediate workload review and redistribution',
          priority: 'high',
          estimatedImpact: 0.7
        });
      }
    }

    // Stress management interventions
    if (riskProfile.stressFactors.includes('high_stress')) {
      interventions.push({
        type: 'short_term',
        category: 'stress_management',
        description: 'Enroll in stress management workshop or mindfulness program',
        priority: riskProfile.currentRiskLevel === 'high' ? 'high' : 'medium',
        estimatedImpact: 0.6
      });
    }

    // Social support interventions
    if (riskProfile.stressFactors.includes('social_isolation')) {
      interventions.push({
        type: 'short_term',
        category: 'social_support',
        description: 'Facilitate team building activities or mentorship program',
        priority: 'medium',
        estimatedImpact: 0.5
      });
    }

    // Workload interventions
    if (riskProfile.stressFactors.includes('workload') && riskProfile.currentRiskLevel !== 'high') {
      interventions.push({
        type: 'short_term',
        category: 'workload',
        description: 'Review and optimize work processes and priorities',
        priority: 'medium',
        estimatedImpact: 0.6
      });
    }

    // Long-term preventive interventions
    if (riskProfile.currentRiskLevel === 'low') {
      interventions.push({
        type: 'long_term',
        category: 'stress_management',
        description: 'Maintain regular wellness check-ins and preventive practices',
        priority: 'low',
        estimatedImpact: 0.4
      });
    }

    return this.personalizeInterventions(interventions, riskProfile);
  }

  private async mlBurnoutPrediction(metrics: EmployeeMetrics[]): Promise<BurnoutPrediction> {
    if (!this.burnoutModel) throw new Error('Burnout model not loaded');

    // Prepare features for the model
    const features = this.prepareBurnoutFeatures(metrics);
    const tensor = tf.tensor2d([features]);
    
    const prediction = this.burnoutModel.predict(tensor) as tf.Tensor;
    const result = await prediction.data();
    
    tensor.dispose();
    prediction.dispose();

    const riskScore = result[0];
    const timeToRisk = result[1] * 365; // Convert to days
    const confidence = result[2];

    return {
      riskScore,
      riskLevel: riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low',
      timeToRisk: Math.round(timeToRisk),
      confidence,
      contributingFactors: this.identifyBurnoutFactors(metrics, riskScore),
      recommendations: []
    };
  }

  private ruleBasedBurnoutPrediction(metrics: EmployeeMetrics[]): BurnoutPrediction {
    if (metrics.length === 0) return this.getDefaultBurnoutPrediction();

    const recent = metrics.slice(-7); // Last week
    const avgStress = recent.reduce((sum, m) => sum + m.stressLevel, 0) / recent.length;
    const avgEnergy = recent.reduce((sum, m) => sum + m.energyLevel, 0) / recent.length;
    const avgSatisfaction = recent.reduce((sum, m) => sum + m.workSatisfaction, 0) / recent.length;
    const avgWorkLifeBalance = recent.reduce((sum, m) => sum + m.workLifeBalance, 0) / recent.length;

    // Calculate risk score based on multiple factors
    let riskScore = 0;
    
    // High stress contributes to burnout
    if (avgStress > 7) riskScore += 0.3;
    else if (avgStress > 5) riskScore += 0.15;
    
    // Low energy contributes to burnout
    if (avgEnergy < 4) riskScore += 0.25;
    else if (avgEnergy < 6) riskScore += 0.1;
    
    // Low satisfaction contributes to burnout
    if (avgSatisfaction < 4) riskScore += 0.2;
    else if (avgSatisfaction < 6) riskScore += 0.1;
    
    // Poor work-life balance contributes to burnout
    if (avgWorkLifeBalance < 4) riskScore += 0.25;
    else if (avgWorkLifeBalance < 6) riskScore += 0.1;

    // Check for declining trends
    if (metrics.length >= 14) {
      const older = metrics.slice(-14, -7);
      const olderAvgStress = older.reduce((sum, m) => sum + m.stressLevel, 0) / older.length;
      const olderAvgEnergy = older.reduce((sum, m) => sum + m.energyLevel, 0) / older.length;
      
      if (avgStress > olderAvgStress + 1) riskScore += 0.1; // Increasing stress
      if (avgEnergy < olderAvgEnergy - 1) riskScore += 0.1; // Decreasing energy
    }

    riskScore = Math.min(1, riskScore);

    const riskLevel: 'low' | 'medium' | 'high' = 
      riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low';

    const timeToRisk = riskLevel === 'high' ? 7 : riskLevel === 'medium' ? 30 : 90;

    return {
      riskScore,
      riskLevel,
      timeToRisk,
      confidence: 0.7,
      contributingFactors: this.identifyBurnoutFactors(metrics, riskScore),
      recommendations: []
    };
  }

  private async mlEngagementForecast(metrics: EmployeeMetrics[]): Promise<EngagementForecast> {
    if (!this.engagementModel) throw new Error('Engagement model not loaded');

    const features = this.prepareEngagementFeatures(metrics);
    const tensor = tf.tensor2d([features]);
    
    const prediction = this.engagementModel.predict(tensor) as tf.Tensor;
    const result = await prediction.data();
    
    tensor.dispose();
    prediction.dispose();

    const predictedEngagement = result[0] * 10; // Scale to 0-10
    const trendDirection = result[1]; // -1 to 1
    const confidence = result[2];

    return {
      predictedEngagement,
      trend: trendDirection > 0.1 ? 'increasing' : trendDirection < -0.1 ? 'decreasing' : 'stable',
      confidence,
      timeframe: 30, // 30 days forecast
      influencingFactors: this.identifyEngagementFactors(metrics)
    };
  }

  private ruleBasedEngagementForecast(metrics: EmployeeMetrics[]): EngagementForecast {
    if (metrics.length === 0) return this.getDefaultEngagementForecast();

    const recent = metrics.slice(-7);
    const avgSatisfaction = recent.reduce((sum, m) => sum + m.workSatisfaction, 0) / recent.length;
    const avgEnergy = recent.reduce((sum, m) => sum + m.energyLevel, 0) / recent.length;
    const avgSocialConnection = recent.reduce((sum, m) => sum + m.socialConnection, 0) / recent.length;

    // Calculate predicted engagement
    const predictedEngagement = (avgSatisfaction + avgEnergy + avgSocialConnection) / 3;

    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (metrics.length >= 14) {
      const older = metrics.slice(-14, -7);
      const olderAvgSatisfaction = older.reduce((sum, m) => sum + m.workSatisfaction, 0) / older.length;
      
      if (avgSatisfaction > olderAvgSatisfaction + 0.5) trend = 'increasing';
      else if (avgSatisfaction < olderAvgSatisfaction - 0.5) trend = 'decreasing';
    }

    return {
      predictedEngagement,
      trend,
      confidence: 0.6,
      timeframe: 30,
      influencingFactors: this.identifyEngagementFactors(metrics)
    };
  }

  private prepareBurnoutFeatures(metrics: EmployeeMetrics[]): number[] {
    const recent = metrics.slice(-30); // Last 30 days
    
    const features = [
      // Averages
      recent.reduce((sum, m) => sum + m.stressLevel, 0) / recent.length,
      recent.reduce((sum, m) => sum + m.energyLevel, 0) / recent.length,
      recent.reduce((sum, m) => sum + m.workSatisfaction, 0) / recent.length,
      recent.reduce((sum, m) => sum + m.workLifeBalance, 0) / recent.length,
      recent.reduce((sum, m) => sum + m.sleepQuality, 0) / recent.length,
      recent.reduce((sum, m) => sum + m.workload, 0) / recent.length,
      
      // Variability
      this.calculateVariability(recent.map(m => m.stressLevel)),
      this.calculateVariability(recent.map(m => m.moodRating)),
      
      // Trends
      this.calculateTrend(recent.map(m => m.stressLevel)),
      this.calculateTrend(recent.map(m => m.energyLevel)),
      
      // Recent patterns
      recent.filter(m => m.stressLevel > 7).length / recent.length,
      recent.filter(m => m.energyLevel < 4).length / recent.length,
    ];

    // Pad to expected input size
    while (features.length < 50) features.push(0);
    return features.slice(0, 50);
  }

  private prepareEngagementFeatures(metrics: EmployeeMetrics[]): number[] {
    const recent = metrics.slice(-30);
    
    const features = [
      // Current state
      recent.reduce((sum, m) => sum + m.workSatisfaction, 0) / recent.length,
      recent.reduce((sum, m) => sum + m.energyLevel, 0) / recent.length,
      recent.reduce((sum, m) => sum + m.socialConnection, 0) / recent.length,
      recent.reduce((sum, m) => sum + m.conversationFrequency, 0) / recent.length,
      
      // Trends
      this.calculateTrend(recent.map(m => m.workSatisfaction)),
      this.calculateTrend(recent.map(m => m.energyLevel)),
      
      // Stability
      this.calculateVariability(recent.map(m => m.moodRating)),
      
      // Work factors
      recent.reduce((sum, m) => sum + m.workload, 0) / recent.length,
      recent.reduce((sum, m) => sum + m.workLifeBalance, 0) / recent.length,
    ];

    while (features.length < 30) features.push(0);
    return features.slice(0, 30);
  }

  private calculateVariability(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    // Simple linear trend calculation
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + val * index, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private identifyBurnoutFactors(metrics: EmployeeMetrics[], riskScore: number): string[] {
    const factors: string[] = [];
    const recent = metrics.slice(-7);
    
    if (recent.length === 0) return factors;
    
    const avgStress = recent.reduce((sum, m) => sum + m.stressLevel, 0) / recent.length;
    const avgEnergy = recent.reduce((sum, m) => sum + m.energyLevel, 0) / recent.length;
    const avgWorkload = recent.reduce((sum, m) => sum + m.workload, 0) / recent.length;
    const avgWorkLifeBalance = recent.reduce((sum, m) => sum + m.workLifeBalance, 0) / recent.length;
    const avgSleep = recent.reduce((sum, m) => sum + m.sleepQuality, 0) / recent.length;
    
    if (avgStress > 7) factors.push('high_stress_levels');
    if (avgEnergy < 4) factors.push('chronic_fatigue');
    if (avgWorkload > 8) factors.push('excessive_workload');
    if (avgWorkLifeBalance < 4) factors.push('poor_work_life_balance');
    if (avgSleep < 5) factors.push('sleep_deprivation');
    
    // Check for declining trends
    if (metrics.length >= 14) {
      const older = metrics.slice(-14, -7);
      const olderAvgEnergy = older.reduce((sum, m) => sum + m.energyLevel, 0) / older.length;
      const olderAvgSatisfaction = older.reduce((sum, m) => sum + m.workSatisfaction, 0) / older.length;
      
      if (avgEnergy < olderAvgEnergy - 1) factors.push('declining_energy');
      if (recent.reduce((sum, m) => sum + m.workSatisfaction, 0) / recent.length < olderAvgSatisfaction - 1) {
        factors.push('declining_satisfaction');
      }
    }
    
    return factors;
  }

  private identifyEngagementFactors(metrics: EmployeeMetrics[]): string[] {
    const factors: string[] = [];
    const recent = metrics.slice(-7);
    
    if (recent.length === 0) return factors;
    
    const avgSatisfaction = recent.reduce((sum, m) => sum + m.workSatisfaction, 0) / recent.length;
    const avgSocialConnection = recent.reduce((sum, m) => sum + m.socialConnection, 0) / recent.length;
    const avgConversationFreq = recent.reduce((sum, m) => sum + m.conversationFrequency, 0) / recent.length;
    
    if (avgSatisfaction > 7) factors.push('high_job_satisfaction');
    if (avgSocialConnection > 7) factors.push('strong_social_connections');
    if (avgConversationFreq > 5) factors.push('active_communication');
    
    if (avgSatisfaction < 4) factors.push('low_job_satisfaction');
    if (avgSocialConnection < 4) factors.push('social_isolation');
    if (avgConversationFreq < 2) factors.push('limited_communication');
    
    return factors;
  }

  private analyzeTrends(metrics: EmployeeMetrics[]): TrendData[] {
    const trends: TrendData[] = [];
    
    if (metrics.length < 7) return trends;
    
    const metricNames = [
      'moodRating', 'stressLevel', 'energyLevel', 'workSatisfaction',
      'workLifeBalance', 'sleepQuality', 'socialConnection'
    ];
    
    metricNames.forEach(metricName => {
      const values = metrics.map(m => m[metricName as keyof EmployeeMetrics] as number);
      const timestamps = metrics.map(m => m.timestamp);
      const trend = this.calculateTrend(values);
      
      trends.push({
        metric: metricName,
        values: values.slice(-30), // Last 30 data points
        timestamps: timestamps.slice(-30),
        trend: trend > 0.1 ? 'up' : trend < -0.1 ? 'down' : 'stable',
        changeRate: trend
      });
    });
    
    return trends;
  }

  private calculateCurrentRiskLevel(
    latest: EmployeeMetrics, 
    burnoutPrediction: BurnoutPrediction
  ): 'low' | 'medium' | 'high' {
    // Combine current state with burnout prediction
    let riskScore = burnoutPrediction.riskScore * 0.6; // 60% weight to prediction
    
    // Add current state indicators (40% weight)
    if (latest.stressLevel > 8) riskScore += 0.15;
    if (latest.energyLevel < 3) riskScore += 0.1;
    if (latest.moodRating < 3) riskScore += 0.1;
    if (latest.workSatisfaction < 3) riskScore += 0.05;
    
    return riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low';
  }

  private identifyStressFactors(metrics: EmployeeMetrics[]): string[] {
    const factors: string[] = [];
    const recent = metrics.slice(-7);
    
    if (recent.length === 0) return factors;
    
    const avgStress = recent.reduce((sum, m) => sum + m.stressLevel, 0) / recent.length;
    const avgWorkload = recent.reduce((sum, m) => sum + m.workload, 0) / recent.length;
    const avgSocialConnection = recent.reduce((sum, m) => sum + m.socialConnection, 0) / recent.length;
    const avgWorkLifeBalance = recent.reduce((sum, m) => sum + m.workLifeBalance, 0) / recent.length;
    
    if (avgStress > 7) factors.push('high_stress');
    if (avgWorkload > 8) factors.push('workload');
    if (avgSocialConnection < 4) factors.push('social_isolation');
    if (avgWorkLifeBalance < 4) factors.push('work_life_imbalance');
    
    return factors;
  }

  private identifyProtectiveFactors(metrics: EmployeeMetrics[]): string[] {
    const factors: string[] = [];
    const recent = metrics.slice(-7);
    
    if (recent.length === 0) return factors;
    
    const avgSocialConnection = recent.reduce((sum, m) => sum + m.socialConnection, 0) / recent.length;
    const avgWorkSatisfaction = recent.reduce((sum, m) => sum + m.workSatisfaction, 0) / recent.length;
    const avgSleepQuality = recent.reduce((sum, m) => sum + m.sleepQuality, 0) / recent.length;
    const avgWorkLifeBalance = recent.reduce((sum, m) => sum + m.workLifeBalance, 0) / recent.length;
    
    if (avgSocialConnection > 7) factors.push('strong_social_support');
    if (avgWorkSatisfaction > 7) factors.push('high_job_satisfaction');
    if (avgSleepQuality > 7) factors.push('good_sleep_habits');
    if (avgWorkLifeBalance > 7) factors.push('healthy_work_life_balance');
    
    return factors;
  }

  private personalizeInterventions(interventions: Intervention[], riskProfile: RiskProfile): Intervention[] {
    return interventions.map(intervention => {
      // Adjust priority based on risk profile
      if (riskProfile.currentRiskLevel === 'high' && intervention.priority === 'medium') {
        intervention.priority = 'high';
      }
      
      // Customize descriptions based on specific factors
      if (intervention.category === 'stress_management' && riskProfile.stressFactors.includes('workload')) {
        intervention.description += ' with focus on workload management techniques';
      }
      
      if (intervention.category === 'social_support' && riskProfile.protectiveFactors.includes('strong_social_support')) {
        intervention.estimatedImpact *= 1.2; // Higher impact if social support is already strong
      }
      
      return intervention;
    });
  }

  private getDefaultBurnoutPrediction(): BurnoutPrediction {
    return {
      riskScore: 0.3,
      riskLevel: 'low',
      timeToRisk: 90,
      confidence: 0.5,
      contributingFactors: [],
      recommendations: []
    };
  }

  private getDefaultEngagementForecast(): EngagementForecast {
    return {
      predictedEngagement: 6,
      trend: 'stable',
      confidence: 0.5,
      timeframe: 30,
      influencingFactors: []
    };
  }
}

// Singleton instance
export const predictionEngine = new WellnessPredictionEngine();