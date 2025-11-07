'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Heart,
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Bed,
  Pill,
  FlaskConical,
  Receipt,
  Shield,
  UserCog,
  Settings,
  BarChart3,
  Building2,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: UserCog, label: 'Staff Management', href: '/dashboard/staff' },
  { icon: Stethoscope, label: 'OPD', href: '/dashboard/opd' },
  { icon: Bed, label: 'IPD', href: '/dashboard/ipd' },
  { icon: Pill, label: 'Pharmacy', href: '/dashboard/pharmacy' },
  { icon: Calendar, label: 'Appointments', href: '/dashboard/appointments' },
  { icon: Users, label: 'Patients', href: '/dashboard/patients' },
  { icon: Building2, label: 'Inventory', href: '/dashboard/inventory' },
  { icon: Receipt, label: 'Billing', href: '/dashboard/billing' },
  { icon: BarChart3, label: 'Reports', href: '/dashboard/reports' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-800">
        <span className="text-2xl mr-2">🩺</span>
        <span className="text-xl font-bold">HMS Dashboard</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="ml-3 font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-400 text-center">
          © 2024 CareStack
        </p>
      </div>
    </div>
  );
}
