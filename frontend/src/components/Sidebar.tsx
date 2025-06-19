import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { X, LayoutDashboard, Users,  Settings, FolderClosed, Table, BarChart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSettingsStore } from '../store/settingsStore';
import cbsLogo from '../cbs.png';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { settings, fetchSettings } = useSettingsStore();
  const [logoUrl, setLogoUrl] = useState<string>(cbsLogo);
  
  // Function to get the correct logo URL
  const getLogoUrl = (logoPath: string | undefined | null): string => {
    if (!logoPath) return cbsLogo;
    
    // If it's already a full URL, return it
    if (logoPath.startsWith('http')) return logoPath;
    
    // Remove any leading "/api" if present
    const cleanPath = logoPath.startsWith('/api') 
      ? logoPath.substring(4) 
      : logoPath;
    
    // Construct the full URL
  const apiBaseUrl = import.meta.env.BACKEND_URL || 'http://localhost:3001';
    return `${apiBaseUrl}${cleanPath}`;
  };
  
  // Fetch settings on component mount to get the logo
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  // Update logo URL when settings change
  useEffect(() => {
    if (settings?.logo_url) {
      const url = getLogoUrl(settings.logo_url);
      setLogoUrl(url);
    }
  }, [settings]);

  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Documents', href: '/documents', icon: FolderClosed },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Client Table', href: '/clients/table', icon: Table },
     { name: 'Analytics', href: '/analytics', icon: BarChart }
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <>
      {/* Mobile Sidebar */}
      <Transition.Root show={open} as={React.Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={React.Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm" />
          </Transition.Child>
          
          <div className="fixed inset-0 flex">
            <Transition.Child
              as={React.Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex h-full flex-col overflow-y-auto bg-gradient-to-b from-slate-50 to-white py-6 shadow-2xl border-r border-slate-200/50">
                  <div className="flex items-center justify-between px-6">
                     <Link to="/" className="flex items-center group">
                      <div className="p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200">
                        <img 
                          src={logoUrl} 
                          alt={settings?.company_name || "CBS Logo"} 
                          className="h-8 w-8 object-contain"
                          onError={(e) => {
                            console.error("Logo failed to load:", logoUrl);
                            (e.target as HTMLImageElement).src = cbsLogo;
                          }}
                        />
                      </div>
                      <span className="ml-3 text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                       Welcome Admin<span className="text-slate-200 text-sm">😊</span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  
                  <nav className="mt-8 flex-1 space-y-2 px-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`
                          group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200
                          ${isActive(item.href) 
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-100' 
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}
                        `}
                        onClick={() => setOpen(false)}
                      >
                        <div className={`
                          p-1.5 rounded-lg mr-3 transition-colors duration-200
                          ${isActive(item.href) 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}
                        `}>
                          <item.icon className="h-4 w-4" aria-hidden="true" />
                        </div>
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  
                  {user && (
                    <div className="mt-auto border-t border-slate-200/50 pt-6 px-4">
                      <div className="flex items-center p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors duration-200">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg">
                            {user.name.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                          <button
                            onClick={logout}
                            className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors duration-200"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-200/50 bg-gradient-to-b from-slate-50/50 to-white px-6 pb-4 backdrop-blur-sm">
          <div className="flex h-16 shrink-0 items-center">
           <Link to="/" className="flex items-center group">
              <div className="p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                <img 
                  src={logoUrl} 
                  alt={settings?.company_name || "CBS Logo"} 
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    console.error("Logo failed to load:", logoUrl);
                    (e.target as HTMLImageElement).src = cbsLogo;
                  }}
                />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Welcome Admin<span className="text-slate-200 text-sm">😊</span>
              </span>
            </Link>
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-2">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`
                          group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200
                          ${isActive(item.href) 
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-100' 
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm'}
                        `}
                      >
                        <div className={`
                          p-1.5 rounded-lg transition-all duration-200
                          ${isActive(item.href) 
                            ? 'bg-blue-100 text-blue-600 shadow-sm' 
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:scale-105'}
                        `}>
                          <item.icon className="h-4 w-4" aria-hidden="true" />
                        </div>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
          
          {user && (
            <div className="mt-auto border-t border-slate-200/50 pt-6">
              <div className="flex items-center gap-x-4 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors duration-200">
                <div className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg">
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-semibold leading-6 text-slate-800">{user.name}</span>
                  <button
                    onClick={logout}
                    className="text-xs leading-5 text-slate-500 hover:text-red-600 transition-colors duration-200 text-left"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};