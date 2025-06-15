import React, { useState } from 'react';
import { FollowUp } from '../types';

interface FollowUpFormProps {
  clientId: number;
  onSubmit: (data: Partial<FollowUp>) => Promise<void>;
  isLoading?: boolean;
}

export const FollowUpForm: React.FC<FollowUpFormProps> = ({ 
  clientId, 
  onSubmit, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState<Partial<FollowUp>>({
    client_id: clientId,
    type: 'Call',
    notes: '',
    date: new Date().toISOString().slice(0, 10),
    date_time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
    next_follow_up_date: '',
    next_follow_up_time: '09:00'
  });
  
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const combinedData: Partial<FollowUp> = {
        ...formData,
        date: `${formData.date}T${formData.date_time}:00`,
        next_follow_up_date: formData.next_follow_up_date 
          ? `${formData.next_follow_up_date}T${formData.next_follow_up_time}:00`
          : undefined
      };

      const { date_time, next_follow_up_time, ...dataToSubmit } = combinedData;

      await onSubmit(dataToSubmit);
      
      setFormData({
        client_id: clientId,
        type: 'Call',
        notes: '',
        date: new Date().toISOString().slice(0, 10),
        date_time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
        next_follow_up_date: '',
        next_follow_up_time: '09:00'
      });
    } catch (error) {
      setSubmitError('Failed to add follow-up. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-1 rounded-xl">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow-xl rounded-xl border border-slate-200/60 backdrop-blur-sm">
        {submitError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{submitError}</h3>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center pb-2">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
            Add New Follow-up
          </h3>
          <p className="mt-2 text-sm text-slate-600">Track your client communications and schedule future interactions</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="type" className="block text-sm font-semibold text-slate-700">
              Follow-up Type
            </label>
            <div className="relative">
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="appearance-none mt-1 block w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 pr-10 text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none sm:text-sm hover:border-slate-300"
              >
                <option value="Call">📞 Call</option>
                <option value="Email">📧 Email</option>
                <option value="Meeting">👥 Meeting</option>
                <option value="Other">📋 Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-semibold text-slate-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none sm:text-sm hover:border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="date_time" className="block text-sm font-semibold text-slate-700">
                Time
              </label>
              <input
                type="time"
                id="date_time"
                name="date_time"
                required
                value={formData.date_time}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none sm:text-sm hover:border-slate-300"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-semibold text-slate-700">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            required
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter detailed follow-up notes, discussion points, outcomes..."
            className="mt-1 block w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none sm:text-sm hover:border-slate-300 resize-none"
          />
        </div>
        
        <div className="border-t border-slate-200 pt-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
            <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Schedule Next Follow-up (Optional)
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="next_follow_up_date" className="block text-sm font-medium text-slate-600">
                Next Date
              </label>
              <input
                type="date"
                id="next_follow_up_date"
                name="next_follow_up_date"
                value={formData.next_follow_up_date}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none focus:bg-white sm:text-sm hover:border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="next_follow_up_time" className="block text-sm font-medium text-slate-600">
                Next Time
              </label>
              <input
                type="time"
                id="next_follow_up_time"
                name="next_follow_up_time"
                value={formData.next_follow_up_time}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none focus:bg-white sm:text-sm hover:border-slate-300"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="inline-flex items-center rounded-xl border border-transparent bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 disabled:shadow-lg transform hover:scale-105 active:scale-95"
          >
            {isSubmitting || isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Follow-up...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Follow-up
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
