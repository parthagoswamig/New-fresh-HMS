import { ModulePage } from '@/components/layout/ModulePage';
import { Receipt } from 'lucide-react';

export default function BillingPage() {
  return (
    <ModulePage
      icon={Receipt}
      title="Billing"
      description="Manage invoices, payments, and billing records"
    />
  );
}
