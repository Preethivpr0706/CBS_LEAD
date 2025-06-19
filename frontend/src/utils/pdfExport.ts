// utils/pdfExport.ts
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Client } from '../types';
import autoTable from 'jspdf-autotable';
import { 
  generateStatusChart, 
  generateAreaChart,
  generateMonthlyChart
} from './chartRenderer';

export const exportToPdf = async (clients: Client[], filename: string): Promise<void> => {
  // Create PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Client Analytics Report', 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Add summary
  doc.setFontSize(14);
  doc.text('Summary', 14, 40);
  
  const totalAmount = clients.reduce((sum, client) => {
  const amount = Number(client.required_amount) || 0;
  return sum + amount;
}, 0);
  // Status counts
  const statusCounts = clients.reduce((acc, client) => {
    acc[client.status] = (acc[client.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const summaryData = [
    ['Total Clients', clients.length.toString()],
    ['Total Required Amount', `₹${totalAmount.toLocaleString()}`],
    ['New Clients', (statusCounts['New'] || 0).toString()],
    ['In Progress', (statusCounts['In Progress'] || 0).toString()],
    ['Approved', (statusCounts['Approved'] || 0).toString()],
    ['Rejected', (statusCounts['Rejected'] || 0).toString()],
    ['Disbursed', (statusCounts['Disbursed'] || 0).toString()]
  ];
  
  // First table - Summary
  let finalY = 45;
  autoTable(doc, {
    startY: finalY,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] },
    didDrawPage: (data) => {
      finalY = data.cursor.y;
    }
  });
  
  // Add client data table
  doc.setFontSize(14);
  doc.text('Client Details', 14, finalY + 15);
  
  const tableData = clients.map(client => [
    client.customer_name,
    client.business_name,
    client.area,
    `₹${client.required_amount.toLocaleString()}`,
    client.status,
    new Date(client.created_at).toLocaleDateString()
  ]);
  
  // Second table - Client details
  autoTable(doc, {
    startY: finalY + 20,
    head: [['Client Name', 'Business', 'Area', 'Amount', 'Status', 'Created Date']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30 }
    },
    didDrawPage: (data) => {
      // Add header on each page
      doc.setFontSize(10);
      doc.text('Chetana Business Solutions - Client Analytics', data.settings.margin.left, 10);
      
      // Add page number at the bottom
      doc.text(`Page ${doc.getNumberOfPages()}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
    }
  });
  
  try {
    // Add a new page for analytics charts
    doc.addPage();
    
    // Add header on analytics page
    doc.setFontSize(10);
    doc.text('Chetana Business Solutions - Client Analytics', 14, 10);
    
    // Add title for analytics page
    doc.setFontSize(18);
    doc.text('Analytics Charts', 14, 22);
    
    // Generate status chart
    const statusChartImage = await generateStatusChart(clients);
    
    // Add status chart title
    doc.setFontSize(14);
    doc.text('Client Status Distribution', 14, 35);
    
    // Add status chart to PDF
    doc.addImage(statusChartImage, 'PNG', 15, 40, 180, 90);
    
    // Generate area chart
    const areaChartImage = await generateAreaChart(clients);
    
    // Add area chart title
    doc.text('Top Client Areas', 14, 140);
    
    // Add area chart to PDF
    doc.addImage(areaChartImage, 'PNG', 15, 145, 180, 90);
    
    // Add a new page for more charts
    doc.addPage();
    
    // Add header on the new page
    doc.setFontSize(10);
    doc.text('Chetana Business Solutions - Client Analytics', 14, 10);
    
    // Add title for the page
    doc.setFontSize(18);
    doc.text('Client Acquisition Trends', 14, 22);
    
    // Generate monthly chart
    const monthlyChartImage = await generateMonthlyChart(clients);
    
    // Add monthly chart title
    doc.setFontSize(14);
    doc.text('Monthly Client Acquisition', 14, 35);
    
    // Add monthly chart to PDF
    doc.addImage(monthlyChartImage, 'PNG', 15, 40, 180, 90);
    
    // Add page numbers to all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${totalPages}`, 14, doc.internal.pageSize.height - 10);
    }
  } catch (error) {
    console.error('Error generating charts for PDF:', error);
    
    // Add error message if charts fail
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(255, 0, 0);
    doc.text('Error generating charts. Please try again.', 14, 40);
    doc.setTextColor(0, 0, 0);
  }
  
  // Save the PDF
  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};
