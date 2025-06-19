// pages/Analytics.tsx
import React, { useState, useEffect } from 'react';
import { useClientsStore } from '../store/clientsStore';
import { Client, ClientStatus } from '../types';
import { 
  BarChart, 
  FileSpreadsheet, 
  FileText, // Changed from FilePdf to FileText
  Filter, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  X,
  Loader2
} from 'lucide-react';
import { DateRangePicker } from '../components/analytics/DateRangePicker';
import { exportToExcel } from '../utils/excelExport';
import { exportToPdf } from '../utils/pdfExport';
import { AnalyticsChart } from '../components/analytics/AnalyticsChart';
import { AnalyticsSummary } from '../components/analytics/AnalyticsSummary';
import toast from 'react-hot-toast';

export const Analytics: React.FC = () => {
  const { clients, fetchClients, isLoading } = useClientsStore();
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { startDate: null, endDate: null } as { startDate: Date | null, endDate: Date | null },
    status: [] as ClientStatus[],
    area: [] as string[],
    minAmount: '',
    maxAmount: ''
  });
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  
  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  
  // Extract available areas from clients
  useEffect(() => {
    if (clients.length > 0) {
      const areas = Array.from(new Set(clients.map(client => client.area))).filter(Boolean).sort();
      setAvailableAreas(areas as string[]);
    }
  }, [clients]);
  
  // Apply filters to clients
  useEffect(() => {
    let result = [...clients];
    
    // Filter by date range
    if (filters.dateRange.startDate && filters.dateRange.endDate) {
      const startDate = new Date(filters.dateRange.startDate);
      const endDate = new Date(filters.dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      
      result = result.filter(client => {
        const createdDate = new Date(client.created_at);
        return createdDate >= startDate && createdDate <= endDate;
      });
    }
    
    // Filter by status
    if (filters.status.length > 0) {
      result = result.filter(client => filters.status.includes(client.status));
    }
    
    // Filter by area
    if (filters.area.length > 0) {
      result = result.filter(client => filters.area.includes(client.area));
    }
    
    // Filter by amount
    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount);
      result = result.filter(client => client.required_amount >= minAmount);
    }
    
    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount);
      result = result.filter(client => client.required_amount <= maxAmount);
    }
    
    setFilteredClients(result);
  }, [clients, filters]);
  
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      dateRange: { startDate: null, endDate: null },
      status: [],
      area: [],
      minAmount: '',
      maxAmount: ''
    });
  };
  
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await exportToExcel(filteredClients, 'client_analytics');
    } catch (error) {
      console.error('Failed to export to Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExportPdf = async () => {
  setIsExporting(true);
  try {
    await exportToPdf(filteredClients, 'client_analytics');
    toast.success('PDF report generated successfully');
  } catch (error) {
    console.error('Failed to export to PDF:', error);
    toast.error('Failed to generate PDF report');
  } finally {
    setIsExporting(false);
  }
};
  
  const statusOptions: ClientStatus[] = ['New', 'In Progress', 'Approved', 'Rejected', 'Disbursed', 'Completed'];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart className="mr-3 h-8 w-8 text-blue-600" />
              Analytics Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Analyze client data and generate reports
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title={showFilters ? 'Hide Filters' : 'Show Filters'}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            <button
              onClick={handleExportExcel}
              disabled={isExporting || filteredClients.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export to Excel"
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 h-4 w-4" />
              )}
              Export to Excel
            </button>
            
            <button
              onClick={handleExportPdf}
              disabled={isExporting || filteredClients.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export to PDF"
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Export to PDF
            </button>
          </div>
        </div>
        
        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                  title="Clear all filters"
                >
                  Clear all filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-500"
                  title="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                  Date Range
                </label>
                <DateRangePicker
                  startDate={filters.dateRange.startDate}
                  endDate={filters.dateRange.endDate}
                  onChange={(range) => handleFilterChange('dateRange', range)}
                />
              </div>
              
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Users className="mr-2 h-4 w-4 text-gray-500" />
                  Status
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {statusOptions.map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('status', [...filters.status, status]);
                          } else {
                            handleFilterChange('status', filters.status.filter(s => s !== status));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Area Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                  Area
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableAreas.map((area) => (
                    <label key={area} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.area.includes(area)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('area', [...filters.area, area]);
                          } else {
                            handleFilterChange('area', filters.area.filter(a => a !== area));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Amount Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
                  Amount Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Min</label>
                    <input
                      type="number"
                      value={filters.minAmount}
                      onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Min"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Max</label>
                    <input
                      type="number"
                      value={filters.maxAmount}
                      onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-lg text-gray-700">Loading analytics data...</span>
          </div>
        )}
        
        {/* Analytics Content */}
        {!isLoading && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <AnalyticsSummary clients={filteredClients} />
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Clients by Status</h3>
                <AnalyticsChart 
                  type="pie"
                  data={filteredClients}
                  category="status"
                />
              </div>
              
              <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Clients by Area</h3>
                <AnalyticsChart 
                  type="bar"
                  data={filteredClients}
                  category="area"
                />
              </div>
              
              <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Client Acquisition</h3>
                <AnalyticsChart 
                  type="line"
                  data={filteredClients}
                  category="created_at"
                  timeframe="monthly"
                />
              </div>
            </div>
            
            {/* Data Table */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Client Data</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Showing {filteredClients.length} of {clients.length} clients
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Area
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{client.customer_name}</div>
                            <div className="text-sm text-gray-500">{client.phone_number}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{client.business_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{client.area}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">₹{client.required_amount.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              client.status === 'New' ? 'bg-blue-100 text-blue-800' :
                              client.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              client.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              client.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              client.status === 'Disbursed' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {client.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(client.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          No clients match the selected filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};