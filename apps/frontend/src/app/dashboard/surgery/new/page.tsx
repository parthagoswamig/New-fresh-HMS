'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { surgeryService } from '@/services/surgery.service';
import { patientService } from '@/services/patients.service';
import { staffService } from '@/services/staff.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const SURGERY_TYPES = [
  'GENERAL',
  'ORTHOPEDIC',
  'CARDIAC',
  'NEUROSURGERY',
  'PLASTIC',
  'GYNECOLOGICAL',
  'UROLOGICAL',
  'OPHTHALMIC',
  'ENT',
  'PEDIATRIC',
  'EMERGENCY',
  'OTHER',
];

export default function NewSurgeryPage() {
  const router = useRouter();
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [surgeons, setSurgeons] = useState<any[]>([]);
  const [otRooms, setOtRooms] = useState<any[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  
  const [formData, setFormData] = useState({
    patientId: '',
    surgeonId: '',
    assistantIds: [] as string[],
    anesthesiologistId: '',
    otRoomId: '',
    surgeryType: 'GENERAL',
    procedureName: '',
    scheduledDate: '',
    preOpDiagnosis: '',
    preOpNote: '',
    estimatedCost: '',
    consentFormUrl: '',
  });

  useEffect(() => {
    if (tenant?.id) {
      fetchData();
    }
  }, [tenant]);

  const fetchData = async (searchTerm?: string) => {
    try {
      const [patientsRes, staffRes, otRoomsRes] = await Promise.all([
        patientService.list({ page: 1, limit: 100, search: searchTerm || undefined }, tenant?.id || ''),
        staffService.list(tenant?.id || '', 1, 100),
        surgeryService.getOperatingRooms(tenant?.id || ''),
      ]);
      const patientData = Array.isArray(patientsRes?.data)
        ? patientsRes.data
        : (patientsRes?.data?.data || []);

      const staffData = Array.isArray(staffRes?.data)
        ? staffRes.data
        : (staffRes?.data?.data || []);

      setPatients(patientData);
      setSurgeons(
        staffData.filter(
          (s: any) =>
            s?.user?.role === 'DOCTOR' || s?.user?.role === 'HOSPITAL_ADMIN',
        ),
      );
      setOtRooms(otRoomsRes);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) return;

    try {
      setLoading(true);
      await surgeryService.create(tenant.id, {
        ...formData,
        estimatedCost: parseFloat(formData.estimatedCost),
        assistantIds: formData.assistantIds.length > 0 ? formData.assistantIds : undefined,
        anesthesiologistId: formData.anesthesiologistId || undefined,
        preOpDiagnosis: formData.preOpDiagnosis || undefined,
        preOpNote: formData.preOpNote || undefined,
        consentFormUrl: formData.consentFormUrl || undefined,
      });
      router.push('/dashboard/surgery');
    } catch (error: any) {
      console.error('Error creating surgery:', error);
      alert(error.response?.data?.message || 'Failed to schedule surgery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/surgery"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Surgery List
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Schedule Surgery</h1>
        <p className="text-gray-600 mt-1">Schedule a new surgical procedure</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Patient & Procedure Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Patient by Aadhaar / Name / ID / Phone
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      placeholder="Enter Aadhaar, name, ID, or phone"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => fetchData(patientSearch)}
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium"
                    >
                      Search
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient *
                  </label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.patientId} - {patient.firstName} {patient.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surgery Type *
                </label>
                <select
                  value={formData.surgeryType}
                  onChange={(e) => setFormData({ ...formData, surgeryType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {SURGERY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Procedure Name *
                </label>
                <input
                  type="text"
                  value={formData.procedureName}
                  onChange={(e) => setFormData({ ...formData, procedureName: e.target.value })}
                  placeholder="e.g., Appendectomy, Total Knee Replacement"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pre-operative Diagnosis
                </label>
                <input
                  type="text"
                  value={formData.preOpDiagnosis}
                  onChange={(e) => setFormData({ ...formData, preOpDiagnosis: e.target.value })}
                  placeholder="Diagnosis before surgery"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Cost (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pre-operative Notes
              </label>
              <textarea
                value={formData.preOpNote}
                onChange={(e) => setFormData({ ...formData, preOpNote: e.target.value })}
                placeholder="Pre-operative instructions and notes"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Surgical Team & OT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Surgeon *
                </label>
                <select
                  value={formData.surgeonId}
                  onChange={(e) => setFormData({ ...formData, surgeonId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Surgeon</option>
                  {surgeons.map((surgeon) => (
                    <option key={surgeon.id} value={surgeon.id}>
                      Dr. {surgeon.user.firstName} {surgeon.user.lastName}
                      {surgeon.specialization && ` - ${surgeon.specialization}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anesthesiologist
                </label>
                <select
                  value={formData.anesthesiologistId}
                  onChange={(e) => setFormData({ ...formData, anesthesiologistId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Anesthesiologist</option>
                  {surgeons.map((surgeon) => (
                    <option key={surgeon.id} value={surgeon.id}>
                      Dr. {surgeon.user.firstName} {surgeon.user.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operating Room *
                </label>
                <select
                  value={formData.otRoomId}
                  onChange={(e) => setFormData({ ...formData, otRoomId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select OT Room</option>
                  {otRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} - {room.roomNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Scheduling...' : 'Schedule Surgery'}
          </button>
          <Link
            href="/dashboard/surgery"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
