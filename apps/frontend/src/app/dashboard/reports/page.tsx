import { ModulePage } from '@/components/layout/ModulePage';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <ModulePage
      icon={BarChart3}
      title="Reports"
      description="Generate and view analytics, statistics, and reports"
    />
  );
}
