import apiClient from '@/lib/api-client';

export const laboratoryService = {
  create: (data: any, tenantId: string) =>
    apiClient.post('/laboratory', data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  update: (id: string, data: any, tenantId: string) =>
    apiClient.patch(`/laboratory/${id}`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  list: (params: any, tenantId: string) =>
    apiClient.get('/laboratory', {
      params,
      headers: { 'x-tenant-id': tenantId },
    }),

  getById: (id: string, tenantId: string) =>
    apiClient.get(`/laboratory/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  remove: (id: string, tenantId: string) =>
    apiClient.delete(`/laboratory/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  getStats: (tenantId: string) =>
    apiClient.get('/laboratory/stats', {
      headers: { 'x-tenant-id': tenantId },
    }),
};
