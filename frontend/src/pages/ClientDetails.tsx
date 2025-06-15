import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit2, Trash2, Phone, Mail, MapPin, CreditCard, RefreshCw, Clock, History, Building2, DollarSign } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { FollowUpForm } from '../components/FollowUpForm';
import { FollowUpTimeline } from '../components/FollowUpTimeline';
import { LoanDisbursementForm } from '../components/LoanDisbursementForm';
import { useClientsStore } from '../store/clientsStore';
import { Client, FollowUp, Loan } from '../types';
import { formatDate, formatDateTime } from '../utils/formatDate';
import { ClientSummaryFormat } from '../components/ClientSummaryFormat';

export const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const { getClientById, deleteClient, addFollowUp, fetchClientFollowUps, addLoan, fetchClientLoans } = useClientsStore();
   
  const client = getClientById(parseInt(id || '0', 10));

  if (!client) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Client not found</h3>
          <p className="text-gray-500">The requested client could not be located.</p>
        </div>
      </div>
    );
  }

  React.useEffect(() => {
    if (client) {
      fetchClientFollowUps(client.id);
      fetchClientLoans(client.id);
    }
  }, [client, fetchClientFollowUps, fetchClientLoans]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      await deleteClient(client.id);
      navigate('/clients');
    }
  };

  const handleFollowUpSubmit = async (followUpData: Partial<FollowUp>) => {
    try {
      await addFollowUp(client.id, followUpData);
      console.log('Follow-up data:', followUpData);
    } catch (error) {
      console.error('Failed to add follow-up:', error);
    }
  };

  const handleLoanSubmit = async (loanData: Partial<Loan>) => {
    try {
      const formData = new FormData();
      
      formData.append('amount', loanData.amount!.toString());
      formData.append('disbursement_date', loanData.disbursement_date!);
      
      if (loanData.proof_file) {
        formData.append('proof', loanData.proof_file);
      }

      await addLoan(client.id, formData);
      alert('Loan recorded successfully');
      await fetchClientLoans(client.id);
      
    } catch (error) {
      console.error('Failed to record loan:', error);
      alert('Failed to record loan. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {client.customer_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{client.customer_name}</h1>
                <p className="text-gray-600 mt-1">Client Details & Management</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Link
                to={`/clients/${id}/edit`}
                className="inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Client
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2.5 border border-red-200 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 hover:border-red-300 transition-all duration-200 hover:shadow-md"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'details', name: 'Details', icon: MapPin },
                { id: 'followups', name: 'Follow-ups', icon: Phone },
                { id: 'loans', name: 'Loans', icon: DollarSign }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200 rounded-t-lg -mb-px`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'details' && (
              <div className="space-y-8">
                {/* Contact & Business Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Contact Information Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 ml-3">Contact Information</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-700 bg-white rounded-lg p-3 shadow-sm">
                        <Phone className="h-5 w-5 mr-3 text-blue-500" />
                        <span className="font-medium">{client.phone_number}</span>
                      </div>
                      <div className="flex items-center text-gray-700 bg-white rounded-lg p-3 shadow-sm">
                        <MapPin className="h-5 w-5 mr-3 text-green-500" />
                        <span className="font-medium">{client.area}</span>
                      </div>
                    </div>
                  </div>

                  {/* Business Information Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 ml-3">Business Information</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-700 bg-white rounded-lg p-3 shadow-sm">
                        <CreditCard className="h-5 w-5 mr-3 text-purple-500" />
                        <div>
                          <span className="text-sm text-gray-500 block">Business Name</span>
                          <span className="font-medium">{client.business_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700 bg-white rounded-lg p-3 shadow-sm">
                        <RefreshCw className="h-5 w-5 mr-3 text-orange-500" />
                        <div>
                          <span className="text-sm text-gray-500 block">Monthly Turnover</span>
                          <span className="font-medium">₹{client.monthly_turnover?.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700 bg-white rounded-lg p-3 shadow-sm">
                        <Clock className="h-5 w-5 mr-3 text-red-500" />
                        <div>
                          <span className="text-sm text-gray-500 block">Required Amount</span>
                          <span className="font-medium">₹{client.required_amount?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <ClientSummaryFormat client={client} />
              </div>
            )}

            {activeTab === 'followups' && (
              <div className="space-y-8">
                <FollowUpForm 
                  clientId={client.id} 
                  onSubmit={handleFollowUpSubmit}
                />
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <History className="w-5 h-5 mr-2 text-blue-500" />
                    Follow-up Timeline
                  </h3>
                  <FollowUpTimeline 
                    followUps={Object.values(useClientsStore.getState().followUps[client.id] || [])} 
                  />
                </div>
              </div>
            )}

            {activeTab === 'loans' && (
              <div className="space-y-8">
                <LoanDisbursementForm 
                  clientId={client.id}
                  onSubmit={handleLoanSubmit}
                />
                
                {/* Loan History Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <History className="w-5 h-5 mr-2 text-green-500" />
                    Loan History
                  </h3>
                  
                  {useClientsStore.getState().loans[client.id]?.length > 0 ? (
                    <div className="space-y-4">
                      {useClientsStore.getState().loans[client.id].map((loan) => (
                        <div key={loan.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-lg font-semibold text-gray-900">
                                    ₹{loan.amount.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Disbursed on {formatDate(loan.disbursement_date)}
                                  </p>
                                </div>
                              </div>
                              
                              {loan.proof_file_name && (
                                <a
                                  href={`${import.meta.env.VITE_API_URL}/loans/proof/${loan.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 bg-blue-50 px-3 py-1 rounded-full transition-colors duration-200"
                                  download={loan.proof_file_name}
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  View Proof Document
                                </a>
                              )}
                            </div>
                            
                            <div className="text-right text-sm text-gray-500">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatDateTime(loan.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No loans recorded</h3>
                      <p className="text-gray-500">Start by recording the first loan disbursement.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};