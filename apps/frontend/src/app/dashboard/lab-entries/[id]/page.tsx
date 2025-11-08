'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Printer } from 'lucide-react';
import { labEntryService } from '@/services/lab-entry.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function LabEntryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { tenant } = useAuthStore();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [reportData, setReportData] = useState({
    findings: '',
    interpretation: '',
    comments: '',
  });

  useEffect(() => {
    if (params.id && tenant?.id) {
      fetchEntry();
    }
  }, [params.id, tenant]);

  const fetchEntry = async () => {
    try {
      setLoading(true);
      const response = await labEntryService.getEntryById(params.id as string, tenant?.id || '');
      setEntry(response.data);
      
      // Initialize results from items
      if (response.data.items) {
        setResults(
          response.data.items.map((item: any) => ({
            itemId: item.id,
            result: item.result || '',
            unit: item.unit || '',
            referenceRange: item.referenceRange || '',
          }))
        );
      }

      // Load existing report data if available
      if (response.data.report) {
        setReportData({
          findings: response.data.report.findings || '',
          interpretation: response.data.report.interpretation || '',
          comments: response.data.report.comments || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch entry:', error);
      alert('Failed to load lab order');
    } finally {
      setLoading(false);
    }
  };

  const handleResultChange = (itemId: string, field: string, value: string) => {
    setResults(
      results.map((r) =>
        r.itemId === itemId ? { ...r, [field]: value } : r
      )
    );
  };

  const handleSubmitResults = async () => {
    try {
      setSaving(true);
      const payload = {
        results: results.filter((r) => r.result), // Only submit results that have values
        findings: reportData.findings,
        interpretation: reportData.interpretation,
        comments: reportData.comments,
      };

      await labEntryService.addResults(params.id as string, payload, tenant?.id || '');
      alert('Results saved successfully!');
      fetchEntry(); // Reload to get updated data
    } catch (error: any) {
      console.error('Failed to save results:', error);
      alert(error.response?.data?.message || 'Failed to save results');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ORDERED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">Lab order not found</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/lab-entries">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Lab Order: {entry.entryNumber}</h1>
            <p className="text-muted-foreground">View and add test results</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(entry.status)}>
            {entry.status.replace('_', ' ')}
          </Badge>
          {entry.status === 'COMPLETED' && (
            <Link href={`/dashboard/lab-entries/${entry.id}/print`}>
              <Button variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print Report
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Patient Name</div>
              <div className="font-medium">
                {entry.patient?.firstName} {entry.patient?.lastName}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Patient ID</div>
              <div className="font-medium">{entry.patient?.patientId}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Age / Gender</div>
              <div className="font-medium">
                {entry.patient?.dateOfBirth
                  ? new Date().getFullYear() -
                    new Date(entry.patient.dateOfBirth).getFullYear()
                  : 'N/A'}{' '}
                / {entry.patient?.gender || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Contact</div>
              <div className="font-medium">{entry.patient?.phone || 'N/A'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Order Date</div>
              <div className="font-medium">
                {new Date(entry.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Sample Type</div>
              <div className="font-medium">{entry.sampleType || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
              <div className="font-medium">{entry.items?.length || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="font-medium text-lg">₹{entry.totalAmount}</div>
            </div>
          </div>
          {entry.notes && (
            <div className="mt-4">
              <div className="text-sm text-muted-foreground">Notes</div>
              <div className="font-medium">{entry.notes}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {entry.items?.map((item: any, index: number) => (
            <div key={item.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{item.testName}</h3>
                  <p className="text-sm text-muted-foreground">Price: ₹{item.price}</p>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {item.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`result-${item.id}`}>Result Value *</Label>
                  <Input
                    id={`result-${item.id}`}
                    placeholder="e.g., 8500, Normal, Positive"
                    value={results[index]?.result || ''}
                    onChange={(e) =>
                      handleResultChange(item.id, 'result', e.target.value)
                    }
                    disabled={entry.status === 'COMPLETED'}
                  />
                </div>
                <div>
                  <Label htmlFor={`unit-${item.id}`}>Unit</Label>
                  <Input
                    id={`unit-${item.id}`}
                    placeholder="e.g., cells/μL, mg/dL"
                    value={results[index]?.unit || ''}
                    onChange={(e) =>
                      handleResultChange(item.id, 'unit', e.target.value)
                    }
                    disabled={entry.status === 'COMPLETED'}
                  />
                </div>
                <div>
                  <Label htmlFor={`range-${item.id}`}>Reference Range</Label>
                  <Input
                    id={`range-${item.id}`}
                    placeholder="e.g., 4000-11000"
                    value={results[index]?.referenceRange || ''}
                    onChange={(e) =>
                      handleResultChange(item.id, 'referenceRange', e.target.value)
                    }
                    disabled={entry.status === 'COMPLETED'}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Report Details */}
      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="findings">Clinical Findings</Label>
            <Textarea
              id="findings"
              placeholder="Overall clinical findings..."
              value={reportData.findings}
              onChange={(e) =>
                setReportData({ ...reportData, findings: e.target.value })
              }
              rows={3}
              disabled={entry.status === 'COMPLETED'}
            />
          </div>
          <div>
            <Label htmlFor="interpretation">Medical Interpretation</Label>
            <Textarea
              id="interpretation"
              placeholder="Medical interpretation of results..."
              value={reportData.interpretation}
              onChange={(e) =>
                setReportData({ ...reportData, interpretation: e.target.value })
              }
              rows={3}
              disabled={entry.status === 'COMPLETED'}
            />
          </div>
          <div>
            <Label htmlFor="comments">Doctor Comments / Recommendations</Label>
            <Textarea
              id="comments"
              placeholder="Additional comments or recommendations..."
              value={reportData.comments}
              onChange={(e) =>
                setReportData({ ...reportData, comments: e.target.value })
              }
              rows={3}
              disabled={entry.status === 'COMPLETED'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {entry.status !== 'COMPLETED' && (
        <div className="flex justify-end gap-4">
          <Link href="/dashboard/lab-entries">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleSubmitResults} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Results'}
          </Button>
        </div>
      )}
    </div>
  );
}
