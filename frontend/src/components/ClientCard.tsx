// components/ClientCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Building2, IndianRupee, TrendingUp, ArrowRight } from 'lucide-react';
import { Client } from '../types';
import { formatDate } from '../utils/formatDate';
import { StatusBadge } from './StatusBadge';

interface ClientCardProps {
    client: Client;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
    return (
        <Link
            to={`/clients/${client.id}`}
            className="group block"
        >
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:bg-white/90">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Card content */}
                <div className="relative p-6">
                    {/* Header with status */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0">
                            {/* Business name with icon */}
                            <div className="flex items-center mb-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                                    <Building2 className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                                        {client.business_name}
                                    </h3>
                                </div>
                            </div>
                            {/* Customer name */}
                            <p className="text-sm font-medium text-slate-600 pl-13">
                                {client.customer_name}
                            </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                            <StatusBadge status={client.status} />
                        </div>
                    </div>

                    {/* Contact information */}
                    <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                                <Phone className="h-4 w-4 text-slate-500" />
                            </div>
                            <span className="font-medium">{client.phone_number}</span>
                        </div>

                        <div className="flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                                <MapPin className="h-4 w-4 text-slate-500" />
                            </div>
                            <span className="font-medium">{client.area}</span>
                        </div>
                    </div>

                    {/* Financial information */}
                    <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                    <IndianRupee className="h-4 w-4 text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">Required Amount</span>
                            </div>
                            <span className="text-sm font-bold text-green-700">
                                ₹{client.required_amount.toLocaleString()}
                            </span>
                        </div>

                        {client.monthly_turnover && (
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">Monthly Turnover</span>
                                </div>
                                <span className="text-sm font-bold text-blue-700">
                                    ₹{client.monthly_turnover.toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Follow-up information */}
                    {client.next_follow_up && (
                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                                        <Clock className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-slate-600 block">Next Follow-up</span>
                                        <span className="text-sm font-bold text-amber-700">
                                            {formatDate(client.next_follow_up)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Hover arrow indicator */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};