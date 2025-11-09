'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { surgeryService, Surgery } from '@/services/surgery.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, X, CheckCircle, Clock, Printer } from 'lucide-react';
import Link from 'next/link';

const STATUS_COLORS = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function SurgeryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [surgery, setSurgery] = useState<Surgery | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (tenant?.id && params.id) {
      fetchSurgery();
    }
  }, [tenant, params.id]);

  const fetchSurgery = async () => {
    try {
      setLoading(true);
      const data = await surgeryService.getById(tenant?.id || '', params.id as string);
      setSurgery(data);
    } catch (error) {
      console.error('Error fetching surgery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!surgery || !tenant?.id) return;
    
    try {
      await surgeryService.updateStatus(tenant.id, surgery.id, newStatus);
      await fetchSurgery();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCancel = async () => {
    if (!surgery || !tenant?.id || !cancelReason.trim()) return;
    
    try {
      await surgeryService.cancel(tenant.id, surgery.id, cancelReason);
      setShowCancelModal(false);
      await fetchSurgery();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel surgery');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!surgery) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Surgery not found</p>
        <Link href="/dashboard/surgery" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Surgery List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/surgery"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Surgery List
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {surgery.surgeryNumber}
              </h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${STATUS_COLORS[surgery.status]}`}>
                {surgery.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-600">{surgery.procedureName}</p>
          </div>
          <div className="flex gap-2">
            {surgery.status === 'SCHEDULED' && (
              <button
                onClick={() => handleStatusChange('IN_PROGRESS')}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Clock className="w-4 h-4" />
                Start Surgery
              </button>
            )}
            {surgery.status === 'IN_PROGRESS' && (
              <button
                onClick={() => handleStatusChange('COMPLETED')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Completed
              </button>
            )}
            {(surgery.status === 'SCHEDULED' || surgery.status === 'IN_PROGRESS') && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
            <Link
              href={`/dashboard/surgery/${surgery.id}/print`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Patient ID</p>
                  <p className="font-medium">{surgery.patient?.patientId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">
                    {surgery.patient?.firstName} {surgery.patient?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium">{surgery.patient?.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Blood Group</p>
                  <p className="font-medium">{surgery.patient?.bloodGroup || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Surgery Details */}
          <Card>
            <CardHeader>
              <CardTitle>Surgery Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Surgery Type</p>
                  <p className="font-medium">{surgery.surgeryType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Procedure</p>
                  <p className="font-medium">{surgery.procedureName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Scheduled Date</p>
                  <p className="font-medium">{formatDate(surgery.scheduledDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Operating Room</p>
                  <p className="font-medium">{surgery.operatingRoom?.name}</p>
                </div>
                {surgery.startTime && (
                  <div>
                    <p className="text-sm text-gray-600">Start Time</p>
                    <p className="font-medium">{formatDate(surgery.startTime)}</p>
                  </div>
                )}
                {surgery.endTime && (
                  <div>
                    <p className="text-sm text-gray-600">End Time</p>
                    <p className="font-medium">{formatDate(surgery.endTime)}</p>
                  </div>
                )}
                {surgery.duration && (
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{surgery.duration} minutes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Clinical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Clinical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {surgery.preOpDiagnosis && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pre-operative Diagnosis</p>
                  <p className="text-gray-900">{surgery.preOpDiagnosis}</p>
                </div>
              )}
              {surgery.postOpDiagnosis && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Post-operative Diagnosis</p>
                  <p className="text-gray-900">{surgery.postOpDiagnosis}</p>
                </div>
              )}
              {surgery.preOpNote && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pre-operative Notes</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{surgery.preOpNote}</p>
                </div>
              )}
              {surgery.postOpNote && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Post-operative Notes</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{surgery.postOpNote}</p>
                </div>
              )}
              {surgery.complications && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Complications</p>
                  <p className="text-red-600">{surgery.complications}</p>
                </div>
              )}
              {surgery.bloodLoss && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Blood Loss</p>
                  <p className="text-gray-900">{surgery.bloodLoss} ml</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Surgical Team */}
          <Card>
            <CardHeader>
              <CardTitle>Surgical Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Primary Surgeon</p>
                <p className="font-medium">
                  Dr. {surgery.surgeon?.user?.firstName} {surgery.surgeon?.user?.lastName}
                </p>
                {surgery.surgeon?.specialization && (
                  <p className="text-sm text-gray-500">{surgery.surgeon.specialization}</p>
                )}
              </div>
              {surgery.anesthesiologist && (
                <div>
                  <p className="text-sm text-gray-600">Anesthesiologist</p>
                  <p className="font-medium">
                    Dr. {surgery.anesthesiologist.user?.firstName}{' '}
                    {surgery.anesthesiologist.user?.lastName}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cost Information */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Estimated Cost</p>
                <p className="text-xl font-bold text-gray-900">
                  ₹{surgery.estimatedCost.toLocaleString()}
                </p>
              </div>
              {surgery.actualCost && (
                <div>
                  <p className="text-sm text-gray-600">Actual Cost</p>
                  <p className="text-xl font-bold text-green-600">
                    ₹{surgery.actualCost.toLocaleString()}
                  </p>
                </div>
              )}
              {surgery.bill && (
                <Link
                  href={`/dashboard/billing/${surgery.bill.id}`}
                  className="block text-blue-600 hover:underline text-sm"
                >
                  View Bill →
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Cancel Surgery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Please provide a reason for cancelling this surgery.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={!cancelReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Confirm Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
