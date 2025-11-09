import apiClient from '@/lib/api-client';

export interface Surgery {
  id: string;
  surgeryNumber: string;
  patientId: string;
  surgeonId: string;
  assistantIds: string[];
  anesthesiologistId?: string;
  otRoomId: string;
  surgeryType: string;
  procedureName: string;
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  preOpDiagnosis?: string;
  postOpDiagnosis?: string;
  preOpNote?: string;
  postOpNote?: string;
  complications?: string;
  bloodLoss?: number;
  duration?: number;
  estimatedCost: number;
  actualCost?: number;
  consentFormUrl?: string;
  billId?: string;
  patient?: any;
  surgeon?: any;
  anesthesiologist?: any;
  operatingRoom?: any;
  bill?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSurgeryDto {
  patientId: string;
  surgeonId: string;
  assistantIds?: string[];
  anesthesiologistId?: string;
  otRoomId: string;
  surgeryType: string;
  procedureName: string;
  scheduledDate: string;
  preOpDiagnosis?: string;
  preOpNote?: string;
  requiredEquipment?: string[];
  estimatedCost: number;
  consentFormUrl?: string;
}

export const surgeryService = {
  create: async (tenantId: string, data: CreateSurgeryDto) => {
    const response = await apiClient.post('/surgery', data, {
      headers: { 'x-tenant-id': tenantId },
    });
    return response.data;
  },

  list: async (
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string;
      status?: string;
      surgeryType?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const response = await apiClient.get('/surgery', {
      params: { page, limit, ...filters },
      headers: { 'x-tenant-id': tenantId },
    });
    return response.data;
  },

  getById: async (tenantId: string, id: string) => {
    const response = await apiClient.get(`/surgery/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    });
    return response.data;
  },

  update: async (tenantId: string, id: string, data: Partial<CreateSurgeryDto>) => {
    const response = await apiClient.patch(`/surgery/${id}`, data, {
      headers: { 'x-tenant-id': tenantId },
    });
    return response.data;
  },

  updateStatus: async (tenantId: string, id: string, status: string) => {
    const response = await apiClient.patch(`/surgery/${id}/status`, { status }, {
      headers: { 'x-tenant-id': tenantId },
    });
    return response.data;
  },

  cancel: async (tenantId: string, id: string, reason: string) => {
    const response = await apiClient.post(`/surgery/${id}/cancel`, { reason }, {
      headers: { 'x-tenant-id': tenantId },
    });
    return response.data;
  },

  remove: async (tenantId: string, id: string) => {
    const response = await apiClient.delete(`/surgery/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    });
    return response.data;
  },

  getStats: async (tenantId: string, startDate?: string, endDate?: string) => {
    const response = await apiClient.get('/surgery/stats', {
      params: { startDate, endDate },
      headers: { 'x-tenant-id': tenantId },
    });
    return response.data;
  },

  getOperatingRooms: async (tenantId: string) => {
    const response = await apiClient.get('/surgery/operating-rooms', {
      headers: { 'x-tenant-id': tenantId },
    });
    return response.data;
  },
};
