'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { appointmentService } from '@/services/appointments.service';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '09:00',
    reason: '',
    notes: '',
    status: 'PENDING',
  });

  useEffect(() => {
    fetchAppointment();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchAppointment = async () => {
    try {
      setFetching(true);
      const response = await appointmentService.getById(params.id as string, tenant?.id || '');
      const appointment = response.data;

      setFormData({
        patientId: appointment.patientId || '',
        doctorId: appointment.doctorId || '',
        appointmentDate: appointment.appointmentDate
          ? new Date(appointment.appointmentDate).toISOString().split('T')[0]
          : '',
        appointmentTime: appointment.appointmentTime || '09:00',
        reason: appointment.reason || '',
        notes: appointment.notes || '',
        status: appointment.status || 'PENDING',
      });
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
      alert('Failed to load appointment details');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await appointmentService.update(params.id as string, formData, tenant?.id || '');
      router.push('/dashboard/appointments');
    } catch (error: any) {
      console.error('Failed to update appointment:', error);
      alert(error.response?.data?.message || 'Failed to update appointment');
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

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00',
  ];

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="text-gray-600 mt-4">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6">
        <Link href="/dashboard/appointments">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Appointments
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Appointment</h1>
        <p className="text-gray-600 mt-1">Update appointment details</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
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
                <Label htmlFor="appointmentDate">Appointment Date *</Label>
                <Input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="appointmentTime">Time Slot *</Label>
                <select
                  id="appointmentTime"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Enter reason for appointment..."
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
                placeholder="Enter any additional notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
            {loading ? 'Updating...' : 'Update Appointment'}
          </Button>
          <Link href="/dashboard/appointments">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
