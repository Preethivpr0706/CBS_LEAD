import React from 'react';
import { Client } from '../types';
import { AlertTriangle, User, Phone, Building2, MapPin, X } from 'lucide-react';

interface DuplicateClientModalProps {
  client: Client;
  onView: () => void;
  onUpdate: () => void;
  onCreateNew: () => void;
  onClose: () => void;
}

export const DuplicateClientModal: React.FC<DuplicateClientModalProps> = ({
  client,
  onView,
  onUpdate,
  onCreateNew,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-300 scale-100">
        <div className="relative p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors duration-200"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Duplicate Client Found</h3>
              <p className="text-slate-600 mb-6">
                A client with similar information already exists in the system.
              </p>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200/50 mb-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-slate-800 mb-3">{client.customer_name}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Phone className="flex-shrink-0 mr-3 h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-700 font-medium">{client.phone_number}</span>
                      </div>
                      {client.business_name && (
                        <div className="flex items-center">
                          <Building2 className="flex-shrink-0 mr-3 h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-600">{client.business_name}</span>
                        </div>
                      )}
                      {client.area && (
                        <div className="flex items-center">
                          <MapPin className="flex-shrink-0 mr-3 h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-600">{client.area}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onView}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  View Existing Client
                </button>
                
                <button
                  type="button"
                  onClick={onUpdate}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Update Existing Client
                </button>
                
                <button
                  type="button"
                  onClick={onCreateNew}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Create New Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};