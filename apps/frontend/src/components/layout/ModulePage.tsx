import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ModulePageProps {
  title: string;
  children: React.ReactNode;
}

export function ModulePage({ title, children }: ModulePageProps) {
  return (
    <div className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Back to Dashboard Link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {children}
      </div>
    </div>
  );
}
