import { ModulePage } from '@/components/layout/ModulePage';
import { DollarSign } from 'lucide-react';

export default function FinancePage() {
  return (
    <ModulePage
      icon={DollarSign}
      title="Finance"
      description="Manage accounts, expenses, revenue, and financial reports"
    />
  );
}
