import apiClient from '@/lib/api-client';

export const ipdService = {
  create: (data: any, tenantId: string) =>
    apiClient.post('/ipd', data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  update: (id: string, data: any, tenantId: string) =>
    apiClient.patch(`/ipd/${id}`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  list: (params: any, tenantId: string) =>
    apiClient.get('/ipd', {
      params,
      headers: { 'x-tenant-id': tenantId },
    }),

  getById: (id: string, tenantId: string) =>
    apiClient.get(`/ipd/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  remove: (id: string, tenantId: string) =>
    apiClient.delete(`/ipd/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  getStats: (tenantId: string) =>
    apiClient.get('/ipd/stats', {
      headers: { 'x-tenant-id': tenantId },
    }),

  discharge: (id: string, data: { dischargeSummary: string }, tenantId: string) =>
    apiClient.patch(`/ipd/${id}/discharge`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),
};
