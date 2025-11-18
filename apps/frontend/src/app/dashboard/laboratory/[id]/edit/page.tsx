'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { laboratoryService } from '@/services/laboratory.service';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function EditLabTestPage() {
  const router = useRouter();
  const params = useParams();
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [labTests, setLabTests] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    labTestId: '',
    orderedById: '',
    testName: '',
    testCode: '',
    sampleType: '',
    result: '',
    unit: '',
    referenceRange: '',
    status: 'ORDERED',
    notes: '',
  });

  useEffect(() => {
    if (tenant?.id) {
      fetchLabTest();
      fetchPatients();
      fetchLabTests();
      fetchDoctors();
    }
  }, [tenant?.id]);

  const fetchLabTest = async () => {
    try {
      setFetching(true);
      const response = await laboratoryService.getById(params.id as string, tenant?.id || '');
      const test = response.data;

      setFormData({
        patientId: test.patientId || '',
        labTestId: test.labTestId || '',
        orderedById: test.orderedById || '',
        testName: test.testName || '',
        testCode: test.testCode || '',
        sampleType: test.sampleType || '',
        result: test.result || '',
        unit: test.unit || '',
        referenceRange: test.referenceRange || '',
        status: test.status || 'ORDERED',
        notes: test.notes || '',
      });
    } catch (error) {
      console.error('Failed to fetch lab test:', error);
      alert('Failed to load lab test details');
    } finally {
      setFetching(false);
    }
  };

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

  const fetchLabTests = async () => {
    try {
      const response = await apiClient.get('/lab-tests', {
        headers: { 'x-tenant-id': tenant?.id },
        params: { limit: 100 },
      });
      setLabTests(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch lab tests:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.get('/staff', {
        headers: { 'x-tenant-id': tenant?.id },
        params: { limit: 100 },
      });
      const doctorsList = response.data.data?.filter(
        (staff: any) => staff.user.role === 'DOCTOR' || staff.user.role === 'LAB_TECHNICIAN'
      ) || [];
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        testCode: formData.testCode || undefined,
        sampleType: formData.sampleType || undefined,
        result: formData.result || undefined,
        unit: formData.unit || undefined,
        referenceRange: formData.referenceRange || undefined,
        notes: formData.notes || undefined,
      };

      await laboratoryService.update(params.id as string, payload, tenant?.id || '');
      router.push('/dashboard/laboratory');
    } catch (error: any) {
      console.error('Failed to update lab test:', error);
      alert(error.response?.data?.message || 'Failed to update lab test');
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="text-gray-600 mt-4">Loading lab test details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6">
        <Link href="/dashboard/laboratory">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Laboratory
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Lab Test</h1>
        <p className="text-gray-600 mt-1">Update lab test details</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <Label className="text-sm" htmlFor="patientSearch">
                    Search Patient by Aadhaar / Name / ID / Phone
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="patientSearch"
                      type="text"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      placeholder="Enter Aadhaar, name, ID, or phone"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fetchPatients(patientSearch)}
                    >
                      Search
                    </Button>
                  </div>
                </div>

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
              </div>

              <div>
                <Label htmlFor="labTestId">Lab Test *</Label>
                <select
                  id="labTestId"
                  name="labTestId"
                  value={formData.labTestId}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Test</option>
                  {labTests.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.name} {test.category && `- ${test.category}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="orderedById">Ordered By *</Label>
                <select
                  id="orderedById"
                  name="orderedById"
                  value={formData.orderedById}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Doctor/Technician</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.user.firstName} {doctor.user.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="testName">Test Name *</Label>
                <Input
                  type="text"
                  id="testName"
                  name="testName"
                  value={formData.testName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="testCode">Test Code</Label>
                <Input
                  type="text"
                  id="testCode"
                  name="testCode"
                  value={formData.testCode}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="sampleType">Sample Type</Label>
                <select
                  id="sampleType"
                  name="sampleType"
                  value={formData.sampleType}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Sample Type</option>
                  <option value="Blood">Blood</option>
                  <option value="Urine">Urine</option>
                  <option value="Stool">Stool</option>
                  <option value="Saliva">Saliva</option>
                  <option value="Tissue">Tissue</option>
                  <option value="Other">Other</option>
                </select>
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
                  <option value="ORDERED">Ordered</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="result">Result</Label>
                <Input
                  type="text"
                  id="result"
                  name="result"
                  value={formData.result}
                  onChange={handleChange}
                  placeholder="e.g., 120"
                />
              </div>

              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  type="text"
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="e.g., mg/dL"
                />
              </div>

              <div>
                <Label htmlFor="referenceRange">Reference Range</Label>
                <Input
                  type="text"
                  id="referenceRange"
                  name="referenceRange"
                  value={formData.referenceRange}
                  onChange={handleChange}
                  placeholder="e.g., 70-100"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
            {loading ? 'Updating...' : 'Update Lab Test'}
          </Button>
          <Link href="/dashboard/laboratory">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
