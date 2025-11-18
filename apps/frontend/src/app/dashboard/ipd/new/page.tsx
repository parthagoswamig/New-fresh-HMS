'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function NewIPDAdmissionPage() {
  const router = useRouter();
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    departmentId: '',
    wardId: '',
    bedId: '',
    admissionDate: new Date().toISOString().slice(0, 16),
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
    if (tenant?.id) {
      fetchPatients();
      fetchDoctors();
      fetchDepartments();
      fetchWards();
    }
  }, [tenant?.id]);

  useEffect(() => {
    if (formData.wardId) {
      fetchBeds(formData.wardId);
    } else {
      setBeds([]);
      setFormData(prev => ({ ...prev, bedId: '' }));
    }
  }, [formData.wardId]);

  const fetchPatients = async (searchTerm?: string) => {
    try {
      const response = await apiClient.get('/patients', {
        headers: { 'x-tenant-id': tenant?.id },
        params: { limit: 100, search: searchTerm || undefined },
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
      // Filter only doctors with safe access
      const staffData = Array.isArray(response?.data?.data) ? response.data.data : [];
      const doctorsList = staffData.filter(
        (staff: any) => staff?.user?.role === 'DOCTOR'
      );
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      setDoctors([]);
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

  const fetchWards = async () => {
    try {
      const response = await apiClient.get('/ipd/wards', {
        headers: { 'x-tenant-id': tenant?.id },
      });
      setWards(response.data || []);
    } catch (error) {
      console.error('Failed to fetch wards:', error);
    }
  };

  const fetchBeds = async (wardId: string) => {
    try {
      const response = await apiClient.get(`/ipd/wards/${wardId}/beds`, {
        headers: { 'x-tenant-id': tenant?.id },
        params: { available: true },
      });
      setBeds(response.data || []);
    } catch (error) {
      console.error('Failed to fetch beds:', error);
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
      };

      await ipdService.create(payload, tenant?.id || '');
      router.push('/dashboard/ipd');
    } catch (error: any) {
      console.error('Failed to create admission:', error);
      alert(error.response?.data?.message || 'Failed to create admission');
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6">
        <Link href="/dashboard/ipd">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to IPD
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">New IPD Admission</h1>
        <p className="text-gray-600 mt-1">Register a new inpatient admission</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Admission Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
              <div className="flex-1">
                <Label htmlFor="patientSearch">Search Patient by Aadhaar / Name / ID / Phone</Label>
                <Input
                  id="patientSearch"
                  type="text"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Enter Aadhaar, patient ID, name, or phone"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => fetchPatients(patientSearch)}
              >
                Search
              </Button>
            </div>
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
                <Label htmlFor="wardId">Ward</Label>
                <select
                  id="wardId"
                  name="wardId"
                  value={formData.wardId}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Ward</option>
                  {wards.map((ward) => (
                    <option key={ward.id} value={ward.id}>
                      {ward.name} {ward.floor ? `(Floor ${ward.floor})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="bedId">Bed</Label>
                <select
                  id="bedId"
                  name="bedId"
                  value={formData.bedId}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!formData.wardId}
                >
                  <option value="">Select Bed</option>
                  {beds.map((bed) => (
                    <option key={bed.id} value={bed.id}>
                      Bed {bed.bedNumber} ({bed.bedType})
                    </option>
                  ))}
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
                <Label htmlFor="bedNumber">Bed Number (Manual)</Label>
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
            {loading ? 'Creating...' : 'Create Admission'}
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
