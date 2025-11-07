'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  const modules = [
    { name: 'Patients', icon: '👥', href: '/dashboard/patients', color: 'bg-blue-500' },
    { name: 'Appointments', icon: '📅', href: '/dashboard/appointments', color: 'bg-green-500' },
    { name: 'OPD', icon: '🏥', href: '/dashboard/opd', color: 'bg-purple-500' },
    { name: 'IPD', icon: '🛏️', href: '/dashboard/ipd', color: 'bg-indigo-500' },
    { name: 'Staff', icon: '👨‍⚕️', href: '/dashboard/staff', color: 'bg-teal-500' },
    { name: 'Pharmacy', icon: '💊', href: '/dashboard/pharmacy', color: 'bg-pink-500' },
    { name: 'Laboratory', icon: '🔬', href: '/dashboard/laboratory', color: 'bg-yellow-500' },
    { name: 'Billing', icon: '💰', href: '/dashboard/billing', color: 'bg-orange-500' },
    { name: 'Insurance', icon: '🛡️', href: '/dashboard/insurance', color: 'bg-red-500' },
    { name: 'Reports', icon: '📊', href: '/dashboard/reports', color: 'bg-gray-500' },
    { name: 'Settings', icon: '⚙️', href: '/dashboard/settings', color: 'bg-slate-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">HMS SaaS Dashboard</h1>
            <p className="text-sm text-gray-600">
              Welcome, {user.firstName} {user.lastName} ({user.role})
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Total Patients</div>
            <div className="text-3xl font-bold text-gray-900">1,234</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Today's Appointments</div>
            <div className="text-3xl font-bold text-gray-900">45</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Active Staff</div>
            <div className="text-3xl font-bold text-gray-900">87</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Revenue (Month)</div>
            <div className="text-3xl font-bold text-gray-900">$45.2K</div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {modules.map((module) => (
              <a
                key={module.name}
                href={module.href}
                className="flex flex-col items-center justify-center p-6 rounded-lg hover:bg-gray-50 transition border border-gray-200"
              >
                <div className={`${module.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2`}>
                  {module.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{module.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">New patient registered</p>
                <p className="text-sm text-gray-500">John Doe - 2 minutes ago</p>
              </div>
              <span className="text-green-600 text-sm">✓ Completed</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Appointment scheduled</p>
                <p className="text-sm text-gray-500">Dr. Smith - 15 minutes ago</p>
              </div>
              <span className="text-blue-600 text-sm">⏰ Scheduled</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Lab report uploaded</p>
                <p className="text-sm text-gray-500">Patient ID: 12345 - 1 hour ago</p>
              </div>
              <span className="text-purple-600 text-sm">📄 Report</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
