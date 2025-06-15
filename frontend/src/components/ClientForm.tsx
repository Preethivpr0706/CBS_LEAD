import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '../types';

interface ClientFormData {
  customer_name: string;
  phone_number: string;
  business_name: string;
  monthly_turnover: string;  // Keep as string for form input
  area: string;
  required_amount: string;  // Keep as string for form input
  old_financier_name: string;
  old_scheme: string;
  old_finance_amount: string;  // Keep as string for form input
  new_financier_name: string;
  new_scheme: string;
  bank_support: boolean;
  remarks: string;
  reference: string;
  commission_percentage: string;  // Keep as string for form input
}

// Define the props interface
interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const ClientForm: React.FC<ClientFormProps> = ({ 
  initialData = {}, 
  onSubmit, 
  isLoading = false 
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState<ClientFormData>({
    customer_name: '',
    phone_number: '',
    business_name: '',
    monthly_turnover: '',
    area: '',
    required_amount: '',
    old_financier_name: '',
    old_scheme: '',
    old_finance_amount: '',
    new_financier_name: '',
    new_scheme: '',
    bank_support: false,
    remarks: '',
    reference: '',
    commission_percentage: '',
    ...initialData
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert numeric fields for submission
    const processedData = {
      ...formData,
      monthly_turnover: formData.monthly_turnover ? Number(formData.monthly_turnover) : null,
      required_amount: formData.required_amount ? Number(formData.required_amount) : null,
      old_finance_amount: formData.old_finance_amount ? Number(formData.old_finance_amount) : null,
      commission_percentage: formData.commission_percentage ? Number(formData.commission_percentage) : null,
    };
    
    onSubmit(processedData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700">
        <h2 className="text-xl font-bold text-white">Client Information</h2>
        <p className="text-blue-100 text-sm">Fields marked with an asterisk (*) are required</p>
      </div>
      
      {/* Client Information Section */}
      <div className="p-6 space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Personal & Business Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="col-span-1">
              <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customer_name"
                id="customer_name"
                required
                value={formData.customer_name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                placeholder="Enter customer name"
              />
            </div>
            
            <div className="col-span-1">
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone_number"
                id="phone_number"
                required
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="col-span-1">
              <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="business_name"
                id="business_name"
                required
                value={formData.business_name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                placeholder="Enter business name"
              />
            </div>
            
            <div className="col-span-1">
              <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                Area/Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="area"
                id="area"
                required
                value={formData.area}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                placeholder="Enter area or location"
              />
            </div>
            
            <div className="col-span-1">
              <label htmlFor="monthly_turnover" className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Turnover
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  name="monthly_turnover"
                  id="monthly_turnover"
                  value={formData.monthly_turnover}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 pl-7 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Financial Details Section */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Financial Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="col-span-1">
              <label htmlFor="required_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Required Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  name="required_amount"
                  id="required_amount"
                  required
                  value={formData.required_amount}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 pl-7 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="col-span-1">
              <label htmlFor="commission_percentage" className="block text-sm font-medium text-gray-700 mb-1">
                Commission Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  name="commission_percentage"
                  id="commission_percentage"
                  value={formData.commission_percentage}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Previous Financing Section */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Previous Financing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="col-span-1">
              <label htmlFor="old_financier_name" className="block text-sm font-medium text-gray-700 mb-1">
                Old Financier Name
              </label>
              <input
                type="text"
                name="old_financier_name"
                id="old_financier_name"
                value={formData.old_financier_name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                placeholder="Enter financier name"
              />
            </div>
            
            <div className="col-span-1">
              <label htmlFor="old_scheme" className="block text-sm font-medium text-gray-700 mb-1">
                Old Scheme
              </label>
              <input
                type="text"
                name="old_scheme"
                id="old_scheme"
                value={formData.old_scheme}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                placeholder="Enter scheme details"
              />
            </div>
            
            <div className="col-span-1">
              <label htmlFor="old_finance_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Old Finance Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  name="old_finance_amount"
                  id="old_finance_amount"
                  value={formData.old_finance_amount}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 pl-7 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* New Financing Section */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">New Financing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="col-span-1">
              <label htmlFor="new_financier_name" className="block text-sm font-medium text-gray-700 mb-1">
                New Financier Name
              </label>
              <input
                type="text"
                name="new_financier_name"
                id="new_financier_name"
                value={formData.new_financier_name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                placeholder="Enter financier name"
              />
            </div>
            
            <div className="col-span-1">
              <label htmlFor="new_scheme" className="block text-sm font-medium text-gray-700 mb-1">
                New Scheme
              </label>
              <input
                type="text"
                name="new_scheme"
                id="new_scheme"
                value={formData.new_scheme}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                placeholder="Enter scheme details"
              />
            </div>
            
            <div className="col-span-1">
              <label htmlFor="bank_support" className="flex items-center text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="bank_support"
                  id="bank_support"
                  checked={formData.bank_support}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                Bank Support
              </label>
            </div>
          </div>
        </div>
        
        {/* Additional Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="col-span-1">
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                Reference
              </label>
              <input
                type="text"
                name="reference"
                id="reference"
                value={formData.reference}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                placeholder="Enter reference"
              />
            </div>
            
            <div className="col-span-2">
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                name="remarks"
                id="remarks"
                rows={3}
                value={formData.remarks}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out resize-none"
                placeholder="Enter any additional remarks or notes"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 flex items-center justify-end space-x-3 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 ease-in-out"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : 'Save Client'}
        </button>
      </div>
    </form>
  );
};