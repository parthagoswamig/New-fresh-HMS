'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { emergencyService, EmergencyCase } from '@/services/emergency.service';

export default function EmergencyPrintPage() {
  const params = useParams();
  const { tenant } = useAuthStore();
  const [emergencyCase, setEmergencyCase] = useState<EmergencyCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant?.id && params.id) {
      fetchEmergencyCase();
    }
  }, [tenant, params.id]);

  const fetchEmergencyCase = async () => {
    try {
      const response = await emergencyService.getById(params.id as string, tenant?.id || '');
      setEmergencyCase(response.data);
      setLoading(false);
      // Auto-print after data loads
      setTimeout(() => window.print(), 500);
    } catch (error) {
      console.error('Error fetching emergency case:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  if (!emergencyCase) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600">Emergency case not found</div>
        </div>
      </div>
    );
  }

  const patientName = emergencyCase.patient
    ? `${emergencyCase.patient.firstName} ${emergencyCase.patient.lastName}`
    : emergencyCase.quickName || 'Unknown';

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white print:p-0">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{tenant?.name || 'Hospital Name'}</h1>
        <p className="text-sm text-gray-600 mt-1">Emergency Department Report</p>
        <p className="text-xs text-gray-500 mt-1">
          Generated on: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Emergency Case Information */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Emergency Case Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-semibold">Emergency Number:</span>
            <p>{emergencyCase.emergencyNumber}</p>
          </div>
          <div>
            <span className="font-semibold">Status:</span>
            <p className="uppercase">{emergencyCase.status.replace('_', ' ')}</p>
          </div>
          <div>
            <span className="font-semibold">Severity:</span>
            <p className="text-red-600 font-bold">{emergencyCase.severity}</p>
          </div>
          <div>
            <span className="font-semibold">Arrival Mode:</span>
            <p>{emergencyCase.arrivalMode}</p>
          </div>
          <div>
            <span className="font-semibold">Arrival Time:</span>
            <p>{new Date(emergencyCase.arrivalTime).toLocaleString()}</p>
          </div>
          {emergencyCase.treatmentStartTime && (
            <div>
              <span className="font-semibold">Treatment Start:</span>
              <p>{new Date(emergencyCase.treatmentStartTime).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Patient Information */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Patient Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-semibold">Name:</span>
            <p>{patientName}</p>
          </div>
          {emergencyCase.quickAge && (
            <div>
              <span className="font-semibold">Age:</span>
              <p>{emergencyCase.quickAge} years</p>
            </div>
          )}
          {emergencyCase.quickGender && (
            <div>
              <span className="font-semibold">Gender:</span>
              <p>{emergencyCase.quickGender}</p>
            </div>
          )}
          {emergencyCase.quickContact && (
            <div>
              <span className="font-semibold">Contact:</span>
              <p>{emergencyCase.quickContact}</p>
            </div>
          )}
          {emergencyCase.quickAddress && (
            <div className="col-span-2">
              <span className="font-semibold">Address:</span>
              <p>{emergencyCase.quickAddress}</p>
            </div>
          )}
        </div>
      </div>

      {/* Chief Complaint */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Chief Complaint</h2>
        <p>{emergencyCase.chiefComplaint}</p>
      </div>

      {/* Vital Signs */}
      {(emergencyCase.bloodPressure ||
        emergencyCase.heartRate ||
        emergencyCase.temperature ||
        emergencyCase.respiratoryRate ||
        emergencyCase.oxygenSaturation) && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Vital Signs</h2>
          <div className="grid grid-cols-3 gap-4">
            {emergencyCase.bloodPressure && (
              <div>
                <span className="font-semibold">Blood Pressure:</span>
                <p>{emergencyCase.bloodPressure} mmHg</p>
              </div>
            )}
            {emergencyCase.heartRate && (
              <div>
                <span className="font-semibold">Heart Rate:</span>
                <p>{emergencyCase.heartRate} bpm</p>
              </div>
            )}
            {emergencyCase.temperature && (
              <div>
                <span className="font-semibold">Temperature:</span>
                <p>{emergencyCase.temperature} °C</p>
              </div>
            )}
            {emergencyCase.respiratoryRate && (
              <div>
                <span className="font-semibold">Respiratory Rate:</span>
                <p>{emergencyCase.respiratoryRate} /min</p>
              </div>
            )}
            {emergencyCase.oxygenSaturation && (
              <div>
                <span className="font-semibold">O2 Saturation:</span>
                <p>{emergencyCase.oxygenSaturation}%</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clinical Information */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Clinical Information</h2>
        {emergencyCase.primaryDiagnosis && (
          <div className="mb-3">
            <span className="font-semibold">Primary Diagnosis:</span>
            <p>{emergencyCase.primaryDiagnosis}</p>
          </div>
        )}
        {emergencyCase.secondaryDiagnosis && (
          <div className="mb-3">
            <span className="font-semibold">Secondary Diagnosis:</span>
            <p>{emergencyCase.secondaryDiagnosis}</p>
          </div>
        )}
        {emergencyCase.allergies && (
          <div className="mb-3">
            <span className="font-semibold">Known Allergies:</span>
            <p>{emergencyCase.allergies}</p>
          </div>
        )}
        {emergencyCase.currentMedications && (
          <div className="mb-3">
            <span className="font-semibold">Current Medications:</span>
            <p>{emergencyCase.currentMedications}</p>
          </div>
        )}
        {emergencyCase.medicalHistory && (
          <div className="mb-3">
            <span className="font-semibold">Medical History:</span>
            <p>{emergencyCase.medicalHistory}</p>
          </div>
        )}
      </div>

      {/* Medical Team */}
      {(emergencyCase.triageNurse || emergencyCase.attendingDoctor) && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Medical Team</h2>
          <div className="grid grid-cols-2 gap-4">
            {emergencyCase.triageNurse && (
              <div>
                <span className="font-semibold">Triage Nurse:</span>
                <p>{emergencyCase.triageNurse.user.name}</p>
              </div>
            )}
            {emergencyCase.attendingDoctor && (
              <div>
                <span className="font-semibold">Attending Doctor:</span>
                <p>{emergencyCase.attendingDoctor.user.name}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Discharge Information */}
      {emergencyCase.status === 'DISCHARGED' && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Discharge Information</h2>
          {emergencyCase.dischargeTime && (
            <div className="mb-3">
              <span className="font-semibold">Discharge Time:</span>
              <p>{new Date(emergencyCase.dischargeTime).toLocaleString()}</p>
            </div>
          )}
          {emergencyCase.dischargeSummary && (
            <div className="mb-3">
              <span className="font-semibold">Discharge Summary:</span>
              <p className="whitespace-pre-wrap">{emergencyCase.dischargeSummary}</p>
            </div>
          )}
          {emergencyCase.dischargeAdvice && (
            <div className="mb-3">
              <span className="font-semibold">Discharge Advice:</span>
              <p className="whitespace-pre-wrap">{emergencyCase.dischargeAdvice}</p>
            </div>
          )}
          {emergencyCase.followUpDate && (
            <div className="mb-3">
              <span className="font-semibold">Follow-up Date:</span>
              <p>{new Date(emergencyCase.followUpDate).toLocaleString()}</p>
            </div>
          )}
        </div>
      )}

      {/* Death Information */}
      {emergencyCase.status === 'DECEASED' && (
        <div className="mb-6 border-2 border-gray-400 p-4">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Death Certificate Information</h2>
          {emergencyCase.deathTime && (
            <div className="mb-3">
              <span className="font-semibold">Time of Death:</span>
              <p>{new Date(emergencyCase.deathTime).toLocaleString()}</p>
            </div>
          )}
          {emergencyCase.causeOfDeath && (
            <div className="mb-3">
              <span className="font-semibold">Cause of Death:</span>
              <p className="whitespace-pre-wrap">{emergencyCase.causeOfDeath}</p>
            </div>
          )}
        </div>
      )}

      {/* Signatures */}
      <div className="mt-12 pt-8 border-t-2 border-gray-300">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="border-t-2 border-gray-400 pt-2 mt-16">
              <p className="font-semibold">Doctor's Signature</p>
              {emergencyCase.attendingDoctor && (
                <p className="text-sm text-gray-600">{emergencyCase.attendingDoctor.user.name}</p>
              )}
            </div>
          </div>
          <div>
            <div className="border-t-2 border-gray-400 pt-2 mt-16">
              <p className="font-semibold">Authorized Signature</p>
              <p className="text-sm text-gray-600">Emergency Department</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500 border-t pt-4">
        <p>This is a computer-generated document and does not require a physical signature.</p>
        <p>For any queries, please contact the Emergency Department.</p>
      </div>

      {/* Print Button (hidden when printing) */}
      <div className="mt-6 text-center print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          Print Report
        </button>
      </div>
    </div>
  );
}
