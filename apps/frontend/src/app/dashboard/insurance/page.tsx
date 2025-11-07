import { ModulePage } from '@/components/layout/ModulePage';
import { Shield } from 'lucide-react';

export default function InsurancePage() {
  return (
    <ModulePage
      icon={Shield}
      title="Insurance"
      description="Manage insurance claims, policies, and approvals"
    />
  );
}
