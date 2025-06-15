// store/documentsStore.ts
import { create } from 'zustand';
import { documentsApi } from '../services/api';
import { Document } from '../types';

interface DocumentsState {
    documents: Document[];
    folders: string[];
    isLoading: boolean;
    error: string | null;

    fetchDocuments: () => Promise<void>;
    fetchFolders: () => Promise<void>;
    addDocument: (file: File, folder: string) => Promise<void>;
    addFolder: (name: string) => Promise<void>;
    deleteDocument: (id: number) => Promise<void>;
}

export const useDocumentsStore = create<DocumentsState>((set) => ({
    documents: [],
    folders: [],
    isLoading: false,
    error: null,

    fetchDocuments: async () => {
        set({ isLoading: true });
        try {
            const response = await documentsApi.getAll();
            set({ documents: response.data, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch documents', isLoading: false });
        }
    },

    fetchFolders: async () => {
        try {
            const response = await documentsApi.getFolders();
            set({ folders: response.data });
        } catch (error) {
            set({ error: 'Failed to fetch folders' });
        }
    },

    // store/documentsStore.ts
addDocument: async (file: File, folder: string) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    const response = await documentsApi.upload(file, folder);
    
    set(state => ({
      documents: [...state.documents, response.data]
    }));
    
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    set({ error: 'Failed to upload document' });
    throw error;
  }
},

    addFolder: async (name: string) => {
        try {
            await documentsApi.createFolder(name);
            set(state => ({
                folders: [...state.folders, name]
            }));
        } catch (error) {
            set({ error: 'Failed to create folder' });
            throw error;
        }
    },

    deleteDocument: async (id: number) => {
        try {
            await documentsApi.delete(id);
            set(state => ({
                documents: state.documents.filter(doc => doc.id !== id)
            }));
        } catch (error) {
            set({ error: 'Failed to delete document' });
            throw error;
        }
    }
}));
