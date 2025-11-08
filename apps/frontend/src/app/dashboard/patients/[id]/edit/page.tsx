'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { patientService } from '@/services/patients.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bloodGroup: '',
    maritalStatus: '',
    emergencyContact: '',
    allergies: '',
  });

  useEffect(() => {
    fetchPatient();
  }, []);

  const fetchPatient = async () => {
    try {
      setFetching(true);
      const response = await patientService.getById(params.id as string, tenant?.id || '');
      const patient = response.data;

      setFormData({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        dateOfBirth: patient.dateOfBirth
          ? new Date(patient.dateOfBirth).toISOString().split('T')[0]
          : '',
        gender: patient.gender || 'MALE',
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        city: patient.city || '',
        state: patient.state || '',
        zipCode: patient.zipCode || '',
        bloodGroup: patient.bloodGroup || '',
        maritalStatus: patient.maritalStatus || '',
        emergencyContact: patient.emergencyContact || '',
        allergies: patient.allergies || '',
      });
    } catch (error) {
      console.error('Failed to fetch patient:', error);
      alert('Failed to load patient details');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        email: formData.email || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        maritalStatus: formData.maritalStatus || undefined,
        emergencyContact: formData.emergencyContact || undefined,
        allergies: formData.allergies || undefined,
      };

      await patientService.update(params.id as string, payload, tenant?.id || '');
      router.push('/dashboard/patients');
    } catch (error: any) {
      console.error('Failed to update patient:', error);
      alert(error.response?.data?.message || 'Failed to update patient');
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
          <p className="text-gray-600 mt-4">Loading patient details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6">
        <Link href="/dashboard/patients">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Patient</h1>
        <p className="text-gray-600 mt-1">Update patient information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender *</Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <select
                  id="maritalStatus"
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  type="tel"
                  id="emergencyContact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Emergency contact number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="List any known allergies..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
            {loading ? 'Updating...' : 'Update Patient'}
          </Button>
          <Link href="/dashboard/patients">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
