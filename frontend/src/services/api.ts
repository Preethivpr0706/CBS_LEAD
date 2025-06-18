// services/api.ts
import axios from 'axios';
import {AppSettings, Client, ClientStatus, FollowUp} from '../types/index'

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const clientsApi = {
  getAll: () => api.get('/clients'),
  getById: (id: number) => api.get(`/clients/${id}`),
  search: (query: string) => api.get(`/clients/search?query=${encodeURIComponent(query)}`),
  checkDuplicate: (data: { phone_number?: string, customer_name?: string }) => 
    api.post('/clients/check-duplicate', data),
  mergeClient: (id: number, data: Partial<Client>) => 
    api.post(`/clients/${id}/merge`, data),
  create: (data: Partial<Client>) => api.post('/clients', data),
  update: (id: number, data: Partial<Client>) => api.put(`/clients/${id}`, data),
  updateStatus: (id: number, status: ClientStatus) => 
    api.patch(`/clients/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/clients/${id}`),
};

export const followUpsApi = {
  getByClientId: (clientId: number) => 
    api.get(`/follow-ups/client/${clientId}`),
  create: (clientId: number, data: Partial<FollowUp>) => 
    api.post(`/follow-ups/client/${clientId}`, data),
};

export const loansApi = {
    getByClientId: (clientId: number) => 
        api.get(`/loans/client/${clientId}`),
    create: (clientId: number, formData: FormData) => 
        api.post(`/loans/client/${clientId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    getProofUrl: (loanId: number) => 
        `${API_BASE_URL}/loans/proof/${loanId}`,
};

// services/api.ts
// services/api.ts
export const documentsApi = {
  getAll: () => api.get('/documents'),
  getFolders: () => api.get('/documents/folders'),
  
  upload: (file: File, folder: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  createFolder: (name: string) => api.post('/documents/folders', { name }),
  delete: (id: number) => api.delete(`/documents/${id}`),
  download: (id: number) => api.get(`/documents/download/${id}`),
};

// Settings API
export const settingsApi = {
  // Get company settings
  getSettings: () => api.get('/settings'),
  
  // Update company settings
  updateSettings: (data: Partial<AppSettings>) => api.put('/settings', data),
  
  // Upload company logo
  uploadLogo: (formData: FormData) => 
    api.post('/settings/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// Auth API
export const authApi = {
  // Login
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  // Change password
  changePassword: (currentPassword: string, newPassword: string) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
};


export default api;
