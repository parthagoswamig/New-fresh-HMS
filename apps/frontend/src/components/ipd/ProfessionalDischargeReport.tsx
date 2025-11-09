'use client';

import React from 'react';
import { forwardRef } from 'react';

interface ProfessionalDischargeReportProps {
  admission: any;
  hospital: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
    registrationNo?: string;
  };
}

export const ProfessionalDischargeReport = forwardRef<HTMLDivElement, ProfessionalDischargeReportProps>(
  ({ admission, hospital }, ref) => {
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
            </div>
            {hospital.logo && (
              <div className="w-24 h-24">
                <img src={hospital.logo} alt="Hospital Logo" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
            DISCHARGE SUMMARY
          </h2>
          <div className="h-1 w-32 bg-blue-600 mx-auto mt-2"></div>
        </div>

        {/* Patient Demographics */}
        <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-blue-50 px-4 py-2 border-b border-gray-300">
            <h3 className="font-bold text-gray-900 uppercase text-sm">Patient Demographics</h3>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-semibold text-gray-700 w-1/4">Patient Name:</td>
                  <td className="py-2 text-gray-900">
                    {admission.patient.firstName} {admission.patient.lastName}
                  </td>
                  <td className="py-2 font-semibold text-gray-700 w-1/4">Patient ID:</td>
                  <td className="py-2 text-gray-900">{admission.patient.patientId}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-semibold text-gray-700">Age / Gender:</td>
                  <td className="py-2 text-gray-900">
                    {admission.patient.dateOfBirth ? calculateAge(admission.patient.dateOfBirth) : 'N/A'} Years / {admission.patient.gender}
                  </td>
                  <td className="py-2 font-semibold text-gray-700">Blood Group:</td>
                  <td className="py-2 text-gray-900">{admission.patient.bloodGroup || 'N/A'}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-semibold text-gray-700">Contact:</td>
                  <td className="py-2 text-gray-900">{admission.patient.phone}</td>
                  <td className="py-2 font-semibold text-gray-700">Email:</td>
                  <td className="py-2 text-gray-900">{admission.patient.email || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold text-gray-700">Address:</td>
                  <td className="py-2 text-gray-900" colSpan={3}>
                    {admission.patient.address || 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Admission & Discharge Details */}
        <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-blue-50 px-4 py-2 border-b border-gray-300">
            <h3 className="font-bold text-gray-900 uppercase text-sm">Admission & Discharge Details</h3>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-semibold text-gray-700 w-1/4">Admission Date & Time:</td>
                  <td className="py-2 text-gray-900">{formatDateTime(admission.admissionDate)}</td>
                  <td className="py-2 font-semibold text-gray-700 w-1/4">Discharge Date & Time:</td>
                  <td className="py-2 text-gray-900">
                    {admission.dischargeDate ? formatDateTime(admission.dischargeDate) : 'N/A'}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-semibold text-gray-700">Duration of Stay:</td>
                  <td className="py-2 text-gray-900">
                    {admission.dischargeDate
                      ? `${calculateDuration(admission.admissionDate, admission.dischargeDate)} Days`
                      : 'N/A'}
                  </td>
                  <td className="py-2 font-semibold text-gray-700">Room / Bed No:</td>
                  <td className="py-2 text-gray-900">
                    {admission.roomNumber || 'N/A'} / {admission.bedNumber || 'N/A'}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-semibold text-gray-700">Department:</td>
                  <td className="py-2 text-gray-900">{admission.department?.name || 'N/A'}</td>
                  <td className="py-2 font-semibold text-gray-700">Admission Type:</td>
                  <td className="py-2 text-gray-900">{admission.admissionType || 'Regular'}</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold text-gray-700">Consultant:</td>
                  <td className="py-2 text-gray-900" colSpan={3}>
                    Dr. {admission.doctor.user.firstName} {admission.doctor.user.lastName}
                    {admission.doctor.specialization && ` (${admission.doctor.specialization})`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Clinical Summary */}
        <div className="mb-6">
          <div className="bg-gray-100 px-4 py-2 border-l-4 border-blue-600 mb-3">
            <h3 className="font-bold text-gray-900 uppercase text-sm">Clinical Summary</h3>
          </div>

          {/* Chief Complaints / Reason for Admission */}
          {admission.admissionReason && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 text-sm mb-2">Chief Complaints / Reason for Admission:</h4>
              <p className="text-gray-900 text-sm leading-relaxed pl-4 whitespace-pre-wrap">
                {admission.admissionReason}
              </p>
            </div>
          )}

          {/* Diagnosis */}
          {admission.diagnosis && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 text-sm mb-2">Provisional / Final Diagnosis:</h4>
              <p className="text-gray-900 text-sm leading-relaxed pl-4 whitespace-pre-wrap">
                {admission.diagnosis}
              </p>
            </div>
          )}

          {/* Treatment Given */}
          {admission.treatmentPlan && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 text-sm mb-2">Treatment Given:</h4>
              <p className="text-gray-900 text-sm leading-relaxed pl-4 whitespace-pre-wrap">
                {admission.treatmentPlan}
              </p>
            </div>
          )}

          {/* Condition at Discharge */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 text-sm mb-2">Condition at Discharge:</h4>
            <p className="text-gray-900 text-sm leading-relaxed pl-4">
              {admission.dischargeCondition || 'Stable and improved'}
            </p>
          </div>

          {/* Discharge Summary / Instructions */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 text-sm mb-2">Discharge Summary & Instructions:</h4>
            <p className="text-gray-900 text-sm leading-relaxed pl-4 whitespace-pre-wrap">
              {admission.dischargeSummary || 'Patient discharged in stable condition. Follow-up as advised.'}
            </p>
          </div>
        </div>

        {/* Medications on Discharge */}
        {admission.dischargeMedications && (
          <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-blue-50 px-4 py-2 border-b border-gray-300">
              <h3 className="font-bold text-gray-900 uppercase text-sm">Medications on Discharge</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                {admission.dischargeMedications}
              </p>
            </div>
          </div>
        )}

        {/* Follow-up Instructions */}
        <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-yellow-50 px-4 py-2 border-b border-yellow-300">
            <h3 className="font-bold text-gray-900 uppercase text-sm">Follow-up Instructions</h3>
          </div>
          <div className="p-4">
            <p className="text-gray-900 text-sm leading-relaxed">
              {admission.followUpInstructions || 'Follow-up with consultant as advised. Report immediately if any complications arise.'}
            </p>
            {admission.followUpDate && (
              <p className="text-gray-900 text-sm mt-2">
                <span className="font-semibold">Next Follow-up Date:</span> {formatDate(admission.followUpDate)}
              </p>
            )}
          </div>
        </div>

        {/* Investigations / Lab Reports */}
        {admission.investigations && (
          <div className="mb-6">
            <div className="bg-gray-100 px-4 py-2 border-l-4 border-blue-600 mb-2">
              <h3 className="font-bold text-gray-900 uppercase text-sm">Investigations Performed</h3>
            </div>
            <p className="text-gray-900 text-sm leading-relaxed pl-4 whitespace-pre-wrap">
              {admission.investigations}
            </p>
          </div>
        )}

        {/* Signatures */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-gray-600 mb-8">Authorized Signature</p>
              <div className="border-t border-gray-400 pt-2">
                <p className="font-semibold text-gray-900 text-sm">
                  Dr. {admission.doctor.user.firstName} {admission.doctor.user.lastName}
                </p>
                <p className="text-xs text-gray-600">
                  {admission.doctor.specialization || 'Consultant Physician'}
                </p>
                <p className="text-xs text-gray-600">
                  Reg. No: {admission.doctor.registrationNo || 'N/A'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 mb-2">Date of Issue</p>
              <p className="font-semibold text-gray-900 text-sm">
                {formatDate(admission.dischargeDate || new Date().toISOString())}
              </p>
              <div className="mt-8">
                <p className="text-xs text-gray-500 italic">This is a computer-generated document.</p>
                <p className="text-xs text-gray-500 italic">No signature is required.</p>
                <p className="text-xs text-gray-500 mt-2">Document ID: {admission.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center">
          <p className="text-xs text-gray-600">
            This discharge summary is issued for medical purposes only.
          </p>
          <p className="text-xs text-gray-600">
            For any queries, please contact: {hospital.phone} | {hospital.email}
          </p>
        </div>
      </div>
    );
  }
);

ProfessionalDischargeReport.displayName = 'ProfessionalDischargeReport';
