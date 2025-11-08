import apiClient from '@/lib/api-client';

export const labTestService = {
  // Lab Test Catalog Management
  createTest: (data: any, tenantId: string) =>
    apiClient.post('/lab-tests', data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  updateTest: (id: string, data: any, tenantId: string) =>
    apiClient.patch(`/lab-tests/${id}`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  listTests: (params: any, tenantId: string) =>
    apiClient.get('/lab-tests', {
      params,
      headers: { 'x-tenant-id': tenantId },
    }),

  getTestById: (id: string, tenantId: string) =>
    apiClient.get(`/lab-tests/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  removeTest: (id: string, tenantId: string) =>
    apiClient.delete(`/lab-tests/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  getTestStats: (tenantId: string) =>
    apiClient.get('/lab-tests/stats', {
      headers: { 'x-tenant-id': tenantId },
    }),

  getCategories: (tenantId: string) =>
    apiClient.get('/lab-tests/categories', {
      headers: { 'x-tenant-id': tenantId },
    }),
};
