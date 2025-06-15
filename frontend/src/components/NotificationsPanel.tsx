import React from 'react';
import { Bell, X, Calendar, Users, AlertCircle } from 'lucide-react';
import { useClientsStore } from '../store/clientsStore';
import { formatDateTime } from '../utils/formatDate';
import { Link } from 'react-router-dom';
import { Client, FollowUp } from '../types';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const { clients, followUps } = useClientsStore();
  
  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  
  // Get follow-ups due today
  const followUpsDueToday = clients.filter(client => 
    client.next_follow_up === today
  );
  
  // Convert followUps object to array
  const followUpsArray = Object.values(followUps).flat();
  
  // Get recent follow-ups (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentFollowUps = followUpsArray
    .filter((followUp: FollowUp) => new Date(followUp.date) > sevenDaysAgo)
    .sort((a: FollowUp, b: FollowUp) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 5);
  
  // Get clients with no recent activity (no follow-ups in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const inactiveClients = clients.filter(client => {
    const clientFollowUps = followUpsArray.filter(f => f.client_id === client.id);
    const lastFollowUp = clientFollowUps.length > 0 
      ? clientFollowUps.sort((a: FollowUp, b: FollowUp) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0]
      : null;
    return !lastFollowUp || new Date(lastFollowUp.date) < thirtyDaysAgo;
  });
  
  // Get notifications count
  const notificationsCount = followUpsDueToday.length + inactiveClients.length;
  
  if (!isOpen) return null;
  
  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
          <button
            onClick={onClose}
            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close notifications"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mt-4 space-y-4">
          {/* Follow-ups Due Today */}
          {followUpsDueToday.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Follow-ups Due Today</h3>
              <div className="space-y-2">
                {followUpsDueToday.map(client => (
                  <Link
                    key={client.id}
                    to={`/clients/${client.id}`}
                    className="block p-2 hover:bg-gray-50 rounded-md"
                    onClick={onClose}
                  >
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{client.customer_name}</p>
                        <p className="text-sm text-gray-500">Follow-up scheduled for today</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Recent Follow-ups */}
          {recentFollowUps.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Recent Activity</h3>
              <div className="space-y-2">
                {recentFollowUps.map((followUp: FollowUp) => {
                  const client = clients.find(c => c.id === followUp.client_id);
                  return (
                    <Link
                      key={followUp.id}
                      to={`/clients/${followUp.client_id}`}
                      className="block p-2 hover:bg-gray-50 rounded-md"
                      onClick={onClose}
                    >
                      <div className="flex items-start">
                        <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {client?.customer_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {followUp.type} on {formatDateTime(followUp.date)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Inactive Clients */}
          {inactiveClients.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Needs Attention</h3>
              <div className="space-y-2">
                {inactiveClients.map(client => (
                  <Link
                    key={client.id}
                    to={`/clients/${client.id}`}
                    className="block p-2 hover:bg-gray-50 rounded-md"
                    onClick={onClose}
                  >
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {client.customer_name}
                        </p>
                        <p className="text-sm text-gray-500">No activity in the last 30 days</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {notificationsCount === 0 && (
            <div className="text-center py-4">
              <Bell className="mx-auto h-8 w-8 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No new notifications</h3>
              <p className="mt-1 text-sm text-gray-500">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
