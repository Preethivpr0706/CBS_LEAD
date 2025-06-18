// components/NotificationsPanel.tsx
import React from 'react';
import { Bell, X, Calendar, Users, AlertCircle, Settings } from 'lucide-react';
import { useClientsStore } from '../store/clientsStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatDateTime } from '../utils/formatDate';
import { Link } from 'react-router-dom';
import { Client, FollowUp } from '../types';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  // Always call hooks at the top level
  const { settings } = useSettingsStore();
  const { clients, followUps } = useClientsStore();
  const notificationsEnabled = settings?.notifications_enabled ?? true;

  if (!isOpen) return null;

  // Calculate notification data only if needed
  let notificationContent = null;
  
  if (!notificationsEnabled) {
    notificationContent = (
      <div className="mt-4 text-center py-6">
        <Bell className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-2 text-base font-medium text-gray-900">Notifications Disabled</h3>
        <p className="mt-1 text-sm text-gray-500">
          You have turned off notifications in your settings.
        </p>
        <Link
          to="/settings"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          onClick={onClose}
        >
          <Settings className="mr-2 h-4 w-4" />
          Enable Notifications
        </Link>
      </div>
    );
  } else {
    const today = new Date().toISOString().split('T')[0];
    const followUpsDueToday = clients.filter(client => 
      client.next_follow_up === today
    );
    
    const followUpsArray = Object.values(followUps).flat();
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentFollowUps = followUpsArray
      .filter((followUp: FollowUp) => new Date(followUp.date) > sevenDaysAgo)
      .sort((a: FollowUp, b: FollowUp) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5);
    
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
    
    const notificationsCount = followUpsDueToday.length + inactiveClients.length;
    
    notificationContent = (
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
    );
  }

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
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
        {notificationContent}
      </div>
    </div>
  );
};