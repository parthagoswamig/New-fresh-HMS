import apiClient from '@/lib/api-client';

export const insuranceService = {
  // ==================== COMPANIES ====================
  createCompany: (data: any, tenantId: string) =>
    apiClient.post('/insurance/companies', data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  listCompanies: (params: any, tenantId: string) =>
    apiClient.get('/insurance/companies', {
      params,
      headers: { 'x-tenant-id': tenantId },
    }),

  getCompany: (id: string, tenantId: string) =>
    apiClient.get(`/insurance/companies/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  updateCompany: (id: string, data: any, tenantId: string) =>
    apiClient.patch(`/insurance/companies/${id}`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  deleteCompany: (id: string, tenantId: string) =>
    apiClient.delete(`/insurance/companies/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  // ==================== POLICIES ====================
  createPolicy: (data: any, tenantId: string) =>
    apiClient.post('/insurance/policies', data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  listPolicies: (params: any, tenantId: string) =>
    apiClient.get('/insurance/policies', {
      params,
      headers: { 'x-tenant-id': tenantId },
    }),

  getPolicy: (id: string, tenantId: string) =>
    apiClient.get(`/insurance/policies/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  updatePolicy: (id: string, data: any, tenantId: string) =>
    apiClient.patch(`/insurance/policies/${id}`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  deletePolicy: (id: string, tenantId: string) =>
    apiClient.delete(`/insurance/policies/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  // ==================== PATIENT INSURANCE ====================
  assignInsurance: (data: any, tenantId: string) =>
    apiClient.post('/insurance/patient-insurance', data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  getPatientInsurance: (patientId: string, tenantId: string) =>
    apiClient.get(`/insurance/patient-insurance/patient/${patientId}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  getActivePatientInsurance: (patientId: string, tenantId: string) =>
    apiClient.get(`/insurance/patient-insurance/patient/${patientId}/active`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  // ==================== CLAIMS ====================
  createClaim: (data: any, tenantId: string, userId: string) =>
    apiClient.post('/insurance/claims', data, {
      headers: {
        'x-tenant-id': tenantId,
        'x-user-id': userId,
      },
    }),

  listClaims: (params: any, tenantId: string) =>
    apiClient.get('/insurance/claims', {
      params,
      headers: { 'x-tenant-id': tenantId },
    }),

  getClaim: (id: string, tenantId: string) =>
    apiClient.get(`/insurance/claims/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  updateClaimStatus: (id: string, data: any, tenantId: string, userId: string) =>
    apiClient.patch(`/insurance/claims/${id}/status`, data, {
      headers: {
        'x-tenant-id': tenantId,
        'x-user-id': userId,
      },
    }),

  addClaimDocuments: (id: string, documents: any[], tenantId: string) =>
    apiClient.post(`/insurance/claims/${id}/documents`, documents, {
      headers: { 'x-tenant-id': tenantId },
    }),

  // ==================== STATISTICS ====================
  getCompanyStats: (tenantId: string) =>
    apiClient.get('/insurance/stats/companies', {
      headers: { 'x-tenant-id': tenantId },
    }),

  getClaimStats: (tenantId: string) =>
    apiClient.get('/insurance/stats/claims', {
      headers: { 'x-tenant-id': tenantId },
    }),
};
