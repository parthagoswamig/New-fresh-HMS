'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { emergencyService } from '@/services/emergency.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Users, AlertTriangle, Activity } from 'lucide-react';
import Link from 'next/link';

export default function EmergencyAnalyticsPage() {
  const { tenant } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (tenant?.id) {
      fetchStats();
    }
  }, [tenant]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await emergencyService.getStats(
        tenant?.id || '',
        dateRange.startDate || undefined,
        dateRange.endDate || undefined,
      );
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    fetchStats();
  };

  if (loading) {
    return <div className="p-6 text-center">Loading analytics...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/emergency"
          className="text-red-600 hover:text-red-700 flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Emergency
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-red-600" />
          Emergency Analytics
        </h1>
        <p className="text-gray-600 mt-1">Emergency department performance metrics</p>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="border rounded-lg px-4 py-2"
              />
            </div>
            <button
              onClick={handleDateFilter}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Apply Filter
            </button>
            <button
              onClick={() => {
                setDateRange({ startDate: '', endDate: '' });
                setTimeout(fetchStats, 100);
              }}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Cases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Under Treatment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.underTreatment}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Mortality Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.mortalityRate}%</div>
                <p className="text-xs text-gray-500 mt-1">{stats.deceased} deaths</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Treatment Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.avgTreatmentTime}</div>
                <p className="text-xs text-gray-500 mt-1">minutes</p>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="text-sm text-gray-600">Waiting</div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.waiting}</div>
                  <div className="text-xs text-gray-500">
                    {stats.total > 0 ? ((stats.waiting / stats.total) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-600">Under Treatment</div>
                  <div className="text-2xl font-bold text-blue-600">{stats.underTreatment}</div>
                  <div className="text-xs text-gray-500">
                    {stats.total > 0 ? ((stats.underTreatment / stats.total) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-sm text-gray-600">Admitted</div>
                  <div className="text-2xl font-bold text-purple-600">{stats.admitted}</div>
                  <div className="text-xs text-gray-500">
                    {stats.total > 0 ? ((stats.admitted / stats.total) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <div className="text-sm text-gray-600">Transferred</div>
                  <div className="text-2xl font-bold text-indigo-600">{stats.transferred}</div>
                  <div className="text-xs text-gray-500">
                    {stats.total > 0 ? ((stats.transferred / stats.total) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-sm text-gray-600">Discharged</div>
                  <div className="text-2xl font-bold text-green-600">{stats.discharged}</div>
                  <div className="text-xs text-gray-500">
                    {stats.total > 0 ? ((stats.discharged / stats.total) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600">Deceased</div>
                  <div className="text-2xl font-bold text-gray-600">{stats.deceased}</div>
                  <div className="text-xs text-gray-500">
                    {stats.total > 0 ? ((stats.deceased / stats.total) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Severity Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Cases by Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.bySeverity.map((item: any) => (
                  <div
                    key={item.severity}
                    className={`p-4 rounded-lg border-2 ${
                      item.severity === 'CRITICAL'
                        ? 'bg-red-50 border-red-300'
                        : item.severity === 'SERIOUS'
                        ? 'bg-orange-50 border-orange-300'
                        : item.severity === 'MODERATE'
                        ? 'bg-yellow-50 border-yellow-300'
                        : 'bg-green-50 border-green-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-700">{item.severity}</div>
                    <div className="text-3xl font-bold mt-2">{item.count}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.total > 0 ? ((item.count / stats.total) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Arrival Mode Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Cases by Arrival Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {stats.byArrivalMode.map((item: any) => (
                  <div key={item.mode} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="text-sm font-medium text-gray-700">{item.mode.replace('_', ' ')}</div>
                    <div className="text-2xl font-bold mt-2">{item.count}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.total > 0 ? ((item.count / stats.total) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Total Emergency Cases</span>
                  <span className="text-xl font-bold">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Active Cases</span>
                  <span className="text-xl font-bold text-blue-600">
                    {stats.waiting + stats.underTreatment}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Completed Cases</span>
                  <span className="text-xl font-bold text-green-600">
                    {stats.discharged + stats.admitted + stats.transferred}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Treatment Time</span>
                  <span className="text-xl font-bold text-purple-600">{stats.avgTreatmentTime} min</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Critical Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Mortality Rate</span>
                  <span className="text-xl font-bold text-red-600">{stats.mortalityRate}%</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Total Deaths</span>
                  <span className="text-xl font-bold">{stats.deceased}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Critical Cases</span>
                  <span className="text-xl font-bold text-red-600">
                    {stats.bySeverity.find((s: any) => s.severity === 'CRITICAL')?.count || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Admission Rate</span>
                  <span className="text-xl font-bold text-purple-600">
                    {stats.total > 0 ? ((stats.admitted / stats.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
