import apiClient from '@/lib/api-client';

export const appointmentService = {
  create: (data: any, tenantId: string) =>
    apiClient.post('/appointments', data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  update: (id: string, data: any, tenantId: string) =>
    apiClient.patch(`/appointments/${id}`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  list: (params: any, tenantId: string) =>
    apiClient.get('/appointments', {
      params,
      headers: { 'x-tenant-id': tenantId },
    }),

  getById: (id: string, tenantId: string) =>
    apiClient.get(`/appointments/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  remove: (id: string, tenantId: string) =>
    apiClient.delete(`/appointments/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  getStats: (tenantId: string) =>
    apiClient.get('/appointments/stats', {
      headers: { 'x-tenant-id': tenantId },
    }),
};
