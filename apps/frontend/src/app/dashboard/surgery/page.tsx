'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { surgeryService, Surgery } from '@/services/surgery.service';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, Filter, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';

const STATUS_COLORS = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function SurgeryPage() {
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    surgeryType: '',
  });

  useEffect(() => {
    if (tenant?.id) {
      fetchSurgeries();
    }
  }, [tenant, page, filters]);

  const fetchSurgeries = async () => {
    try {
      setLoading(true);
      const response = await surgeryService.list(tenant?.id || '', page, 10, filters);
      setSurgeries(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Error fetching surgeries:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Surgery Management</h1>
          <p className="text-gray-600 mt-1">Manage surgical procedures and OT scheduling</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/surgery/analytics"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Analytics
          </Link>
          <Link
            href="/dashboard/surgery/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule Surgery
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by surgery #, patient, procedure..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              value={filters.surgeryType}
              onChange={(e) => setFilters({ ...filters, surgeryType: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="GENERAL">General</option>
              <option value="ORTHOPEDIC">Orthopedic</option>
              <option value="CARDIAC">Cardiac</option>
              <option value="NEUROSURGERY">Neurosurgery</option>
              <option value="PLASTIC">Plastic</option>
              <option value="GYNECOLOGICAL">Gynecological</option>
              <option value="UROLOGICAL">Urological</option>
              <option value="OPHTHALMIC">Ophthalmic</option>
              <option value="ENT">ENT</option>
              <option value="PEDIATRIC">Pediatric</option>
              <option value="EMERGENCY">Emergency</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Surgery List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : surgeries.length > 0 ? (
        <div className="space-y-4">
          {surgeries.map((surgery) => (
            <Card key={surgery.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {surgery.surgeryNumber}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[surgery.status]}`}>
                        {surgery.status.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                        {surgery.surgeryType}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium mb-1">{surgery.procedureName}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Patient:</span>{' '}
                        {surgery.patient?.firstName} {surgery.patient?.lastName}
                      </div>
                      <div>
                        <span className="font-medium">Surgeon:</span>{' '}
                        {surgery.surgeon?.user?.firstName} {surgery.surgeon?.user?.lastName}
                      </div>
                      <div>
                        <span className="font-medium">OT:</span>{' '}
                        {surgery.operatingRoom?.name}
                      </div>
                      <div>
                        <span className="font-medium">Scheduled:</span>{' '}
                        {formatDate(surgery.scheduledDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/surgery/${surgery.id}`}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {Math.ceil(total / 10)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / 10)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 mb-4">No surgeries found</p>
            <Link
              href="/dashboard/surgery/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Schedule First Surgery
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
