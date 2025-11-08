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
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { patientService } from '@/services/patients.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { tenant } = useAuthStore();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatient();
  }, []);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const response = await patientService.getById(params.id as string, tenant?.id || '');
      setPatient(response.data);
    } catch (error) {
      console.error('Failed to fetch patient:', error);
      alert('Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this patient?')) {
      return;
    }

    try {
      await patientService.remove(params.id as string, tenant?.id || '');
      router.push('/dashboard/patients');
    } catch (error) {
      console.error('Failed to delete patient:', error);
      alert('Failed to delete patient');
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

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient not found</h3>
          <Link href="/dashboard/patients">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Patients
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
        <Link href="/dashboard/patients">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-gray-600 mt-1">
              {patient.patientId} • {calculateAge(patient.dateOfBirth)} years old
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                patient.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {patient.status}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Link href={`/dashboard/patients/${patient.id}/edit`}>
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
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="text-base font-medium text-gray-900">
                {patient.firstName} {patient.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patient ID</p>
              <p className="text-base font-medium text-gray-900">{patient.patientId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="text-base font-medium text-gray-900">
                {formatDate(patient.dateOfBirth)} ({calculateAge(patient.dateOfBirth)} years)
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="text-base font-medium text-gray-900">{patient.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Blood Group</p>
              <p className="text-base font-medium text-gray-900">{patient.bloodGroup || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Marital Status</p>
              <p className="text-base font-medium text-gray-900">{patient.maritalStatus || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-base font-medium text-gray-900">{patient.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-base font-medium text-gray-900">{patient.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="text-base font-medium text-gray-900">
                {patient.address || 'N/A'}
                {patient.city && `, ${patient.city}`}
                {patient.state && `, ${patient.state}`}
                {patient.zipCode && ` - ${patient.zipCode}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Emergency Contact</p>
              <p className="text-base font-medium text-gray-900">
                {patient.emergencyContact || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {patient.allergies && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Allergies</p>
                  <p className="text-sm text-red-600 mt-1 whitespace-pre-wrap">{patient.allergies}</p>
                </div>
              </div>
            )}
            {!patient.allergies && (
              <p className="text-sm text-gray-500">No known allergies</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        {patient.appointments && patient.appointments.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Recent Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patient.appointments.slice(0, 5).map((apt: any) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Dr. {apt.doctor.user.firstName} {apt.doctor.user.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(apt.appointmentDate)} at {apt.appointmentTime}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        apt.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : apt.status === 'CONFIRMED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600">
              <p>
                <span className="font-medium">Registered:</span> {formatDateTime(patient.createdAt)}
              </p>
              <p>
                <span className="font-medium">Last Updated:</span> {formatDateTime(patient.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
