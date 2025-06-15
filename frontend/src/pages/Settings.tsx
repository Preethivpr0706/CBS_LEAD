import React from 'react';
import { User, Bell, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Account Settings</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage your account and application preferences.
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                Full name
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{user?.name || 'N/A'}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                Email address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{user?.email || 'N/A'}</dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Notification Settings</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage how you receive notifications.
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="follow-up-due"
                  name="follow-up-due"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  defaultChecked
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="follow-up-due" className="font-medium text-gray-700">
                  Follow-up due reminders
                </label>
                <p className="text-gray-500">Receive notifications when follow-ups are due.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="new-client"
                  name="new-client"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  defaultChecked
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="new-client" className="font-medium text-gray-700">
                  New client notifications
                </label>
                <p className="text-gray-500">Receive notifications when new clients are added.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="loan-disbursed"
                  name="loan-disbursed"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  defaultChecked
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="loan-disbursed" className="font-medium text-gray-700">
                  Loan disbursement notifications
                </label>
                <p className="text-gray-500">Receive notifications when loans are disbursed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Security Settings</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage your account security.
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Shield className="mr-2 h-4 w-4 text-gray-500" />
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import Mail component
import { Mail } from 'lucide-react';