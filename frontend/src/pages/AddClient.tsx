// pages/AddClient.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientForm } from '../components/ClientForm';
import { ClientSearch } from '../components/ClientSearch';
import { useClientsStore } from '../store/clientsStore';
import { AlertCircle, Search, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Client } from '../types';
import { clientsApi } from '../services/api';

export const AddClient = () => {
  const navigate = useNavigate();
  const { addClient } = useClientsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [existingClient, setExistingClient] = useState<Client | null>(null);
  
  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Check for duplicates before submitting
      const duplicateCheck = await clientsApi.checkDuplicate({
        phone_number: data.phone_number,
        customer_name: data.customer_name
      });
      
      if (duplicateCheck.data.isDuplicate) {
        const existingClient = duplicateCheck.data.clients[0];
        
        // Show confirmation dialog
        if (window.confirm(`A client with ${duplicateCheck.data.matchType === 'phone' ? 'this phone number' : 'a similar name'} already exists. Would you like to view the existing client?`)) {
          navigate(`/clients/${existingClient.id}`);
          return;
        }
        
        // If they choose not to view the existing client, ask if they want to merge
        if (window.confirm(`Would you like to update the existing client with this new information?`)) {
          const mergedClient = await clientsApi.mergeClient(existingClient.id, data);
          toast.success('Client information updated successfully');
          navigate(`/clients/${existingClient.id}`);
          return;
        }
        
        // If they choose not to merge, confirm they want to create a duplicate
        if (!window.confirm(`Are you sure you want to create a new client record? This may result in duplicate entries.`)) {
          setIsSubmitting(false);
          return;
        }
      }
      
      // If no duplicates or user confirmed to create anyway
      const newClient = await addClient(data);
      toast.success('Client added successfully');
      navigate(`/clients/${newClient.id}`);
    } catch (err: any) {
      console.error('Failed to create client:', err);
      
      // Check if this is a duplicate client error from the server
      if (err.response && err.response.status === 409) {
        const existingClient = err.response.data.existingClient;
        toast.error('Client with this phone number already exists');
        
        if (window.confirm('A client with this phone number already exists. Would you like to view the existing client?')) {
          navigate(`/clients/${existingClient.id}`);
        }
        return;
      }
      
      setError('Failed to create client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClientSelect = (client: Client) => {
    setExistingClient(client);
    setShowSearch(false);
    
    // Ask if they want to view or update the existing client
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Existing Client Found</h3>
          <p class="text-gray-600 mb-4">
            A client with this information already exists in the system.
          </p>
          <div class="flex justify-end space-x-3">
            <button id="view-client" class="px-4 py-2 bg-blue-600 text-white rounded-md">
              View Client
            </button>
            <button id="update-client" class="px-4 py-2 bg-green-600 text-white rounded-md">
              Update Client
            </button>
            <button id="cancel" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('view-client')?.addEventListener('click', () => {
      document.body.removeChild(modal);
      navigate(`/clients/${client.id}`);
    });
    
    document.getElementById('update-client')?.addEventListener('click', () => {
      document.body.removeChild(modal);
      navigate(`/clients/${client.id}/edit`);
    });
    
    document.getElementById('cancel')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
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
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Add New Client</h1>
            <p className="mt-1 text-sm text-gray-500">
              Enter the client's information to create a new record.
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {showSearch ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Close Search
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Existing Clients
              </>
            )}
          </button>
        </div>
        
        {showSearch && (
          <div className="bg-white shadow-sm rounded-md p-6 border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Search for Existing Clients</h2>
            <ClientSearch 
              onClientSelect={handleClientSelect}
              onClose={() => setShowSearch(false)}
            />
          </div>
        )}
        
        <div className="bg-white shadow-sm rounded-md">
          <ClientForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>
      </div>
    </div>
  );
};
