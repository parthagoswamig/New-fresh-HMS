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
  Bed,
  FileText,
  Activity,
} from 'lucide-react';
import { ipdService } from '@/services/ipd.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function IPDDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { tenant } = useAuthStore();
  const [admission, setAdmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmission();
  }, []);

  const fetchAdmission = async () => {
    try {
      setLoading(true);
      const response = await ipdService.getById(params.id as string, tenant?.id || '');
      setAdmission(response.data);
    } catch (error) {
      console.error('Failed to fetch admission:', error);
      alert('Failed to load admission details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this admission?')) {
      return;
    }

    try {
      await ipdService.remove(params.id as string, tenant?.id || '');
      router.push('/dashboard/ipd');
    } catch (error) {
      console.error('Failed to delete admission:', error);
      alert('Failed to delete admission');
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
      case 'ADMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'UNDER_TREATMENT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DISCHARGED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading admission details...</p>
        </div>
      </div>
    );
  }

  if (!admission) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Bed className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Admission not found</h3>
          <Link href="/dashboard/ipd">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to IPD
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
        <Link href="/dashboard/ipd">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to IPD
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              IPD Admission Details
            </h1>
            <p className="text-gray-600 mt-1">
              Admitted on {formatDateTime(admission.admissionDate)}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                admission.status
              )}`}
            >
              {admission.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Link href={`/dashboard/ipd/${admission.id}/edit`}>
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
                {admission.patient.firstName} {admission.patient.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patient ID</p>
              <p className="text-base font-medium text-gray-900">{admission.patient.patientId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-base font-medium text-gray-900">
                {admission.patient.phone || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-base font-medium text-gray-900">
                {admission.patient.email || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="text-base font-medium text-gray-900">
                {admission.patient.gender || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Blood Group</p>
              <p className="text-base font-medium text-gray-900">
                {admission.patient.bloodGroup || 'N/A'}
              </p>
            </div>
            {admission.patient.allergies && (
              <div>
                <p className="text-sm text-gray-600">Allergies</p>
                <p className="text-base font-medium text-red-600">{admission.patient.allergies}</p>
              </div>
            )}
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
                Dr. {admission.doctor.user.firstName} {admission.doctor.user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="text-base font-medium text-gray-900">
                {admission.doctor.department?.name || admission.department?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-base font-medium text-gray-900">
                {admission.doctor.user.phone || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-base font-medium text-gray-900">
                {admission.doctor.user.email || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Admission Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Admission Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Admission Date</p>
              <p className="text-base font-medium text-gray-900">
                {formatDateTime(admission.admissionDate)}
              </p>
            </div>
            {admission.dischargeDate && (
              <div>
                <p className="text-sm text-gray-600">Discharge Date</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDateTime(admission.dischargeDate)}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  admission.status
                )}`}
              >
                {admission.status.replace('_', ' ')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Room & Bed Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bed className="w-5 h-5 mr-2" />
              Room & Bed Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Room Number</p>
              <p className="text-base font-medium text-gray-900">
                {admission.roomNumber || 'Not assigned'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bed Number</p>
              <p className="text-base font-medium text-gray-900">
                {admission.bedNumber || 'Not assigned'}
              </p>
            </div>
            {admission.bed && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Ward</p>
                  <p className="text-base font-medium text-gray-900">
                    {admission.bed.ward?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bed Type</p>
                  <p className="text-base font-medium text-gray-900">
                    {admission.bed.bedType || 'N/A'}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Clinical Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Clinical Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Reason for Admission</p>
              <p className="text-base text-gray-900 whitespace-pre-wrap">
                {admission.admissionReason}
              </p>
            </div>

            {admission.diagnosis && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Diagnosis</p>
                <p className="text-base text-gray-900 whitespace-pre-wrap">
                  {admission.diagnosis}
                </p>
              </div>
            )}

            {admission.treatmentPlan && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Treatment Plan</p>
                <p className="text-base text-gray-900 whitespace-pre-wrap">
                  {admission.treatmentPlan}
                </p>
              </div>
            )}

            {admission.dischargeSummary && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Discharge Summary</p>
                <p className="text-base text-gray-900 whitespace-pre-wrap">
                  {admission.dischargeSummary}
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
                {formatDateTime(admission.createdAt)}
              </p>
              <p>
                <span className="font-medium">Last Updated:</span>{' '}
                {formatDateTime(admission.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
