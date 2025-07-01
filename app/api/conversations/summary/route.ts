import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { HIPAACompliance } from '@/lib/security/hipaa-compliance';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Parse request body
    const summary = await request.json();
    
    if (!summary || !summary.sessionId) {
      return NextResponse.json(
        { error: 'Invalid request. Session ID is required.' },
        { status: 400 }
      );
    }

    // Log data access for HIPAA compliance
    HIPAACompliance.logDataAccess(userId, 'conversation_summary', 'create');

    // Store conversation summary
    const summaryRef = doc(collection(db, 'conversation_summaries'));
    await setDoc(summaryRef, {
      id: summaryRef.id,
      session_id: summary.sessionId,
      user_id: userId,
      user_role: userRole,
      duration: summary.duration || 0,
      message_count: summary.messageCount || 0,
      final_emotional_state: summary.finalEmotionalState || null,
      final_risk_level: summary.finalRiskLevel || 'low',
      risk_indicators: summary.riskIndicators || [],
      created_at: serverTimestamp()
    });

    // If high risk, create an alert for employers (anonymized)
    if (summary.finalRiskLevel === 'high' && userRole === 'employee') {
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (userData && userData.company_id) {
        const alertRef = doc(collection(db, 'risk_alerts'));
        await setDoc(alertRef, {
          id: alertRef.id,
          company_id: userData.company_id,
          department: userData.department || 'Unknown',
          level: summary.riskIndicators.includes('crisis_language') ? 'critical' : 'high',
          description: 'Employee showing signs of high stress or distress',
          affected_employees: 1,
          timestamp: serverTimestamp(),
          action_required: summary.riskIndicators.includes('crisis_language'),
          // No personal identifiers stored
          anonymized: true
        });
      }
    }

    return NextResponse.json({ success: true, id: summaryRef.id });
  } catch (error) {
    console.error('Error saving conversation summary:', error);
    return NextResponse.json(
      { error: 'Failed to save conversation summary' },
      { status: 500 }
    );
  }
}