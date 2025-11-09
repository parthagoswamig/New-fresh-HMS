'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Plus, Search, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { insuranceService } from '@/services/insurance.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function PoliciesPage() {
  const { tenant } = useAuthStore();
  const [policies, setPolicies] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);

  const [formData, setFormData] = useState({
    companyId: '',
    policyName: '',
    policyNumber: '',
    policyType: 'Health',
    coveragePercent: 80,
    deductible: 0,
    maxCoverage: 0,
    validFrom: '',
    validUntil: '',
    terms: '',
  });

  useEffect(() => {
    fetchPolicies();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await insuranceService.listCompanies({}, tenant?.id || '');
      setCompanies(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await insuranceService.listPolicies(
        { search: searchTerm },
        tenant?.id || ''
      );
      setPolicies(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (editingPolicy) {
        await insuranceService.updatePolicy(editingPolicy.id, formData, tenant?.id || '');
      } else {
        await insuranceService.createPolicy(formData, tenant?.id || '');
      }

      setShowModal(false);
      setEditingPolicy(null);
      resetForm();
      fetchPolicies();
    } catch (error: any) {
      console.error('Failed to save policy:', error);
      alert(error.response?.data?.message || 'Failed to save policy');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (policy: any) => {
    setEditingPolicy(policy);
    setFormData({
      companyId: policy.companyId || '',
      policyName: policy.policyName || '',
      policyNumber: policy.policyNumber || '',
      policyType: policy.policyType || 'Health',
      coveragePercent: policy.coveragePercent || 80,
      deductible: policy.deductible || 0,
      maxCoverage: policy.maxCoverage || 0,
      validFrom: policy.validFrom?.split('T')[0] || '',
      validUntil: policy.validUntil?.split('T')[0] || '',
      terms: policy.terms || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;

    try {
      await insuranceService.deletePolicy(id, tenant?.id || '');
      fetchPolicies();
    } catch (error) {
      console.error('Failed to delete policy:', error);
      alert('Failed to delete policy');
    }
  };

  const resetForm = () => {
    setFormData({
      companyId: '',
      policyName: '',
      policyNumber: '',
      policyType: 'Health',
      coveragePercent: 80,
      deductible: 0,
      maxCoverage: 0,
      validFrom: '',
      validUntil: '',
      terms: '',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/insurance">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="w-8 h-8" />
              Insurance Policies
            </h1>
            <p className="text-gray-500">Manage insurance policy templates</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setShowModal(true);
            setEditingPolicy(null);
            resetForm();
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Policy
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchPolicies}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Insurance Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Policy</th>
                  <th className="text-left p-4">Company</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-right p-4">Coverage</th>
                  <th className="text-right p-4">Deductible</th>
                  <th className="text-left p-4">Validity</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium">{policy.policyName}</div>
                      <div className="text-sm text-gray-500">{policy.policyNumber}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{policy.company?.name}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {policy.policyType}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-semibold">{policy.coveragePercent}%</div>
                      <div className="text-xs text-gray-500">
                        Max: ₹{policy.maxCoverage?.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4 text-right">₹{policy.deductible?.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="text-sm">
                        {new Date(policy.validFrom).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        to {new Date(policy.validUntil).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(policy)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(policy.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {policies.length === 0 && (
              <div className="text-center py-8 text-gray-500">No policies found</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingPolicy ? 'Edit Policy' : 'Add New Policy'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="companyId">Insurance Company *</Label>
                    <select
                      id="companyId"
                      className="w-full border rounded px-3 py-2"
                      value={formData.companyId}
                      onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                      required
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="policyName">Policy Name *</Label>
                    <Input
                      id="policyName"
                      value={formData.policyName}
                      onChange={(e) => setFormData({ ...formData, policyName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="policyNumber">Policy Number *</Label>
                    <Input
                      id="policyNumber"
                      value={formData.policyNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, policyNumber: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="policyType">Policy Type *</Label>
                    <select
                      id="policyType"
                      className="w-full border rounded px-3 py-2"
                      value={formData.policyType}
                      onChange={(e) => setFormData({ ...formData, policyType: e.target.value })}
                    >
                      <option value="Health">Health</option>
                      <option value="Life">Life</option>
                      <option value="Accident">Accident</option>
                      <option value="Critical Illness">Critical Illness</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="coveragePercent">Coverage % *</Label>
                    <Input
                      id="coveragePercent"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.coveragePercent}
                      onChange={(e) =>
                        setFormData({ ...formData, coveragePercent: parseFloat(e.target.value) })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="deductible">Deductible (₹)</Label>
                    <Input
                      id="deductible"
                      type="number"
                      min="0"
                      value={formData.deductible}
                      onChange={(e) =>
                        setFormData({ ...formData, deductible: parseFloat(e.target.value) })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxCoverage">Max Coverage (₹)</Label>
                    <Input
                      id="maxCoverage"
                      type="number"
                      min="0"
                      value={formData.maxCoverage}
                      onChange={(e) =>
                        setFormData({ ...formData, maxCoverage: parseFloat(e.target.value) })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="validFrom">Valid From *</Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="validUntil">Valid Until *</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="terms">Terms & Conditions</Label>
                    <Textarea
                      id="terms"
                      value={formData.terms}
                      onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPolicy(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : editingPolicy ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
