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
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    {
      title: 'Total Patients',
      value: '1,234',
      change: '+12.5%',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Appointments Today',
      value: '56',
      change: '+8.2%',
      icon: Calendar,
      color: 'green',
    },
    {
      title: 'OPD Visits',
      value: '234',
      change: '+15.3%',
      icon: Stethoscope,
      color: 'purple',
    },
    {
      title: 'IPD Admissions',
      value: '45',
      change: '-2.4%',
      icon: Bed,
      color: 'orange',
    },
    {
      title: 'Pending Bills',
      value: '$12,450',
      change: '+5.1%',
      icon: Receipt,
      color: 'red',
    },
    {
      title: 'Revenue (MTD)',
      value: '$89,234',
      change: '+18.7%',
      icon: TrendingUp,
      color: 'indigo',
    },
  ];

  const recentActivities = [
    {
      action: 'New patient registered',
      user: 'Dr. Sarah Johnson',
      time: '5 minutes ago',
    },
    {
      action: 'Appointment scheduled',
      user: 'Receptionist',
      time: '12 minutes ago',
    },
    {
      action: 'Lab report generated',
      user: 'Lab Technician',
      time: '25 minutes ago',
    },
    {
      action: 'Prescription created',
      user: 'Dr. Michael Chen',
      time: '1 hour ago',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your hospital today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                        <p
                          className={`text-sm mt-2 ${
                            stat.change.startsWith('+')
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {stat.change} from last month
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 pb-4 border-b last:border-0"
                    >
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          by {activity.user}
                        </p>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  ))}
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
                    { label: 'New Patient', icon: Users },
                    { label: 'Schedule Appointment', icon: Calendar },
                    { label: 'Create Bill', icon: Receipt },
                    { label: 'Lab Test', icon: Activity },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
        </div>
  );
}
