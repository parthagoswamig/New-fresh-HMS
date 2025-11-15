'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { pharmacyService } from '@/services/pharmacy.service';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function SellMedicinePage() {
  const router = useRouter();
  const { tenant, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    paymentMethod: 'CASH',
    notes: '',
  });
  const [items, setItems] = useState([
    { medicineId: '', quantity: 1, unitPrice: 0, discount: 0 },
  ]);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await pharmacyService.list(
        { page: 1, limit: 1000 },
        tenant?.id || '',
      );
      setMedicines(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validItems = items.filter(
        (item) => item.medicineId && item.quantity > 0
      );

      if (validItems.length === 0) {
        alert('Please add at least one medicine');
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        items: validItems.map((item) => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
        })),
        soldBy: user?.staff?.id || '',
      };

      await apiClient.post('/pharmacy/sell', payload, {
        headers: { 'x-tenant-id': tenant?.id },
      });

      alert('Medicine sold successfully!');
      router.push('/dashboard/pharmacy');
    } catch (error: any) {
      console.error('Failed to sell medicine:', error);
      alert(error.response?.data?.message || 'Failed to sell medicine');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]:
        field === 'quantity' || field === 'unitPrice' || field === 'discount'
          ? parseFloat(value) || 0
          : value,
    };

    // Auto-fill price when medicine is selected
    if (field === 'medicineId' && value) {
      const medicine = medicines.find((m) => m.id === value);
      if (medicine) {
        newItems[index].unitPrice = medicine.sellingPrice || medicine.price || 0;
      }
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { medicineId: '', quantity: 1, unitPrice: 0, discount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateItemTotal = (item: any) => {
    return item.quantity * item.unitPrice - (item.discount || 0);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6">
        <Link href="/dashboard/pharmacy">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pharmacy
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-8 h-8 text-green-600" />
          Sell Medicine
        </h1>
        <p className="text-gray-600 mt-1">Direct medicine sale to customers</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="customerAddress">Address</Label>
                <Input
                  id="customerAddress"
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Medicine Items</CardTitle>
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
                  <div className="col-span-12 md:col-span-4">
                    <Label htmlFor={`medicine-${index}`}>Medicine *</Label>
                    <select
                      id={`medicine-${index}`}
                      value={item.medicineId}
                      onChange={(e) =>
                        handleItemChange(index, 'medicineId', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Select Medicine</option>
                      {medicines.map((medicine) => (
                        <option key={medicine.id} value={medicine.id}>
                          {medicine.name} - Stock: {medicine.quantity}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <Label htmlFor={`qty-${index}`}>Quantity *</Label>
                    <Input
                      id={`qty-${index}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', e.target.value)
                      }
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <Label htmlFor={`price-${index}`}>Price *</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(index, 'unitPrice', e.target.value)
                      }
                      min="0"
                      required
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <Label htmlFor={`discount-${index}`}>Discount</Label>
                    <Input
                      id={`discount-${index}`}
                      type="number"
                      step="0.01"
                      value={item.discount}
                      onChange={(e) =>
                        handleItemChange(index, 'discount', e.target.value)
                      }
                      min="0"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label>Total</Label>
                    <div className="px-3 py-2 bg-gray-50 rounded-md text-sm font-medium">
                      ₹{calculateItemTotal(item).toFixed(2)}
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
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total Amount:</span>
                <span className="text-green-600">₹{calculateTotal().toFixed(2)}</span>
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
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Processing...' : 'Complete Sale'}
          </Button>
          <Link href="/dashboard/pharmacy">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
