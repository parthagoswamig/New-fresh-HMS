'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bed,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Activity,
} from 'lucide-react';
import { ipdService } from '@/services/ipd.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function IPDPage() {
  const router = useRouter();
  const { tenant } = useAuthStore();
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, admitted: 0, discharged: 0, underTreatment: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAdmissions();
    fetchStats();
  }, [page, search]);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const response = await ipdService.list(
        { page, limit: 10, search },
        tenant?.id || '',
      );
      setAdmissions(response.data.data || []);
      setTotalPages(response.data.meta?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch IPD admissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await ipdService.getStats(tenant?.id || '');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admission?')) {
      return;
    }

    try {
      await ipdService.remove(id, tenant?.id || '');
      fetchAdmissions();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete admission:', error);
      alert('Failed to delete admission');
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
      case 'ADMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'UNDER_TREATMENT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DISCHARGED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
              <Bed className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                IPD Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Inpatient Department Admissions
              </p>
            </div>
          </div>
          <Link href="/dashboard/ipd/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Admission
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Admissions</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admitted</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.admitted}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under Treatment</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.underTreatment}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Discharged</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.discharged}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserX className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by patient name, ID, or reason..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Admissions List */}
      <Card>
        <CardHeader>
          <CardTitle>IPD Admissions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading admissions...</p>
            </div>
          ) : admissions.length === 0 ? (
            <div className="text-center py-12">
              <Bed className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No admissions found</h3>
              <p className="text-gray-600 mb-6">
                {search ? 'Try a different search term' : 'Create your first IPD admission'}
              </p>
              <Link href="/dashboard/ipd/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Admission
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admission Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room/Bed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {admissions.map((admission) => (
                      <tr key={admission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {admission.patient.firstName} {admission.patient.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {admission.patient.patientId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Dr. {admission.doctor.user.firstName} {admission.doctor.user.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {admission.department?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(admission.admissionDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {admission.roomNumber && admission.bedNumber
                            ? `${admission.roomNumber}/${admission.bedNumber}`
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              admission.status
                            )}`}
                          >
                            {admission.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/dashboard/ipd/${admission.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/ipd/${admission.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(admission.id)}
                            >
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
                {admissions.map((admission) => (
                  <Card key={admission.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {admission.patient.firstName} {admission.patient.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{admission.patient.patientId}</p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            admission.status
                          )}`}
                        >
                          {admission.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Doctor:</span>
                          <span className="text-gray-900">
                            Dr. {admission.doctor.user.firstName} {admission.doctor.user.lastName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span className="text-gray-900">{admission.department?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Admission:</span>
                          <span className="text-gray-900">{formatDate(admission.admissionDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Room/Bed:</span>
                          <span className="text-gray-900">
                            {admission.roomNumber && admission.bedNumber
                              ? `${admission.roomNumber}/${admission.bedNumber}`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/ipd/${admission.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/dashboard/ipd/${admission.id}/edit`} className="flex-1">
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
