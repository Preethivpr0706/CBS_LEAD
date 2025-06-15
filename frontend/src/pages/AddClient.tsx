// pages/AddClient.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientForm } from '../components/ClientForm';
import { useClientsStore } from '../store/clientsStore';
import { AlertCircle } from 'lucide-react';

// components/AddClient.tsx
export const AddClient = () => {
  const navigate = useNavigate();
  const { addClient } = useClientsStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const newClient = await addClient(data);
      navigate(`/clients/${newClient.id}`);
    } catch (err) {
      console.error('Failed to create client:', err);
      setError('Failed to create client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
        
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Add New Client</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter the client's information to create a new record.
          </p>
        </div>
        
        <div className="bg-white shadow-sm rounded-md">
          <ClientForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>
      </div>
    </div>
  );
};

