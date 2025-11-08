'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { labTestService } from '@/services/lab-test.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function NewLabTestPage() {
  const router = useRouter();
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    unit: '',
    referenceRange: '',
  });

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
      };

      await labTestService.createTest(payload, tenant?.id || '');
      router.push('/dashboard/lab-tests');
    } catch (error: any) {
      console.error('Failed to create lab test:', error);
      alert(error.response?.data?.message || 'Failed to create lab test');
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
          <CardTitle>Create New Lab Test</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add a new test to your lab test catalog
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
                  <p className="text-xs text-muted-foreground">
                    Unit for the test result (e.g., cells/μL for WBC count)
                  </p>
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
                  <p className="text-xs text-muted-foreground">
                    Normal range for the test result
                  </p>
                </div>
              </div>
            </div>

            {/* Example */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Example:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li><strong>Name:</strong> Complete Blood Count (CBC)</li>
                <li><strong>Category:</strong> Hematology</li>
                <li><strong>Price:</strong> 500</li>
                <li><strong>Unit:</strong> cells/μL</li>
                <li><strong>Reference Range:</strong> 4000-11000</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Lab Test'}
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
