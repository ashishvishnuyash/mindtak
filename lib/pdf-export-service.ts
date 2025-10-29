import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import type { MentalHealthReport, User } from '@/types';

// Extend jsPDF type to include autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

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
    // Modern gradient-style header background
    this.doc.setFillColor(59, 130, 246); // Primary blue
    this.doc.rect(this.margin, this.margin, this.pageWidth - 2 * this.margin, 20, 'F');
    
    // Add subtle shadow effect
    this.doc.setFillColor(45, 100, 200); // Darker blue for shadow
    this.doc.rect(this.margin + 1, this.margin + 1, this.pageWidth - 2 * this.margin, 20, 'F');
    
    // Main header background
    this.doc.setFillColor(59, 130, 246);
    this.doc.rect(this.margin, this.margin, this.pageWidth - 2 * this.margin, 20, 'F');
    
    // Company logo area (enhanced)
    this.doc.setFillColor(255, 255, 255);
    this.doc.circle(this.margin + 10, this.margin + 10, 6, 'F');
    this.doc.setTextColor(59, 130, 246);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('D', this.margin + 7, this.margin + 13);
    
    // Title with better typography
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin + 25, this.margin + 12);
    
    // Subtitle with improved styling
    if (subtitle) {
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(240, 248, 255); // Light blue
      this.doc.text(subtitle, this.margin + 25, this.margin + 17);
    }
    
    // Add decorative line
    this.doc.setDrawColor(255, 255, 255);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin + 5, this.margin + 22, this.pageWidth - this.margin - 5, this.margin + 22);
    
    this.currentY = this.margin + 35;
  }

  private addReportInfo(config: PDFExportConfig) {
    // Info box with subtle background
    this.doc.setFillColor(248, 250, 252); // Light gray background
    this.doc.rect(this.margin, this.currentY - 3, this.pageWidth - 2 * this.margin, 20, 'F');
    
    // Border for info box
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, this.currentY - 3, this.pageWidth - 2 * this.margin, 20);
    
    this.doc.setTextColor(51, 65, 85); // Dark gray
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const dateRange = `${new Date(config.dateRange.start).toLocaleDateString()} to ${new Date(config.dateRange.end).toLocaleDateString()}`;
    
    this.doc.text(`Report Generated: ${reportDate}`, this.margin + 5, this.currentY + 2);
    this.doc.text(`Analysis Period: ${dateRange}`, this.margin + 5, this.currentY + 7);
    
    if (config.filters) {
      let filterText = 'Applied Filters: ';
      if (config.filters.departments?.length) {
        filterText += `Departments (${config.filters.departments.join(', ')})`;
      }
      if (config.filters.riskLevels?.length) {
        filterText += ` | Risk Levels (${config.filters.riskLevels.join(', ')})`;
      }
      this.doc.text(filterText, this.margin + 5, this.currentY + 12);
      this.currentY += 25;
    } else {
      this.currentY += 20;
    }
    
    // Add elegant separator
    this.doc.setDrawColor(59, 130, 246);
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;
  }

  private addExecutiveSummary(analytics: any) {
    // Section header with icon and styling
    this.doc.setFillColor(34, 197, 94); // Green background
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 8, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Executive Summary', this.margin + 3, this.currentY + 3);
    this.currentY += 12;
    
    // Summary cards layout
    const cardWidth = (this.pageWidth - 2 * this.margin - 10) / 2;
    const cardHeight = 25;
    
    // Left card - Key Metrics
    this.doc.setFillColor(240, 253, 244); // Light green
    this.doc.rect(this.margin, this.currentY, cardWidth, cardHeight, 'F');
    this.doc.setDrawColor(34, 197, 94);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, this.currentY, cardWidth, cardHeight);
    
    this.doc.setTextColor(22, 101, 52); // Dark green
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Key Metrics', this.margin + 3, this.currentY + 5);
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Total Reports: ${analytics.totalReports}`, this.margin + 3, this.currentY + 10);
    this.doc.text(`Avg Wellness: ${analytics.avgWellness.toFixed(1)}/10`, this.margin + 3, this.currentY + 15);
    
    // Wellness status indicator
    const statusText = analytics.avgWellness >= 7 ? 'Excellent' : analytics.avgWellness >= 5 ? 'Good' : 'Needs Attention';
    this.doc.text(`Status: ${statusText}`, this.margin + 3, this.currentY + 20);
    
    // Right card - Risk Distribution
    this.doc.setFillColor(254, 242, 242); // Light red
    this.doc.rect(this.margin + cardWidth + 5, this.currentY, cardWidth, cardHeight, 'F');
    this.doc.setDrawColor(239, 68, 68);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin + cardWidth + 5, this.currentY, cardWidth, cardHeight);
    
    this.doc.setTextColor(153, 27, 27); // Dark red
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Risk Distribution', this.margin + cardWidth + 8, this.currentY + 5);
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`High Risk: ${analytics.riskDistribution.high || 0}`, this.margin + cardWidth + 8, this.currentY + 10);
    this.doc.text(`Medium Risk: ${analytics.riskDistribution.medium || 0}`, this.margin + cardWidth + 8, this.currentY + 15);
    this.doc.text(`Low Risk: ${analytics.riskDistribution.low || 0}`, this.margin + cardWidth + 8, this.currentY + 20);
    
    this.currentY += cardHeight + 15;
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
    // Section header
    this.doc.setFillColor(147, 51, 234); // Purple background
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 8, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Detailed Analytics', this.margin + 3, this.currentY + 3);
    this.currentY += 15;
    
    // Risk Distribution with visual bars
    this.doc.setTextColor(51, 65, 85);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Risk Level Distribution', this.margin, this.currentY);
    this.currentY += 8;
    
    const totalReports = Object.values(analytics.riskDistribution).reduce((sum: number, count: any) => sum + count, 0);
    const barWidth = this.pageWidth - 2 * this.margin - 60;
    
    Object.entries(analytics.riskDistribution).forEach(([level, count]: [string, any]) => {
      const percentage = totalReports > 0 ? (count / totalReports) * 100 : 0;
      const barLength = (percentage / 100) * barWidth;
      
      // Risk level colors
      const colors = {
        high: [239, 68, 68],
        medium: [245, 158, 11],
        low: [34, 197, 94]
      };
      const color = colors[level as keyof typeof colors] || [156, 163, 175];
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${level.charAt(0).toUpperCase() + level.slice(1)}:`, this.margin + 5, this.currentY);
      
      // Progress bar background
      this.doc.setFillColor(243, 244, 246);
      this.doc.rect(this.margin + 35, this.currentY - 3, barWidth, 6, 'F');
      
      // Progress bar fill
      this.doc.setFillColor(color[0], color[1], color[2]);
      this.doc.rect(this.margin + 35, this.currentY - 3, barLength, 6, 'F');
      
      // Percentage and count
      this.doc.text(`${count} (${percentage.toFixed(1)}%)`, this.margin + 35 + barWidth + 5, this.currentY);
      
      this.currentY += 8;
    });
    
    this.currentY += 10;
    
    // Department Statistics with enhanced layout
    if (analytics.departmentStats && Object.keys(analytics.departmentStats).length > 0) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Department Performance', this.margin, this.currentY);
      this.currentY += 8;
      
      // Table-like layout for departments
      this.doc.setFillColor(248, 250, 252);
      this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 6, 'F');
      
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(71, 85, 105);
      this.doc.text('Department', this.margin + 3, this.currentY + 2);
      this.doc.text('Employees', this.margin + 60, this.currentY + 2);
      this.doc.text('Avg Wellness', this.margin + 100, this.currentY + 2);
      this.doc.text('Reports', this.margin + 140, this.currentY + 2);
      
      this.currentY += 8;
      
      Object.entries(analytics.departmentStats).forEach(([dept, stats]: [string, any], index) => {
        // Alternating row colors
        if (index % 2 === 0) {
          this.doc.setFillColor(249, 250, 251);
          this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 6, 'F');
        }
        
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(51, 65, 85);
        
        this.doc.text(dept, this.margin + 3, this.currentY + 2);
        this.doc.text(stats.count.toString(), this.margin + 60, this.currentY + 2);
        this.doc.text(stats.avgWellness?.toFixed(1) || 'N/A', this.margin + 100, this.currentY + 2);
        this.doc.text(stats.reports.toString(), this.margin + 140, this.currentY + 2);
        
        this.currentY += 6;
      });
    }
    
    this.currentY += 15;
  }

  private addRawDataTable(reports: MentalHealthReport[], employees: User[]) {
    // Section header
    this.doc.setFillColor(99, 102, 241); // Indigo background
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 8, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Detailed Report Data', this.margin + 3, this.currentY + 3);
    this.currentY += 15;
    
    // Create employee lookup map
    const employeeMap = new Map(employees.map(emp => [emp.id, emp]));
    
    // Enhanced table with better styling
    const tableData = reports.slice(0, 25).map((report, index) => {
      const employee = employeeMap.get(report.employee_id);
      const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown';
      const reportDate = new Date(report.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: '2-digit'

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
>>>>>>> 7896dd2a291aa89587983ef18534e01126dd4d78
      });
      
      return [
        reportDate,
        employeeName,
        `${report.mood_rating}/10`,
        `${report.stress_level}/10`,
        `${report.energy_level}/10`,
        `${report.overall_wellness}/10`,
        report.risk_level.toUpperCase()
      ];
    });
    
    // Use autoTable for better formatting (if available)
    if ((this.doc as any).autoTable) {
      (this.doc as any).autoTable({
        head: [['Date', 'Employee', 'Mood', 'Stress', 'Energy', 'Wellness', 'Risk Level']],
        body: tableData,
        startY: this.currentY,
        styles: { 
          fontSize: 8,
          cellPadding: 2,
          lineColor: [226, 232, 240],
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [99, 102, 241],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 35 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 20, halign: 'center' },
          5: { cellWidth: 20, halign: 'center' },
          6: { cellWidth: 25, halign: 'center' }
        }
      });
      
      this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    } else {
      // Fallback to manual table drawing with enhanced styling
      const headers = ['Date', 'Employee', 'Mood', 'Stress', 'Energy', 'Wellness', 'Risk'];
      const colWidths = [25, 40, 18, 18, 18, 18, 25];
      const startX = this.margin;
      
      // Header background
      this.doc.setFillColor(248, 250, 252);
      this.doc.rect(startX, this.currentY - 2, this.pageWidth - 2 * this.margin, 8, 'F');
      
      // Draw table headers
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(71, 85, 105);
      let x = startX;
      
      headers.forEach((header, index) => {
        this.doc.text(header, x + 2, this.currentY + 2);
        x += colWidths[index];
      });
      
      this.currentY += 8;
      
      // Draw table rows with alternating colors
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      
      tableData.forEach((rowData, rowIndex) => {
        // Check if we need a new page
        if (this.currentY > this.pageHeight - 25) {
          this.doc.addPage();
          this.currentY = this.margin;
          
          // Redraw headers on new page
          this.doc.setFillColor(248, 250, 252);
          this.doc.rect(startX, this.currentY - 2, this.pageWidth - 2 * this.margin, 8, 'F');
          
          this.doc.setFont('helvetica', 'bold');
          this.doc.setTextColor(71, 85, 105);
          x = startX;
          headers.forEach((header, headerIndex) => {
            this.doc.text(header, x + 2, this.currentY + 2);
            x += colWidths[headerIndex];
          });
          this.currentY += 8;
          this.doc.setFont('helvetica', 'normal');
        }
        
        // Alternating row colors
        if (rowIndex % 2 === 0) {
          this.doc.setFillColor(249, 250, 251);
          this.doc.rect(startX, this.currentY - 2, this.pageWidth - 2 * this.margin, 6, 'F');
        }
        
        this.doc.setTextColor(51, 65, 85);
        x = startX;
        rowData.forEach((data, dataIndex) => {
          this.doc.text(data, x + 2, this.currentY + 2);
          x += colWidths[dataIndex];
        });
        
        this.currentY += 6;
      });
    }
    
    if (reports.length > 25) {
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(107, 114, 128);
      this.doc.text(`Showing 25 of ${reports.length} total reports. Full data available in system.`, this.margin, this.currentY + 5);
    }
    
    this.currentY += 15;
  }

  private addFooter() {
    const footerY = this.pageHeight - 20;
    
    // Footer background
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(0, footerY - 5, this.pageWidth, 25, 'F');
    
    // Footer border
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.5);
    this.doc.line(0, footerY - 5, this.pageWidth, footerY - 5);
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 116, 139);
    
    // Company branding
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Diltak.ai Wellness Platform', this.margin, footerY);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Confidential & Secure Mental Health Analytics', this.margin, footerY + 4);
    
    // Page number with better styling
    const pageNum = (this.doc as any).internal.getCurrentPageInfo()?.pageNumber || 1;
    const totalPages = (this.doc as any).internal.getNumberOfPages() || 1;
    this.doc.text(`Page ${pageNum} of ${totalPages}`, this.pageWidth - this.margin - 25, footerY);
    
    // Generated timestamp
    this.doc.text(`Generated: ${new Date().toLocaleString()}`, this.pageWidth - this.margin - 60, footerY + 4);
    
    // Privacy notice
    this.doc.setTextColor(156, 163, 175);
    this.doc.text('This report contains confidential information. Handle with care.', this.pageWidth / 2, footerY + 8, { align: 'center' });
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





