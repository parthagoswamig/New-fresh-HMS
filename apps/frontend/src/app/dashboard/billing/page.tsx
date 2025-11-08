'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Receipt, Plus, Search, Eye, Edit, Trash2, DollarSign, FileText, Clock, CheckCircle } from 'lucide-react';
import { billingService } from '@/services/billing.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BillingPage() {
  const router = useRouter();
  const { tenant } = useAuthStore();
  const [bills, setBills] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0, partiallyPaid: 0, cancelled: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBills();
    fetchStats();
  }, [page, search, statusFilter]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await billingService.list(
        { page, limit: 10, search, status: statusFilter || undefined },
        tenant?.id || ''
      );
      setBills(response.data.data || []);
      setTotalPages(response.data.meta?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await billingService.getStats(tenant?.id || '');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await billingService.remove(id, tenant?.id || '');
      fetchBills();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete bill:', error);
      alert('Failed to delete invoice');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PARTIALLY_PAID':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
              <Receipt className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Billing & Invoices</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage patient invoices</p>
            </div>
          </div>
          <Link href="/dashboard/billing/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 mb-1">Paid</p>
              <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 mb-1">Partial</p>
              <p className="text-2xl font-bold text-blue-600">{stats.partiallyPaid}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 mb-1">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 mb-1">Revenue</p>
              <p className="text-xl font-bold text-emerald-600">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by invoice number or patient..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <p className="text-gray-600 mt-4">Loading invoices...</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-600 mb-6">
                {search || statusFilter ? 'Try adjusting your filters' : 'Create your first invoice'}
              </p>
              <Link href="/dashboard/billing/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {bill.billNumber}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {bill.patient.firstName} {bill.patient.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{bill.patient.patientId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(bill.billDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${bill.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                            {bill.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/dashboard/billing/${bill.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/billing/${bill.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(bill.id)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {bills.map((bill) => (
                  <Card key={bill.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{bill.billNumber}</h3>
                          <p className="text-sm text-gray-500">
                            {bill.patient.firstName} {bill.patient.lastName}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                          {bill.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="text-gray-900">{formatDate(bill.billDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="text-gray-900 font-semibold">${bill.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/billing/${bill.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/dashboard/billing/${bill.id}/edit`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
