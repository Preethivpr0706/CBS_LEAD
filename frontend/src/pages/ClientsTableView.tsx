// pages/ClientsTable.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, PlusCircle, ChevronDown, Download, RefreshCw } from 'lucide-react';
import { useClientsStore } from '../store/clientsStore';
import { ClientStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate } from '../utils/formatDate';

import * as XLSX from 'xlsx';

export const ClientsTableView = () => {
  const { clients, fetchClients, isLoading, updateClient } = useClientsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ClientStatus | ''>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredClients, setFilteredClients] = useState(clients);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const tableRef = React.useRef(null);

  const statuses: ClientStatus[] = ['New', 'In Progress', 'Approved', 'Rejected', 'Disbursed', 'Completed'];

  // Handle Excel export
  const handleExport = () => {
    // Prepare data for export
    const exportData = filteredClients.map(client => ({
      'Client Name': client.customer_name,
      'Business Name': client.business_name,
      'Contact Number': client.phone_number,
      'Location': client.area,
      'Amount Needed (₹)': client.required_amount,
      'Monthly Turnover (₹)': client.monthly_turnover,
      'Status': client.status,
      'Last Updated': formatDate(client.updated_at || client.created_at)
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');

    // Generate XLSX file and trigger download
    XLSX.writeFile(workbook, 'Clients_List.xlsx', { compression: true });
  };

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Filter and search clients
  useEffect(() => {
    let result = [...clients];

    if (filterStatus) {
      result = result.filter(client => client.status === filterStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(client =>
        client.customer_name.toLowerCase().includes(query) ||
        client.phone_number.toLowerCase().includes(query) ||
        client.business_name.toLowerCase().includes(query) ||
        client.area.toLowerCase().includes(query)
      );
    }

    setFilteredClients(result);
  }, [clients, searchQuery, filterStatus]);

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (filterButtonRef.current) {
      const rect = filterButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right - 256 // 256px is dropdown width, align right edge
      });
    }
  };

  // Calculate dropdown position when opening
  const handleFilterToggle = () => {
    if (!isFilterOpen) {
      updateDropdownPosition();
    }
    setIsFilterOpen(!isFilterOpen);
  };

  // Update position on scroll and resize
  useEffect(() => {
    if (isFilterOpen) {
      const handleScroll = () => updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();

      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isFilterOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown-container') && !target.closest('.dropdown-portal')) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isFilterOpen]);

  const handleStatusChange = async (clientId: number, newStatus: ClientStatus) => {
    try {
      await updateClient(clientId, { status: newStatus });
      await fetchClients(); // Refresh the list
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 shadow-lg"></div>
          <p className="text-slate-600 font-medium">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Clients Table View</h1>
            <p className="text-lg text-slate-600">Manage your clients in a detailed table format</p>
          </div>

          {/* Filter and search controls */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              {/* Search Bar */}
              <div className="w-full md:w-96">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 bg-white/50 backdrop-blur-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 text-sm font-medium"
                    placeholder="Search clients..."
                  />
                </div>
              </div>

              {/* Button group */}
              <div className="flex items-center space-x-3">
                {/* Filter dropdown */}
                <div className="relative filter-dropdown-container">
                  <button
                    ref={filterButtonRef}
                    type="button"
                    className="inline-flex items-center px-5 py-3 border-2 border-slate-200 shadow-lg text-sm font-semibold rounded-xl text-slate-700 bg-white/70 backdrop-blur-sm hover:bg-white hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    onClick={handleFilterToggle}
                  >
                    <Filter className="-ml-1 mr-3 h-5 w-5 text-slate-500" />
                    {filterStatus || 'All Statuses'}
                    <ChevronDown className={`ml-3 h-5 w-5 text-slate-500 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Export button */}
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-5 py-3 border border-slate-200 text-sm font-semibold rounded-xl shadow-lg text-slate-700 bg-white/70 backdrop-blur-sm hover:bg-white hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                >
                  <Download className="-ml-1 mr-2 h-5 w-5 text-slate-500" />
                  Export
                </button>

                {/* Refresh button */}
                <button
                  onClick={fetchClients}
                  className="inline-flex items-center px-5 py-3 border border-slate-200 text-sm font-semibold rounded-xl shadow-lg text-slate-700 bg-white/70 backdrop-blur-sm hover:bg-white hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                >
                  <RefreshCw className="-ml-1 mr-2 h-5 w-5 text-slate-500" />
                  Refresh
                </button>

                {/* Add Client Button */}
                <Link
                  to="/clients/add"
                  className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transform hover:scale-105 transition-all duration-200"
                >
                  <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                  Add
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Results summary */}
        <div className="mb-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm font-medium text-slate-700 flex items-center">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-xs font-bold mr-3">
                {filteredClients.length}
              </span>
              Showing {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
              {filterStatus && (
                <span className="ml-2 flex items-center">
                  with status <span className="ml-1"><StatusBadge status={filterStatus} size="sm" /></span>
                </span>
              )}
              {searchQuery && (
                <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-medium">
                  matching "{searchQuery}"
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Clients table */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table ref={tableRef} className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50 backdrop-blur-sm">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Amount Needed
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                            {client.customer_name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{client.customer_name}</div>
                            <Link
                              to={`/clients/${client.id}`}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 font-medium">{client.business_name}</div>
                        <div className="text-xs text-slate-500">₹{client.monthly_turnover?.toLocaleString() || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{client.phone_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{client.area}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          ₹{client.required_amount?.toLocaleString() || '0'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={client.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500">
                          {formatDate(client.updated_at || client.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <select
                            value={client.status}
                            onChange={(e) => handleStatusChange(client.id, e.target.value as ClientStatus)}
                            className="block w-40 pl-3 pr-10 py-1.5 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            aria-label={`Change status for ${client.customer_name}`}
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-16 h-16 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-slate-900">No clients found</h3>
                        <p className="mt-2 text-sm text-slate-500">
                          {searchQuery || filterStatus
                            ? "Try adjusting your search or filter criteria."
                            : "Get started by adding a new client."}
                        </p>
                        <div className="mt-6">
                          <Link
                            to="/clients/add"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                            Add Client
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Portal-style dropdown rendered at document body level */}
      {isFilterOpen && (
        <div className="dropdown-portal">
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setIsFilterOpen(false)}
          />
          <div 
            className="absolute z-[9999] w-64 rounded-xl shadow-2xl bg-white/95 backdrop-blur-sm ring-1 ring-slate-200 border border-white/20"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="filter-button"
          >
            <div className="p-2">
              <button
                role="menuitem"
                onClick={() => {
                  setFilterStatus('');
                  setIsFilterOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-all duration-150 ${!filterStatus ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                All Statuses
              </button>
              {statuses.map((status) => (
                <button
                  key={status}
                  role="menuitem"
                  onClick={() => {
                    setFilterStatus(status);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-all duration-150 ${
                    filterStatus === status
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center">
                    <StatusBadge status={status} size="sm" />
                    <span className="ml-3">{status}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};