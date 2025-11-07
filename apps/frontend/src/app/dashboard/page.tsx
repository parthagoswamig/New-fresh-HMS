'use client';

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
} from 'lucide-react';

export default function DashboardPage() {
  const { user, tenant } = useAuthStore();

  const stats = [
    {
      title: 'Total Patients',
      value: '0',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Appointments Today',
      value: '0',
      icon: Calendar,
      color: 'green',
    },
    {
      title: 'OPD Visits',
      value: '0',
      icon: Stethoscope,
      color: 'purple',
    },
    {
      title: 'IPD Admissions',
      value: '0',
      icon: Bed,
      color: 'orange',
    },
    {
      title: 'Pending Bills',
      value: '$0',
      icon: Receipt,
      color: 'red',
    },
    {
      title: 'Revenue (MTD)',
      value: '$0',
      icon: TrendingUp,
      color: 'indigo',
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
        {stats.map((stat) => {
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
                  <div className={`w-12 h-12 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">No recent activity</p>
              <p className="text-sm text-gray-500 mt-2">
                Activity will appear here as you use the system
              </p>
            </div>
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
