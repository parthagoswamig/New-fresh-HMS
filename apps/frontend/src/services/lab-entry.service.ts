import apiClient from '@/lib/api-client';

export const labEntryService = {
  // Lab Entry Management (Patient Orders)
  createEntry: (data: any, tenantId: string) =>
    apiClient.post('/lab-entries', data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  listEntries: (params: any, tenantId: string) =>
    apiClient.get('/lab-entries', {
      params,
      headers: { 'x-tenant-id': tenantId },
    }),

  getEntryById: (id: string, tenantId: string) =>
    apiClient.get(`/lab-entries/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  addResults: (id: string, data: any, tenantId: string) =>
    apiClient.post(`/lab-entries/${id}/results`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  getPrintData: (id: string, tenantId: string) =>
    apiClient.get(`/lab-entries/${id}/print`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  createBill: (id: string, tenantId: string) =>
    apiClient.post(`/lab-entries/${id}/bill`, {}, {
      headers: { 'x-tenant-id': tenantId },
    }),

  removeEntry: (id: string, tenantId: string) =>
    apiClient.delete(`/lab-entries/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  getStats: (tenantId: string) =>
    apiClient.get('/lab-entries/stats', {
      headers: { 'x-tenant-id': tenantId },
    }),
};
