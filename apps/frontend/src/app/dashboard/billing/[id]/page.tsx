'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, User, Receipt, Calendar, DollarSign, FileText, Printer } from 'lucide-react';
import { billingService } from '@/services/billing.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { tenant } = useAuthStore();
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBill();
  }, []);

  const fetchBill = async () => {
    try {
      setLoading(true);
      const response = await billingService.getById(params.id as string, tenant?.id || '');
      setBill(response.data);
    } catch (error) {
      console.error('Failed to fetch bill:', error);
      alert('Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await billingService.remove(params.id as string, tenant?.id || '');
      router.push('/dashboard/billing');
    } catch (error) {
      console.error('Failed to delete bill:', error);
      alert('Failed to delete invoice');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="text-gray-600 mt-4">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice not found</h3>
          <Link href="/dashboard/billing">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Billing
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6">
        <Link href="/dashboard/billing">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Billing
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Invoice {bill.billNumber}</h1>
            <p className="text-gray-600 mt-1">Issued on {formatDate(bill.billDate)}</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(bill.status)}`}>
              {bill.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <Link href={`/dashboard/billing/${bill.id}/print`}>
          <Button>
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
        </Link>
        <Link href={`/dashboard/billing/${bill.id}/edit`}>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </Link>
        <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-base font-medium text-gray-900">
                {bill.patient.firstName} {bill.patient.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patient ID</p>
              <p className="text-base font-medium text-gray-900">{bill.patient.patientId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-base font-medium text-gray-900">{bill.patient.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-base font-medium text-gray-900">{bill.patient.email || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Invoice Number</p>
              <p className="text-base font-medium text-gray-900">{bill.billNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Issue Date</p>
              <p className="text-base font-medium text-gray-900">{formatDate(bill.billDate)}</p>
            </div>
            {bill.dueDate && (
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="text-base font-medium text-gray-900">{formatDate(bill.dueDate)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                {bill.status.replace('_', ' ')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="w-5 h-5 mr-2" />
              Line Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bill.items.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${(bill.totalAmount + bill.discountAmount).toFixed(2)}</span>
              </div>
              {bill.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-red-600">-${bill.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="text-emerald-600">${bill.totalAmount.toFixed(2)}</span>
              </div>
              {bill.paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Paid Amount:</span>
                    <span className="font-medium text-green-600">${bill.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-600">Balance Due:</span>
                    <span className="text-red-600">${(bill.totalAmount - bill.paidAmount).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {bill.notes && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-gray-900 whitespace-pre-wrap">{bill.notes}</p>
            </CardContent>
          </Card>
        )}

        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600">
              <p>
                <span className="font-medium">Created:</span> {formatDateTime(bill.createdAt)}
              </p>
              <p>
                <span className="font-medium">Last Updated:</span> {formatDateTime(bill.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
