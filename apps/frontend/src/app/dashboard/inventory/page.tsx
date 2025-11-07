import { ModulePage } from '@/components/layout/ModulePage';
import { Building2 } from 'lucide-react';

export default function InventoryPage() {
  return (
    <ModulePage
      icon={Building2}
      title="Inventory"
      description="Manage hospital supplies, equipment, and stock levels"
    />
  );
}
