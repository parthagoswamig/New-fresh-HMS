'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { labTestService } from '@/services/lab-test.service';
import { labEntryService } from '@/services/lab-entry.service';
import { patientService } from '@/services/patients.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function NewLabEntryPage() {
  const router = useRouter();
  const { tenant, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [selectedTests, setSelectedTests] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patientId: '',
    sampleType: 'Blood',
    notes: '',
    billNow: false,
  });

  useEffect(() => {
    if (tenant?.id) {
      fetchPatients();
      fetchTests();
    }
  }, [tenant]);

  const fetchPatients = async () => {
    try {
      const response = await patientService.list({ limit: 100 }, tenant?.id || '');
      // Handle both array and object response formats
      const patientData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setPatients(patientData);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      setPatients([]);
    }
  };

  const fetchTests = async () => {
    try {
      const response = await labTestService.listTests({
        isActive: true,
        limit: 100,
      }, tenant?.id || '');
      // Handle both array and object response formats
      const testData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setAvailableTests(testData);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      setAvailableTests([]);
    }
  };

  const handleAddTest = (test: any) => {
    if (!selectedTests.find((t) => t.id === test.id)) {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const handleRemoveTest = (testId: string) => {
    setSelectedTests(selectedTests.filter((t) => t.id !== testId));
  };

  const calculateTotal = () => {
    return selectedTests.reduce((sum, test) => sum + Number(test.price), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId) {
      alert('Please select a patient');
      return;
    }

    if (selectedTests.length === 0) {
      alert('Please select at least one test');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        patientId: formData.patientId,
        tests: selectedTests.map((test) => ({ labTestId: test.id })),
        sampleType: formData.sampleType,
        notes: formData.notes,
        billNow: formData.billNow,
      };

      await labEntryService.createEntry(payload, tenant?.id || '', user?.id || '');
      router.push('/dashboard/lab-entries');
    } catch (error: any) {
      console.error('Failed to create lab entry:', error);
      alert(error.response?.data?.message || 'Failed to create lab order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/lab-entries">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Lab Order</h1>
          <p className="text-muted-foreground">Create a new patient lab test order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="patient">Patient *</Label>
              <select
                id="patient"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                required
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName} ({patient.patientId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="sampleType">Sample Type</Label>
              <select
                id="sampleType"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.sampleType}
                onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
              >
                <option value="Blood">Blood</option>
                <option value="Urine">Urine</option>
                <option value="Stool">Stool</option>
                <option value="Saliva">Saliva</option>
                <option value="Tissue">Tissue</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Test Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Available Tests */}
            <div>
              <Label>Available Tests</Label>
              <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
                {availableTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex justify-between items-center p-2 hover:bg-muted rounded-md"
                  >
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {test.category} • ₹{test.price}
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddTest(test)}
                      disabled={selectedTests.some((t) => t.id === test.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Tests */}
            {selectedTests.length > 0 && (
              <div>
                <Label>Selected Tests ({selectedTests.length})</Label>
                <div className="mt-2 border rounded-md p-2 space-y-2">
                  {selectedTests.map((test) => (
                    <div
                      key={test.id}
                      className="flex justify-between items-center p-2 bg-blue-50 rounded-md"
                    >
                      <div>
                        <div className="font-medium">{test.name}</div>
                        <div className="text-sm text-muted-foreground">₹{test.price}</div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveTest(test.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total Amount */}
            {selectedTests.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{calculateTotal()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes / Instructions</Label>
              <Textarea
                id="notes"
                placeholder="Add any special instructions or notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="billNow"
                checked={formData.billNow}
                onChange={(e) => setFormData({ ...formData, billNow: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="billNow" className="cursor-pointer">
                Create bill immediately (otherwise add to final billing)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/dashboard/lab-entries">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading || selectedTests.length === 0}>
            {loading ? 'Creating...' : 'Create Lab Order'}
          </Button>
        </div>
      </form>
    </div>
  );
}
