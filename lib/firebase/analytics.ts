import { analytics } from '@/lib/firebase';
import { logEvent, setUserProperties, setUserId } from 'firebase/analytics';

// Analytics event types
export interface AnalyticsEvent {
  name: string;
  parameters?: { [key: string]: any };
}

// Custom events for mental health platform
export const ANALYTICS_EVENTS = {
  // Authentication events
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Mental health events
  REPORT_CREATED: 'mental_health_report_created',
  CHAT_SESSION_STARTED: 'chat_session_started',
  VOICE_CHAT_STARTED: 'voice_chat_started',
  
  // Employer events
  EMPLOYEE_ADDED: 'employee_added',
  DASHBOARD_VIEWED: 'employer_dashboard_viewed',
  ANALYTICS_VIEWED: 'analytics_viewed',
  
  // Employee events
  WELLNESS_CHECK: 'wellness_check_completed',
  AI_INTERACTION: 'ai_interaction',
  
  // Engagement events
  PAGE_VIEW: 'page_view',
  FEATURE_USED: 'feature_used',
  ERROR_OCCURRED: 'error_occurred'
} as const;

export class AnalyticsService {
  private static isEnabled(): boolean {
    return analytics !== null && typeof window !== 'undefined';
  }

  // Log custom events
  static logEvent(eventName: string, parameters?: { [key: string]: any }): void {
    if (!this.isEnabled()) return;

    try {
      logEvent(analytics, eventName, {
        timestamp: new Date().toISOString(),
        ...parameters
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Set user properties
  static setUserProperties(properties: { [key: string]: any }): void {
    if (!this.isEnabled()) return;

    try {
      setUserProperties(analytics, properties);
    } catch (error) {
      console.error('Analytics user properties error:', error);
    }
  }

  // Set user ID
  static setUserId(userId: string): void {
    if (!this.isEnabled()) return;

    try {
      setUserId(analytics, userId);
    } catch (error) {
      console.error('Analytics user ID error:', error);
    }
  }

  // Mental health specific events
  static logWellnessReport(reportData: {
    overall_wellness: number;
    stress_level: number;
    risk_level: string;
    employee_role?: string;
  }): void {
    this.logEvent(ANALYTICS_EVENTS.REPORT_CREATED, {
      wellness_score: reportData.overall_wellness,
      stress_level: reportData.stress_level,
      risk_level: reportData.risk_level,
      employee_role: reportData.employee_role
    });
  }

  static logChatInteraction(data: {
    session_type: 'text' | 'voice';
    message_count?: number;
    duration?: number;
  }): void {
    this.logEvent(ANALYTICS_EVENTS.AI_INTERACTION, {
      interaction_type: data.session_type,
      message_count: data.message_count,
      duration_seconds: data.duration
    });
  }

  static logEmployerAction(action: string, data?: { [key: string]: any }): void {
    this.logEvent(ANALYTICS_EVENTS.FEATURE_USED, {
      feature_type: 'employer',
      action,
      ...data
    });
  }

  static logEmployeeAction(action: string, data?: { [key: string]: any }): void {
    this.logEvent(ANALYTICS_EVENTS.FEATURE_USED, {
      feature_type: 'employee',
      action,
      ...data
    });
  }

  static logError(error: string, context?: string): void {
    this.logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
      error_message: error,
      error_context: context,
      user_agent: navigator.userAgent
    });
  }

  static logPageView(pageName: string, userRole?: string): void {
    this.logEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
      page_name: pageName,
      user_role: userRole
    });
  }
}

// Hook for easy analytics integration
export function useAnalytics() {
  return {
    logEvent: AnalyticsService.logEvent,
    setUserProperties: AnalyticsService.setUserProperties,
    setUserId: AnalyticsService.setUserId,
    logWellnessReport: AnalyticsService.logWellnessReport,
    logChatInteraction: AnalyticsService.logChatInteraction,
    logEmployerAction: AnalyticsService.logEmployerAction,
    logEmployeeAction: AnalyticsService.logEmployeeAction,
    logError: AnalyticsService.logError,
    logPageView: AnalyticsService.logPageView
  };
}