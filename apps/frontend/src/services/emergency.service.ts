import apiClient from '@/lib/api-client';

export type EmergencySeverity = 'CRITICAL' | 'SERIOUS' | 'MODERATE' | 'STABLE';
export type EmergencyStatus = 'WAITING' | 'UNDER_TREATMENT' | 'ADMITTED' | 'TRANSFERRED' | 'DISCHARGED' | 'DECEASED';
export type ArrivalMode = 'AMBULANCE' | 'WALK_IN' | 'REFERRED' | 'POLICE' | 'OTHER';

export interface EmergencyCase {
  id: string;
  emergencyNumber: string;
  tenantId: string;
  
  // Patient Information
  patientId?: string;
  quickName?: string;
  quickAge?: number;
  quickGender?: string;
  quickContact?: string;
  quickAddress?: string;
  
  // Triage
  severity: EmergencySeverity;
  chiefComplaint: string;
  arrivalMode: ArrivalMode;
  arrivalTime: string;
  firstResponderId?: string;
  triageNurseId?: string;
  attendingDoctorId?: string;
  
  // Vitals
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  
  // Clinical
  primaryDiagnosis?: string;
  secondaryDiagnosis?: string;
  allergies?: string;
  currentMedications?: string;
  medicalHistory?: string;
  
  // Treatment
  progressNotes?: any[];
  interventions?: any[];
  investigations?: any[];
  medications?: any[];
  
  // Status
  status: EmergencyStatus;
  treatmentStartTime?: string;
  treatmentEndTime?: string;
  
  // Disposition
  admittedToIpdId?: string;
  transferredTo?: string;
  transferReason?: string;
  dischargeTime?: string;
  dischargeSummary?: string;
  dischargeAdvice?: string;
  followUpDate?: string;
  
  // Death
  deathTime?: string;
  causeOfDeath?: string;
  deathCertificateUrl?: string;
  
  // Billing
  billId?: string;
  estimatedCost?: number;
  actualCost?: number;
  
  // Relations
  patient?: any;
  firstResponder?: any;
  triageNurse?: any;
  attendingDoctor?: any;
  bill?: any;
  
  // Audit
  createdAt: string;
  updatedAt: string;
}

export const emergencyService = {
  create: (data: any, tenantId: string) =>
    apiClient.post('/emergency', data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  list: (params: any, tenantId: string) =>
    apiClient.get('/emergency', {
      params,
      headers: { 'x-tenant-id': tenantId },
    }),

  getById: (id: string, tenantId: string) =>
    apiClient.get(`/emergency/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  update: (id: string, data: any, tenantId: string) =>
    apiClient.patch(`/emergency/${id}`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  transferToIpd: (id: string, data: { ipdAdmissionId: string; updatedById: string }, tenantId: string) =>
    apiClient.post(`/emergency/${id}/transfer`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  discharge: (
    id: string,
    data: {
      dischargeSummary: string;
      dischargeAdvice?: string;
      followUpDate?: string;
      updatedById: string;
    },
    tenantId: string,
  ) =>
    apiClient.post(`/emergency/${id}/discharge`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  declareDeath: (
    id: string,
    data: {
      causeOfDeath: string;
      deathTime?: string;
      deathCertificateUrl?: string;
      updatedById: string;
    },
    tenantId: string,
  ) =>
    apiClient.post(`/emergency/${id}/death`, data, {
      headers: { 'x-tenant-id': tenantId },
    }),

  remove: (id: string, tenantId: string) =>
    apiClient.delete(`/emergency/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    }),

  getStats: (tenantId: string, startDate?: string, endDate?: string) =>
    apiClient.get('/emergency/stats', {
      params: { startDate, endDate },
      headers: { 'x-tenant-id': tenantId },
    }),
};
