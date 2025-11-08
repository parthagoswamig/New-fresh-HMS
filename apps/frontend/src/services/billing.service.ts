import apiClient from '@/lib/api-client';

export const billingService = {
  create: (data: any, tenantId: string) =>
    apiClient.post('/billing', data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  update: (id: string, data: any, tenantId: string) =>
    apiClient.patch(`/billing/${id}`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  list: (params: any, tenantId: string) =>
    apiClient.get('/billing', {
      params,
      headers: { 'x-tenant-id': tenantId },
    }),

  getById: (id: string, tenantId: string) =>
    apiClient.get(`/billing/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  remove: (id: string, tenantId: string) =>
    apiClient.delete(`/billing/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  getStats: (tenantId: string) =>
    apiClient.get('/billing/stats', {
      headers: { 'x-tenant-id': tenantId },
    }),
};
