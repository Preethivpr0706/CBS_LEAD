import React from 'react';
import { Loan } from '../types';
import { DollarSign } from 'lucide-react';

interface LoanDisbursementFormProps {
  clientId: number;  // Change from string to number
  onSubmit: (data: Partial<Loan>) => Promise<void>;  // Add Promise<void>
  isLoading?: boolean;
}

export const LoanDisbursementForm: React.FC<LoanDisbursementFormProps> = ({ 
  clientId, 
  onSubmit, 
  isLoading = false 
}) => {
  const [formData, setFormData] = React.useState<Partial<Loan>>({
    client_id: clientId,
    amount: 0,
    disbursement_date: new Date().toISOString().split('T')[0],
  });
  
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const files = e.target.files;
      if (files && files.length > 0) {
        setProofFile(files[0]);
        setFormData(prev => ({ ...prev, proof_file: files[0] }));
      }
    } else if (name === 'amount') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 ml-3">Record Loan Disbursement</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount (₹)
            </label>
            <div className="relative">
              <input
                type="text"
                name="amount"
                id="amount"
                required
                value={formData.amount}
                onChange={handleChange}
                className="block w-full rounded-lg border-gray-300 pl-10 pr-4 py-3 focus:border-green-500 focus:ring-green-500 sm:text-sm shadow-sm"
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="disbursement_date" className="block text-sm font-medium text-gray-700 mb-2">
              Disbursement Date
            </label>
            <input
              type="date"
              id="disbursement_date"
              name="disbursement_date"
              required
              value={formData.disbursement_date}
              onChange={handleChange}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm py-3"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="proof" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Proof (Document/Screenshot)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-400 transition-colors duration-200">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="proof"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                >
                  <span>Upload a file</span>
                  <input id="proof" name="proof" type="file" className="sr-only" onChange={handleChange} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
            </div>
          </div>
          {proofFile && (
            <p className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
              Selected file: {proofFile.name}
            </p>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Record Disbursement
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
