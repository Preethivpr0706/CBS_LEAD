// store/settingsStore.ts
import { create } from 'zustand';
import { settingsApi } from '../services/api';
import { AppSettings } from '../types';

interface SettingsState {
  settings: AppSettings | null;
  isLoading: boolean;
  error: string | null;
  
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<AppSettings>) => Promise<void>;
  uploadLogo: (file: File) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  error: null,
  
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await settingsApi.getSettings();
      set({ settings: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: 'Failed to fetch settings', 
        isLoading: false,
        // Set default settings if none exist
        settings: {
            id: 1,
            company_name: 'Chetana Business Solutions',
            company_email: 'info@chetana.com',
            company_phone: '',
            company_address: '',
            notification_email: 'harishradhakrishnan2001@gmail.com',
            reminder_time_before: 2,
            notifications_enabled: true,
            admin_email: 'admin@chetana.com',
            admin_name: 'Admin User',
        }
      });
    }
  },
  
  updateSettings: async (data: Partial<AppSettings>) => {
    set({ isLoading: true, error: null });
    try {
      await settingsApi.updateSettings(data);
      set(state => ({
        settings: state.settings ? { ...state.settings, ...data } : null,
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to update settings', isLoading: false });
      throw error;
    }
  },
  
  uploadLogo: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const response = await settingsApi.uploadLogo(formData);
      
      set(state => ({
        settings: state.settings ? { ...state.settings, logo_url: response.data.logo_url } : null,
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to upload logo', isLoading: false });
      throw error;
    }
  }
}));
