'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { X, AlertCircle } from 'lucide-react';

interface EnhancedDischargeModalProps {
  admission: any;
  onClose: () => void;
  onConfirm: (data: any) => Promise<void>;
}

export default function EnhancedDischargeModal({
  admission,
  onClose,
  onConfirm,
}: EnhancedDischargeModalProps) {
  const [formData, setFormData] = useState({
    dischargeSummary: '',
    dischargeCondition: 'Stable and improved',
    dischargeMedications: '',
    followUpInstructions: '',
    followUpDate: '',
    investigations: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.dischargeSummary.trim()) {
      setError('Discharge summary is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onConfirm(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to discharge patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Discharge Patient</h2>
            <p className="text-sm text-gray-600 mt-1">
              {admission.patient.firstName} {admission.patient.lastName} -{' '}
              {admission.patient.patientId}
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
                <span className="ml-2 font-medium">{admission.department?.name || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Discharge Summary */}
          <div>
            <Label htmlFor="dischargeSummary" className="text-base font-semibold">
              Discharge Summary <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-600 mb-2">
              Comprehensive summary of treatment, recovery, and post-discharge instructions
            </p>
            <Textarea
              id="dischargeSummary"
              value={formData.dischargeSummary}
              onChange={(e) => setFormData({ ...formData, dischargeSummary: e.target.value })}
              placeholder="Enter detailed discharge summary including:&#10;- Treatment provided during hospitalization&#10;- Current condition and progress&#10;- Medications prescribed&#10;- Follow-up instructions&#10;- Dietary/activity restrictions&#10;- Warning signs to watch for"
              rows={8}
              className="w-full"
              required
            />
          </div>

          {/* Condition at Discharge */}
          <div>
            <Label htmlFor="dischargeCondition" className="text-base font-semibold">
              Condition at Discharge
            </Label>
            <Input
              id="dischargeCondition"
              value={formData.dischargeCondition}
              onChange={(e) => setFormData({ ...formData, dischargeCondition: e.target.value })}
              placeholder="e.g., Stable and improved, Recovering well"
              className="w-full"
            />
          </div>

          {/* Medications on Discharge */}
          <div>
            <Label htmlFor="dischargeMedications" className="text-base font-semibold">
              Medications on Discharge
            </Label>
            <p className="text-sm text-gray-600 mb-2">
              List all medications with dosage and duration
            </p>
            <Textarea
              id="dischargeMedications"
              value={formData.dischargeMedications}
              onChange={(e) => setFormData({ ...formData, dischargeMedications: e.target.value })}
              placeholder="Example:&#10;1. Tablet Paracetamol 500mg - 1 tablet twice daily for 5 days&#10;2. Syrup Amoxicillin 250mg - 5ml three times daily for 7 days&#10;3. Tablet Omeprazole 20mg - 1 tablet once daily before breakfast"
              rows={6}
              className="w-full"
            />
          </div>

          {/* Follow-up Instructions */}
          <div>
            <Label htmlFor="followUpInstructions" className="text-base font-semibold">
              Follow-up Instructions
            </Label>
            <Textarea
              id="followUpInstructions"
              value={formData.followUpInstructions}
              onChange={(e) =>
                setFormData({ ...formData, followUpInstructions: e.target.value })
              }
              placeholder="Enter follow-up instructions:&#10;- When to return for check-up&#10;- What symptoms to watch for&#10;- Activity restrictions&#10;- Dietary advice"
              rows={5}
              className="w-full"
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <Label htmlFor="followUpDate" className="text-base font-semibold">
              Next Follow-up Date
            </Label>
            <Input
              id="followUpDate"
              type="date"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              className="w-full"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Investigations Performed */}
          <div>
            <Label htmlFor="investigations" className="text-base font-semibold">
              Investigations Performed
            </Label>
            <p className="text-sm text-gray-600 mb-2">
              List all lab tests, imaging, and procedures done
            </p>
            <Textarea
              id="investigations"
              value={formData.investigations}
              onChange={(e) => setFormData({ ...formData, investigations: e.target.value })}
              placeholder="Example:&#10;- Complete Blood Count (CBC)&#10;- Chest X-Ray&#10;- ECG&#10;- Blood Sugar Levels"
              rows={5}
              className="w-full"
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
              <p>
                This action will mark the patient as discharged and generate a professional discharge
                summary. This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t -mx-6 px-6 py-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Processing...' : 'Confirm Discharge & Generate Summary'}
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
