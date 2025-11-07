import { ModulePage } from '@/components/layout/ModulePage';
import { UserCog } from 'lucide-react';

export default function StaffPage() {
  return (
    <ModulePage
      icon={UserCog}
      title="Staff Management"
      description="Manage doctors, nurses, and hospital staff"
    />
  );
}
