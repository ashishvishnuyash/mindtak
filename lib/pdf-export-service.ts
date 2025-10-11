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
      throw new Error('Failed to generate PDF report');
    }
  }

  private addHeader(title: string, subtitle?: string) {
    // Company logo placeholder (you can add actual logo later)
    this.doc.setFillColor(59, 130, 246); // Blue color
    this.doc.rect(this.margin, this.margin, this.pageWidth - 2 * this.margin, 15, 'F');
    
    // Title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin + 5, this.margin + 10);
    
    // Subtitle
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, this.margin + 5, this.margin + 15);
    }
    
    this.currentY = this.margin + 25;
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
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Executive Summary', this.margin, this.currentY);
    this.currentY += 8;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const summary = [
      `Total Reports: ${analytics.totalReports}`,
      `Average Wellness Score: ${analytics.avgWellness.toFixed(1)}/10`,
      `High Risk Reports: ${analytics.riskDistribution.high || 0}`,
      `Medium Risk Reports: ${analytics.riskDistribution.medium || 0}`,
      `Low Risk Reports: ${analytics.riskDistribution.low || 0}`
    ];
    
    summary.forEach(line => {
      this.doc.text(`• ${line}`, this.margin + 5, this.currentY);
      this.currentY += 5;
    });
    
    this.currentY += 10;
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
    
    // Table headers
    const headers = [
      'Date',
      'Employee',
      'Mood',
      'Stress',
      'Energy',
      'Wellness',
      'Risk Level'
    ];
    
    const colWidths = [25, 40, 15, 15, 15, 15, 20];
    const startX = this.margin;
    
    // Draw table headers
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    let x = startX;
    
    headers.forEach((header, index) => {
      this.doc.text(header, x, this.currentY);
      x += colWidths[index];
    });
    
    this.currentY += 5;
    
    // Draw table rows
    this.doc.setFont('helvetica', 'normal');
    reports.slice(0, 20).forEach((report, index) => { // Limit to 20 rows to avoid page overflow
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 20) {
        this.doc.addPage();
        this.currentY = this.margin;
        
        // Redraw headers
        this.doc.setFont('helvetica', 'bold');
        x = startX;
        headers.forEach((header, headerIndex) => {
          this.doc.text(header, x, this.currentY);
          x += colWidths[headerIndex];
        });
        this.currentY += 5;
        this.doc.setFont('helvetica', 'normal');
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
        report.overall_wellness.toString(),
        report.risk_level.toUpperCase()
      ];
      
      x = startX;
      rowData.forEach((data, dataIndex) => {
        this.doc.text(data, x, this.currentY);
        x += colWidths[dataIndex];
      });
      
      this.currentY += 4;
    });
    
    if (reports.length > 20) {
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(`... and ${reports.length - 20} more reports`, this.margin, this.currentY);
    }
    
    this.currentY += 10;
  }

  private addFooter() {
    const footerY = this.pageHeight - 15;
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(128, 128, 128);
    
    // Page number
    const pageNum = this.doc.internal.getCurrentPageInfo().pageNumber;
    const totalPages = this.doc.internal.getNumberOfPages();
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
  const avgWellness = totalReports > 0 
    ? reports.reduce((sum, r) => sum + r.overall_wellness, 0) / totalReports 
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
      const deptAvgWellness = employeeReports.reduce((sum, r) => sum + r.overall_wellness, 0) / employeeReports.length;
      departmentStats[dept].avgWellness = deptAvgWellness;
    }
  });
  
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
    trendData
  };
}





