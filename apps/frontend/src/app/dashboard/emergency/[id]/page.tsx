'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { emergencyService, EmergencyCase, EmergencyStatus } from '@/services/emergency.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Activity, Heart, Thermometer, Wind, Droplets, FileText, Printer, UserCheck, X } from 'lucide-react';
import Link from 'next/link';

const STATUS_COLORS: Record<EmergencyStatus, string> = {
  WAITING: 'bg-yellow-100 text-yellow-800',
  UNDER_TREATMENT: 'bg-blue-100 text-blue-800',
  ADMITTED: 'bg-purple-100 text-purple-800',
  TRANSFERRED: 'bg-indigo-100 text-indigo-800',
  DISCHARGED: 'bg-green-100 text-green-800',
  DECEASED: 'bg-gray-100 text-gray-800',
};

export default function EmergencyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { tenant, user } = useAuthStore();
  const [emergencyCase, setEmergencyCase] = useState<EmergencyCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [showDeathModal, setShowDeathModal] = useState(false);
  const [dischargeData, setDischargeData] = useState({
    dischargeSummary: '',
    dischargeAdvice: '',
    followUpDate: '',
  });
  const [deathData, setDeathData] = useState({
    causeOfDeath: '',
    deathTime: '',
  });

  useEffect(() => {
    if (tenant?.id && params.id) {
      fetchEmergencyCase();
    }
  }, [tenant, params.id]);

  const fetchEmergencyCase = async () => {
    try {
      setLoading(true);
      const response = await emergencyService.getById(params.id as string, tenant?.id || '');
      setEmergencyCase(response.data);
    } catch (error) {
      console.error('Error fetching emergency case:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: EmergencyStatus) => {
    if (!emergencyCase) return;

    try {
      await emergencyService.update(
        emergencyCase.id,
        { status: newStatus, updatedById: user?.staff?.id || '' },
        tenant?.id || '',
      );
      fetchEmergencyCase();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDischarge = async () => {
    if (!emergencyCase) return;

    try {
      await emergencyService.discharge(
        emergencyCase.id,
        {
          ...dischargeData,
          updatedById: user?.staff?.id || '',
        },
        tenant?.id || '',
      );
      setShowDischargeModal(false);
      fetchEmergencyCase();
    } catch (error) {
      console.error('Error discharging:', error);
      alert('Failed to discharge patient');
    }
  };

  const handleDeclareDeath = async () => {
    if (!emergencyCase) return;

    try {
      await emergencyService.declareDeath(
        emergencyCase.id,
        {
          ...deathData,
          updatedById: user?.staff?.id || '',
        },
        tenant?.id || '',
      );
      setShowDeathModal(false);
      fetchEmergencyCase();
    } catch (error) {
      console.error('Error declaring death:', error);
      alert('Failed to declare death');
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!emergencyCase) {
    return <div className="p-6 text-center">Emergency case not found</div>;
  }

  const patientName = emergencyCase.patient
    ? `${emergencyCase.patient.firstName} ${emergencyCase.patient.lastName}`
    : emergencyCase.quickName || 'Unknown';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/emergency"
            className="text-red-600 hover:text-red-700 flex items-center gap-2 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Emergency
          </Link>
          <h1 className="text-3xl font-bold">{emergencyCase.emergencyNumber}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[emergencyCase.status]}`}>
              {emergencyCase.status.replace('_', ' ')}
            </span>
            <span className="text-gray-600">
              Arrived: {new Date(emergencyCase.arrivalTime).toLocaleString()}
            </span>
          </div>
        </div>
        <Link
          href={`/dashboard/emergency/${emergencyCase.id}/print`}
          target="_blank"
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
        >
          <Printer className="h-5 w-5" />
          Print Report
        </Link>
      </div>

      {/* Action Buttons */}
      {emergencyCase.status !== 'DISCHARGED' && emergencyCase.status !== 'DECEASED' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3 flex-wrap">
              {emergencyCase.status === 'WAITING' && (
                <button
                  onClick={() => handleStatusChange('UNDER_TREATMENT')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Start Treatment
                </button>
              )}
              {(emergencyCase.status === 'WAITING' || emergencyCase.status === 'UNDER_TREATMENT') && (
                <>
                  <button
                    onClick={() => setShowDischargeModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Discharge
                  </button>
                  <button
                    onClick={() => setShowDeathModal(true)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Declare Death
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-gray-600">Name:</span>{' '}
              <span className="font-medium">{patientName}</span>
            </div>
            {emergencyCase.quickAge && (
              <div>
                <span className="text-gray-600">Age:</span>{' '}
                <span className="font-medium">{emergencyCase.quickAge} years</span>
              </div>
            )}
            {emergencyCase.quickGender && (
              <div>
                <span className="text-gray-600">Gender:</span>{' '}
                <span className="font-medium">{emergencyCase.quickGender}</span>
              </div>
            )}
            {emergencyCase.quickContact && (
              <div>
                <span className="text-gray-600">Contact:</span>{' '}
                <span className="font-medium">{emergencyCase.quickContact}</span>
              </div>
            )}
            {emergencyCase.quickAddress && (
              <div>
                <span className="text-gray-600">Address:</span>{' '}
                <span className="font-medium">{emergencyCase.quickAddress}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Triage Information */}
        <Card>
          <CardHeader>
            <CardTitle>Triage Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-gray-600">Severity:</span>{' '}
              <span className="font-medium text-red-600">{emergencyCase.severity}</span>
            </div>
            <div>
              <span className="text-gray-600">Arrival Mode:</span>{' '}
              <span className="font-medium">{emergencyCase.arrivalMode}</span>
            </div>
            <div>
              <span className="text-gray-600">Chief Complaint:</span>{' '}
              <span className="font-medium">{emergencyCase.chiefComplaint}</span>
            </div>
            {emergencyCase.triageNurse && (
              <div>
                <span className="text-gray-600">Triage Nurse:</span>{' '}
                <span className="font-medium">{emergencyCase.triageNurse.user.name}</span>
              </div>
            )}
            {emergencyCase.attendingDoctor && (
              <div>
                <span className="text-gray-600">Attending Doctor:</span>{' '}
                <span className="font-medium">{emergencyCase.attendingDoctor.user.name}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyCase.bloodPressure && (
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-gray-600">BP:</span>
                <span className="font-medium">{emergencyCase.bloodPressure} mmHg</span>
              </div>
            )}
            {emergencyCase.heartRate && (
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600">Heart Rate:</span>
                <span className="font-medium">{emergencyCase.heartRate} bpm</span>
              </div>
            )}
            {emergencyCase.temperature && (
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <span className="text-gray-600">Temperature:</span>
                <span className="font-medium">{emergencyCase.temperature} °C</span>
              </div>
            )}
            {emergencyCase.respiratoryRate && (
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-cyan-500" />
                <span className="text-gray-600">Respiratory Rate:</span>
                <span className="font-medium">{emergencyCase.respiratoryRate} /min</span>
              </div>
            )}
            {emergencyCase.oxygenSaturation && (
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-green-500" />
                <span className="text-gray-600">O2 Saturation:</span>
                <span className="font-medium">{emergencyCase.oxygenSaturation}%</span>
              </div>
            )}
            {!emergencyCase.bloodPressure &&
              !emergencyCase.heartRate &&
              !emergencyCase.temperature &&
              !emergencyCase.respiratoryRate &&
              !emergencyCase.oxygenSaturation && (
                <p className="text-gray-500 text-sm">No vitals recorded</p>
              )}
          </CardContent>
        </Card>

        {/* Clinical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Clinical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyCase.primaryDiagnosis && (
              <div>
                <span className="text-gray-600">Primary Diagnosis:</span>{' '}
                <span className="font-medium">{emergencyCase.primaryDiagnosis}</span>
              </div>
            )}
            {emergencyCase.allergies && (
              <div>
                <span className="text-gray-600">Allergies:</span>{' '}
                <span className="font-medium">{emergencyCase.allergies}</span>
              </div>
            )}
            {emergencyCase.currentMedications && (
              <div>
                <span className="text-gray-600">Current Medications:</span>{' '}
                <span className="font-medium">{emergencyCase.currentMedications}</span>
              </div>
            )}
            {emergencyCase.medicalHistory && (
              <div>
                <span className="text-gray-600">Medical History:</span>{' '}
                <span className="font-medium">{emergencyCase.medicalHistory}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Discharge Summary */}
      {emergencyCase.status === 'DISCHARGED' && emergencyCase.dischargeSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Discharge Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-gray-600">Summary:</span>{' '}
              <p className="mt-1">{emergencyCase.dischargeSummary}</p>
            </div>
            {emergencyCase.dischargeAdvice && (
              <div>
                <span className="text-gray-600">Advice:</span>{' '}
                <p className="mt-1">{emergencyCase.dischargeAdvice}</p>
              </div>
            )}
            {emergencyCase.dischargeTime && (
              <div>
                <span className="text-gray-600">Discharge Time:</span>{' '}
                <span className="font-medium">{new Date(emergencyCase.dischargeTime).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Death Information */}
      {emergencyCase.status === 'DECEASED' && (
        <Card className="border-gray-300">
          <CardHeader>
            <CardTitle>Death Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyCase.deathTime && (
              <div>
                <span className="text-gray-600">Time of Death:</span>{' '}
                <span className="font-medium">{new Date(emergencyCase.deathTime).toLocaleString()}</span>
              </div>
            )}
            {emergencyCase.causeOfDeath && (
              <div>
                <span className="text-gray-600">Cause of Death:</span>{' '}
                <span className="font-medium">{emergencyCase.causeOfDeath}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Discharge Modal */}
      {showDischargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Discharge Patient
                <button onClick={() => setShowDischargeModal(false)}>
                  <X className="h-5 w-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Discharge Summary *</label>
                <textarea
                  value={dischargeData.dischargeSummary}
                  onChange={(e) => setDischargeData({ ...dischargeData, dischargeSummary: e.target.value })}
                  rows={4}
                  required
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Discharge Advice</label>
                <textarea
                  value={dischargeData.dischargeAdvice}
                  onChange={(e) => setDischargeData({ ...dischargeData, dischargeAdvice: e.target.value })}
                  rows={3}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Follow-up Date</label>
                <input
                  type="datetime-local"
                  value={dischargeData.followUpDate}
                  onChange={(e) => setDischargeData({ ...dischargeData, followUpDate: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDischarge}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Discharge
                </button>
                <button
                  onClick={() => setShowDischargeModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Death Modal */}
      {showDeathModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Declare Death
                <button onClick={() => setShowDeathModal(false)}>
                  <X className="h-5 w-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cause of Death *</label>
                <textarea
                  value={deathData.causeOfDeath}
                  onChange={(e) => setDeathData({ ...deathData, causeOfDeath: e.target.value })}
                  rows={4}
                  required
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time of Death</label>
                <input
                  type="datetime-local"
                  value={deathData.deathTime}
                  onChange={(e) => setDeathData({ ...deathData, deathTime: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeclareDeath}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Declare Death
                </button>
                <button
                  onClick={() => setShowDeathModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
