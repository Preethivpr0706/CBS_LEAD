// pages/Settings.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';
import { useAuth } from '../hooks/useAuth';
import { Save, Building, Mail, Phone, MapPin, Clock, User, Shield, Eye, EyeOff, Bell, Upload, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import cbsLogo from '../cbs.png'; // Import the fallback logo
import { Switch } from '../components/ui/switch'; 

export const Settings: React.FC = () => {
  const { settings, fetchSettings, updateSettings, uploadLogo, isLoading } = useSettingsStore();
  const { changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('company');
  
  // Company settings form
  const [companyForm, setCompanyForm] = useState({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    notification_email: '',
    reminder_time_before: 2,
    notifications_enabled: true,
    admin_email: '',
    admin_name: ''
  });
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(5);

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

// Handle toggle change
  const handleToggleChange = (name: string, checked: boolean) => {
    setCompanyForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
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

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setCompanyForm({
        company_name: settings.company_name || '',
        company_email: settings.company_email || '',
        company_phone: settings.company_phone || '',
        company_address: settings.company_address || '',
        notification_email: settings.notification_email || '',
        reminder_time_before: settings.reminder_time_before || 2,
        notifications_enabled: settings.notifications_enabled !== undefined ? settings.notifications_enabled : true,
        admin_email: settings.admin_email || '',
        admin_name: settings.admin_name || ''
      });
      
      // Set logo preview from settings
      if (settings.logo_url) {
        const logoUrl = getLogoUrl(settings.logo_url);
        setLogoPreview(logoUrl);
      }
    }
  }, [settings]);


  // Countdown effect for logout
  useEffect(() => {
    let timer: number;
    if (showLogoutPrompt && logoutCountdown > 0) {
      timer = window.setTimeout(() => {
        setLogoutCountdown(prev => prev - 1);
      }, 1000);
    } else if (showLogoutPrompt && logoutCountdown === 0) {
      handleLogout();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showLogoutPrompt, logoutCountdown]);

  const handleCompanyFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setCompanyForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // First update settings
      await updateSettings(companyForm);
      
      // Then upload logo if selected
      if (logoFile) {
        await uploadLogo(logoFile);
      }
      
      // Refresh settings to get the updated data including new logo URL
      await fetchSettings();
      
      toast.success('Company settings updated successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save company settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const success = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      if (success) {
        toast.success('Password changed successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Show logout prompt
        setShowLogoutPrompt(true);
      } else {
        toast.error('Failed to change password');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading && !settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <SettingsIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Settings</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Configure your lead management system to match your business needs
          </p>
        </div>
        
        {/* Tabs */}
        <div className="mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('company')}
                className={`${
                  activeTab === 'company'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                } flex-1 flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-200`}
              >
                <Building className="mr-2 h-5 w-5" />
                Company Settings
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`${
                  activeTab === 'account'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                } flex-1 flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-200`}
              >
                <User className="mr-2 h-5 w-5" />
                Account Settings
              </button>
            </nav>
          </div>
        </div>
        
        {/* Company Settings Tab */}
        {activeTab === 'company' && (
          <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
            <div className="p-10">
              <form onSubmit={handleCompanySubmit} className="space-y-12">
                {/* Company Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label htmlFor="company_name" className="block text-sm font-semibold text-gray-700">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="company_name"
                        id="company_name"
                        value={companyForm.company_name}
                        onChange={handleCompanyFormChange}
                        className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 bg-white"
                        placeholder="Enter company name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="company_email" className="block text-sm font-semibold text-gray-700">
                        Company Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="company_email"
                          id="company_email"
                          value={companyForm.company_email}
                          onChange={handleCompanyFormChange}
                          className="block w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 bg-white"
                          placeholder="company@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="company_phone" className="block text-sm font-semibold text-gray-700">
                        Company Phone
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="company_phone"
                          id="company_phone"
                          value={companyForm.company_phone}
                          onChange={handleCompanyFormChange}
                          className="block w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 bg-white"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="company_address" className="block text-sm font-semibold text-gray-700">
                        Company Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="company_address"
                          id="company_address"
                          value={companyForm.company_address}
                          onChange={handleCompanyFormChange}
                          className="block w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 bg-white"
                          placeholder="123 Business Street, City, State 12345"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Logo Upload section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Company Logo</h2>
                  </div>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
                    <div className="relative group">
                      <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300">
                        {logoPreview ? (
                          <img 
                            src={logoPreview} 
                            alt="Company logo" 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              console.error("Logo failed to load:", logoPreview);
                              (e.target as HTMLImageElement).src = cbsLogo;
                            }}
                          />
                        ) : (
                          <img 
                            src={cbsLogo} 
                            alt="Default logo" 
                            className="w-full h-full object-contain opacity-50"
                          />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-2xl transition-all duration-300"></div>
                    </div>
                    
                    <div className="flex-1">
                      <label className="block">
                        <span className="sr-only">Choose logo file</span>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 cursor-pointer">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                          <div className="text-center">
                            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                            <div className="text-sm text-gray-600">
                              <span className="font-semibold text-purple-600 hover:text-purple-700">Click to upload</span> or drag and drop
                            </div>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 2MB</p>
                          </div>
                        </div>
                      </label>
                      {logoFile && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                          <p className="text-sm text-green-700 font-medium">
                            ✓ Logo ready to upload: {logoFile.name}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Logo will be updated across the application after saving
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Notification Settings */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mr-4">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label htmlFor="notification_email" className="block text-sm font-semibold text-gray-700">
                        Notification Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="notification_email"
                          id="notification_email"
                          value={companyForm.notification_email}
                          onChange={handleCompanyFormChange}
                          className="block w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all duration-200 bg-white"
                          placeholder="notifications@example.com"
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Follow-up reminders will be sent to this email
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="reminder_time_before" className="block text-sm font-semibold text-gray-700">
                        Reminder Time
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Clock className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          id="reminder_time_before"
                          name="reminder_time_before"
                          value={companyForm.reminder_time_before}
                          onChange={handleCompanyFormChange}
                          className="block w-full pl-12 pr-10 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all duration-200 bg-white appearance-none"
                        >
                          <option value={1}>1 hour before</option>
                          <option value={2}>2 hours before</option>
                          <option value={3}>3 hours before</option>
                          <option value={6}>6 hours before</option>
                          <option value={12}>12 hours before</option>
                          <option value={24}>24 hours before</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="lg:col-span-2 pt-4">
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <Switch
                          id="notifications_enabled"
                          name="notifications_enabled"
                          checked={companyForm.notifications_enabled}
                          onCheckedChange={(checked) => handleToggleChange('notifications_enabled', checked)}
                          label="Enable Notifications"
                          description={
                            companyForm.notifications_enabled
                              ? "You'll receive notifications about follow-ups and client activity"
                              : "Notifications are disabled. You won't see alerts about follow-ups and client activity"
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Save Button */}
                <div className="flex justify-end pt-6">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="mr-3 h-5 w-5" />
                        Save Settings
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Account Settings Tab */}
        {activeTab === 'account' && (
          <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
            <div className="p-10">
              <div className="space-y-12">
                {/* Admin Account */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Admin Account</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="admin_name" className="block text-sm font-semibold text-gray-700">
                        Admin Name
                      </label>
                      <input
                        type="text"
                        name="admin_name"
                        id="admin_name"
                        value={companyForm.admin_name}
                        onChange={handleCompanyFormChange}
                        className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 bg-white"
                        placeholder="Enter admin name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="admin_email" className="block text-sm font-semibold text-gray-700">
                        Admin Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="admin_email"
                          id="admin_email"
                          value={companyForm.admin_email}
                          onChange={handleCompanyFormChange}
                          className="block w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 bg-white"
                          placeholder="admin@example.com"
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        This email will be used for logging into the system
                      </p>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={handleCompanySubmit}
                        disabled={isSaving}
                        className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-5 w-5" />
                            Save Account Settings
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Change Password */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-8 border border-red-100">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                  </div>
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          id="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordFormChange}
                          className="block w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20 transition-all duration-200 bg-white"
                          placeholder="Enter current password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          id="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordFormChange}
                          className="block w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20 transition-all duration-200 bg-white"
                          placeholder="Enter new password"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="confirmPassword"
                          id="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordFormChange}
                          className="block w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20 transition-all duration-200 bg-white"
                          placeholder="Confirm new password"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                      >
                        {isChangingPassword ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Changing Password...
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-5 w-5" />
                            Change Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Logout Prompt Modal */}
      {showLogoutPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Password Changed Successfully</h3>
              <p className="text-gray-600 mb-6">
                For security reasons, you will be logged out in {logoutCountdown} seconds.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowLogoutPrompt(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
                >
                  Logout Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};