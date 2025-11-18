import apiClient from '@/lib/api-client';

export const prescriptionService = {
  getByAppointment: (appointmentId: string, tenantId: string) =>
    apiClient.get(`/prescriptions/appointment/${appointmentId}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  upsertForAppointment: (appointmentId: string, data: any, tenantId: string) =>
    apiClient.post(`/prescriptions/appointment/${appointmentId}`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  listByPatient: (patientId: string, tenantId: string) =>
    apiClient.get(`/prescriptions/patient/${patientId}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  getById: (id: string, tenantId: string) =>
    apiClient.get(`/prescriptions/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),
};
