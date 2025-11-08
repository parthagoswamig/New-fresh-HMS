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
  DollarSign,
  FileText,
  Building2,
} from 'lucide-react';
import { opdService } from '@/services/opd.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function OPDDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { tenant } = useAuthStore();
  const [visit, setVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisit();
  }, []);

  const fetchVisit = async () => {
    try {
      setLoading(true);
      const response = await opdService.getById(params.id as string, tenant?.id || '');
      setVisit(response.data);
    } catch (error) {
      console.error('Failed to fetch visit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this visit?')) {
      return;
    }

    try {
      await opdService.remove(params.id as string, tenant?.id || '');
      router.push('/dashboard/opd');
    } catch (error) {
      console.error('Failed to delete visit:', error);
      alert('Failed to delete visit');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading visit details...</p>
        </div>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Visit not found</p>
          <Link href="/dashboard/opd">
            <Button className="mt-4">Back to OPD</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6">
        <Link href="/dashboard/opd">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to OPD
          </Button>
        </Link>
      </div>

      {/* Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                OPD Visit Details
              </h1>
              <p className="text-gray-600 mt-1">
                Visit Date: {formatDate(visit.visitDate)}
              </p>
              <span
                className={`inline-block mt-2 px-3 py-1 text-sm font-semibold rounded-full ${
                  visit.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-800'
                    : visit.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {visit.status}
              </span>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Link href={`/dashboard/opd/${params.id}/edit`}>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <p className="font-medium">
                {visit.patient.firstName} {visit.patient.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patient ID</p>
              <p className="font-medium">{visit.patient.patientId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact</p>
              <p className="font-medium">{visit.patient.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{visit.patient.email || 'N/A'}</p>
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
              <p className="font-medium">
                Dr. {visit.doctor.user.firstName} {visit.doctor.user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-medium">{visit.department?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact</p>
              <p className="font-medium">{visit.doctor.user.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{visit.doctor.user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Visit Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Visit Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-1">Chief Complaint</p>
              <p className="text-gray-900">{visit.chiefComplaint}</p>
            </div>

            {visit.diagnosis && (
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Diagnosis</p>
                <p className="text-gray-900">{visit.diagnosis}</p>
              </div>
            )}

            {visit.prescription && (
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Prescription</p>
                <p className="text-gray-900 whitespace-pre-wrap">{visit.prescription}</p>
              </div>
            )}

            {visit.notes && (
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Additional Notes</p>
                <p className="text-gray-900">{visit.notes}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Consultation Fee</span>
                <span className="text-2xl font-bold text-gray-900">
                  ${visit.fee.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timestamps */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {formatDate(visit.createdAt)}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{' '}
              {formatDate(visit.updatedAt)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
