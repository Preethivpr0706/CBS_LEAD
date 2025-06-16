import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  const { clients, updateClient, fetchClients, getClientById } = useClientsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Find client by ID
  const client = getClientById(parseInt(id || '0', 10));
  
  // Add useEffect to fetch data if client is not found
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // If client is not found, try fetching all clients first
        if (!client && id) {
          await fetchClients();
        }
      } catch (error) {
        console.error('Failed to load client data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, client, fetchClients]);

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading client...</h3>
            <p className="text-gray-500">Please wait while we fetch the client details.</p>
          </div>
        </div>
      </div>
    );
  }
  // Show not found only after loading is complete
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
          <p className="text-gray-500 mb-4">The requested client could not be located.</p>
          <Link
            to="/clients"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Clients
          </Link>
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
