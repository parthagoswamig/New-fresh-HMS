'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Pill,
  Package,
  DollarSign,
  Calendar,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { pharmacyService } from '@/services/pharmacy.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function MedicineDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { tenant } = useAuthStore();
  const [medicine, setMedicine] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicine();
  }, []);

  const fetchMedicine = async () => {
    try {
      setLoading(true);
      const response = await pharmacyService.getById(params.id as string, tenant?.id || '');
      setMedicine(response.data);
    } catch (error) {
      console.error('Failed to fetch medicine:', error);
      alert('Failed to load medicine details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this medicine?')) {
      return;
    }

    try {
      await pharmacyService.remove(params.id as string, tenant?.id || '');
      router.push('/dashboard/pharmacy');
    } catch (error) {
      console.error('Failed to delete medicine:', error);
      alert('Failed to delete medicine');
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
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

  const isExpired = (date: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const isLowStock = (quantity: number, reorderLevel: number = 10) => {
    return quantity <= reorderLevel;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="text-gray-600 mt-4">Loading medicine details...</p>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Medicine not found</h3>
          <Link href="/dashboard/pharmacy">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pharmacy
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/pharmacy">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pharmacy
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{medicine.name}</h1>
            <p className="text-gray-600 mt-1">{medicine.brand || 'Generic'}</p>
          </div>
          <div className="flex gap-2">
            {isExpired(medicine.expiryDate) ? (
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                Expired
              </span>
            ) : isLowStock(medicine.stockQuantity, medicine.reorderLevel) ? (
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                Low Stock
              </span>
            ) : (
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                In Stock
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Link href={`/dashboard/pharmacy/${medicine.id}/edit`}>
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
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Pill className="w-5 h-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Medicine Name</p>
              <p className="text-base font-medium text-gray-900">{medicine.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Brand</p>
              <p className="text-base font-medium text-gray-900">{medicine.brand || 'Generic'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Generic Name</p>
              <p className="text-base font-medium text-gray-900">{medicine.genericName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Manufacturer</p>
              <p className="text-base font-medium text-gray-900">{medicine.manufacturer || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="text-base font-medium text-gray-900">{medicine.category || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stock Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Stock Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Current Stock</p>
              <p
                className={`text-base font-medium ${
                  isLowStock(medicine.stockQuantity, medicine.reorderLevel)
                    ? 'text-red-600'
                    : 'text-gray-900'
                }`}
              >
                {medicine.stockQuantity}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Reorder Level</p>
              <p className="text-base font-medium text-gray-900">
                {medicine.reorderLevel}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Batch Number</p>
              <p className="text-base font-medium text-gray-900">{medicine.batchNumber || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Pricing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Unit Price</p>
              <p className="text-2xl font-bold text-gray-900">
                ${medicine.unitPrice.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Stock Value</p>
              <p className="text-xl font-semibold text-gray-900">
                ${(medicine.unitPrice * medicine.stockQuantity).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Expiry Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Expiry Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Expiry Date</p>
              <p
                className={`text-base font-medium ${
                  isExpired(medicine.expiryDate) ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                {formatDate(medicine.expiryDate)}
              </p>
            </div>
            {isExpired(medicine.expiryDate) && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Medicine Expired</p>
                  <p className="text-sm text-red-600 mt-1">
                    This medicine has expired and should not be dispensed.
                  </p>
                </div>
              </div>
            )}
            {isLowStock(medicine.stockQuantity, medicine.reorderLevel) && !isExpired(medicine.expiryDate) && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Low Stock Alert</p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Stock is below reorder level. Consider restocking soon.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        {medicine.description && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-gray-900 whitespace-pre-wrap">{medicine.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600">
              <p>
                <span className="font-medium">Created:</span> {formatDateTime(medicine.createdAt)}
              </p>
              <p>
                <span className="font-medium">Last Updated:</span>{' '}
                {formatDateTime(medicine.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
