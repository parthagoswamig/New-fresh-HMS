'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { insuranceService } from '@/services/insurance.service';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewClaimPage() {
  const router = useRouter();
  const { tenant, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [services, setServices] = useState<any[]>([
    { serviceId: '', serviceName: '', serviceType: 'CONSULTATION', cost: 0 },
  ]);

  const [formData, setFormData] = useState({
    billId: '',
  });

  const addService = () => {
    setServices([
      ...services,
      { serviceId: '', serviceName: '', serviceType: 'CONSULTATION', cost: 0 },
    ]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: string, value: any) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient || !selectedPolicy || !serviceDate || services.length === 0) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);

      const staffId = user?.staff?.id || user?.id || '';

      await insuranceService.createClaim(
        {
          patientId: selectedPatient,
          policyId: selectedPolicy,
          serviceDate,
          services,
          billId: formData.billId || undefined,
        },
        tenant?.id || '',
        staffId
      );

      alert('Claim created successfully!');
      router.push('/dashboard/insurance/claims');
    } catch (error: any) {
      console.error('Failed to create claim:', error);
      alert(error.response?.data?.message || 'Failed to create claim');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = services.reduce((sum, s) => sum + (parseFloat(s.cost) || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/insurance/claims">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Claim</h1>
          <p className="text-gray-500">Submit a new insurance claim for a patient</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient & Policy Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Patient & Policy Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient">Patient ID *</Label>
                <Input
                  id="patient"
                  placeholder="Enter patient ID"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the patient's ID from the system
                </p>
              </div>

              <div>
                <Label htmlFor="policy">Policy ID *</Label>
                <Input
                  id="policy"
                  placeholder="Enter policy ID"
                  value={selectedPolicy}
                  onChange={(e) => setSelectedPolicy(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the insurance policy ID
                </p>
              </div>

              <div>
                <Label htmlFor="serviceDate">Service Date *</Label>
                <Input
                  id="serviceDate"
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="billId">Bill ID (Optional)</Label>
                <Input
                  id="billId"
                  placeholder="Enter bill ID if exists"
                  value={formData.billId}
                  onChange={(e) => setFormData({ ...formData, billId: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Services</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addService}>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Service {index + 1}</h4>
                  {services.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeService(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label>Service ID</Label>
                    <Input
                      placeholder="ID"
                      value={service.serviceId}
                      onChange={(e) => updateService(index, 'serviceId', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Service Name</Label>
                    <Input
                      placeholder="Name"
                      value={service.serviceName}
                      onChange={(e) => updateService(index, 'serviceName', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Type</Label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={service.serviceType}
                      onChange={(e) => updateService(index, 'serviceType', e.target.value)}
                    >
                      <option value="CONSULTATION">Consultation</option>
                      <option value="LAB">Lab Test</option>
                      <option value="RADIOLOGY">Radiology</option>
                      <option value="PROCEDURE">Procedure</option>
                      <option value="MEDICATION">Medication</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label>Cost (₹)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={service.cost}
                      onChange={(e) =>
                        updateService(index, 'cost', parseFloat(e.target.value) || 0)
                      }
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4 justify-end">
          <Link href="/dashboard/insurance/claims">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Claim'}
          </Button>
        </div>
      </form>
    </div>
  );
}
