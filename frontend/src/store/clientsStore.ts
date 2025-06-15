// store/clientsStore.ts
import { create } from 'zustand';
import { clientsApi, followUpsApi,loansApi } from '../services/api';
import { Client, FollowUp, Loan } from '../types';

interface ClientsState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  
  fetchClients: () => Promise<void>;
  addClient: (client: Partial<Client>) => Promise<Client>;
  updateClient: (id: number, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
  getClientById: (id: number) => Client | undefined;
  
  followUps: Record<number, FollowUp[]>;
  addFollowUp: (clientId: number, followUp: Partial<FollowUp>) => Promise<void>;
  fetchClientFollowUps: (clientId: number) => Promise<void>;

   loans: Record<number, Loan[]>;
    addLoan: (clientId: number, loanData: FormData) => Promise<void>;
    fetchClientLoans: (clientId: number) => Promise<void>;
}


export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: [],
  isLoading: false,
  error: null,
  followUps: {},
  loans: {},

  fetchClients: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await clientsApi.getAll();
      set({ clients: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch clients', isLoading: false });
    }
  },

  addClient: async (clientData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await clientsApi.create(clientData);
      const newClient = response.data;
      set((state) => ({
        clients: [...state.clients, newClient],
        isLoading: false
      }));
      return newClient;
    } catch (error) {
      set({ error: 'Failed to add client', isLoading: false });
      throw error;
    }
  },

  updateClient: async (id, clientData) => {
    set({ isLoading: true, error: null });
    try {
      await clientsApi.update(id, clientData);
      set((state) => ({
        clients: state.clients.map(client =>
          client.id === id ? { ...client, ...clientData } : client
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to update client', isLoading: false });
      throw error;
    }
  },

  deleteClient: async (id) => {
    try {
      await clientsApi.delete(id);
      set((state) => {
        const newFollowUps = { ...state.followUps };
        delete newFollowUps[id];
        
        return {
          clients: state.clients.filter(client => client.id !== id),
          followUps: newFollowUps
        };
      });
    } catch (error) {
      set({ error: 'Failed to delete client' });
      throw error;
    }
  },

  getClientById: (id) => {
    return get().clients.find(client => client.id === id);
  },


  addFollowUp: async (clientId: number, followUpData: Partial<FollowUp>) => {
    try {
      const response = await followUpsApi.create(clientId, followUpData);
      const newFollowUp = response.data;
      
      set(state => ({
        followUps: {
          ...state.followUps,
          [clientId]: [newFollowUp, ...(state.followUps[clientId] || [])]
        }
      }));

      // Update client's next follow-up date
      if (newFollowUp.next_follow_up_date) {
        const client = get().clients.find(c => c.id === clientId);
        if (client) {
          await clientsApi.update(clientId, {
            next_follow_up: newFollowUp.next_follow_up_date
          });
        }
      }
    } catch (error) {
      console.error('Failed to add follow-up:', error);
      throw error;
    }
  },

  fetchClientFollowUps: async (clientId: number) => {
    try {
      const response = await followUpsApi.getByClientId(clientId);
      set(state => ({
        followUps: {
          ...state.followUps,
          [clientId]: response.data
        }
      }));
    } catch (error) {
      console.error('Failed to fetch follow-ups:', error);
      throw error;
    }
  },
  
    addLoan: async (clientId, loanData) => {
        try {
            const response = await loansApi.create(clientId, loanData);
            set(state => ({
                loans: {
                    ...state.loans,
                    [clientId]: [...(state.loans[clientId] || []), response.data]
                }
            }));
        } catch (error) {
            console.error('Failed to add loan:', error);
            throw error;
        }
    },

    fetchClientLoans: async (clientId) => {
        try {
            const response = await loansApi.getByClientId(clientId);
            set(state => ({
                loans: {
                    ...state.loans,
                    [clientId]: response.data
                }
            }));
        } catch (error) {
            console.error('Failed to fetch loans:', error);
            throw error;
        }
    }
}));
