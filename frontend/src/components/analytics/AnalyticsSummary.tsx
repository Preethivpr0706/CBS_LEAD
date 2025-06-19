// components/AnalyticsSummary.tsx
import React, { useMemo } from 'react';
import { Client } from '../../types';
import { Users, TrendingUp, DollarSign, Calendar } from 'lucide-react';

interface AnalyticsSummaryProps {
  clients: Client[];
}

export const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({ clients }) => {
  const summaryData = useMemo(() => {
    // Total clients
    const totalClients = clients.length;
    
    // Total required amount - Convert to number to ensure addition instead of concatenation
    const totalAmount = clients.reduce((sum, client) => {
      const amount = Number(client.required_amount) || 0;
      return sum + amount;
    }, 0);
    
    // Clients by status
    const statusCounts = clients.reduce((acc, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Clients added this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const clientsThisMonth = clients.filter(client => 
      new Date(client.created_at) >= startOfMonth
    ).length;
    
    // Conversion rate (Approved + Disbursed / Total)
    const approvedCount = statusCounts['Approved'] || 0;
    const disbursedCount = statusCounts['Disbursed'] || 0;
    const conversionRate = totalClients > 0 
      ? ((approvedCount + disbursedCount) / totalClients) * 100 
      : 0;
    
    return {
      totalClients,
      totalAmount,
      statusCounts,
      clientsThisMonth,
      conversionRate
    };
  }, [clients]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Clients */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Total Clients</dt>
              <dd>
                <div className="text-lg font-semibold text-gray-900">{summaryData.totalClients}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      {/* Total Amount */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Total Required Amount</dt>
              <dd>
                <div className="text-lg font-semibold text-gray-900">₹{summaryData.totalAmount.toLocaleString()}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      {/* Conversion Rate */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="p-3 rounded-full bg-purple-50 text-purple-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
              <dd>
                <div className="text-lg font-semibold text-gray-900">{summaryData.conversionRate.toFixed(1)}%</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      {/* Clients This Month */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Clients This Month</dt>
              <dd>
                <div className="text-lg font-semibold text-gray-900">{summaryData.clientsThisMonth}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};