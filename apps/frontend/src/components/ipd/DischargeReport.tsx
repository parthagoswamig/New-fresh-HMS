'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DischargeReportProps {
  admission: any;
  onClose: () => void;
}

export default function DischargeReport({ admission, onClose }: DischargeReportProps) {
  useEffect(() => {
    // Auto-trigger print dialog after a short delay
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateDuration = (admissionDate: string, dischargeDate: string) => {
    const start = new Date(admissionDate);
    const end = new Date(dischargeDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button - Hidden on Print */}
        <div className="no-print flex justify-end p-4 border-b">
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Printable Content */}
        <div className="p-8 print:p-12">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">DISCHARGE SUMMARY</h1>
            <p className="text-lg text-gray-600">Hospital Management System</p>
            <p className="text-sm text-gray-500 mt-2">
              Generated on: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Patient Information */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
              Patient Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Patient Name</p>
                <p className="font-semibold text-gray-900">
                  {admission.patient.firstName} {admission.patient.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Patient ID</p>
                <p className="font-semibold text-gray-900">{admission.patient.patientId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age / Gender</p>
                <p className="font-semibold text-gray-900">
                  {admission.patient.dateOfBirth ? calculateAge(admission.patient.dateOfBirth) : 'N/A'} years / {admission.patient.gender}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Blood Group</p>
                <p className="font-semibold text-gray-900">{admission.patient.bloodGroup || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact</p>
                <p className="font-semibold text-gray-900">{admission.patient.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{admission.patient.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Admission Details */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
              Admission Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Admission Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(admission.admissionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Discharge Date</p>
                <p className="font-semibold text-gray-900">
                  {admission.dischargeDate ? new Date(admission.dischargeDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration of Stay</p>
                <p className="font-semibold text-gray-900">
                  {admission.dischargeDate 
                    ? `${calculateDuration(admission.admissionDate, admission.dischargeDate)} days`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Room / Bed</p>
                <p className="font-semibold text-gray-900">
                  {admission.roomNumber || 'N/A'} / {admission.bedNumber || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-semibold text-gray-900">{admission.department?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Attending Doctor</p>
                <p className="font-semibold text-gray-900">
                  Dr. {admission.doctor.user.firstName} {admission.doctor.user.lastName}
                </p>
              </div>
            </div>
          </div>

          {/* Admission Reason */}
          {admission.admissionReason && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                Reason for Admission
              </h2>
              <p className="text-gray-900 whitespace-pre-wrap">{admission.admissionReason}</p>
            </div>
          )}

          {/* Diagnosis */}
          {admission.diagnosis && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                Diagnosis
              </h2>
              <p className="text-gray-900 whitespace-pre-wrap">{admission.diagnosis}</p>
            </div>
          )}

          {/* Treatment Plan */}
          {admission.treatmentPlan && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                Treatment Provided
              </h2>
              <p className="text-gray-900 whitespace-pre-wrap">{admission.treatmentPlan}</p>
            </div>
          )}

          {/* Discharge Summary */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
              Discharge Summary
            </h2>
            <p className="text-gray-900 whitespace-pre-wrap">
              {admission.dischargeSummary || 'No discharge summary provided.'}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t-2 border-gray-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 mb-8">Authorized Signature</p>
                <div className="border-t border-gray-400 w-48 pt-2">
                  <p className="text-sm font-semibold text-gray-900">
                    Dr. {admission.doctor.user.firstName} {admission.doctor.user.lastName}
                  </p>
                  <p className="text-xs text-gray-600">Attending Physician</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 italic">
                  This is a system-generated document.
                </p>
                <p className="text-xs text-gray-500 italic">
                  Document ID: {admission.id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Print Button - Hidden on Print */}
        <div className="no-print flex justify-center gap-4 p-6 border-t">
          <Button onClick={() => window.print()} className="px-8">
            Print Report
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
