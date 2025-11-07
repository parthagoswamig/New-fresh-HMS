import { ModulePage } from '@/components/layout/ModulePage';
import { Scissors } from 'lucide-react';

export default function SurgeryPage() {
  return (
    <ModulePage
      icon={Scissors}
      title="Surgery"
      description="Manage surgical procedures, OT scheduling, and post-op care"
    />
  );
}
