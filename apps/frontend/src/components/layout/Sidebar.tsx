'use client';

import { useState } from 'react';
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
  Menu,
  X,
  Siren,
  Scissors,
  Scan,
  DollarSign,
  Package,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: UserCog, label: 'Staff', href: '/dashboard/staff' },
  { icon: Building2, label: 'Departments', href: '/dashboard/departments' },
  { icon: Users, label: 'Patients', href: '/dashboard/patients' },
  { icon: Calendar, label: 'Appointments', href: '/dashboard/appointments' },
  { icon: Stethoscope, label: 'OPD', href: '/dashboard/opd' },
  { icon: Bed, label: 'IPD', href: '/dashboard/ipd' },
  { icon: Siren, label: 'Emergency', href: '/dashboard/emergency' },
  { icon: Scissors, label: 'Surgery', href: '/dashboard/surgery' },
  { icon: Pill, label: 'Pharmacy', href: '/dashboard/pharmacy' },
  { icon: FlaskConical, label: 'Laboratory', href: '/dashboard/lab-entries' },
  { icon: Package, label: 'Inventory', href: '/dashboard/inventory' },
  { icon: Scan, label: 'Radiology', href: '/dashboard/radiology' },
  { icon: Receipt, label: 'Billing', href: '/dashboard/billing' },
  { icon: Shield, label: 'Insurance', href: '/dashboard/insurance' },
  { icon: DollarSign, label: 'Finance', href: '/dashboard/finance' },
  { icon: BarChart3, label: 'Reports', href: '/dashboard/reports' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-800">
          <span className="text-2xl mr-2">🩺</span>
          <span className="text-xl font-bold">HMS</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto h-[calc(100vh-8rem)]">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center px-4 py-3 rounded-lg transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="ml-3 font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-900">
          <p className="text-xs text-gray-400 text-center">
            © 2024 HMS
          </p>
        </div>
      </div>
    </>
  );
}
