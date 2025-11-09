'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { emergencyService, EmergencyCase, EmergencyStatus, EmergencySeverity } from '@/services/emergency.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Siren, Plus, Search, AlertCircle, Activity, UserCheck, Users } from 'lucide-react';
import Link from 'next/link';

const STATUS_COLORS: Record<EmergencyStatus, string> = {
  WAITING: 'bg-yellow-100 text-yellow-800',
  UNDER_TREATMENT: 'bg-blue-100 text-blue-800',
  ADMITTED: 'bg-purple-100 text-purple-800',
  TRANSFERRED: 'bg-indigo-100 text-indigo-800',
  DISCHARGED: 'bg-green-100 text-green-800',
  DECEASED: 'bg-gray-100 text-gray-800',
};

const SEVERITY_COLORS: Record<EmergencySeverity, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  SERIOUS: 'bg-orange-100 text-orange-800 border-orange-300',
  MODERATE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  STABLE: 'bg-green-100 text-green-800 border-green-300',
};

export default function EmergencyPage() {
  const router = useRouter();
  const { tenant } = useAuthStore();
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EmergencyStatus | ''>('');
  const [severityFilter, setSeverityFilter] = useState<EmergencySeverity | ''>('');
  const [stats, setStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (tenant?.id) {
      fetchData();
      fetchStats();
    }
  }, [tenant, page, statusFilter, severityFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await emergencyService.list(
        {
          page,
          limit: 10,
          search,
          status: statusFilter || undefined,
          severity: severityFilter || undefined,
        },
        tenant?.id || '',
      );
      setCases(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (error) {
      console.error('Error fetching emergency cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await emergencyService.getStats(tenant?.id || '');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Siren className="h-8 w-8 text-red-600" />
            Emergency Department
          </h1>
          <p className="text-gray-600 mt-1">Manage emergency cases and triage</p>
        </div>
        <Link
          href="/dashboard/emergency/new"
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          New Emergency Case
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Waiting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.waiting}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Under Treatment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.underTreatment}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Mortality Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.mortalityRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by number, name, complaint..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as EmergencyStatus | '');
                setPage(1);
              }}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="WAITING">Waiting</option>
              <option value="UNDER_TREATMENT">Under Treatment</option>
              <option value="ADMITTED">Admitted</option>
              <option value="TRANSFERRED">Transferred</option>
              <option value="DISCHARGED">Discharged</option>
              <option value="DECEASED">Deceased</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value as EmergencySeverity | '');
                setPage(1);
              }}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Severity</option>
              <option value="CRITICAL">Critical</option>
              <option value="SERIOUS">Serious</option>
              <option value="MODERATE">Moderate</option>
              <option value="STABLE">Stable</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Cases</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : cases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No emergency cases found</div>
          ) : (
            <div className="space-y-4">
              {cases.map((emergencyCase) => (
                <div
                  key={emergencyCase.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/dashboard/emergency/${emergencyCase.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-lg">{emergencyCase.emergencyNumber}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${SEVERITY_COLORS[emergencyCase.severity]}`}>
                          {emergencyCase.severity}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[emergencyCase.status]}`}>
                          {emergencyCase.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Patient:</span>{' '}
                          <span className="font-medium">
                            {emergencyCase.patient
                              ? `${emergencyCase.patient.firstName} ${emergencyCase.patient.lastName}`
                              : emergencyCase.quickName || 'Unknown'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Arrival:</span>{' '}
                          <span className="font-medium">{new Date(emergencyCase.arrivalTime).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Chief Complaint:</span>{' '}
                          <span className="font-medium">{emergencyCase.chiefComplaint}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Arrival Mode:</span>{' '}
                          <span className="font-medium">{emergencyCase.arrivalMode}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
