'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { opdService } from '@/services/opd.service';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function EditOPDVisitPage() {
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
    visitDate: '',
    chiefComplaint: '',
    diagnosis: '',
    notes: '',
    fee: '',
    status: 'PENDING',
  });

  useEffect(() => {
    fetchVisit();
    fetchPatients();
    fetchDoctors();
    fetchDepartments();
  }, []);

  const fetchVisit = async () => {
    try {
      setFetching(true);
      const response = await opdService.getById(params.id as string, tenant?.id || '');
      const visit = response.data;
      setFormData({
        patientId: visit.patientId,
        doctorId: visit.doctorId,
        departmentId: visit.departmentId || '',
        visitDate: new Date(visit.visitDate).toISOString().slice(0, 16),
        chiefComplaint: visit.chiefComplaint,
        diagnosis: visit.diagnosis || '',
        notes: visit.notes || '',
        fee: visit.fee.toString(),
        status: visit.status,
      });
    } catch (error) {
      console.error('Failed to fetch visit:', error);
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
        fee: parseFloat(formData.fee) || 0,
        departmentId: formData.departmentId || undefined,
      };

      await opdService.update(params.id as string, payload, tenant?.id || '');
      router.push('/dashboard/opd');
    } catch (error: any) {
      console.error('Failed to update visit:', error);
      alert(error.response?.data?.message || 'Failed to update visit');
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading visit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6">
        <Link href="/dashboard/opd">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to OPD
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit OPD Visit</h1>
        <p className="text-gray-600 mt-1">Update visit information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Visit Information</CardTitle>
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
                <Label htmlFor="visitDate">Visit Date & Time *</Label>
                <Input
                  type="datetime-local"
                  id="visitDate"
                  name="visitDate"
                  value={formData.visitDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="fee">Consultation Fee *</Label>
                <Input
                  type="number"
                  id="fee"
                  name="fee"
                  value={formData.fee}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
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
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
              <Textarea
                id="chiefComplaint"
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleChange}
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
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
            {loading ? 'Updating...' : 'Update Visit'}
          </Button>
          <Link href="/dashboard/opd">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
