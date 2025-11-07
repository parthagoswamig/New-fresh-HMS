import { ModulePage } from '@/components/layout/ModulePage';
import { Bed } from 'lucide-react';

export default function IpdPage() {
  return (
    <ModulePage
      icon={Bed}
      title="IPD"
      description="Manage inpatient department and bed allocation"
    />
  );
}
