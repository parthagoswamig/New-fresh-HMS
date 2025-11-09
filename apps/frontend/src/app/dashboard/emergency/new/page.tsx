'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { emergencyService, EmergencySeverity, ArrivalMode } from '@/services/emergency.service';
import { patientService } from '@/services/patients.service';
import { staffService } from '@/services/staff.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const SEVERITY_LEVELS: EmergencySeverity[] = ['CRITICAL', 'SERIOUS', 'MODERATE', 'STABLE'];
const ARRIVAL_MODES: ArrivalMode[] = ['AMBULANCE', 'WALK_IN', 'REFERRED', 'POLICE', 'OTHER'];

export default function NewEmergencyPage() {
  const router = useRouter();
  const { tenant, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [useQuickReg, setUseQuickReg] = useState(false);

  const [formData, setFormData] = useState({
    // Patient
    patientId: '',
    quickName: '',
    quickAge: '',
    quickGender: '',
    quickContact: '',
    quickAddress: '',
    
    // Triage
    severity: 'MODERATE' as EmergencySeverity,
    chiefComplaint: '',
    arrivalMode: 'WALK_IN' as ArrivalMode,
    triageNurseId: '',
    attendingDoctorId: '',
    
    // Vitals
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    
    // Clinical
    primaryDiagnosis: '',
    allergies: '',
    currentMedications: '',
    medicalHistory: '',
    
    // Billing
    estimatedCost: '',
  });

  useEffect(() => {
    if (tenant?.id) {
      fetchData();
    }
  }, [tenant]);

  const fetchData = async () => {
    try {
      const [patientsRes, staffRes] = await Promise.all([
        patientService.list({ page: 1, limit: 100 }, tenant?.id || ''),
        staffService.list(tenant?.id || '', 1, 100),
      ]);
      setPatients(patientsRes.data.data);
      setStaff(staffRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData: any = {
        severity: formData.severity,
        chiefComplaint: formData.chiefComplaint,
        arrivalMode: formData.arrivalMode,
        createdById: user?.staff?.id || '',
      };

      // Patient data
      if (useQuickReg) {
        submitData.quickName = formData.quickName;
        submitData.quickAge = parseInt(formData.quickAge);
        submitData.quickGender = formData.quickGender;
        submitData.quickContact = formData.quickContact;
        submitData.quickAddress = formData.quickAddress;
      } else {
        submitData.patientId = formData.patientId;
      }

      // Staff
      if (formData.triageNurseId) submitData.triageNurseId = formData.triageNurseId;
      if (formData.attendingDoctorId) submitData.attendingDoctorId = formData.attendingDoctorId;

      // Vitals
      if (formData.bloodPressure) submitData.bloodPressure = formData.bloodPressure;
      if (formData.heartRate) submitData.heartRate = parseInt(formData.heartRate);
      if (formData.temperature) submitData.temperature = parseFloat(formData.temperature);
      if (formData.respiratoryRate) submitData.respiratoryRate = parseInt(formData.respiratoryRate);
      if (formData.oxygenSaturation) submitData.oxygenSaturation = parseInt(formData.oxygenSaturation);

      // Clinical
      if (formData.primaryDiagnosis) submitData.primaryDiagnosis = formData.primaryDiagnosis;
      if (formData.allergies) submitData.allergies = formData.allergies;
      if (formData.currentMedications) submitData.currentMedications = formData.currentMedications;
      if (formData.medicalHistory) submitData.medicalHistory = formData.medicalHistory;

      // Billing
      if (formData.estimatedCost) submitData.estimatedCost = parseFloat(formData.estimatedCost);

      const response = await emergencyService.create(submitData, tenant?.id || '');
      router.push(`/dashboard/emergency/${response.data.id}`);
    } catch (error) {
      console.error('Error creating emergency case:', error);
      alert('Failed to create emergency case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/emergency"
          className="text-red-600 hover:text-red-700 flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Emergency
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          New Emergency Case
        </h1>
        <p className="text-gray-600 mt-1">Register new emergency patient</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!useQuickReg}
                  onChange={() => setUseQuickReg(false)}
                  className="w-4 h-4"
                />
                <span>Existing Patient</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={useQuickReg}
                  onChange={() => setUseQuickReg(true)}
                  className="w-4 h-4"
                />
                <span>Quick Registration</span>
              </label>
            </div>

            {!useQuickReg ? (
              <div>
                <label className="block text-sm font-medium mb-2">Select Patient *</label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  required={!useQuickReg}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="">Select patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.patientId} - {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.quickName}
                    onChange={(e) => setFormData({ ...formData, quickName: e.target.value })}
                    required={useQuickReg}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Age *</label>
                  <input
                    type="number"
                    value={formData.quickAge}
                    onChange={(e) => setFormData({ ...formData, quickAge: e.target.value })}
                    required={useQuickReg}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Gender *</label>
                  <select
                    value={formData.quickGender}
                    onChange={(e) => setFormData({ ...formData, quickGender: e.target.value })}
                    required={useQuickReg}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="">Select...</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact *</label>
                  <input
                    type="text"
                    value={formData.quickContact}
                    onChange={(e) => setFormData({ ...formData, quickContact: e.target.value })}
                    required={useQuickReg}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.quickAddress}
                    onChange={(e) => setFormData({ ...formData, quickAddress: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Triage Information */}
        <Card>
          <CardHeader>
            <CardTitle>Triage Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Severity Level *</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as EmergencySeverity })}
                  required
                  className="w-full border rounded-lg px-4 py-2"
                >
                  {SEVERITY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Arrival Mode *</label>
                <select
                  value={formData.arrivalMode}
                  onChange={(e) => setFormData({ ...formData, arrivalMode: e.target.value as ArrivalMode })}
                  required
                  className="w-full border rounded-lg px-4 py-2"
                >
                  {ARRIVAL_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Chief Complaint *</label>
              <textarea
                value={formData.chiefComplaint}
                onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                required
                rows={3}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Triage Nurse</label>
                <select
                  value={formData.triageNurseId}
                  onChange={(e) => setFormData({ ...formData, triageNurseId: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="">Select nurse...</option>
                  {staff
                    .filter((s) => s.user.role === 'NURSE')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.user.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Attending Doctor</label>
                <select
                  value={formData.attendingDoctorId}
                  onChange={(e) => setFormData({ ...formData, attendingDoctorId: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="">Select doctor...</option>
                  {staff
                    .filter((s) => s.user.role === 'DOCTOR' || s.user.role === 'HOSPITAL_ADMIN')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.user.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vitals */}
        <Card>
          <CardHeader>
            <CardTitle>Vital Signs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Blood Pressure</label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={formData.bloodPressure}
                  onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={formData.heartRate}
                  onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Respiratory Rate</label>
                <input
                  type="number"
                  value={formData.respiratoryRate}
                  onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">O2 Saturation (%)</label>
                <input
                  type="number"
                  value={formData.oxygenSaturation}
                  onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Primary Diagnosis</label>
              <input
                type="text"
                value={formData.primaryDiagnosis}
                onChange={(e) => setFormData({ ...formData, primaryDiagnosis: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Known Allergies</label>
              <textarea
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                rows={2}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Current Medications</label>
              <textarea
                value={formData.currentMedications}
                onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                rows={2}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Medical History</label>
              <textarea
                value={formData.medicalHistory}
                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                rows={3}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium mb-2">Estimated Cost</label>
              <input
                type="number"
                step="0.01"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Creating...' : 'Create Emergency Case'}
          </button>
          <Link
            href="/dashboard/emergency"
            className="px-6 py-3 border rounded-lg hover:bg-gray-50 flex items-center justify-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
