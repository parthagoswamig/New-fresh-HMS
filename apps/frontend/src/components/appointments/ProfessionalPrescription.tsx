import React, { forwardRef } from 'react';

interface ProfessionalPrescriptionProps {
  appointment?: any;
  prescription?: any;
  hospital: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

const formatDate = (date: string | Date | undefined) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const calculateAge = (dob?: string | Date | null) => {
  if (!dob) return '';
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return `${age} yrs`;
};

export const ProfessionalPrescription = forwardRef<HTMLDivElement, ProfessionalPrescriptionProps>(
  ({ appointment, prescription, hospital }, ref) => {
    const sourceAppointment = prescription?.appointment || appointment || {};
    const patient = sourceAppointment?.patient || {};
    const doctor = sourceAppointment?.doctor || {};
    const doctorUser = doctor.user || {};
    const items = prescription?.items || [];
    const headerDate = sourceAppointment?.appointmentDate || prescription?.prescriptionDate;
    const headerTime = sourceAppointment?.appointmentTime;

    return (
      <div ref={ref as any} className="max-w-3xl mx-auto bg-white text-gray-900 p-6 shadow print:shadow-none">
        {/* Header */}
        <div className="border-b border-gray-300 pb-3 mb-3 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{hospital.name}</h1>
            <p className="text-xs text-gray-600">{hospital.address}</p>
            <p className="text-xs text-gray-600">
              Ph: {hospital.phone} | Email: {hospital.email}
            </p>
          </div>
          <div className="text-right text-xs">
            <p className="font-semibold text-sm">Outpatient Prescription</p>
            <p>Date: {formatDate(headerDate)}</p>
            <p>Appt Time: {headerTime || ''}</p>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="flex justify-between text-xs mb-2">
          <div>
            <p className="font-semibold text-sm">
              Dr. {doctorUser.firstName} {doctorUser.lastName}
            </p>
            <p className="text-gray-600">{doctor?.department?.name}</p>
          </div>
          <div className="text-right text-gray-600">
            <p>M.B.B.S.</p>
            <p>Reg. No: ____________</p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="border-y border-gray-300 py-2 mb-3 text-xs">
          <div className="flex justify-between mb-1">
            <div>
              <span className="font-semibold">Patient: </span>
              <span>
                {patient.firstName} {patient.lastName}
              </span>
            </div>
            <div>
              <span className="font-semibold">Patient ID: </span>
              <span>{patient.patientId}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <div>
              <span className="font-semibold">Age / Sex: </span>
              <span>
                {calculateAge(patient.dateOfBirth)}
                {patient.gender ? ` / ${patient.gender}` : ''}
              </span>
            </div>
            <div>
              <span className="font-semibold">Phone: </span>
              <span>{patient.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Reason & Notes */}
        <div className="mb-3 text-xs">
          {sourceAppointment?.reason && (
            <div className="mb-1">
              <p className="font-semibold">Chief Complaint / Reason:</p>
              <p className="whitespace-pre-wrap border border-gray-200 rounded px-2 py-1 mt-1 min-h-[40px]">
                {sourceAppointment.reason}
              </p>
            </div>
          )}
          {sourceAppointment?.notes && (
            <div>
              <p className="font-semibold">Clinical Notes:</p>
              <p className="whitespace-pre-wrap border border-gray-200 rounded px-2 py-1 mt-1 min-h-[40px]">
                {sourceAppointment.notes}
              </p>
            </div>
          )}
          {prescription?.notes && (
            <div className="mt-1">
              <p className="font-semibold">Prescription Notes:</p>
              <p className="whitespace-pre-wrap border border-gray-200 rounded px-2 py-1 mt-1 min-h-[40px]">
                {prescription.notes}
              </p>
            </div>
          )}
        </div>

        {/* Prescription Body */}
        <div className="flex gap-3">
          <div className="pt-2">
            <span className="text-3xl font-bold text-green-600">℞</span>
          </div>
          <div className="flex-1 text-xs">
            {/* Medicine lines for handwritten or typed prescription */}
            <div className="space-y-2 mb-3">
              {items.length > 0 ? (
                <table className="w-full border border-gray-200 text-[11px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border-b border-gray-200 px-2 py-1 text-left w-8">#</th>
                      <th className="border-b border-gray-200 px-2 py-1 text-left">Medicine</th>
                      <th className="border-b border-gray-200 px-2 py-1 text-left">Dose</th>
                      <th className="border-b border-gray-200 px-2 py-1 text-left">Freq</th>
                      <th className="border-b border-gray-200 px-2 py-1 text-left">Duration</th>
                      <th className="border-b border-gray-200 px-2 py-1 text-left">Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any, index: number) => (
                      <tr key={item.id || index} className="align-top">
                        <td className="border-b border-gray-200 px-2 py-1 text-xs">
                          {index + 1}
                        </td>
                        <td className="border-b border-gray-200 px-2 py-1 text-xs">
                          <div className="font-medium">
                            {item.medicine?.name || 'Medicine'}
                          </div>
                          {(item.medicine?.brand || item.medicine?.genericName) && (
                            <div className="text-[10px] text-gray-500">
                              {item.medicine?.brand}
                              {item.medicine?.genericName && (
                                <span>
                                  {item.medicine?.brand ? ' · ' : ''}
                                  {item.medicine.genericName}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="border-b border-gray-200 px-2 py-1 text-xs">
                          {item.dosage}
                        </td>
                        <td className="border-b border-gray-200 px-2 py-1 text-xs">
                          {item.frequency}
                        </td>
                        <td className="border-b border-gray-200 px-2 py-1 text-xs">
                          {item.duration}
                        </td>
                        <td className="border-b border-gray-200 px-2 py-1 text-xs">
                          {item.instructions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="space-y-2 mb-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="border-b border-dotted border-gray-400 h-6" />
                  ))}
                </div>
              )}
            </div>

            {/* Advice / Investigations / Follow-up */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
              <div>
                <p className="font-semibold mb-1">Investigations</p>
                <div className="border border-gray-200 rounded h-20" />
              </div>
              <div>
                <p className="font-semibold mb-1">Advice</p>
                <div className="border border-gray-200 rounded h-20" />
              </div>
              <div>
                <p className="font-semibold mb-1">Next Visit / Follow-up</p>
                <div className="border border-gray-200 rounded h-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-between items-end text-[10px] text-gray-600">
          <div>
            <p>Hospital Stamp</p>
            <div className="mt-4 w-32 h-12 border border-gray-300 rounded" />
          </div>
          <div className="text-right">
            <div className="border-b border-gray-400 w-40 mb-1 ml-auto" />
            <p>Doctor's Signature</p>
          </div>
        </div>

        <div className="mt-4 text-[9px] text-gray-500 text-center border-t border-gray-200 pt-1">
          This prescription is valid only for the patient named above. Please follow the
          doctor&apos;s instructions carefully.
        </div>
      </div>
    );
  },
);

ProfessionalPrescription.displayName = 'ProfessionalPrescription';
