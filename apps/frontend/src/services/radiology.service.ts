import apiClient from '@/lib/api-client';

export const radiologyService = {
  // Radiology Test Management
  createTest: (data: any, tenantId: string) =>
    apiClient.post('/radiology/tests', data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  listTests: (params: any, tenantId: string) =>
    apiClient.get('/radiology/tests', {
      params,
      headers: { 'x-tenant-id': tenantId },
    }),

  getTestById: (id: string, tenantId: string) =>
    apiClient.get(`/radiology/tests/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  updateTest: (id: string, data: any, tenantId: string) =>
    apiClient.patch(`/radiology/tests/${id}`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  deleteTest: (id: string, tenantId: string) =>
    apiClient.delete(`/radiology/tests/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  // Patient Radiology Management
  assignTest: (data: any, tenantId: string, userId: string) =>
    apiClient.post('/radiology/assign', data, {
      headers: { 
        'x-tenant-id': tenantId,
        'x-user-id': userId,
      },
    }),

  getPatientTests: (patientId: string, tenantId: string) =>
    apiClient.get(`/radiology/patient/${patientId}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  updateResult: (id: string, data: any, tenantId: string) =>
    apiClient.patch(`/radiology/result/${id}`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  getReport: (id: string, tenantId: string) =>
    apiClient.get(`/radiology/report/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  getStats: (tenantId: string) =>
    apiClient.get('/radiology/stats', {
      headers: { 'x-tenant-id': tenantId },
    }),
};
