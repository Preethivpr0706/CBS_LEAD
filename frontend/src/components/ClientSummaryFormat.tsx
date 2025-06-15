// components/ClientSummaryFormat.tsx
import React, { useState } from 'react';
import { Copy, Mail, MessageSquare, Check, FileText, Share2 } from 'lucide-react';
import { Client } from '../types';
import { StatusBadge } from './StatusBadge';

interface ClientSummaryFormatProps {
  client: Client;
}

export const ClientSummaryFormat: React.FC<ClientSummaryFormatProps> = ({ client }) => {
  const [copied, setCopied] = useState(false);

  const formatSummary = () => {
    return `Name of Company: ${client.business_name}
Customer Name: ${client.customer_name}
Phone Number: ${client.phone_number}
Monthly Turnover: ₹${client.monthly_turnover || 'N/A'}
Area: ${client.area}
Required Amount: ₹${client.required_amount}
Old Financier: ${client.old_financier_name || 'N/A'}
Old Scheme: ${client.old_scheme || 'N/A'}
Old Finance Amount: ${client.old_finance_amount ? `₹${client.old_finance_amount}` : 'N/A'}
New Financier: ${client.new_financier_name || 'N/A'}
New Scheme: ${client.new_scheme || 'N/A'}
Bank Support: ${client.bank_support ? 'Yes' : 'No'}
Reference: ${client.reference || 'N/A'}
Status: ${client.status}
Commission: ${client.commission_percentage ? `${client.commission_percentage}%` : 'N/A'}
Remarks: ${client.remarks || 'N/A'}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatSummary());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = (type: 'email' | 'sms') => {
    const summary = formatSummary();
    if (type === 'email') {
      window.location.href = `mailto:?subject=Client Summary - ${client.customer_name}&body=${encodeURIComponent(summary)}`;
    } else {
      window.location.href = `sms:?body=${encodeURIComponent(summary)}`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-white/20 shadow-xl rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm px-6 py-4 border-b border-slate-200/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Client Summary</h3>
              <p className="text-sm text-slate-600">Formatted for sharing and documentation</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleCopy}
              className={`inline-flex items-center px-4 py-2.5 border-2 shadow-lg text-sm font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 ${
                copied
                  ? 'border-green-200 text-green-700 bg-green-50 focus:ring-green-500/20'
                  : 'border-slate-200 text-slate-700 bg-white/70 hover:bg-white hover:border-slate-300 focus:ring-blue-500/20'
              }`}
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </button>
            <div className="flex border-2 border-slate-200 rounded-xl overflow-hidden shadow-lg bg-white/70">
              <button
                onClick={() => handleShare('email')}
                className="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:bg-blue-50 focus:text-blue-700 transition-all duration-200"
                title="Share via email"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </button>
              <div className="w-px bg-slate-200"></div>
              <button
                onClick={() => handleShare('sms')}
                className="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-green-50 hover:text-green-700 focus:outline-none focus:bg-green-50 focus:text-green-700 transition-all duration-200"
                title="Share via SMS"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                SMS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Content */}
      <div className="p-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 shadow-inner overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2 flex items-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <span className="ml-4 text-sm font-medium text-slate-300">client-summary.txt</span>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {/* Company Information Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Company Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600 mr-2">Company:</span>
                    <span className="font-semibold text-slate-900 text-right">{client.business_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600 mr-2">Customer:</span>
                    <span className="font-semibold text-slate-900 text-right">{client.customer_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600 mr-2">Phone:</span>
                    <span className="font-semibold text-slate-900 text-right">{client.phone_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600 mr-2">Area:</span>
                    <span className="font-semibold text-slate-900 text-right">{client.area}</span>
                  </div>
                </div>
              </div>

              {/* Financial Information Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Financial Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600 mr-2">Monthly Turnover:</span>
                    <span className="font-bold text-green-700 text-right">₹{client.monthly_turnover?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600 mr-2">Required Amount:</span>
                    <span className="font-bold text-green-700 text-right">₹{client.required_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600 mr-2">Commission:</span>
                    <span className="font-bold text-green-700 text-right">{client.commission_percentage ? `${client.commission_percentage}%` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600 mr-2">Bank Support:</span>
                    <span className={`font-bold px-2 py-1 rounded-full text-xs ${client.bank_support ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {client.bank_support ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Previous Financing Section */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
                <h4 className="text-sm font-bold text-amber-800 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                  Previous Financing
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600 mr-2">Old Financier:</span>
                    <span className="font-semibold text-slate-900 text-right">{client.old_financier_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600 mr-2">Old Scheme:</span>
                    <span className="font-semibold text-slate-900 text-right">{client.old_scheme || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center md:col-span-2">
                    <span className="font-medium text-slate-600 mr-2">Old Finance Amount:</span>
                    <span className="font-bold text-amber-700 text-right">{client.old_finance_amount ? `₹${client.old_finance_amount.toLocaleString()}` : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* New Financing Section */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
                <h4 className="text-sm font-bold text-purple-800 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  New Financing
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600 mr-2">New Financier:</span>
                    <span className="font-semibold text-slate-900 text-right">{client.new_financier_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600 mr-2">New Scheme:</span>
                    <span className="font-semibold text-slate-900 text-right">{client.new_scheme || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Status & Additional Info Section */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg p-4 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-slate-500 rounded-full mr-2"></div>
                  Status & Additional Information
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600 mr-2">Current Status:</span>
                    <StatusBadge status={client.status} size="sm" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600 mr-2">Reference:</span>
                    <span className="font-semibold text-slate-900 text-right">{client.reference || 'N/A'}</span>
                  </div>
                  {client.remarks && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-medium text-slate-600 block mb-2">Remarks:</span>
                      <p className="text-slate-900 bg-white p-3 rounded-md border border-slate-200 italic text-sm leading-relaxed">
                        "{client.remarks}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer note */}
        <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
          <div className="flex items-center text-sm text-blue-700">
            <Share2 className="h-4 w-4 mr-2 text-blue-500" />
            <span className="font-medium">Ready to share</span>
            <span className="ml-2 text-blue-600">
              • Use the copy button to quickly grab the summary or share directly via email/SMS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};