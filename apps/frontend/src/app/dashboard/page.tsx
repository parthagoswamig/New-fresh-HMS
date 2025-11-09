'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Calendar,
  Stethoscope,
  Bed,
  Receipt,
  TrendingUp,
  Activity,
  FileText,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    if (tenant?.id) {
      fetchDashboardData();
    }
  }, [tenant]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activities] = await Promise.all([
        dashboardService.getStats(tenant?.id || ''),
        dashboardService.getRecentActivities(tenant?.id || '', 5),
      ]);
      setStats(statsData);
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    {
      title: 'Total Patients',
      value: loading ? '...' : (stats?.patients?.total || 0).toString(),
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: 'Appointments Today',
      value: loading ? '...' : (stats?.appointments?.today || 0).toString(),
      icon: Calendar,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'OPD Visits',
      value: loading ? '...' : (stats?.opd?.total || 0).toString(),
      icon: Stethoscope,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      title: 'IPD Admissions',
      value: loading ? '...' : (stats?.ipd?.active || 0).toString(),
      icon: Bed,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
    },
    {
      title: 'Pending Bills',
      value: loading ? '...' : `₹${(stats?.billing?.pending || 0).toLocaleString()}`,
      icon: Receipt,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
    },
    {
      title: 'Revenue (MTD)',
      value: loading ? '...' : `₹${(stats?.billing?.revenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'indigo',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          {tenant?.name} - Dashboard Overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-b-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'appointment' ? 'bg-green-100' :
                      activity.type === 'bill' ? 'bg-blue-100' :
                      'bg-purple-100'
                    }`}>
                      {activity.type === 'appointment' && <Calendar className="w-5 h-5 text-green-600" />}
                      {activity.type === 'bill' && <Receipt className="w-5 h-5 text-blue-600" />}
                      {activity.type === 'lab' && <Activity className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type === 'appointment' && `Appointment: ${activity.patient?.firstName} ${activity.patient?.lastName}`}
                        {activity.type === 'bill' && `Bill: ${activity.billNumber}`}
                        {activity.type === 'lab' && `Lab: ${activity.entryNumber}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.date).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">No recent activity</p>
                <p className="text-sm text-gray-500 mt-2">
                  Activity will appear here as you use the system
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'New Patient', icon: Users, href: '/dashboard/patients' },
                { label: 'Schedule Appointment', icon: Calendar, href: '/dashboard/appointments' },
                { label: 'Create Bill', icon: Receipt, href: '/dashboard/billing' },
                { label: 'Lab Test', icon: Activity, href: '/dashboard/laboratory' },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => window.location.href = action.href}
                    className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border-2 border-transparent transition-all"
                  >
                    <Icon className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-blue-900">Add Staff Members</p>
                <p className="text-sm text-blue-700">Go to Staff module to add doctors, nurses, and other staff</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-blue-900">Register Patients</p>
                <p className="text-sm text-blue-700">Add patient records with their medical history</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-blue-900">Schedule Appointments</p>
                <p className="text-sm text-blue-700">Start booking appointments for your patients</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
