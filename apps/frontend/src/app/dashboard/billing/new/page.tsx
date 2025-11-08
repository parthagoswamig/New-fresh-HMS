'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { billingService } from '@/services/billing.service';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function NewInvoicePage() {
  const router = useRouter();
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patientId: '',
    dueDate: '',
    discountAmount: 0,
    notes: '',
    status: 'PENDING',
  });
  const [items, setItems] = useState([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await apiClient.get('/patients', {
        headers: { 'x-tenant-id': tenant?.id },
        params: { limit: 100 },
      });
      setPatients(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        items: items.filter(item => item.description && item.quantity > 0 && item.unitPrice > 0),
        dueDate: formData.dueDate || undefined,
      };

      await billingService.create(payload, tenant?.id || '');
      router.push('/dashboard/billing');
    } catch (error: any) {
      console.error('Failed to create invoice:', error);
      alert(error.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'discountAmount' ? parseFloat(value) || 0 : value }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value,
    };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - formData.discountAmount;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6">
        <Link href="/dashboard/billing">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Billing
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Invoice</h1>
        <p className="text-gray-600 mt-1">Generate a new invoice for patient</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientId">Patient *</Label>
                <select
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-12 md:col-span-5">
                    <Label htmlFor={`desc-${index}`}>Description</Label>
                    <Input
                      id={`desc-${index}`}
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Item description"
                      required
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <Label htmlFor={`qty-${index}`}>Qty</Label>
                    <Input
                      id={`qty-${index}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <Label htmlFor={`price-${index}`}>Price</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <Label>Amount</Label>
                    <div className="px-3 py-2 bg-gray-50 rounded-md text-sm font-medium">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <Label htmlFor="discountAmount">Discount:</Label>
                <Input
                  id="discountAmount"
                  name="discountAmount"
                  type="number"
                  step="0.01"
                  value={formData.discountAmount}
                  onChange={handleChange}
                  min="0"
                  max={calculateSubtotal()}
                  className="w-32"
                />
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="text-emerald-600">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
            {loading ? 'Creating...' : 'Create Invoice'}
          </Button>
          <Link href="/dashboard/billing">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
