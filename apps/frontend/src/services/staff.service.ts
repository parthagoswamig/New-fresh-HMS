import apiClient from '@/lib/api-client';

export const staffService = {
  list: async (tenantId: string, page: number = 1, limit: number = 100) => {
    const response = await apiClient.get('/staff', {
      params: { page, limit },
      headers: { 'x-tenant-id': tenantId },
    });
    return response.data;
  },

  getById: async (tenantId: string, id: string) => {
    const response = await apiClient.get(`/staff/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    });
    return response.data;
  },
};
