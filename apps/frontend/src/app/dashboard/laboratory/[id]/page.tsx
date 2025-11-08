'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, User, Beaker, Calendar, FileText, Activity } from 'lucide-react';
import { laboratoryService } from '@/services/laboratory.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function LabTestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { tenant } = useAuthStore();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTest();
  }, []);

  const fetchTest = async () => {
    try {
      setLoading(true);
      const response = await laboratoryService.getById(params.id as string, tenant?.id || '');
      setTest(response.data);
    } catch (error) {
      console.error('Failed to fetch lab test:', error);
      alert('Failed to load lab test details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lab test?')) return;
    try {
      await laboratoryService.remove(params.id as string, tenant?.id || '');
      router.push('/dashboard/laboratory');
    } catch (error) {
      console.error('Failed to delete test:', error);
      alert('Failed to delete lab test');
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
      case 'ORDERED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isResultNormal = () => {
    if (!test?.result || !test?.referenceRange) return null;
    const result = parseFloat(test.result);
    const range = test.referenceRange.split('-');
    if (range.length === 2) {
      const min = parseFloat(range[0]);
      const max = parseFloat(range[1]);
      return result >= min && result <= max;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="text-gray-600 mt-4">Loading lab test details...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Beaker className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Lab test not found</h3>
          <Link href="/dashboard/laboratory">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Laboratory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6">
        <Link href="/dashboard/laboratory">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Laboratory
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{test.testName}</h1>
            <p className="text-gray-600 mt-1">
              Ordered on {formatDate(test.orderDate)}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(test.status)}`}>
              {test.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <Link href={`/dashboard/laboratory/${test.id}/edit`}>
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
                {test.patient.firstName} {test.patient.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patient ID</p>
              <p className="text-base font-medium text-gray-900">{test.patient.patientId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-base font-medium text-gray-900">{test.patient.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-base font-medium text-gray-900">{test.patient.email || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Beaker className="w-5 h-5 mr-2" />
              Test Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Test Name</p>
              <p className="text-base font-medium text-gray-900">{test.testName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Test Code</p>
              <p className="text-base font-medium text-gray-900">{test.testCode || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sample Type</p>
              <p className="text-base font-medium text-gray-900">{test.sampleType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="text-base font-medium text-gray-900">{test.labTest?.category || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(test.status)}`}>
                {test.status.replace('_', ' ')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {test.result ? (
              <>
                <div>
                  <p className="text-sm text-gray-600">Result</p>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-medium text-gray-900">
                      {test.result} {test.unit && test.unit}
                    </p>
                    {isResultNormal() !== null && (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        isResultNormal() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isResultNormal() ? 'Normal' : 'Abnormal'}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reference Range</p>
                  <p className="text-base font-medium text-gray-900">
                    {test.referenceRange || 'N/A'} {test.unit && test.unit}
                  </p>
                </div>
                {test.resultDate && (
                  <div>
                    <p className="text-sm text-gray-600">Result Date</p>
                    <p className="text-base font-medium text-gray-900">{formatDate(test.resultDate)}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">No results available yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Ordered By</p>
              <p className="text-base font-medium text-gray-900">
                Dr. {test.orderedBy.user.firstName} {test.orderedBy.user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="text-base font-medium text-gray-900">{formatDate(test.orderDate)}</p>
            </div>
            {test.opdVisit && (
              <div>
                <p className="text-sm text-gray-600">OPD Visit</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(test.opdVisit.visitDate)}
                </p>
              </div>
            )}
            {test.ipdAdmission && (
              <div>
                <p className="text-sm text-gray-600">IPD Admission</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(test.ipdAdmission.admissionDate)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {test.notes && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-gray-900 whitespace-pre-wrap">{test.notes}</p>
            </CardContent>
          </Card>
        )}

        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600">
              <p>
                <span className="font-medium">Created:</span> {formatDateTime(test.createdAt)}
              </p>
              <p>
                <span className="font-medium">Last Updated:</span> {formatDateTime(test.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
