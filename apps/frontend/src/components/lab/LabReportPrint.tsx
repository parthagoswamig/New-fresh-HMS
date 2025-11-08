'use client';

import React from 'react';

interface LabReportPrintProps {
  entry: any;
  hospital?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
  };
}

export const LabReportPrint = React.forwardRef<HTMLDivElement, LabReportPrintProps>(
  ({ entry, hospital }, ref) => {
    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    const calculateAge = (dob: string) => {
      if (!dob) return 'N/A';
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    return (
      <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto print:p-0">
        {/* Hospital Header */}
        <div className="border-b-4 border-blue-600 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {hospital?.logo && (
                <img
                  src={hospital.logo}
                  alt="Hospital Logo"
                  className="h-16 mb-2"
                />
              )}
              <h1 className="text-3xl font-bold text-blue-900">
                {hospital?.name || 'Hospital Name'}
              </h1>
              {hospital?.address && (
                <p className="text-sm text-gray-600">{hospital.address}</p>
              )}
              <div className="flex gap-4 text-sm text-gray-600 mt-1">
                {hospital?.phone && <span>📞 {hospital.phone}</span>}
                {hospital?.email && <span>✉️ {hospital.email}</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">LAB REPORT</div>
              <div className="text-sm text-gray-600 mt-1">
                Report ID: {entry.entryNumber}
              </div>
              <div className="text-sm text-gray-600">
                Date: {formatDate(entry.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
            Patient Information
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div className="flex">
              <span className="font-medium text-gray-700 w-32">Patient Name:</span>
              <span className="text-gray-900">
                {entry.patient?.firstName} {entry.patient?.lastName}
              </span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-32">Patient ID:</span>
              <span className="text-gray-900">{entry.patient?.patientId}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-32">Age / Gender:</span>
              <span className="text-gray-900">
                {calculateAge(entry.patient?.dateOfBirth)} Years /{' '}
                {entry.patient?.gender || 'N/A'}
              </span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-32">Contact:</span>
              <span className="text-gray-900">{entry.patient?.phone || 'N/A'}</span>
            </div>
            {entry.patient?.bloodGroup && (
              <div className="flex">
                <span className="font-medium text-gray-700 w-32">Blood Group:</span>
                <span className="text-gray-900">{entry.patient.bloodGroup}</span>
              </div>
            )}
            {entry.sampleType && (
              <div className="flex">
                <span className="font-medium text-gray-700 w-32">Sample Type:</span>
                <span className="text-gray-900">{entry.sampleType}</span>
              </div>
            )}
          </div>
        </div>

        {/* Test Results Table */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
            Test Results
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="border border-gray-300 px-4 py-3 text-left">Test Name</th>
                <th className="border border-gray-300 px-4 py-3 text-left">Result</th>
                <th className="border border-gray-300 px-4 py-3 text-left">Unit</th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Reference Range
                </th>
              </tr>
            </thead>
            <tbody>
              {entry.items?.map((item: any, index: number) => (
                <tr
                  key={item.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="border border-gray-300 px-4 py-3 font-medium">
                    {item.testName}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 font-semibold text-blue-900">
                    {item.result || 'Pending'}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    {item.unit || '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    {item.referenceRange || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Clinical Findings & Interpretation */}
        {(entry.report?.findings ||
          entry.report?.interpretation ||
          entry.report?.comments) && (
          <div className="mb-6 space-y-4">
            {entry.report?.findings && (
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <h3 className="font-semibold text-gray-800 mb-2">Clinical Findings:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {entry.report.findings}
                </p>
              </div>
            )}

            {entry.report?.interpretation && (
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Medical Interpretation:
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {entry.report.interpretation}
                </p>
              </div>
            )}

            {entry.report?.comments && (
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Doctor's Comments / Recommendations:
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {entry.report.comments}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Signature Section */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300">
          <div className="flex justify-between items-end">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-8">
                Reported by: {entry.createdBy?.user?.name || 'Lab Technician'}
              </p>
              <p className="text-xs text-gray-500">
                Report generated on: {formatDate(new Date().toISOString())}
              </p>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-800 w-48 mb-2"></div>
              <p className="font-semibold text-gray-800">Authorized Signature</p>
              <p className="text-sm text-gray-600">
                {entry.report?.reportedBy?.user?.name || 'Doctor / Lab Head'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>
            This is a computer-generated report and does not require a physical
            signature.
          </p>
          <p className="mt-1">
            For any queries, please contact the laboratory department.
          </p>
        </div>

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .print\\:p-0 {
              padding: 0;
            }
          }
        `}</style>
      </div>
    );
  }
);

LabReportPrint.displayName = 'LabReportPrint';
