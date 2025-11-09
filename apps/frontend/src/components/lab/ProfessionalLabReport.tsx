'use client';

import React from 'react';
import { forwardRef } from 'react';

interface ProfessionalLabReportProps {
  entry: any;
  hospital: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
    registrationNo?: string;
    labLicense?: string;
  };
}

export const ProfessionalLabReport = forwardRef<HTMLDivElement, ProfessionalLabReportProps>(
  ({ entry, hospital }, ref) => {
    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    const formatDateTime = (date: string) => {
      return new Date(date).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
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

    const checkAbnormal = (result: string, referenceRange: string) => {
      if (!result || !referenceRange || result === 'Pending') return null;
      
      // Extract numeric value from result
      const numericResult = parseFloat(result);
      if (isNaN(numericResult)) return null;

      // Parse reference range (e.g., "10-20", "<10", ">20")
      const rangeMatch = referenceRange.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
      if (rangeMatch) {
        const min = parseFloat(rangeMatch[1]);
        const max = parseFloat(rangeMatch[2]);
        if (numericResult < min) return 'LOW';
        if (numericResult > max) return 'HIGH';
      }

      return null;
    };

    return (
      <div ref={ref} className="bg-white p-12 max-w-[210mm] mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Hospital Header */}
        <div className="border-b-4 border-blue-600 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-blue-900 mb-2">{hospital.name}</h1>
              <p className="text-sm text-gray-700">{hospital.address}</p>
              <p className="text-sm text-gray-700">
                Phone: {hospital.phone} | Email: {hospital.email}
              </p>
              {hospital.registrationNo && (
                <p className="text-xs text-gray-600 mt-1">Reg. No: {hospital.registrationNo}</p>
              )}
              {hospital.labLicense && (
                <p className="text-xs text-gray-600">Lab License: {hospital.labLicense}</p>
              )}
            </div>
            {hospital.logo && (
              <div className="w-24 h-24">
                <img src={hospital.logo} alt="Hospital Logo" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
            LABORATORY INVESTIGATION REPORT
          </h2>
          <div className="h-1 w-32 bg-blue-600 mx-auto mt-2"></div>
        </div>

        {/* Report Info & Patient Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Left: Report Details */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase border-b pb-2">Report Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Report No:</span>
                <span className="font-semibold text-gray-900">{entry.entryNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Collection Date:</span>
                <span className="font-semibold text-gray-900">{formatDateTime(entry.createdAt)}</span>
              </div>
              {entry.report?.reportedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Report Date:</span>
                  <span className="font-semibold text-gray-900">{formatDateTime(entry.report.reportedAt)}</span>
                </div>
              )}
              {entry.sampleType && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Sample Type:</span>
                  <span className="font-semibold text-gray-900">{entry.sampleType}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${
                  entry.status === 'COMPLETED' ? 'text-green-600' : 
                  entry.status === 'IN_PROGRESS' ? 'text-blue-600' : 
                  'text-yellow-600'
                }`}>
                  {entry.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Patient Details */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase border-b pb-2">Patient Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-bold text-gray-900 text-base">
                  {entry.patient?.firstName} {entry.patient?.lastName}
                </p>
                <p className="text-gray-600 text-xs">Patient ID: {entry.patient?.patientId}</p>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age / Gender:</span>
                <span className="text-gray-900">
                  {calculateAge(entry.patient?.dateOfBirth)} Years / {entry.patient?.gender || 'N/A'}
                </span>
              </div>
              {entry.patient?.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact:</span>
                  <span className="text-gray-900">{entry.patient.phone}</span>
                </div>
              )}
              {entry.patient?.bloodGroup && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Blood Group:</span>
                  <span className="text-gray-900 font-semibold">{entry.patient.bloodGroup}</span>
                </div>
              )}
              {entry.referredBy && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Referred By:</span>
                  <span className="text-gray-900">Dr. {entry.referredBy}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Results Table */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase bg-blue-50 px-4 py-2 border-l-4 border-blue-600">
            Investigation Results
          </h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold uppercase">
                  Test / Investigation
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-xs font-bold uppercase">
                  Result
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-xs font-bold uppercase">
                  Unit
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-xs font-bold uppercase">
                  Reference Range
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-xs font-bold uppercase">
                  Flag
                </th>
              </tr>
            </thead>
            <tbody>
              {entry.items?.map((item: any, index: number) => {
                const abnormalFlag = checkAbnormal(item.result, item.referenceRange);
                return (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                      {item.testName}
                    </td>
                    <td className={`border border-gray-300 px-4 py-3 text-center font-bold ${
                      abnormalFlag ? 'text-red-600' : 'text-blue-900'
                    }`}>
                      {item.result || 'Pending'}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                      {item.unit || '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                      {item.referenceRange || '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      {abnormalFlag && (
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          abnormalFlag === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {abnormalFlag}
                        </span>
                      )}
                      {!abnormalFlag && item.result && item.result !== 'Pending' && (
                        <span className="text-green-600 font-semibold">✓</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Clinical Interpretation */}
        {(entry.report?.findings || entry.report?.interpretation || entry.report?.comments) && (
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase bg-yellow-50 px-4 py-2 border-l-4 border-yellow-500">
              Clinical Interpretation
            </h3>
            
            {entry.report?.findings && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Findings:</h4>
                <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                  {entry.report.findings}
                </p>
              </div>
            )}

            {entry.report?.interpretation && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Medical Interpretation:</h4>
                <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                  {entry.report.interpretation}
                </p>
              </div>
            )}

            {entry.report?.comments && (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Comments / Recommendations:</h4>
                <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                  {entry.report.comments}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Important Notes */}
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500">
          <h4 className="font-semibold text-red-900 mb-2 text-sm">Important Notes:</h4>
          <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
            <li>This report is valid only with authorized signature and hospital stamp.</li>
            <li>Results should be correlated clinically.</li>
            <li>In case of any doubt, please contact the laboratory.</li>
            <li>This report is for the use of the referring physician only.</li>
          </ul>
        </div>

        {/* Signatures */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-gray-600 mb-8">Lab Technician</p>
              <div className="border-t border-gray-400 pt-2">
                <p className="font-semibold text-gray-900 text-sm">
                  {entry.createdBy?.user?.firstName} {entry.createdBy?.user?.lastName}
                </p>
                <p className="text-xs text-gray-600">Lab Technician</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 mb-8">Verified & Authorized By</p>
              <div className="border-t border-gray-400 pt-2 inline-block">
                <p className="font-semibold text-gray-900 text-sm">
                  {entry.report?.reportedBy?.user?.firstName || 'Dr.'} {entry.report?.reportedBy?.user?.lastName || 'Pathologist'}
                </p>
                <p className="text-xs text-gray-600">
                  {entry.report?.reportedBy?.specialization || 'Pathologist / Lab Director'}
                </p>
                {entry.report?.reportedBy?.registrationNo && (
                  <p className="text-xs text-gray-600">Reg. No: {entry.report.reportedBy.registrationNo}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <div>
              <p>Report generated on: {formatDateTime(new Date().toISOString())}</p>
              <p className="mt-1">Document ID: {entry.id}</p>
            </div>
            <div className="text-right">
              <p className="italic">This is a computer-generated report.</p>
              <p className="italic">No signature is required.</p>
            </div>
          </div>
        </div>

        {/* Contact Footer */}
        <div className="mt-6 pt-4 border-t border-gray-300 text-center">
          <p className="text-xs text-gray-600">
            For any queries regarding this report, please contact our laboratory department
          </p>
          <p className="text-xs text-gray-600">
            {hospital.phone} | {hospital.email}
          </p>
        </div>

        {/* End of Report Marker */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 font-semibold">*** END OF REPORT ***</p>
        </div>
      </div>
    );
  }
);

ProfessionalLabReport.displayName = 'ProfessionalLabReport';
