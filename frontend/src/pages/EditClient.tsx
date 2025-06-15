import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClientForm } from '../components/ClientForm';
import { useClientsStore } from '../store/clientsStore';
import { Client } from '../types';

// Define a type for form data that matches the form fields
interface ClientFormData {
  customer_name: string;
  phone_number: string;
  business_name: string;
  monthly_turnover: string;  // as string for form input
  area: string;
  required_amount: string;  // as string for form input
  old_financier_name?: string;
  old_scheme?: string;
  old_finance_amount?: string;  // as string for form input
  new_financier_name?: string;
  new_scheme?: string;
  bank_support: boolean;
  remarks?: string;
  reference?: string;
  commission_percentage?: string;  // as string for form input
}

export const EditClient: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, updateClient } = useClientsStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Find client by ID
  const client = clients.find(c => c.id === parseInt(id || '0', 10));
  
  // If client not found, show error
  if (!client) {
    return (
      <div className="p-4 rounded-md bg-red-50">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Client not found</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>The client you are trying to edit does not exist.</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => navigate('/clients')}
                className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
              >
                Go back to clients
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Convert client data to form data format
  const initialFormData: ClientFormData = {
    customer_name: client.customer_name,
    phone_number: client.phone_number,
    business_name: client.business_name,
    monthly_turnover: client.monthly_turnover.toString(),
    area: client.area,
    required_amount: client.required_amount.toString(),
    old_financier_name: client.old_financier_name,
    old_scheme: client.old_scheme,
    old_finance_amount: client.old_finance_amount?.toString(),
    new_financier_name: client.new_financier_name,
    new_scheme: client.new_scheme,
    bank_support: client.bank_support,
    remarks: client.remarks,
    reference: client.reference,
    commission_percentage: client.commission_percentage?.toString()
  };
  
  const handleSubmit = async (formData: ClientFormData) => {
    setIsSubmitting(true);
    try {
      // Convert form data back to Client type
      const updatedData: Partial<Client> = {
        ...formData,
        monthly_turnover: parseFloat(formData.monthly_turnover),
        required_amount: parseFloat(formData.required_amount),
        old_finance_amount: formData.old_finance_amount ? parseFloat(formData.old_finance_amount) : undefined,
        commission_percentage: formData.commission_percentage ? parseFloat(formData.commission_percentage) : undefined,
      };

      await updateClient(client.id, updatedData);
      navigate(`/clients/${client.id}`);
    } catch (error) {
      console.error('Failed to update client:', error);
      // Handle error (show error message)
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Client</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update client information below.
          </p>
        </div>
        
        <div className="bg-white shadow-sm rounded-md">
          <ClientForm 
            initialData={initialFormData}
            onSubmit={handleSubmit} 
            isLoading={isSubmitting} 
          />
        </div>
      </div>
    </div>
  );
};
