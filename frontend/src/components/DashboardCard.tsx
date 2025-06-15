import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: string | number;
    positive: boolean;
  };
  bgColor?: string;
  textColor?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  change,
  bgColor = 'bg-gradient-to-br from-white to-gray-50',
  textColor = 'text-gray-900'
}) => {
  return (
    <div className={`${bgColor} overflow-hidden rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
              {icon}
            </div>
            <div className="flex-1">
              <dt className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</dt>
              <dd className="mt-1">
                <div className={`text-2xl font-bold ${textColor} leading-tight`}>{value}</div>
              </dd>
            </div>
          </div>
        </div>
      </div>
      {change && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center">
            <span
              className={`inline-flex items-center text-sm font-medium ${
                change.positive ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {change.positive ? (
                <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="font-semibold">{change.value}</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
