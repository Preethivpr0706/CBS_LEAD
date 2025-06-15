
import React, { useEffect } from 'react';
import { Users, CreditCard, TrendingUp, Clock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { useClientsStore } from '../store/clientsStore';
import { formatDate } from '../utils/formatDate';
import { Link } from 'react-router-dom';
import { formatMySQLDateTime, isSameDay } from '../utils/dateUtils';

export const Dashboard: React.FC = () => {
  const { 
    clients, 
    followUps, 
    loans,
    fetchClients, 
    fetchClientFollowUps,
    fetchClientLoans,
    isLoading,
    error 
  } = useClientsStore();

  // Fetch data on component mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Fetch follow-ups and loans for all clients
  useEffect(() => {
    const fetchAllData = async () => {
      for (const client of clients) {
        await fetchClientFollowUps(client.id);
        await fetchClientLoans(client.id);
      }
    };

    if (clients.length > 0) {
      fetchAllData();
    }
  }, [clients, fetchClientFollowUps, fetchClientLoans]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 m-6 rounded-xl bg-red-50 border border-red-200">
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Error loading dashboard</h3>
            <div className="mt-2 text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalClients = clients.length;
  
  const hasLoans = (clientId: number) => {
    return loans[clientId] && loans[clientId].length > 0;
  };

  const activeClients = clients.filter(client => 
    (client.status !== 'Completed' && client.status !== 'Rejected') ||
    hasLoans(client.id)
  ).length;

  const totalDisbursed = Object.values(loans)
    .flat()
    .reduce((sum, loan) => sum + Number(loan.amount), 0)
    .toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

  const disbursedCount = Object.values(loans)
    .flat()
    .length;

  const clientsWithLoans = clients.filter(client => 
    loans[client.id] && loans[client.id].length > 0
  ).length;

  const today = new Date().toISOString().split('T')[0];
  const followUpsDueToday = clients.filter(client => isSameDay(client.next_follow_up));

  const allFollowUps = Object.values(followUps)
    .flat()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.customer_name : 'Unknown Client';
  };

  const allLoans = Object.values(loans)
    .flat()
    .sort((a, b) => 
      new Date(b.disbursement_date).getTime() - new Date(a.disbursement_date).getTime()
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your business today.</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <DashboardCard
            title="Total Clients"
            value={totalClients}
            icon={<Users className="h-7 w-7 text-blue-600" />}
            bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
          />
          
          <DashboardCard
            title="Active Clients"
            value={activeClients}
            icon={<TrendingUp className="h-7 w-7 text-emerald-600" />}
            bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100"
          />
          
          <DashboardCard
            title="Loans Disbursed"
            value={disbursedCount}
            icon={<CreditCard className="h-7 w-7 text-purple-600" />}
            bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
          />
          
          <DashboardCard
            title="Total Amount"
            value={totalDisbursed}
            icon={<CreditCard className="h-7 w-7 text-green-600" />}
            bgColor="bg-gradient-to-br from-green-50 to-green-100"
          />
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3 mb-8">
          
          {/* Recent Loans */}
          <div className="bg-white overflow-hidden rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <div className="flex items-center text-white">
                <CreditCard className="h-6 w-6 mr-3" />
                <h3 className="text-lg font-semibold">Recent Loans</h3>
              </div>
            </div>
           
            <div className="p-6">
              {allLoans.length > 0 ? (
                <div className="space-y-4">
                  {allLoans.map((loan, index) => (
                    <div key={loan.id} className="group">
                      <Link 
                        to={`/clients/${loan.client_id}`} 
                        className="block p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-purple-600">
                                {getClientName(loan.client_id).charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 group-hover:text-purple-600">
                                {getClientName(loan.client_id)}
                              </p>
                              <p className="text-sm text-gray-500">
                                ₹{loan.amount.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                              {formatDate(loan.disbursement_date)}
                            </span>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-500" />
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No loans disbursed</h3>
                  <p className="text-gray-500">Start disbursing loans to see them here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white overflow-hidden rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <div className="flex items-center text-white">
                <Clock className="h-6 w-6 mr-3" />
                <h3 className="text-lg font-semibold">Recent Activity</h3>
              </div>
            </div>
            
            <div className="p-6">
              {allFollowUps.length > 0 ? (
                <div className="space-y-4">
                  {allFollowUps.map((followUp) => (
                    <div key={followUp.id} className="group">
                      <Link 
                        to={`/clients/${followUp.client_id}`} 
                        className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-600">
                                {getClientName(followUp.client_id).charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 group-hover:text-blue-600">
                                {getClientName(followUp.client_id)}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {followUp.type}: {followUp.notes.substring(0, 40)}...
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              {formatDate(followUp.date)}
                            </span>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                  <p className="text-gray-500">Start adding follow-ups to see recent activity.</p>
                </div>
              )}
            </div>
          </div>

          {/* Follow-ups Due Today */}
          <div className="bg-white overflow-hidden rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <div className="flex items-center text-white">
                <AlertCircle className="h-6 w-6 mr-3" />
                <h3 className="text-lg font-semibold">Due Today</h3>
                {followUpsDueToday.length > 0 && (
                  <span className="ml-auto bg-white bg-opacity-20 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {followUpsDueToday.length}
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {followUpsDueToday.length > 0 ? (
                <div className="space-y-4">
                  {followUpsDueToday.map((client) => (
                    <div key={client.id} className="group">
                      <Link 
                        to={`/clients/${client.id}`} 
                        className="block p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-orange-600">
                                {client.customer_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 group-hover:text-orange-600">
                                {client.customer_name}
                              </p>
                              <p className="text-sm text-gray-500">{client.phone_number}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                              URGENT
                            </span>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500" />
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          <Clock className="h-4 w-4 mr-2 text-orange-500" />
                          <span className="font-medium">
                            Due at: {formatMySQLDateTime(client.next_follow_up)}
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                  <p className="text-gray-500">No follow-ups due today.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};