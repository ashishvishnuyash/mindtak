import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';

// Rate limiting for authentication attempts
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset if window has passed
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Check if limit exceeded
    if (record.count >= this.maxAttempts) {
      return false;
    }

    // Increment attempt count
    record.count++;
    record.lastAttempt = now;
    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return 0;

    const elapsed = Date.now() - record.lastAttempt;
    return Math.max(0, this.windowMs - elapsed);
  }
}

// Global rate limiter instances
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const passwordResetRateLimiter = new RateLimiter(3, 60 * 60 * 1000); // 3 attempts per hour

// Input validation and sanitization
export class SecurityValidator {
  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Password strength validation
  static isStrongPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Sanitize user input
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000); // Limit length
  }

  // Validate user role
  static isValidRole(role: string): role is 'employee' | 'employer' {
    return role === 'employee' || role === 'employer';
  }

  // Validate wellness report data
  static validateWellnessReport(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const requiredFields = [
      'stress_level', 'mood_rating', 'energy_level', 'work_satisfaction',
      'work_life_balance', 'anxiety_level', 'confidence_level', 'sleep_quality'
    ];

    for (const field of requiredFields) {
      const value = data[field];
      if (typeof value !== 'number' || value < 1 || value > 10) {
        errors.push(`${field} must be a number between 1 and 10`);
      }
    }

    if (data.comments && typeof data.comments === 'string' && data.comments.length > 1000) {
      errors.push('Comments must be less than 1000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Security monitoring
export class SecurityMonitor {
  private static suspiciousActivities: Map<string, number> = new Map();

  // Log suspicious activity
  static logSuspiciousActivity(userId: string, activity: string): void {
    const key = `${userId}:${activity}`;
    const count = this.suspiciousActivities.get(key) || 0;
    this.suspiciousActivities.set(key, count + 1);

    // Log to console in development, would send to monitoring service in production
    console.warn(`Suspicious activity detected: ${activity} for user ${userId} (count: ${count + 1})`);
  }

  // Check for suspicious patterns
  static isSuspiciousActivity(userId: string, activity: string, threshold: number = 10): boolean {
    const key = `${userId}:${activity}`;
    const count = this.suspiciousActivities.get(key) || 0;
    return count >= threshold;
  }

  // Reset activity count
  static resetActivityCount(userId: string, activity: string): void {
    const key = `${userId}:${activity}`;
    this.suspiciousActivities.delete(key);
  }
}

// Data encryption utilities (for sensitive data)
export class DataEncryption {
  // Simple client-side encryption for sensitive comments
  // Note: In production, use proper encryption libraries
  static encryptSensitiveData(data: string, key?: string): string {
    if (!data) return data;
    
    // This is a simple obfuscation - use proper encryption in production
    const encoded = btoa(data);
    return encoded;
  }

  static decryptSensitiveData(encryptedData: string, key?: string): string {
    if (!encryptedData) return encryptedData;
    
    try {
      return atob(encryptedData);
    } catch {
      return encryptedData; // Return as-is if decryption fails
    }
  }
}

// Session security
export class SessionSecurity {
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private static lastActivity = Date.now();

  // Update last activity timestamp
  static updateActivity(): void {
    this.lastActivity = Date.now();
  }

  // Check if session is expired
  static isSessionExpired(): boolean {
    return Date.now() - this.lastActivity > this.SESSION_TIMEOUT;
  }

  // Force session refresh if needed
  static async checkSessionValidity(): Promise<boolean> {
    if (this.isSessionExpired()) {
      try {
        await auth.signOut();
        return false;
      } catch (error) {
        console.error('Error signing out expired session:', error);
      }
    }
    return true;
  }

  // Get remaining session time
  static getRemainingSessionTime(): number {
    return Math.max(0, this.SESSION_TIMEOUT - (Date.now() - this.lastActivity));
  }
}

// HIPAA compliance helpers
export class HIPAACompliance {
  // Anonymize user data for employer views
  static anonymizeEmployeeData(employeeData: any): any {
    return {
      ...employeeData,
      first_name: 'Anonymous',
      last_name: 'Employee',
      email: `anonymous-${employeeData.id?.substring(0, 8)}@company.com`,
      // Keep only necessary fields for analytics
      department: employeeData.department,
      id: employeeData.id
    };
  }

  // Remove personally identifiable information from reports
  static sanitizeReportForEmployer(report: any): any {
    const sanitized = { ...report };
    
    // Remove or anonymize personal comments
    if (sanitized.comments) {
      sanitized.comments = '[Personal comments removed for privacy]';
    }
    
    // Keep only aggregate data
    return {
      id: sanitized.id,
      overall_wellness: sanitized.overall_wellness,
      stress_level: sanitized.stress_level,
      mood_rating: sanitized.mood_rating,
      energy_level: sanitized.energy_level,
      work_satisfaction: sanitized.work_satisfaction,
      work_life_balance: sanitized.work_life_balance,
      risk_level: sanitized.risk_level,
      created_at: sanitized.created_at,
      employee_id: sanitized.employee_id // Keep for aggregation, but don't expose employee details
    };
  }

  // Log data access for audit trail
  static logDataAccess(userId: string, dataType: string, action: string): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      dataType,
      action,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
    };

    // In production, send to secure audit logging service
    console.log('Data access log:', logEntry);
  }

  // Generate anonymized insights for employers
  static generateAnonymizedInsights(reports: any[]): any {
    if (reports.length === 0) return null;

    const totalReports = reports.length;
    const avgWellness = reports.reduce((sum, r) => sum + r.overall_wellness, 0) / totalReports;
    const avgStress = reports.reduce((sum, r) => sum + r.stress_level, 0) / totalReports;
    const avgMood = reports.reduce((sum, r) => sum + r.mood_rating, 0) / totalReports;

    // Risk distribution
    const riskCounts = reports.reduce((acc, r) => {
      acc[r.risk_level] = (acc[r.risk_level] || 0) + 1;
      return acc;
    }, { low: 0, medium: 0, high: 0 });

    // Trend analysis (simplified)
    const recentReports = reports.slice(-7); // Last 7 reports
    const olderReports = reports.slice(-14, -7); // Previous 7 reports

    let trend = 'stable';
    if (recentReports.length > 0 && olderReports.length > 0) {
      const recentAvg = recentReports.reduce((sum, r) => sum + r.overall_wellness, 0) / recentReports.length;
      const olderAvg = olderReports.reduce((sum, r) => sum + r.overall_wellness, 0) / olderReports.length;
      
      if (recentAvg > olderAvg + 0.5) trend = 'improving';
      else if (recentAvg < olderAvg - 0.5) trend = 'declining';
    }

    return {
      totalReports,
      averageWellness: Math.round(avgWellness * 10) / 10,
      
      averageStress: Math.round(avgStress * 10) / 10,
      averageMood: Math.round(avgMood * 10) / 10,
      riskDistribution: {
        low: riskCounts.low,
        medium: riskCounts.medium,
        high: riskCounts.high
      },
      trend,
      timeframe: {
        start: reports[0]?.created_at,
        end: reports[reports.length - 1]?.created_at
      }
    };
  }
}