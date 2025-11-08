'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Stethoscope,
  Calendar,
  Clock,
  FileText,
} from 'lucide-react';
import { appointmentService } from '@/services/appointments.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { tenant } = useAuthStore();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointment();
  }, []);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getById(params.id as string, tenant?.id || '');
      setAppointment(response.data);
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
      alert('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      await appointmentService.remove(params.id as string, tenant?.id || '');
      router.push('/dashboard/appointments');
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      alert('Failed to delete appointment');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="text-gray-600 mt-4">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Appointment not found</h3>
          <Link href="/dashboard/appointments">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Appointments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/appointments">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Appointments
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Appointment Details
            </h1>
            <p className="text-gray-600 mt-1">
              {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                appointment.status
              )}`}
            >
              {appointment.status}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Link href={`/dashboard/appointments/${appointment.id}/edit`}>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </Link>
        <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.patient.firstName} {appointment.patient.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patient ID</p>
              <p className="text-base font-medium text-gray-900">{appointment.patient.patientId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.patient.phone || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.patient.email || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.patient.gender || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Stethoscope className="w-5 h-5 mr-2" />
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-base font-medium text-gray-900">
                Dr. {appointment.doctor.user.firstName} {appointment.doctor.user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.doctor.department?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.doctor.user.phone || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.doctor.user.email || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="text-base font-medium text-gray-900">
                {formatDate(appointment.appointmentDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="text-base font-medium text-gray-900">{appointment.appointmentTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  appointment.status
                )}`}
              >
                {appointment.status}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Reason for Visit</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.reason || 'Not specified'}
              </p>
            </div>
            {appointment.notes && (
              <div>
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-base font-medium text-gray-900 whitespace-pre-wrap">
                  {appointment.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600">
              <p>
                <span className="font-medium">Created:</span>{' '}
                {formatDateTime(appointment.createdAt)}
              </p>
              <p>
                <span className="font-medium">Last Updated:</span>{' '}
                {formatDateTime(appointment.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
