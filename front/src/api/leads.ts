// src/api/leads.ts
import api from './client';

export interface Lead {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  status: string;
  created_at?: string;
  [key: string]: any;
}

// دالة آمنة لاستخراج الـ Array بغض النظر عن شكل الـ Response القادم من الـ Backend
const normalizeArray = (res: any): any[] => {
  if (Array.isArray(res)) return res;
  if (res?.data) return normalizeArray(res.data);
  if (res?.leads) return normalizeArray(res.leads);
  return [];
};

export const leadsApi = {
  findAll: async (): Promise<Lead[]> => {
    try {
      const response = await api.get('/leads');
      return normalizeArray(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      return [];
    }
  },

  findById: async (id: string) => {
    const response = await api.get(`/leads/${id}`);
    return response.data?.data || response.data;
  },

  create: async (data: Partial<Lead>) => {
    const response = await api.post('/leads', data);
    return response.data?.data || response.data;
  },

  update: async (id: string, data: Partial<Lead>) => {
    const response = await api.put(`/leads/${id}`, data);
    return response.data?.data || response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },
};