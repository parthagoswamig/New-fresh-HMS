import { ModulePage } from '@/components/layout/ModulePage';
import { Pill } from 'lucide-react';

export default function PharmacyPage() {
  return (
    <ModulePage
      icon={Pill}
      title="Pharmacy"
      description="Manage medicines, prescriptions, and inventory"
    />
  );
}
