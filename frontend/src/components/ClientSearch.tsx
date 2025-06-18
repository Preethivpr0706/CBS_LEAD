import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsApi } from '../services/api';
import { Client } from '../types';
import { Search, User, Phone, Building2, MapPin } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

interface ClientSearchProps {
  onClientSelect?: (client: Client) => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const ClientSearch: React.FC<ClientSearchProps> = ({ 
  onClientSelect, 
  onClose,
  showCloseButton = false
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  
  useEffect(() => {
    const searchClients = async () => {
      if (debouncedQuery.length < 3) {
        setResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const response = await clientsApi.search(debouncedQuery);
        setResults(response.data);
      } catch (error) {
        console.error('Error searching clients:', error);
      } finally {
        setIsSearching(false);
      }
    };
    
    searchClients();
  }, [debouncedQuery]);
  
  const handleClientClick = (client: Client) => {
    if (onClientSelect) {
      onClientSelect(client);
    } else {
      navigate(`/clients/${client.id}`);
    }
    
    if (onClose) {
      onClose();
    }
  };
  
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; border: string; dot: string }> = {
      'New': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' },
      'In Progress': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
      'Approved': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
      'Rejected': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-400' },
      'Disbursed': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-400' },
      'default': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400' }
    };
    return configs[status] || configs.default;
  };
  
  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white/70 backdrop-blur-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-700 shadow-sm transition-all duration-200 hover:shadow-md"
          placeholder="Search clients by name, phone, or business..."
          aria-label="Search clients"
        />
        {showCloseButton && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors duration-200"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {isSearching && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-slate-600 font-medium">Searching clients...</span>
          </div>
        </div>
      )}
      
      {!isSearching && debouncedQuery.length >= 3 && results.length === 0 && (
        <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No clients found</h3>
          <p className="text-slate-500">Try adjusting your search terms</p>
        </div>
      )}
      
      {results.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-xl border border-slate-200 overflow-hidden max-h-96 overflow-y-auto">
          <div className="divide-y divide-slate-100">
            {results.map((client) => {
              const statusConfig = getStatusConfig(client.status);
              return (
                <div 
                  key={client.id} 
                  className="px-6 py-4 hover:bg-blue-50/50 cursor-pointer transition-all duration-200 hover:shadow-sm group"
                  onClick={() => handleClientClick(client)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-200">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors duration-200">
                          {client.customer_name}
                        </h4>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-2 ${statusConfig.dot}`}></div>
                          {client.status}
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center">
                          <Phone className="flex-shrink-0 mr-2 h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600 font-medium">{client.phone_number}</span>
                        </div>
                        {client.business_name && (
                          <div className="flex items-center">
                            <Building2 className="flex-shrink-0 mr-2 h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600 truncate">{client.business_name}</span>
                          </div>
                        )}
                        {client.area && (
                          <div className="flex items-center">
                            <MapPin className="flex-shrink-0 mr-2 h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-500">{client.area}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};