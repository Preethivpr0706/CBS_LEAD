import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Bell, MenuIcon, PlusCircle } from 'lucide-react';
import { NotificationsPanel } from './NotificationsPanel';
import { useClientsStore } from '../store/clientsStore';
import { FollowUp } from '../types';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { clients, followUps } = useClientsStore();
  
  // Get notifications count
  const today = new Date().toISOString().split('T')[0];
  const followUpsDueToday = clients.filter(client => 
    client.next_follow_up === today
  );
  
  // Convert followUps object to array
  const followUpsArray = Object.values(followUps).flat();
  
  // Get inactive clients (no follow-ups in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const inactiveClients = clients.filter(client => {
    const clientFollowUps = followUpsArray
      .filter((f: FollowUp) => f.client_id === client.id)
      .sort((a: FollowUp, b: FollowUp) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    
    const lastFollowUp = clientFollowUps[0];
    return !lastFollowUp || new Date(lastFollowUp.date) < thirtyDaysAgo;
  });
  
  const notificationsCount = followUpsDueToday.length + inactiveClients.length;
  
  // Get page subtitle (for context)
  const getPageSubtitle = () => {
    const path = location.pathname;
    
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/clients') return 'Clients';
    if (path === '/clients/table') return 'Clients Table';
    if (path === '/clients/add') return 'Add New Client';
    if (path.match(/^\/clients\/[\w-]+\/edit$/)) return 'Edit Client';
    if (path.match(/^\/clients\/[\w-]+$/)) return 'Client Details';
    if (path === '/documents') return 'Documents';
    if (path === '/settings') return 'Settings';
    
    return '';
  };
  
  const showAddButton = location.pathname === '/clients' || location.pathname === '/clients/table';
  
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <MenuIcon className="h-6 w-6" aria-hidden="true" />
      </button>
      
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center">
            <h1 className="text-2xl font-extrabold text-gray-900 hover:text-blue-600 transition-colors duration-200">
              Chetana Business Solutions
            </h1>
          </Link>
          {getPageSubtitle() && (
            <span className="ml-2 text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
              {getPageSubtitle()}
            </span>
          )}
        </div>
        
        <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {showAddButton && (
              <button
                onClick={() => navigate('/clients/add')}
                className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <PlusCircle className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                Add Client
              </button>
            )}
            
            <div className="relative">
              <button
                type="button"
                className="relative -m-2.5 p-2.5 text-gray-500 hover:text-gray-700"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                aria-label="View notifications"
              >
                <Bell className="h-6 w-6" aria-hidden="true" />
                {notificationsCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                    {notificationsCount}
                  </span>
                )}
              </button>
              
              <NotificationsPanel 
                isOpen={isNotificationsOpen} 
                onClose={() => setIsNotificationsOpen(false)} 
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
