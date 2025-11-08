'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, Search, Eye, CheckCircle, XCircle, 
  Clock, AlertCircle, Plus 
} from 'lucide-react';
import { insuranceService } from '@/services/insurance.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

const STATUS_COLORS: any = {
  INITIATED: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  SETTLED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const STATUS_ICONS: any = {
  INITIATED: Clock,
  UNDER_REVIEW: AlertCircle,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  SETTLED: CheckCircle,
  CANCELLED: XCircle,
};

export default function ClaimsPage() {
  const { tenant, user } = useAuthStore();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchClaims();
  }, [statusFilter]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await insuranceService.listClaims(
        { 
          search: searchTerm,
          status: statusFilter || undefined,
        },
        tenant?.id || ''
      );
      setClaims(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (claimId: string) => {
    if (!confirm('Are you sure you want to approve this claim?')) return;

    try {
      const staffId = user?.staff?.id || user?.id || '';
      await insuranceService.updateClaimStatus(
        claimId,
        {
          status: 'APPROVED',
          reviewNotes: 'Claim approved',
        },
        tenant?.id || '',
        staffId
      );
      fetchClaims();
      alert('Claim approved successfully!');
    } catch (error: any) {
      console.error('Failed to approve claim:', error);
      alert(error.response?.data?.message || 'Failed to approve claim');
    }
  };

  const handleReject = async (claimId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const staffId = user?.staff?.id || user?.id || '';
      await insuranceService.updateClaimStatus(
        claimId,
        {
          status: 'REJECTED',
          rejectionReason: reason,
        },
        tenant?.id || '',
        staffId
      );
      fetchClaims();
      alert('Claim rejected');
    } catch (error: any) {
      console.error('Failed to reject claim:', error);
      alert(error.response?.data?.message || 'Failed to reject claim');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Insurance Claims
          </h1>
          <p className="text-gray-500">Manage and process insurance claims</p>
        </div>
        <Link href="/dashboard/insurance/claims/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Claim
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-4 py-2"
            >
              <option value="">All Status</option>
              <option value="INITIATED">Initiated</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="SETTLED">Settled</option>
            </select>
            <Button onClick={fetchClaims}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Claims List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Claim #</th>
                  <th className="text-left p-4">Patient</th>
                  <th className="text-left p-4">Policy</th>
                  <th className="text-right p-4">Total</th>
                  <th className="text-right p-4">Covered</th>
                  <th className="text-center p-4">Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => {
                  const StatusIcon = STATUS_ICONS[claim.status] || FileText;
                  return (
                    <tr key={claim.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-mono text-sm">{claim.claimNumber}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(claim.claimDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">
                          {claim.patient?.firstName} {claim.patient?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {claim.patient?.patientId}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{claim.policy?.policyName}</div>
                        <div className="text-xs text-gray-500">
                          {claim.policy?.company?.name}
                        </div>
                      </td>
                      <td className="p-4 text-right font-semibold">
                        ₹{claim.totalAmount?.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-semibold text-green-600">
                        ₹{claim.coveredAmount?.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            STATUS_COLORS[claim.status]
                          }`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {claim.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/insurance/claims/${claim.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          {claim.status === 'INITIATED' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(claim.id)}
                                className="text-green-600"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(claim.id)}
                                className="text-red-600"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {claims.length === 0 && (
              <div className="text-center py-8 text-gray-500">No claims found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
