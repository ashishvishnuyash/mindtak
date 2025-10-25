import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { MentalHealthReport, User } from '@/types';

export interface PDFExportConfig {
  title: string;
  subtitle?: string;
  includeCharts: boolean;
  includeRawData: boolean;
  includeAnalytics: boolean;
  dateRange: {
    start: string;
    end: string;
  };
  filters?: {
    departments?: string[];
    riskLevels?: string[];
    employeeIds?: string[];
  };
}

export interface ReportData {
  reports: MentalHealthReport[];
  employees: User[];
  analytics: {
    totalReports: number;
    avgWellness: number;
    riskDistribution: { [key: string]: number };
    departmentStats: { [key: string]: any };
    trendData: any[];
  };
}

export class PDFExportService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  async generateReportPDF(
    config: PDFExportConfig,
    data: ReportData,
    chartElements?: HTMLElement[]
  ): Promise<Blob> {
    try {
      // Add header
      this.addHeader(config.title, config.subtitle);
      
      // Add date range and filters
      this.addReportInfo(config);
      
      // Add executive summary
      this.addExecutiveSummary(data.analytics);
      
      // Add charts if requested
      if (config.includeCharts && chartElements) {
        await this.addCharts(chartElements);
      }
      
      // Add analytics section
      if (config.includeAnalytics) {
        this.addAnalyticsSection(data.analytics);
      }
      
      // Add raw data if requested
      if (config.includeRawData) {
        this.addRawDataTable(data.reports, data.employees);
      }
      
      // Add footer
      this.addFooter();
      
      return this.doc.output('blob');
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        config,
        dataLength: data.reports.length
      });
      throw new Error(`Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private addHeader(title: string, subtitle?: string) {
    // Add gradient background
    this.doc.setFillColor(59, 130, 246); // Blue color
    this.doc.rect(this.margin, this.margin, this.pageWidth - 2 * this.margin, 20, 'F');
    
    // Add company logo placeholder with better styling
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(this.margin + 5, this.margin + 3, 14, 14, 'F');
    this.doc.setTextColor(59, 130, 246);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PROVOTO', this.margin + 8, this.margin + 12);
    
    // Title with better typography
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin + 25, this.margin + 12);
    
    // Subtitle with better styling
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, this.margin + 25, this.margin + 17);
    }
    
    // Add decorative elements
    this.doc.setDrawColor(255, 255, 255);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin + 25, this.margin + 19, this.pageWidth - this.margin - 5, this.margin + 19);
    
    this.currentY = this.margin + 30;
  }

  private addReportInfo(config: PDFExportConfig) {
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const reportDate = new Date().toLocaleDateString();
    const dateRange = `${config.dateRange.start} to ${config.dateRange.end}`;
    
    this.doc.text(`Report Generated: ${reportDate}`, this.margin, this.currentY);
    this.doc.text(`Date Range: ${dateRange}`, this.margin, this.currentY + 5);
    
    if (config.filters) {
      let filterText = 'Filters: ';
      if (config.filters.departments?.length) {
        filterText += `Departments: ${config.filters.departments.join(', ')}`;
      }
      if (config.filters.riskLevels?.length) {
        filterText += ` | Risk Levels: ${config.filters.riskLevels.join(', ')}`;
      }
      this.doc.text(filterText, this.margin, this.currentY + 10);
      this.currentY += 15;
    } else {
      this.currentY += 10;
    }
    
    // Add separator line
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  private addExecutiveSummary(analytics: any) {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(59, 130, 246);
    this.doc.text('Executive Summary', this.margin, this.currentY);
    this.currentY += 8;
    
    // Add decorative line
    this.doc.setDrawColor(59, 130, 246);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    // Create summary cards layout
    const summaryCards = [
      { 
        title: 'Total Reports', 
        value: analytics.totalReports.toString(), 
        color: [59, 130, 246],
        icon: 'RPT'
      },
      { 
        title: 'Avg Wellness Score', 
        value: `${isNaN(analytics.avgWellness) ? '0.0' : analytics.avgWellness.toFixed(1)}/10`, 
        color: [34, 197, 94],
        icon: 'AVG'
      },
      { 
        title: 'High Risk', 
        value: (analytics.riskDistribution.high || 0).toString(), 
        color: [239, 68, 68],
        icon: 'HIGH'
      },
      { 
        title: 'Medium Risk', 
        value: (analytics.riskDistribution.medium || 0).toString(), 
        color: [245, 158, 11],
        icon: 'MED'
      },
      { 
        title: 'Low Risk', 
        value: (analytics.riskDistribution.low || 0).toString(), 
        color: [34, 197, 94],
        icon: 'LOW'
      }
    ];
    
    // Draw summary cards in a grid
    const cardWidth = 35;
    const cardHeight = 20;
    const cardsPerRow = 3;
    let cardX = this.margin;
    let cardY = this.currentY;
    
    summaryCards.forEach((card, index) => {
      if (index > 0 && index % cardsPerRow === 0) {
        cardX = this.margin;
        cardY += cardHeight + 5;
      }
      
      // Draw card background
      this.doc.setFillColor(card.color[0], card.color[1], card.color[2]);
      this.doc.rect(cardX, cardY, cardWidth, cardHeight, 'F');
      
      // Add card content
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(card.icon, cardX + 3, cardY + 6);
      
      this.doc.setFontSize(7);
      this.doc.text(card.title, cardX + 3, cardY + 10);
      
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(card.value, cardX + 3, cardY + 16);
      
      cardX += cardWidth + 5;
    });
    
    this.currentY = cardY + cardHeight + 15;
  }

  private async addCharts(chartElements: HTMLElement[]) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Analytics & Visualizations', this.margin, this.currentY);
    this.currentY += 8;
    
    for (let i = 0; i < chartElements.length; i++) {
      const chartElement = chartElements[i];
      
      try {
        // Check if we need a new page
        if (this.currentY > this.pageHeight - 80) {
          this.doc.addPage();
          this.currentY = this.margin;
        }
        
        // Convert chart to canvas
        const canvas = await html2canvas(chartElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true
        });
        
        // Calculate dimensions
        const imgWidth = this.pageWidth - 2 * this.margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add chart title if available
        const chartTitle = chartElement.getAttribute('data-chart-title') || `Chart ${i + 1}`;
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(chartTitle, this.margin, this.currentY);
        this.currentY += 5;
        
        // Add the chart image
        const imgData = canvas.toDataURL('image/png');
        this.doc.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight);
        
        this.currentY += imgHeight + 10;
        
      } catch (error) {
        console.error(`Error processing chart ${i + 1}:`, error);
        // Add placeholder text if chart fails
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'italic');
        this.doc.text(`Chart ${i + 1} could not be rendered`, this.margin, this.currentY);
        this.currentY += 10;
      }
    }
  }

  private addAnalyticsSection(analytics: any) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Detailed Analytics', this.margin, this.currentY);
    this.currentY += 8;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    // Risk distribution
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Risk Level Distribution:', this.margin, this.currentY);
    this.currentY += 5;
    
    this.doc.setFont('helvetica', 'normal');
    Object.entries(analytics.riskDistribution).forEach(([level, count]) => {
      this.doc.text(`  ${level.charAt(0).toUpperCase() + level.slice(1)}: ${count} reports`, this.margin + 5, this.currentY);
      this.currentY += 4;
    });
    
    this.currentY += 5;
    
    // Department stats
    if (analytics.departmentStats && Object.keys(analytics.departmentStats).length > 0) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Department Statistics:', this.margin, this.currentY);
      this.currentY += 5;
      
      this.doc.setFont('helvetica', 'normal');
      Object.entries(analytics.departmentStats).forEach(([dept, stats]: [string, any]) => {
        this.doc.text(`  ${dept}: ${stats.count} employees, Avg Wellness: ${stats.avgWellness?.toFixed(1) || 'N/A'}`, this.margin + 5, this.currentY);
        this.currentY += 4;
      });
    }
    
    this.currentY += 10;
  }

  private addRawDataTable(reports: MentalHealthReport[], employees: User[]) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Raw Data', this.margin, this.currentY);
    this.currentY += 8;
    
    // Create employee lookup map
    const employeeMap = new Map(employees.map(emp => [emp.id, emp]));
    
    // Basic metrics table
    this.addBasicMetricsTable(reports, employeeMap);
    
    // Add comprehensive metrics summary
    this.addComprehensiveMetricsSummary(reports);
  }

  private addBasicMetricsTable(reports: MentalHealthReport[], employeeMap: Map<string, User>) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(59, 130, 246);
    this.doc.text('Basic Wellness Metrics Data', this.margin, this.currentY);
    this.currentY += 8;

    // Table headers for basic metrics
    const headers = [
      'Date',
      'Employee',
      'Mood',
      'Stress',
      'Energy',
      'Anxiety',
      'Work Sat',
      'W-L Balance',
      'Confidence',
      'Sleep',
      'Wellness',
      'Risk'
    ];
    
    const colWidths = [20, 35, 12, 12, 12, 12, 12, 12, 12, 12, 12, 15];
    const startX = this.margin;
    
    // Draw table headers with enhanced styling
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(startX, this.currentY - 3, colWidths.reduce((sum, width) => sum + width, 0), 8, 'F');
    
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    let x = startX;
    
    headers.forEach((header, index) => {
      this.doc.text(header, x + 2, this.currentY);
      x += colWidths[index];
    });
    
    this.currentY += 6;
    
    // Draw table rows with alternating colors
    this.doc.setFont('helvetica', 'normal');
    reports.slice(0, 15).forEach((report, index) => { // Limit to 15 rows to avoid page overflow
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 30) {
        this.doc.addPage();
        this.currentY = this.margin;
        
        // Redraw headers
        this.doc.setFillColor(240, 240, 240);
        this.doc.rect(startX, this.currentY - 3, colWidths.reduce((sum, width) => sum + width, 0), 8, 'F');
        
        this.doc.setFont('helvetica', 'bold');
        x = startX;
        headers.forEach((header, headerIndex) => {
          this.doc.text(header, x + 2, this.currentY);
          x += colWidths[headerIndex];
        });
        this.currentY += 6;
        this.doc.setFont('helvetica', 'normal');
      }
      
      // Add alternating row background
      if (index % 2 === 0) {
        this.doc.setFillColor(248, 250, 252);
        this.doc.rect(startX, this.currentY - 2, colWidths.reduce((sum, width) => sum + width, 0), 4, 'F');
      }
      
      const employee = employeeMap.get(report.employee_id);
      const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown';
      const reportDate = new Date(report.created_at).toLocaleDateString();
      
      const rowData = [
        reportDate,
        employeeName,
        report.mood_rating.toString(),
        report.stress_level.toString(),
        report.energy_level.toString(),
        (report.anxiety_level || report.anxious_level || 'N/A').toString(),
        report.work_satisfaction.toString(),
        (report.work_life_balance || 'N/A').toString(),
        (report.confidence_level || report.confident_level || 'N/A').toString(),
        (report.sleep_quality || 'N/A').toString(),
        report.overall_wellness.toString(),
        report.risk_level.toUpperCase()
      ];
      
      x = startX;
      rowData.forEach((data, dataIndex) => {
        this.doc.text(data, x + 2, this.currentY);
        x += colWidths[dataIndex];
      });
      
      this.currentY += 4;
    });
    
    if (reports.length > 15) {
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(128, 128, 128);
      this.doc.text(`... and ${reports.length - 15} more reports`, this.margin, this.currentY);
    }
    
    this.currentY += 10;
  }

  private addComprehensiveMetricsSummary(reports: MentalHealthReport[]) {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 120) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(59, 130, 246); // Blue color
    this.doc.text('Comprehensive Wellness Metrics Analysis', this.margin, this.currentY);
    this.currentY += 10;

    // Add decorative line
    this.doc.setDrawColor(59, 130, 246);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;

    // Basic metrics averages with better formatting
    this.addMetricsSection('Basic Wellness Metrics (1-10 Scale)', this.getBasicMetricsData(reports), '/10');

    this.currentY += 5;

    // AI-generated metrics averages
    const reportsWithMetrics = reports.filter(r => r.metrics);
    if (reportsWithMetrics.length > 0) {
      this.addMetricsSection('AI-Generated Comprehensive Metrics (0-3 Scale)', this.getAIMetricsData(reports), '/3');
      
      // Add detailed AI metrics table
      this.addDetailedAIMetricsTable(reportsWithMetrics);
    } else {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(128, 128, 128);
      this.doc.text('No AI-generated comprehensive metrics available', this.margin + 5, this.currentY);
      this.currentY += 8;
    }

    this.currentY += 10;
  }

  private addMetricsSection(title: string, metrics: Array<{name: string, value: string, color?: number[]}>, suffix: string) {
    try {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(title, this.margin, this.currentY);
      this.currentY += 6;

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');

      // Create two columns for better layout
      const col1X = this.margin + 5;
      const col2X = this.margin + 100;
      let col1Y = this.currentY;
      let col2Y = this.currentY;

      metrics.forEach((metric, index) => {
        const isCol1 = index % 2 === 0;
        const currentX = isCol1 ? col1X : col2X;
        const currentY = isCol1 ? col1Y : col2Y;

        // Add colored bullet point
        if (metric.color && Array.isArray(metric.color) && metric.color.length === 3) {
          this.doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
          this.doc.rect(currentX - 4, currentY - 2, 2, 2, 'F');
        }

        this.doc.text(`${metric.name}: ${metric.value}${suffix}`, currentX, currentY);
        
        if (isCol1) {
          col1Y += 4;
        } else {
          col2Y += 4;
        }
      });

      this.currentY = Math.max(col1Y, col2Y) + 5;
    } catch (error) {
      console.error('Error in addMetricsSection:', error);
      // Fallback to simple text layout
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);
      
      metrics.forEach((metric) => {
        this.doc.text(`${metric.name}: ${metric.value}${suffix}`, this.margin + 5, this.currentY);
        this.currentY += 4;
      });
      this.currentY += 5;
    }
  }

  private safeAverage(values: number[]): string {
    const validValues = values.filter(v => !isNaN(v) && v !== null && v !== undefined);
    if (validValues.length === 0) return 'N/A';
    const avg = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
    return isNaN(avg) ? 'N/A' : avg.toFixed(1);
  }

  private getBasicMetricsData(reports: MentalHealthReport[]) {
    const metrics = [
      { name: 'Mood', value: this.safeAverage(reports.map(r => r.mood_rating || 0)), color: [59, 130, 246] },
      { name: 'Stress', value: this.safeAverage(reports.map(r => r.stress_level || 0)), color: [239, 68, 68] },
      { name: 'Energy', value: this.safeAverage(reports.map(r => r.energy_level || 0)), color: [34, 197, 94] },
      { name: 'Work Satisfaction', value: this.safeAverage(reports.map(r => r.work_satisfaction || 0)), color: [139, 92, 246] },
      { name: 'Anxiety', value: this.safeAverage(reports.map(r => r.anxiety_level || r.anxious_level || 0)), color: [245, 158, 11] },
      { name: 'Work-Life Balance', value: this.safeAverage(reports.map(r => r.work_life_balance || 0)), color: [99, 102, 241] },
      { name: 'Confidence', value: this.safeAverage(reports.map(r => r.confidence_level || r.confident_level || 0)), color: [236, 72, 153] },
      { name: 'Sleep Quality', value: this.safeAverage(reports.map(r => r.sleep_quality || 0)), color: [20, 184, 166] }
    ];
    return metrics;
  }

  private getAIMetricsData(reports: MentalHealthReport[]) {
    const aiMetrics = [
      { name: 'Emotional Tone', key: 'emotional_tone', color: [59, 130, 246] },
      { name: 'Stress & Anxiety', key: 'stress_anxiety', color: [239, 68, 68] },
      { name: 'Motivation & Engagement', key: 'motivation_engagement', color: [34, 197, 94] },
      { name: 'Social Connectedness', key: 'social_connectedness', color: [139, 92, 246] },
      { name: 'Self-Esteem', key: 'self_esteem', color: [245, 158, 11] },
      { name: 'Assertiveness', key: 'assertiveness', color: [99, 102, 241] },
      { name: 'Work-Life Balance AI', key: 'work_life_balance_metric', color: [236, 72, 153] },
      { name: 'Cognitive Functioning', key: 'cognitive_functioning', color: [20, 184, 166] },
      { name: 'Emotional Regulation', key: 'emotional_regulation', color: [168, 85, 247] },
      { name: 'Substance Use', key: 'substance_use', color: [107, 114, 128] }
    ];

    return aiMetrics.map(metric => {
      const values = reports
        .filter(r => r.metrics?.[metric.key as keyof typeof r.metrics] !== undefined)
        .map(r => r.metrics?.[metric.key as keyof typeof r.metrics] || 0);
      
      return { name: metric.name, value: this.safeAverage(values), color: metric.color };
    });
  }

  private addDetailedAIMetricsTable(reports: MentalHealthReport[]) {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 80) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Detailed AI Metrics by Report', this.margin, this.currentY);
    this.currentY += 8;

    // Table headers for AI metrics
    const headers = [
      'Date',
      'Employee',
      'Emo Tone',
      'Stress',
      'Motivation',
      'Social',
      'Self-Esteem',
      'Assertive',
      'W-L Balance',
      'Cognitive',
      'Emo Reg',
      'Substance'
    ];
    
    const colWidths = [18, 30, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12];
    const startX = this.margin;
    
    // Draw table headers with background
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(startX, this.currentY - 3, colWidths.reduce((sum, width) => sum + width, 0), 8, 'F');
    
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'bold');
    let x = startX;
    
    headers.forEach((header, index) => {
      this.doc.text(header, x + 2, this.currentY);
      x += colWidths[index];
    });
    
    this.currentY += 6;
    
    // Draw table rows
    this.doc.setFont('helvetica', 'normal');
    reports.slice(0, 20).forEach((report, index) => { // Limit to 20 rows
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 20) {
        this.doc.addPage();
        this.currentY = this.margin;
        
        // Redraw headers
        this.doc.setFillColor(240, 240, 240);
        this.doc.rect(startX, this.currentY - 3, colWidths.reduce((sum, width) => sum + width, 0), 8, 'F');
        
        this.doc.setFont('helvetica', 'bold');
        x = startX;
        headers.forEach((header, headerIndex) => {
          this.doc.text(header, x + 2, this.currentY);
          x += colWidths[headerIndex];
        });
        this.currentY += 6;
        this.doc.setFont('helvetica', 'normal');
      }
      
      const reportDate = new Date(report.created_at).toLocaleDateString();
      const employeeName = report.employee_id.substring(0, 8) + '...'; // Truncate for space
      
      const rowData = [
        reportDate,
        employeeName,
        report.metrics?.emotional_tone?.toString() || 'N/A',
        report.metrics?.stress_anxiety?.toString() || 'N/A',
        report.metrics?.motivation_engagement?.toString() || 'N/A',
        report.metrics?.social_connectedness?.toString() || 'N/A',
        report.metrics?.self_esteem?.toString() || 'N/A',
        report.metrics?.assertiveness?.toString() || 'N/A',
        report.metrics?.work_life_balance_metric?.toString() || 'N/A',
        report.metrics?.cognitive_functioning?.toString() || 'N/A',
        report.metrics?.emotional_regulation?.toString() || 'N/A',
        report.metrics?.substance_use?.toString() || 'N/A'
      ];
      
      x = startX;
      rowData.forEach((data, dataIndex) => {
        this.doc.text(data, x + 2, this.currentY);
        x += colWidths[dataIndex];
      });
      
      this.currentY += 4;
    });
    
    if (reports.length > 20) {
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(`... and ${reports.length - 20} more reports with AI metrics`, this.margin, this.currentY);
    }
    
    this.currentY += 8;
  }

  private addFooter() {
    const footerY = this.pageHeight - 15;
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(128, 128, 128);
    
    // Page number
    const pageNum = (this.doc as any).internal.getCurrentPageInfo()?.pageNumber || 1;
    const totalPages = (this.doc as any).internal.getNumberOfPages() || 1;
    this.doc.text(`Page ${pageNum} of ${totalPages}`, this.pageWidth - this.margin - 20, footerY);
    
    // Generated timestamp
    this.doc.text(`Generated on ${new Date().toLocaleString()}`, this.margin, footerY);
  }
}

// Utility function to extract chart elements from DOM
export function extractChartElements(containerId: string): HTMLElement[] {
  const container = document.getElementById(containerId);
  if (!container) return [];
  
  // Find all chart containers (Recharts components)
  const chartElements = container.querySelectorAll('.recharts-wrapper, [data-chart]');
  return Array.from(chartElements) as HTMLElement[];
}

// Utility function to generate analytics data
export function generateAnalyticsFromReports(reports: MentalHealthReport[], employees: User[]) {
  const totalReports = reports.length;
  const validWellnessValues = reports.filter(r => !isNaN(r.overall_wellness) && r.overall_wellness !== null && r.overall_wellness !== undefined);
  const avgWellness = validWellnessValues.length > 0 
    ? validWellnessValues.reduce((sum, r) => sum + r.overall_wellness, 0) / validWellnessValues.length 
    : 0;
  
  const riskDistribution = reports.reduce((acc, report) => {
    acc[report.risk_level] = (acc[report.risk_level] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  const departmentStats: { [key: string]: any } = {};
  employees.forEach(employee => {
    const dept = employee.department || 'Unassigned';
    const employeeReports = reports.filter(r => r.employee_id === employee.id);
    
    if (!departmentStats[dept]) {
      departmentStats[dept] = { count: 0, avgWellness: 0, reports: 0 };
    }
    
    departmentStats[dept].count++;
    departmentStats[dept].reports += employeeReports.length;
    
    if (employeeReports.length > 0) {
      const validWellnessReports = employeeReports.filter(r => !isNaN(r.overall_wellness) && r.overall_wellness !== null && r.overall_wellness !== undefined);
      const deptAvgWellness = validWellnessReports.length > 0 
        ? validWellnessReports.reduce((sum, r) => sum + r.overall_wellness, 0) / validWellnessReports.length
        : 0;
      departmentStats[dept].avgWellness = deptAvgWellness;
    }
  });

  // Calculate comprehensive metrics averages
  const reportsWithMetrics = reports.filter(r => r.metrics);
  const comprehensiveMetrics = {
    emotional_tone: 0,
    stress_anxiety: 0,
    motivation_engagement: 0,
    social_connectedness: 0,
    self_esteem: 0,
    assertiveness: 0,
    work_life_balance_metric: 0,
    cognitive_functioning: 0,
    emotional_regulation: 0,
    substance_use: 0
  };

  if (reportsWithMetrics.length > 0) {
    const metricKeys = Object.keys(comprehensiveMetrics) as Array<keyof typeof comprehensiveMetrics>;
    metricKeys.forEach(key => {
      const reportsWithThisMetric = reportsWithMetrics.filter(r => r.metrics?.[key] !== undefined);
      if (reportsWithThisMetric.length > 0) {
        comprehensiveMetrics[key] = reportsWithThisMetric.reduce((sum, r) => sum + (r.metrics?.[key] || 0), 0) / reportsWithThisMetric.length;
      }
    });
  }
  
  // Generate trend data (last 30 days)
  const trendData = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayReports = reports.filter(r => r.created_at.startsWith(dateStr));
    const avgMood = dayReports.length > 0 ? dayReports.reduce((sum, r) => sum + r.mood_rating, 0) / dayReports.length : 0;
    const avgStress = dayReports.length > 0 ? dayReports.reduce((sum, r) => sum + r.stress_level, 0) / dayReports.length : 0;
    const avgEnergy = dayReports.length > 0 ? dayReports.reduce((sum, r) => sum + r.energy_level, 0) / dayReports.length : 0;
    
    trendData.push({
      date: dateStr,
      mood: avgMood,
      stress: avgStress,
      energy: avgEnergy,
      reports: dayReports.length
    });
  }
  
  return {
    totalReports,
    avgWellness,
    riskDistribution,
    departmentStats,
    trendData,
    comprehensiveMetrics,
    reportsWithMetrics: reportsWithMetrics.length
  };
}





