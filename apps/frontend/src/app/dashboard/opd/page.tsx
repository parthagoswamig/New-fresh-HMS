import { ModulePage } from '@/components/layout/ModulePage';
import { Stethoscope } from 'lucide-react';

export default function OpdPage() {
  return (
    <ModulePage
      icon={Stethoscope}
      title="OPD"
      description="Manage outpatient department and consultations"
    />
  );
}
