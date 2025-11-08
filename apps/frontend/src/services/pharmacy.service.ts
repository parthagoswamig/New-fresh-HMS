import apiClient from '@/lib/api-client';

export const pharmacyService = {
  create: (data: any, tenantId: string) =>
    apiClient.post('/pharmacy', data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  update: (id: string, data: any, tenantId: string) =>
    apiClient.patch(`/pharmacy/${id}`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  list: (params: any, tenantId: string) =>
    apiClient.get('/pharmacy', {
      params,
      headers: { 'x-tenant-id': tenantId },
    }),

  getById: (id: string, tenantId: string) =>
    apiClient.get(`/pharmacy/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  remove: (id: string, tenantId: string) =>
    apiClient.delete(`/pharmacy/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  getStats: (tenantId: string) =>
    apiClient.get('/pharmacy/stats', {
      headers: { 'x-tenant-id': tenantId },
    }),
};
