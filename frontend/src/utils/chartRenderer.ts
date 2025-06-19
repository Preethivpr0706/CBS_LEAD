// utils/chartRenderer.ts
import html2canvas from 'html2canvas';
import { Client, ClientStatus } from '../types';
import Chart from 'chart.js/auto';

export const renderChartToPng = async (
  chartId: string,
  chartType: 'pie' | 'bar' | 'line',
  data: any,
  options: any,
  width: number = 500,
  height: number = 300
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a container for the chart
      const container = document.createElement('div');
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.backgroundColor = 'white';
      
      // Create canvas element
      const canvas = document.createElement('canvas');
      canvas.id = chartId;
      canvas.width = width;
      canvas.height = height;
      container.appendChild(canvas);
      
      // Add container to document
      document.body.appendChild(container);
      
      // Create chart
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      const chart = new Chart(ctx, {
        type: chartType,
        data: data,
        options: {
          ...options,
          animation: false,
          responsive: false,
          maintainAspectRatio: false
        }
      });
      
      // Wait for chart to render
      setTimeout(async () => {
        try {
          // Use html2canvas to capture the chart
          const canvasImage = await html2canvas(canvas, {
            backgroundColor: 'white',
            scale: 2 // Higher scale for better quality
          });
          
          // Convert to PNG
          const imageData = canvasImage.toDataURL('image/png');
          
          // Clean up
          chart.destroy();
          document.body.removeChild(container);
          
          resolve(imageData);
        } catch (error) {
          console.error('Error capturing chart:', error);
          reject(error);
        }
      }, 200); // Give chart time to render
    } catch (error) {
      console.error('Error creating chart:', error);
      reject(error);
    }
  });
};

export const generateStatusChart = async (clients: Client[]): Promise<string> => {
  // Get status distribution
  const statusCounts: Record<string, number> = {};
  const statusOptions: ClientStatus[] = ['New', 'In Progress', 'Approved', 'Rejected', 'Disbursed', 'Completed'];
  
  // Initialize with zeros
  statusOptions.forEach(status => {
    statusCounts[status] = 0;
  });
  
  // Count clients by status
  clients.forEach(client => {
    statusCounts[client.status] = (statusCounts[client.status] || 0) + 1;
  });
  
  const data = {
    labels: Object.keys(statusCounts),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
      ],
      borderWidth: 1
    }]
  };
  
  const options = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 10
          }
        }
      },
      title: {
        display: true,
        text: 'Client Status Distribution',
        font: {
          size: 14
        }
      }
    }
  };
  
  return renderChartToPng('status-chart', 'pie', data, options);
};

export const generateAreaChart = async (clients: Client[]): Promise<string> => {
  // Get area distribution
  const areaCounts: Record<string, number> = {};
  
  // Count clients by area
  clients.forEach(client => {
    if (client.area) {
      areaCounts[client.area] = (areaCounts[client.area] || 0) + 1;
    }
  });
  
  // Sort areas by count (descending)
  const sortedAreas = Object.keys(areaCounts).sort((a, b) => areaCounts[b] - areaCounts[a]);
  
  // Limit to top 10 areas
  const topAreas = sortedAreas.slice(0, 10);
  const topAreaCounts = topAreas.map(area => areaCounts[area]);
  
  const data = {
    labels: topAreas,
    datasets: [{
      label: 'Number of Clients',
      data: topAreaCounts,
      backgroundColor: 'rgba(54, 162, 235, 0.8)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };
  
  const options = {
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Top Client Areas',
        font: {
          size: 14
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Clients'
        }
      }
    }
  };
  
  return renderChartToPng('area-chart', 'bar', data, options, 500, 300);
};

export const generateMonthlyChart = async (clients: Client[]): Promise<string> => {
  // Group clients by month
  const monthlyData: Record<string, number> = {};
  
  clients.forEach(client => {
    const date = new Date(client.created_at);
    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    
    monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
  });
  
  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    const [monthA, yearA] = a.split(' ');
    const [monthB, yearB] = b.split(' ');
    const yearDiff = parseInt(yearA) - parseInt(yearB);
    if (yearDiff !== 0) return yearDiff;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(monthA) - months.indexOf(monthB);
  });
  
  const data = {
    labels: sortedMonths,
    datasets: [{
      label: 'New Clients',
      data: sortedMonths.map(month => monthlyData[month]),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      tension: 0.1,
      fill: true
    }]
  };
  
  const options = {
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Monthly Client Acquisition',
        font: {
          size: 14
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Clients'
        }
      }
    }
  };
  
  return renderChartToPng('monthly-chart', 'line', data, options, 500, 250);
};
