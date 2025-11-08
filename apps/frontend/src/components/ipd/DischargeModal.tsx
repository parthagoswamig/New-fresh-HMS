'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, AlertCircle } from 'lucide-react';

interface DischargeModalProps {
  admission: any;
  onClose: () => void;
  onConfirm: (dischargeSummary: string) => Promise<void>;
}

export default function DischargeModal({ admission, onClose, onConfirm }: DischargeModalProps) {
  const [dischargeSummary, setDischargeSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dischargeSummary.trim()) {
      setError('Discharge summary is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onConfirm(dischargeSummary);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to discharge patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Discharge Patient</h2>
            <p className="text-sm text-gray-600 mt-1">
              {admission.patient.firstName} {admission.patient.lastName} - {admission.patient.patientId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Patient Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Admission Date:</span>
                <span className="ml-2 font-medium">
                  {new Date(admission.admissionDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Room/Bed:</span>
                <span className="ml-2 font-medium">
                  {admission.roomNumber || 'N/A'} / {admission.bedNumber || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Doctor:</span>
                <span className="ml-2 font-medium">
                  Dr. {admission.doctor.user.firstName} {admission.doctor.user.lastName}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Department:</span>
                <span className="ml-2 font-medium">
                  {admission.department?.name || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Discharge Summary */}
          <div>
            <Label htmlFor="dischargeSummary" className="text-base font-semibold">
              Discharge Summary <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-600 mb-2">
              Provide a comprehensive summary of the patient's treatment, recovery status, and post-discharge instructions.
            </p>
            <Textarea
              id="dischargeSummary"
              value={dischargeSummary}
              onChange={(e) => setDischargeSummary(e.target.value)}
              placeholder="Enter detailed discharge summary including:&#10;- Treatment provided&#10;- Current condition&#10;- Medications prescribed&#10;- Follow-up instructions&#10;- Dietary/activity restrictions"
              rows={10}
              className="w-full"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold">Important:</p>
              <p>This action will mark the patient as discharged and generate a discharge report. This action cannot be undone.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Processing...' : 'Confirm Discharge'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
