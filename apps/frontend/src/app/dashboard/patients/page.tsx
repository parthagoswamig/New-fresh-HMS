import { ModulePage } from '@/components/layout/ModulePage';
import { Users } from 'lucide-react';

export default function PatientsPage() {
  return (
    <ModulePage
      icon={Users}
      title="Patients"
      description="Manage patient records, medical history, and demographics"
    />
  );
}
