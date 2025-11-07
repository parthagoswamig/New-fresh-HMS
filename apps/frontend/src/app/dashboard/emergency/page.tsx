import { ModulePage } from '@/components/layout/ModulePage';
import { Siren } from 'lucide-react';

export default function EmergencyPage() {
  return (
    <ModulePage
      icon={Siren}
      title="Emergency"
      description="Manage emergency cases, triage, and critical care"
    />
  );
}
