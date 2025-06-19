import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { AlertCircle, CheckCircle, User, Building, DollarSign, FileText, Loader2 } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

interface ClientFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

// Move FormSection component outside of ClientForm
interface FormSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ icon: Icon, title, children }) => (
  <div className="space-y-6">
    <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
          <Icon className="h-4 w-4 text-blue-600" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
    </div>
    {children}
  </div>
);

// Move InputField component outside of ClientForm
interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  name, 
  type = 'text', 
  required = false, 
  value,
  onChange,
  errors,
  disabled = false,
  ...props 
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-semibold text-slate-700 mb-2">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-3 border rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
        errors[name] 
          ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
          : 'border-slate-300 bg-white hover:border-slate-400 focus:border-blue-400'
      }`}
      {...props}
    />
    {errors[name] && (
      <p className="mt-2 text-sm text-red-600 flex items-center">
        <AlertCircle className="h-4 w-4 mr-1" />
        {errors[name]}
      </p>
    )}
  </div>
);

export const ClientForm: React.FC<ClientFormProps> = ({ initialData = {}, onSubmit, isLoading }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [existingClient, setExistingClient] = useState<any>(null);
  const debouncedPhone = useDebounce(formData.phone_number, 500);
  
  // Check for existing client when phone number changes
  useEffect(() => {
    const checkExistingClient = async () => {
      // Don't check for existing clients if:
      // 1. Phone number is less than 10 digits
      // 2. We're in edit mode (initialData has an id)
      // 3. Phone number matches the current client's phone (in edit mode)
      if (
        debouncedPhone.length < 10 || 
        initialData.id || 
        (initialData.phone_number && debouncedPhone === initialData.phone_number)
      ) {
        setExistingClient(null);
        return;
      }

      try {
        setIsCheckingPhone(true);
        const response = await clientsApi.checkDuplicate({ phone_number: debouncedPhone });

        if (response.data.isDuplicate) {
          setExistingClient(response.data.clients[0]);
        } else {
          setExistingClient(null);
        }
      } catch (error) {
        console.error('Error checking for existing client:', error);
        setExistingClient(null);
      } finally {
        setIsCheckingPhone(false);
      }
    };

    checkExistingClient();
  }, [debouncedPhone, initialData.id, initialData.phone_number]);

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({ ...prev, [name]: checked }));
      return;
    }
    
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.customer_name) {
      newErrors.customer_name = 'Customer name is required';
    }
    
    if (!formData.phone_number) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone number must be 10 digits';
    }
    
    if (!formData.business_name) {
      newErrors.business_name = 'Business name is required';
    }
    
    if (!formData.area) {
      newErrors.area = 'Area is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // If there's an existing client and we're not in edit mode, confirm before proceeding
    if (existingClient && !initialData.id) {
      if (!window.confirm(`A client with this phone number (${existingClient.customer_name}) already exists. Are you sure you want to create a new client?`)) {
        return;
      }
    }
    
    // Convert numeric fields
    const processedData = {
      ...formData,
      monthly_turnover: formData.monthly_turnover ? parseFloat(formData.monthly_turnover) : null,
      required_amount: formData.required_amount ? parseFloat(formData.required_amount) : null,
      old_finance_amount: formData.old_finance_amount ? parseFloat(formData.old_finance_amount) : null,
      commission_percentage: formData.commission_percentage ? parseFloat(formData.commission_percentage) : null,
    };
    
    onSubmit(processedData);
  };
  
  // Handle navigation to existing client
  const handleNavigateToExisting = () => {
    if (existingClient) {
      navigate(`/clients/${existingClient.id}`);
    }
  };
  
  // Handle using existing client data
  const handleUseExistingClient = () => {
    if (existingClient) {
      setFormData({
        ...formData,
        customer_name: existingClient.customer_name,
        business_name: existingClient.business_name,
        area: existingClient.area,
        monthly_turnover: existingClient.monthly_turnover?.toString() || '',
      });
      setExistingClient(null);
      toast.success('Existing client data loaded');
    }
  };
  
  // Handle updating existing client
  const handleUpdateExisting = () => {
    if (existingClient) {
      navigate(`/clients/${existingClient.id}/edit`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-8">
      {/* Existing Client Alert */}
      {existingClient && !initialData.id && (
        <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                Client with this phone number already exists
              </h3>
              <div className="bg-white/70 rounded-lg p-4 mb-4">
                <p className="text-amber-700 mb-2">
                  <strong>{existingClient.customer_name}</strong> • <strong>{existingClient.business_name}</strong>
                </p>
                <p className="text-sm text-amber-600">This may result in duplicate entries in your system.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleNavigateToExisting}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-amber-800 bg-white/80 hover:bg-white border border-amber-300 transition-all duration-200"
                >
                  View Existing Client
                </button>
                <button
                  type="button"
                  onClick={handleUpdateExisting}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-amber-800 bg-white/80 hover:bg-white border border-amber-300 transition-all duration-200"
                >
                  Update Existing Client
                </button>
                <button
                  type="button"
                  onClick={handleUseExistingClient}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-amber-800 bg-white/80 hover:bg-white border border-amber-300 transition-all duration-200"
                >
                  Use Existing Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Customer Information */}
      <FormSection icon={User} title="Customer Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Customer Name"
            name="customer_name"
            required
            placeholder="Enter full name"
            value={formData.customer_name}
            onChange={handleChange}
            errors={errors}
          />
          
          <div>
            <label htmlFor="phone_number" className="block text-sm font-semibold text-slate-700 mb-2">
              Phone Number<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="phone_number"
                id="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.phone_number 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-slate-300 bg-white hover:border-slate-400 focus:border-blue-400'
                }`}
                disabled={!!initialData.id}
                placeholder="Enter 10-digit phone number"
              />
              {isCheckingPhone && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                </div>
              )}
              {!isCheckingPhone && formData.phone_number.length >= 10 && !existingClient && !initialData.id && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
              )}
            </div>
            {errors.phone_number && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.phone_number}
              </p>
            )}
          </div>
        </div>
      </FormSection>
      
      {/* Business Information */}
      <FormSection icon={Building} title="Business Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Business Name"
            name="business_name"
            required
            placeholder="Enter business name"
            value={formData.business_name}
            onChange={handleChange}
            errors={errors}
          />
          
          <InputField
            label="Monthly Turnover"
            name="monthly_turnover"
            type="number"
            placeholder="Enter amount in rupees"
            value={formData.monthly_turnover}
            onChange={handleChange}
            errors={errors}
          />
          
          <InputField
            label="Area"
            name="area"
            required
            placeholder="Enter business location"
            value={formData.area}
            onChange={handleChange}
            errors={errors}
          />
          
          <InputField
            label="Required Amount"
            name="required_amount"
            type="number"
            placeholder="Enter required loan amount"
            value={formData.required_amount}
            onChange={handleChange}
            errors={errors}
          />
        </div>
      </FormSection>
      
      {/* Financing Information */}
      <FormSection icon={DollarSign} title="Financing Information">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField
            label="Old Financier Name"
            name="old_financier_name"
            placeholder="Previous lender name"
            value={formData.old_financier_name}
            onChange={handleChange}
            errors={errors}
          />
          
          <InputField
            label="Old Scheme"
            name="old_scheme"
            placeholder="Previous loan scheme"
            value={formData.old_scheme}
            onChange={handleChange}
            errors={errors}
          />
          
          <InputField
            label="Old Finance Amount"
            name="old_finance_amount"
            type="number"
            placeholder="Previous loan amount"
            value={formData.old_finance_amount}
            onChange={handleChange}
            errors={errors}
          />
          
          <InputField
            label="New Financier Name"
            name="new_financier_name"
            placeholder="New lender name"
            value={formData.new_financier_name}
            onChange={handleChange}
            errors={errors}
          />
          
          <InputField
            label="New Scheme"
            name="new_scheme"
            placeholder="New loan scheme"
            value={formData.new_scheme}
            onChange={handleChange}
            errors={errors}
          />
          
          <div className="flex items-end">
            <label className="flex items-center space-x-3 p-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
              <input
                id="bank_support"
                name="bank_support"
                type="checkbox"
                checked={formData.bank_support}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Bank Support Required</span>
            </label>
          </div>
        </div>
      </FormSection>
      
      {/* Additional Information */}
      <FormSection icon={FileText} title="Additional Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="remarks" className="block text-sm font-semibold text-slate-700 mb-2">
              Remarks
            </label>
            <textarea
              name="remarks"
              id="remarks"
              rows={4}
              value={formData.remarks}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              placeholder="Additional notes or comments"
            />
          </div>
          
          <div className="space-y-6">
            <InputField
              label="Reference"
              name="reference"
              placeholder="Reference person or source"
              value={formData.reference}
              onChange={handleChange}
              errors={errors}
            />
            
            <InputField
              label="Commission Percentage"
              name="commission_percentage"
              type="number"
              step="0.01"
              placeholder="Commission rate"
              value={formData.commission_percentage}
              onChange={handleChange}
              errors={errors}
            />
          </div>
        </div>
      </FormSection>
      
      {/* Submit Button */}
      <div className="flex justify-end pt-8 border-t border-slate-200">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
              Saving Client...
            </>
          ) : (
            'Save Client Information'
          )}
        </button>
      </div>
    </form>
  );
};