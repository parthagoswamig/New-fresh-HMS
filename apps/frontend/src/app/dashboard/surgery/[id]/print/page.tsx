'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { surgeryService, Surgery } from '@/services/surgery.service';

export default function SurgeryPrintPage() {
  const params = useParams();
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [surgery, setSurgery] = useState<Surgery | null>(null);

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

  useEffect(() => {
    if (surgery && !loading) {
      // Auto-print when loaded
      setTimeout(() => window.print(), 500);
    }
  }, [surgery, loading]);

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
      <div className="p-8 text-center">
        <p className="text-gray-500">Surgery not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white print:p-0">
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>

      {/* Hospital Header */}
      <div className="text-center mb-8 pb-6 border-b-2 border-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {tenant?.name || 'Hospital Management System'}
        </h1>
        <p className="text-gray-600">Surgery Report</p>
      </div>

      {/* Surgery Information */}
      <div className="mb-6">
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Surgery Number</p>
              <p className="font-bold text-lg">{surgery.surgeryNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-bold text-lg">{surgery.status.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Surgery Type</p>
              <p className="font-medium">{surgery.surgeryType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-medium">{formatDate(surgery.scheduledDate)}</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-3">Procedure</h2>
        <p className="text-lg mb-6">{surgery.procedureName}</p>
      </div>

      {/* Patient Information */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 border-b pb-2">Patient Information</h2>
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
          <div>
            <p className="text-sm text-gray-600">Age</p>
            <p className="font-medium">
              {surgery.patient?.dateOfBirth
                ? new Date().getFullYear() -
                  new Date(surgery.patient.dateOfBirth).getFullYear()
                : 'N/A'}{' '}
              years
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Contact</p>
            <p className="font-medium">{surgery.patient?.phone || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Surgical Team */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 border-b pb-2">Surgical Team</h2>
        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <p className="text-sm text-gray-600">Operating Room</p>
            <p className="font-medium">
              {surgery.operatingRoom?.name} - {surgery.operatingRoom?.roomNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Details */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 border-b pb-2">Clinical Details</h2>
        
        {surgery.preOpDiagnosis && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 font-semibold mb-1">Pre-operative Diagnosis</p>
            <p className="text-gray-900">{surgery.preOpDiagnosis}</p>
          </div>
        )}

        {surgery.postOpDiagnosis && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 font-semibold mb-1">Post-operative Diagnosis</p>
            <p className="text-gray-900">{surgery.postOpDiagnosis}</p>
          </div>
        )}

        {surgery.preOpNote && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 font-semibold mb-1">Pre-operative Notes</p>
            <p className="text-gray-900 whitespace-pre-wrap">{surgery.preOpNote}</p>
          </div>
        )}

        {surgery.postOpNote && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 font-semibold mb-1">Post-operative Notes</p>
            <p className="text-gray-900 whitespace-pre-wrap">{surgery.postOpNote}</p>
          </div>
        )}

        {surgery.complications && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 font-semibold mb-1">Complications</p>
            <p className="text-red-600">{surgery.complications}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mt-4">
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
          {surgery.bloodLoss !== null && surgery.bloodLoss !== undefined && (
            <div>
              <p className="text-sm text-gray-600">Blood Loss</p>
              <p className="font-medium">{surgery.bloodLoss} ml</p>
            </div>
          )}
        </div>
      </div>

      {/* Cost Information */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 border-b pb-2">Cost Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Estimated Cost</p>
            <p className="text-lg font-bold">₹{surgery.estimatedCost.toLocaleString()}</p>
          </div>
          {surgery.actualCost && (
            <div>
              <p className="text-sm text-gray-600">Actual Cost</p>
              <p className="text-lg font-bold text-green-600">
                ₹{surgery.actualCost.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-12 pt-6 border-t">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="border-t border-gray-400 pt-2 mt-16">
              <p className="font-semibold">Surgeon's Signature</p>
              <p className="text-sm text-gray-600">
                Dr. {surgery.surgeon?.user?.firstName} {surgery.surgeon?.user?.lastName}
              </p>
            </div>
          </div>
          <div>
            <div className="border-t border-gray-400 pt-2 mt-16">
              <p className="font-semibold">Date & Time</p>
              <p className="text-sm text-gray-600">{formatDate(new Date().toISOString())}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500 print:fixed print:bottom-0 print:left-0 print:right-0">
        <p>This is a computer-generated document. No signature is required.</p>
        <p className="mt-1">Generated on {formatDate(new Date().toISOString())}</p>
      </div>
    </div>
  );
}
