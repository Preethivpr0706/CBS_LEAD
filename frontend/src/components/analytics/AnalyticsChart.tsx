// components/AnalyticsChart.tsx
import React, { useMemo } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Client } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsChartProps {
  type: 'bar' | 'line' | 'pie';
  data: Client[];
  category: keyof Client | 'created_at';
  timeframe?: 'daily' | 'weekly' | 'monthly';
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ 
  type, 
  data, 
  category,
  timeframe = 'monthly'
}) => {
  const chartData = useMemo(() => {
    if (data.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'No Data',
          data: [0],
          backgroundColor: ['rgba(200, 200, 200, 0.2)'],
          borderColor: ['rgba(200, 200, 200, 1)'],
          borderWidth: 1
        }]
      };
    }
    
    if (category === 'created_at') {
      // Time-based chart
      const dateMap = new Map<string, number>();
      
      data.forEach(client => {
        const date = new Date(client.created_at);
        let key: string;
        
        if (timeframe === 'daily') {
          key = date.toISOString().split('T')[0];
        } else if (timeframe === 'weekly') {
          // Get the week number
          const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
          const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
          const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
          key = `Week ${weekNumber}, ${date.getFullYear()}`;
        } else {
          // Monthly
          key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        }
        
        dateMap.set(key, (dateMap.get(key) || 0) + 1);
      });
      
      // Sort keys by date
      const sortedKeys = Array.from(dateMap.keys()).sort((a, b) => {
        if (timeframe === 'daily') {
          return new Date(a).getTime() - new Date(b).getTime();
        } else if (timeframe === 'weekly') {
          const [weekA, yearA] = a.split(', ');
          const [weekB, yearB] = b.split(', ');
          const yearDiff = parseInt(yearA) - parseInt(yearB);
          if (yearDiff !== 0) return yearDiff;
          return parseInt(weekA.replace('Week ', '')) - parseInt(weekB.replace('Week ', ''));
        } else {
          const [monthA, yearA] = a.split(' ');
          const [monthB, yearB] = b.split(' ');
          const yearDiff = parseInt(yearA) - parseInt(yearB);
          if (yearDiff !== 0) return yearDiff;
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return months.indexOf(monthA) - months.indexOf(monthB);
        }
      });
      
      return {
        labels: sortedKeys,
        datasets: [{
          label: 'Number of Clients',
          data: sortedKeys.map(key => dateMap.get(key) || 0),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          tension: 0.1
        }]
      };
    } else {
      // Category-based chart
      const categoryMap = new Map<string, number>();
      
      data.forEach(client => {
        const value = client[category] as string;
        if (value) {
          categoryMap.set(value, (categoryMap.get(value) || 0) + 1);
        }
      });
      
      const labels = Array.from(categoryMap.keys());
      const values = labels.map(label => categoryMap.get(label) || 0);
      
      // Generate colors
      const backgroundColors = [
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(199, 199, 199, 0.2)',
        'rgba(83, 102, 255, 0.2)',
        'rgba(40, 159, 64, 0.2)',
        'rgba(210, 199, 199, 0.2)',
      ];
      
      const borderColors = [
                'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(199, 199, 199, 1)',
        'rgba(83, 102, 255, 1)',
        'rgba(40, 159, 64, 1)',
        'rgba(210, 199, 199, 1)',
      ];
      
      return {
        labels,
        datasets: [{
          label: `Clients by ${category}`,
          data: values,
          backgroundColor: labels.map((_, i) => backgroundColors[i % backgroundColors.length]),
          borderColor: labels.map((_, i) => borderColors[i % borderColors.length]),
          borderWidth: 1
        }]
      };
    }
  }, [data, category, timeframe]);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }
  
  return (
    <div className="h-64">
      {type === 'bar' && <Bar data={chartData} options={options} />}
      {type === 'line' && <Line data={chartData} options={options} />}
      {type === 'pie' && <Pie data={chartData} options={options} />}
    </div>
  );
};

