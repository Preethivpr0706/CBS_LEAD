
import React from 'react';
import { FollowUp } from '../types';
import { formatDateTime } from '../utils/formatDate';
import { Calendar, Phone, Mail, Users, ClipboardCheck, Clock, ArrowRight } from 'lucide-react';

interface FollowUpTimelineProps {
  followUps: FollowUp[];
}

export const FollowUpTimeline: React.FC<FollowUpTimelineProps> = ({ followUps }) => {
  const sortedFollowUps = [...followUps].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (followUps.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl border border-slate-200/60">
        <div className="bg-white rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
          <ClipboardCheck className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No follow-ups yet</h3>
        <p className="text-slate-500 mb-6 max-w-sm mx-auto">Start building your client relationship history by adding your first follow-up interaction.</p>
        <div className="inline-flex items-center text-sm text-blue-600 font-medium">
          <ArrowRight className="h-4 w-4 mr-1" />
          Use the form above to get started
        </div>
      </div>
    );
  }
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Call':
        return <Phone className="h-5 w-5" />;
      case 'Email':
        return <Mail className="h-5 w-5" />;
      case 'Meeting':
        return <Users className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Call':
        return 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border-blue-200';
      case 'Email':
        return 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 border-purple-200';
      case 'Meeting':
        return 'bg-gradient-to-br from-green-100 to-green-200 text-green-700 border-green-200';
      default:
        return 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border-slate-200';
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-1 rounded-xl">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200/60 p-8">
        <div className="mb-8 text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent mb-2">
            Follow-up Timeline
          </h3>
          <p className="text-slate-600">Chronological history of client interactions</p>
        </div>

        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {sortedFollowUps.map((followUp, idx) => (
              <li key={followUp.id}>
                <div className="relative pb-10">
                  {idx !== sortedFollowUps.length - 1 ? (
                    <span className="absolute left-5 top-10 -ml-px h-full w-0.5 bg-gradient-to-b from-slate-300 to-slate-200" aria-hidden="true" />
                  ) : null}
                  
                  <div className="relative flex items-start space-x-4">
                    <div className="relative">
                      <span className={`h-10 w-10 rounded-xl flex items-center justify-center ring-4 ring-white shadow-lg border-2 ${getTypeColor(followUp.type)}`}>
                        {getTypeIcon(followUp.type)}
                      </span>
                    </div>
                    
                    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {followUp.type}
                          </span>
                          <div className="flex items-center text-sm text-slate-500">
                            <Clock className="mr-1.5 h-4 w-4" />
                            <time dateTime={followUp.date} className="font-medium">
                              {formatDateTime(followUp.date)}
                            </time>
                          </div>
                        </div>
                      </div>
                      
                      <div className="prose prose-sm max-w-none">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                          {followUp.notes}
                        </p>
                      </div>
                      
                      {followUp.next_follow_up_date && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <div className="flex items-center text-sm bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 inline-flex">
                            <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                            <span className="text-blue-800 font-medium">
                              Next follow-up: {formatDateTime(followUp.next_follow_up_date)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-500">
            {sortedFollowUps.length} follow-up{sortedFollowUps.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
      </div>
    </div>
  );
};