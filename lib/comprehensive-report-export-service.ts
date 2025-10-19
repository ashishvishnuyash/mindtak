import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface ExportData {
  wellness_metrics: any[];
  gamification_metrics: any;
  conversation_metrics: any;
  user_id: string;
  company_id: string;
  export_date: string;
  user_role: string;
}

export class ComprehensiveReportExportService {
  static async exportToPDF(data: ExportData, userInfo?: any): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Comprehensive Wellness Report', pageWidth / 2, 30, { align: 'center' });
    
    // User Info
    if (userInfo) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`User: ${userInfo.name || userInfo.email}`, 20, 50);
      doc.text(`Role: ${data.user_role}`, 20, 60);
      doc.text(`Export Date: ${new Date(data.export_date).toLocaleDateString()}`, 20, 70);
    }
    
    let yPosition = 90;
    
    // Wellness Metrics Summary
    if (data.wellness_metrics && data.wellness_metrics.length > 0) {
      const latestReport = data.wellness_metrics[0];
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Wellness Metrics Summary', 20, yPosition);
      yPosition += 20;
      
      // Current Metrics Table
      const metricsData = [
        ['Metric', 'Current Value', 'Scale'],
        ['Mood Rating', `${latestReport.mood_rating}/10`, '1-10'],
        ['Stress Level', `${latestReport.stress_level}/10`, '1-10'],
        ['Anxiety Level', `${latestReport.anxiety_level}/10`, '1-10'],
        ['Work Satisfaction', `${latestReport.work_satisfaction}/10`, '1-10'],
        ['Work-Life Balance', `${latestReport.work_life_balance}/10`, '1-10'],
        ['Energy Level', `${latestReport.energy_level}/10`, '1-10'],
        ['Confidence Level', `${latestReport.confidence_level}/10`, '1-10'],
        ['Sleep Quality', `${latestReport.sleep_quality}/10`, '1-10'],
        ['Overall Wellness', `${latestReport.overall_wellness}/10`, '1-10'],
        ['Risk Level', latestReport.risk_level, 'Low/Medium/High']
      ];
      
      (doc as any).autoTable({
        head: [metricsData[0]],
        body: metricsData.slice(1),
        startY: yPosition,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
      
      // Historical Trends
      if (data.wellness_metrics.length > 1) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Historical Trends (Last 7 Reports)', 20, yPosition);
        yPosition += 15;
        
        const trendData = data.wellness_metrics.slice(0, 7).map((report, index) => [
          `Report ${index + 1}`,
          report.mood_rating,
          report.stress_level,
          report.energy_level,
          report.overall_wellness,
          new Date(report.created_at).toLocaleDateString()
        ]);
        
        (doc as any).autoTable({
          head: [['Report', 'Mood', 'Stress', 'Energy', 'Wellness', 'Date']],
          body: trendData,
          startY: yPosition,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [34, 197, 94] }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }
    }
    
    // Gamification Metrics
    if (data.gamification_metrics) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Gamification Metrics', 20, yPosition);
      yPosition += 20;
      
      const gamificationData = [
        ['Metric', 'Value'],
        ['Total Points', data.gamification_metrics.total_points],
        ['Current Streak', data.gamification_metrics.current_streak],
        ['Longest Streak', data.gamification_metrics.longest_streak],
        ['Level', data.gamification_metrics.level],
        ['Badges Earned', data.gamification_metrics.badges.length],
        ['Challenges Completed', data.gamification_metrics.challenges_completed]
      ];
      
      (doc as any).autoTable({
        head: [gamificationData[0]],
        body: gamificationData.slice(1),
        startY: yPosition,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [251, 191, 36] }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
      
      // Badges List
      if (data.gamification_metrics.badges.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Earned Badges:', 20, yPosition);
        yPosition += 10;
        
        doc.setFont('helvetica', 'normal');
        data.gamification_metrics.badges.forEach((badge: string, index: number) => {
          doc.text(`• ${badge}`, 25, yPosition);
          yPosition += 7;
        });
        yPosition += 10;
      }
    }
    
    // Conversation Metrics
    if (data.conversation_metrics) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Conversation Analytics', 20, yPosition);
      yPosition += 20;
      
      const conversationData = [
        ['Metric', 'Value'],
        ['Total Conversations', data.conversation_metrics.total_conversations],
        ['Average Session Duration', `${Math.round(data.conversation_metrics.avg_session_duration / 60)} minutes`],
        ['Total Messages', data.conversation_metrics.total_messages],
        ['Last Conversation', new Date(data.conversation_metrics.last_conversation).toLocaleDateString()]
      ];
      
      (doc as any).autoTable({
        head: [conversationData[0]],
        body: conversationData.slice(1),
        startY: yPosition,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [20, 184, 166] }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }
    
    // AI Analysis (if available)
    if (data.wellness_metrics && data.wellness_metrics[0]?.ai_analysis) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('AI Analysis', 20, yPosition);
      yPosition += 20;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const analysisText = data.wellness_metrics[0].ai_analysis;
      const splitAnalysis = doc.splitTextToSize(analysisText, pageWidth - 40);
      
      splitAnalysis.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });
    }
    
    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${totalPages} - Generated on ${new Date().toLocaleString()}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    const fileName = `wellness-report-${data.user_id}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
  
  static async exportToCSV(data: ExportData): Promise<void> {
    let csvContent = 'Comprehensive Wellness Report\n';
    csvContent += `Export Date,${new Date(data.export_date).toLocaleString()}\n`;
    csvContent += `User ID,${data.user_id}\n`;
    csvContent += `Company ID,${data.company_id}\n`;
    csvContent += `User Role,${data.user_role}\n\n`;
    
    // Wellness Metrics
    if (data.wellness_metrics && data.wellness_metrics.length > 0) {
      csvContent += 'Wellness Metrics\n';
      csvContent += 'Date,Mood Rating,Stress Level,Anxiety Level,Work Satisfaction,Work-Life Balance,Energy Level,Confidence Level,Sleep Quality,Overall Wellness,Risk Level\n';
      
      data.wellness_metrics.forEach(report => {
        csvContent += `${new Date(report.created_at).toLocaleDateString()},${report.mood_rating},${report.stress_level},${report.anxiety_level},${report.work_satisfaction},${report.work_life_balance},${report.energy_level},${report.confidence_level},${report.sleep_quality},${report.overall_wellness},${report.risk_level}\n`;
      });
      csvContent += '\n';
    }
    
    // Gamification Metrics
    if (data.gamification_metrics) {
      csvContent += 'Gamification Metrics\n';
      csvContent += `Total Points,${data.gamification_metrics.total_points}\n`;
      csvContent += `Current Streak,${data.gamification_metrics.current_streak}\n`;
      csvContent += `Longest Streak,${data.gamification_metrics.longest_streak}\n`;
      csvContent += `Level,${data.gamification_metrics.level}\n`;
      csvContent += `Badges Earned,${data.gamification_metrics.badges.length}\n`;
      csvContent += `Challenges Completed,${data.gamification_metrics.challenges_completed}\n`;
      csvContent += `Badges,${data.gamification_metrics.badges.join('; ')}\n\n`;
    }
    
    // Conversation Metrics
    if (data.conversation_metrics) {
      csvContent += 'Conversation Metrics\n';
      csvContent += `Total Conversations,${data.conversation_metrics.total_conversations}\n`;
      csvContent += `Average Session Duration (minutes),${Math.round(data.conversation_metrics.avg_session_duration / 60)}\n`;
      csvContent += `Total Messages,${data.conversation_metrics.total_messages}\n`;
      csvContent += `Last Conversation,${new Date(data.conversation_metrics.last_conversation).toLocaleDateString()}\n\n`;
    }
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `wellness-report-${data.user_id}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
