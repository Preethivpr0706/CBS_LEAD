import React from 'react';
import { useClientsStore } from '../store/clientsStore';
import { Client } from '../types';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface ClientStatusManagerProps {
  client: Client;
  onClose?: () => void;
}

export const ClientStatusManager: React.FC<ClientStatusManagerProps> = ({ client, onClose }) => {
  const { updateClient } = useClientsStore();
  
  const statusOptions = [
    { value: 'New', label: 'New', icon: AlertCircle, color: 'text-gray-600 bg-gray-100' },
    { value: 'Pending Approval', label: 'Pending Approval', icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
    { value: 'In Progress', label: 'In Progress', icon: Clock, color: 'text-blue-600 bg-blue-100' },
    { value: 'Approved', label: 'Approved', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
    { value: 'Rejected', label: 'Rejected', icon: XCircle, color: 'text-red-600 bg-red-100' },
    { value: 'Disbursed', label: 'Disbursed', icon: CheckCircle, color: 'text-purple-600 bg-purple-100' },
    { value: 'Completed', label: 'Completed', icon: CheckCircle, color: 'text-indigo-600 bg-indigo-100' },
  ];
  
  const handleStatusChange = (newStatus: string) => {
    updateClient(client.id, {
      ...client,
      status: newStatus as Client['status'],
      status_updated_at: new Date().toISOString(),
    });
    
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-lg space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Update Client Status</h3>
      
      <div className="grid grid-cols-1 gap-2">
        {statusOptions.map(({ value, label, icon: Icon, color }) => (
          <button
            key={value}
            onClick={() => handleStatusChange(value)}
            className={`flex items-center p-3 rounded-md transition-colors ${
              client.status === value
                ? `${color} font-medium`
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-5 w-5 mr-2" />
            {label}
            {client.status === value && (
              <span className="ml-auto text-sm font-medium">Current</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};