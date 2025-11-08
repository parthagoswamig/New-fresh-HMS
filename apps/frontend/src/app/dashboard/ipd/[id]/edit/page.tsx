'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { ipdService } from '@/services/ipd.service';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function EditIPDAdmissionPage() {
  const router = useRouter();
  const params = useParams();
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    departmentId: '',
    admissionDate: '',
    dischargeDate: '',
    admissionReason: '',
    diagnosis: '',
    treatmentPlan: '',
    roomNumber: '',
    bedNumber: '',
    dischargeSummary: '',
    status: 'ADMITTED',
  });

  useEffect(() => {
    fetchAdmission();
    fetchPatients();
    fetchDoctors();
    fetchDepartments();
  }, []);

  const fetchAdmission = async () => {
    try {
      setFetching(true);
      const response = await ipdService.getById(params.id as string, tenant?.id || '');
      const admission = response.data;
      
      setFormData({
        patientId: admission.patientId || '',
        doctorId: admission.doctorId || '',
        departmentId: admission.departmentId || '',
        admissionDate: admission.admissionDate
          ? new Date(admission.admissionDate).toISOString().slice(0, 16)
          : '',
        dischargeDate: admission.dischargeDate
          ? new Date(admission.dischargeDate).toISOString().slice(0, 16)
          : '',
        admissionReason: admission.admissionReason || '',
        diagnosis: admission.diagnosis || '',
        treatmentPlan: admission.treatmentPlan || '',
        roomNumber: admission.roomNumber || '',
        bedNumber: admission.bedNumber || '',
        dischargeSummary: admission.dischargeSummary || '',
        status: admission.status || 'ADMITTED',
      });
    } catch (error) {
      console.error('Failed to fetch admission:', error);
      alert('Failed to load admission details');
    } finally {
      setFetching(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await apiClient.get('/patients', {
        headers: { 'x-tenant-id': tenant?.id },
        params: { limit: 100 },
      });
      setPatients(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.get('/staff', {
        headers: { 'x-tenant-id': tenant?.id },
        params: { limit: 100 },
      });
      const doctorsList = response.data.data?.filter(
        (staff: any) => staff.user.role === 'DOCTOR'
      ) || [];
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiClient.get('/departments', {
        headers: { 'x-tenant-id': tenant?.id },
        params: { isActive: true },
      });
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        departmentId: formData.departmentId || undefined,
        dischargeDate: formData.dischargeDate || undefined,
        diagnosis: formData.diagnosis || undefined,
        treatmentPlan: formData.treatmentPlan || undefined,
        roomNumber: formData.roomNumber || undefined,
        bedNumber: formData.bedNumber || undefined,
        dischargeSummary: formData.dischargeSummary || undefined,
      };

      await ipdService.update(params.id as string, payload, tenant?.id || '');
      router.push('/dashboard/ipd');
    } catch (error: any) {
      console.error('Failed to update admission:', error);
      alert(error.response?.data?.message || 'Failed to update admission');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading admission details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6">
        <Link href="/dashboard/ipd">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to IPD
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit IPD Admission</h1>
        <p className="text-gray-600 mt-1">Update inpatient admission details</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Admission Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientId">Patient *</Label>
                <select
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} ({patient.patientId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="doctorId">Doctor *</Label>
                <select
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.user.firstName} {doctor.user.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="departmentId">Department</Label>
                <select
                  id="departmentId"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="admissionDate">Admission Date & Time *</Label>
                <Input
                  type="datetime-local"
                  id="admissionDate"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="dischargeDate">Discharge Date (Optional)</Label>
                <Input
                  type="datetime-local"
                  id="dischargeDate"
                  name="dischargeDate"
                  value={formData.dischargeDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ADMITTED">Admitted</option>
                  <option value="UNDER_TREATMENT">Under Treatment</option>
                  <option value="DISCHARGED">Discharged</option>
                </select>
              </div>

              <div>
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  type="text"
                  id="roomNumber"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  placeholder="e.g., 101"
                />
              </div>

              <div>
                <Label htmlFor="bedNumber">Bed Number</Label>
                <Input
                  type="text"
                  id="bedNumber"
                  name="bedNumber"
                  value={formData.bedNumber}
                  onChange={handleChange}
                  placeholder="e.g., A1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="admissionReason">Reason for Admission *</Label>
              <Textarea
                id="admissionReason"
                name="admissionReason"
                value={formData.admissionReason}
                onChange={handleChange}
                placeholder="Describe the reason for admission..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder="Enter diagnosis details..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="treatmentPlan">Treatment Plan</Label>
              <Textarea
                id="treatmentPlan"
                name="treatmentPlan"
                value={formData.treatmentPlan}
                onChange={handleChange}
                placeholder="Enter treatment plan..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="dischargeSummary">Discharge Summary</Label>
              <Textarea
                id="dischargeSummary"
                name="dischargeSummary"
                value={formData.dischargeSummary}
                onChange={handleChange}
                placeholder="Enter discharge summary..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
            {loading ? 'Updating...' : 'Update Admission'}
          </Button>
          <Link href="/dashboard/ipd">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
