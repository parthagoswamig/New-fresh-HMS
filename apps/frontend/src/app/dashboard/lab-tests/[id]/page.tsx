'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { labTestService } from '@/services/lab-test.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function LabTestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { tenant } = useAuthStore();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id && tenant?.id) {
      fetchTest();
    }
  }, [params.id, tenant]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      const response = await labTestService.getTestById(params.id as string, tenant?.id || '');
      setTest(response.data);
    } catch (error) {
      console.error('Failed to fetch test:', error);
      alert('Failed to load test details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to deactivate this test?')) return;

    try {
      await labTestService.removeTest(params.id as string, tenant?.id || '');
      router.push('/dashboard/lab-tests');
    } catch (error) {
      console.error('Failed to delete test:', error);
      alert('Failed to delete test');
    }
  };

  if (loading) {
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

  if (!test) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">Test not found</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/dashboard/lab-tests">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lab Tests
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/dashboard/lab-tests/${test.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4 text-red-500" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{test.name}</CardTitle>
              {test.category && (
                <Badge variant="outline" className="mt-2">
                  {test.category}
                </Badge>
              )}
            </div>
            <Badge variant={test.isActive ? 'default' : 'secondary'}>
              {test.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          {test.description && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Description</h3>
              <p className="text-base">{test.description}</p>
            </div>
          )}

          {/* Pricing */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Pricing</h3>
            <p className="text-2xl font-bold">₹{test.price}</p>
          </div>

          {/* Test Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Unit of Measurement
              </h3>
              <p className="text-base">{test.unit || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Reference Range
              </h3>
              <p className="text-base">{test.referenceRange || 'Not specified'}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(test.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {new Date(test.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
