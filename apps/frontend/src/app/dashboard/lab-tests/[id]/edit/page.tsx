'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { labTestService } from '@/services/lab-test.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function EditLabTestPage() {
  const router = useRouter();
  const params = useParams();
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    unit: '',
    referenceRange: '',
    isActive: true,
  });

  useEffect(() => {
    if (params.id && tenant?.id) {
      fetchTest();
    }
  }, [params.id, tenant]);

  const fetchTest = async () => {
    try {
      setFetching(true);
      const response = await labTestService.getTestById(params.id as string, tenant?.id || '');
      const test = response.data;
      setFormData({
        name: test.name || '',
        category: test.category || '',
        price: test.price?.toString() || '',
        description: test.description || '',
        unit: test.unit || '',
        referenceRange: test.referenceRange || '',
        isActive: test.isActive !== false,
      });
    } catch (error) {
      console.error('Failed to fetch test:', error);
      alert('Failed to load test details');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      alert('Please fill in required fields');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        category: formData.category || undefined,
        price: parseFloat(formData.price),
        description: formData.description || undefined,
        unit: formData.unit || undefined,
        referenceRange: formData.referenceRange || undefined,
        isActive: formData.isActive,
      };

      await labTestService.updateTest(params.id as string, payload, tenant?.id || '');
      router.push('/dashboard/lab-tests');
    } catch (error: any) {
      console.error('Failed to update lab test:', error);
      alert(error.response?.data?.message || 'Failed to update lab test');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (fetching) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/lab-tests">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lab Tests
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Lab Test</CardTitle>
          <p className="text-sm text-muted-foreground">
            Update lab test information
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Test Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Complete Blood Count"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    placeholder="e.g., Hematology, Biochemistry"
                    value={formData.category}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of the test"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing</h3>
              
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 500"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Test Parameters */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Parameters</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit of Measurement</Label>
                  <Input
                    id="unit"
                    name="unit"
                    placeholder="e.g., cells/μL, mg/dL, U/L"
                    value={formData.unit}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referenceRange">Reference Range</Label>
                  <Input
                    id="referenceRange"
                    name="referenceRange"
                    placeholder="e.g., 4000-11000, 0-40"
                    value={formData.referenceRange}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Status</h3>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Inactive tests will not be available for new orders
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Updating...' : 'Update Lab Test'}
              </Button>
              <Link href="/dashboard/lab-tests" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
