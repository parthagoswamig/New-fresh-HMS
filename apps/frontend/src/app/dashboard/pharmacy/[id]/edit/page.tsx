'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { pharmacyService } from '@/services/pharmacy.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function EditMedicinePage() {
  const router = useRouter();
  const params = useParams();
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    batchNumber: '',
    expiryDate: '',
    quantity: '',
    unit: 'tablets',
    pricePerUnit: '',
    description: '',
    genericName: '',
    manufacturer: '',
    category: '',
    reorderLevel: '10',
  });

  useEffect(() => {
    fetchMedicine();
  }, []);

  const fetchMedicine = async () => {
    try {
      setFetching(true);
      const response = await pharmacyService.getById(params.id as string, tenant?.id || '');
      const medicine = response.data;

      setFormData({
        name: medicine.name || '',
        brand: medicine.brand || '',
        batchNumber: medicine.batchNumber || '',
        expiryDate: medicine.expiryDate
          ? new Date(medicine.expiryDate).toISOString().split('T')[0]
          : '',
        quantity: medicine.quantity?.toString() || '',
        unit: medicine.unit || 'tablets',
        pricePerUnit: medicine.pricePerUnit?.toString() || '',
        description: medicine.description || '',
        genericName: medicine.genericName || '',
        manufacturer: medicine.manufacturer || '',
        category: medicine.category || '',
        reorderLevel: medicine.reorderLevel?.toString() || '10',
      });
    } catch (error) {
      console.error('Failed to fetch medicine:', error);
      alert('Failed to load medicine details');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        brand: formData.brand || undefined,
        batchNumber: formData.batchNumber || undefined,
        expiryDate: formData.expiryDate || undefined,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        pricePerUnit: parseFloat(formData.pricePerUnit),
        description: formData.description || undefined,
        genericName: formData.genericName || undefined,
        manufacturer: formData.manufacturer || undefined,
        category: formData.category || undefined,
        reorderLevel: parseInt(formData.reorderLevel) || 10,
      };

      await pharmacyService.update(params.id as string, payload, tenant?.id || '');
      router.push('/dashboard/pharmacy');
    } catch (error: any) {
      console.error('Failed to update medicine:', error);
      alert(error.response?.data?.message || 'Failed to update medicine');
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

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="text-gray-600 mt-4">Loading medicine details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6">
        <Link href="/dashboard/pharmacy">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pharmacy
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Medicine</h1>
        <p className="text-gray-600 mt-1">Update medicine information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Medicine Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Medicine Name *</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Paracetamol"
                  required
                />
              </div>

              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., Crocin"
                />
              </div>

              <div>
                <Label htmlFor="genericName">Generic Name</Label>
                <Input
                  type="text"
                  id="genericName"
                  name="genericName"
                  value={formData.genericName}
                  onChange={handleChange}
                  placeholder="e.g., Acetaminophen"
                />
              </div>

              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  type="text"
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="e.g., GSK"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Analgesic"
                />
              </div>

              <div>
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  type="text"
                  id="batchNumber"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  placeholder="e.g., BATCH001"
                />
              </div>

              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g., 100"
                  min="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="unit">Unit *</Label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="tablets">Tablets</option>
                  <option value="capsules">Capsules</option>
                  <option value="ml">ML</option>
                  <option value="mg">MG</option>
                  <option value="bottles">Bottles</option>
                  <option value="boxes">Boxes</option>
                  <option value="strips">Strips</option>
                  <option value="vials">Vials</option>
                  <option value="syringes">Syringes</option>
                </select>
              </div>

              <div>
                <Label htmlFor="pricePerUnit">Price Per Unit *</Label>
                <Input
                  type="number"
                  id="pricePerUnit"
                  name="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={handleChange}
                  placeholder="e.g., 5.50"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  type="number"
                  id="reorderLevel"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  placeholder="e.g., 10"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter medicine description, usage instructions, side effects, etc..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
            {loading ? 'Updating...' : 'Update Medicine'}
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
