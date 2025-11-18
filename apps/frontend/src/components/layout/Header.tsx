'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { LogOut, User, Bell, Menu } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { user, tenant, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 fixed top-0 right-0 left-0 lg:left-64 z-20">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Tenant Info - Mobile shows on right side of hamburger */}
        <div className="flex-1 lg:flex-none ml-14 lg:ml-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
            {tenant?.name || 'HMS'}
          </h2>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-pink-600 flex items-center justify-center text-white font-medium text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>

          {/* Logout (visible on mobile and desktop) */}
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
