import apiClient from '@/lib/api-client';

export const patientService = {
  create: (data: any, tenantId: string) =>
    apiClient.post('/patients', data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  update: (id: string, data: any, tenantId: string) =>
    apiClient.patch(`/patients/${id}`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  list: (params: any, tenantId: string) =>
    apiClient.get('/patients', {
      params,
      headers: { 'x-tenant-id': tenantId },
    }),

  getById: (id: string, tenantId: string) =>
    apiClient.get(`/patients/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  remove: (id: string, tenantId: string) =>
    apiClient.delete(`/patients/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  getStats: (tenantId: string) =>
    apiClient.get('/patients/stats', {
      headers: { 'x-tenant-id': tenantId },
    }),
};
