import { ModulePage } from '@/components/layout/ModulePage';
import { FlaskConical } from 'lucide-react';

export default function LaboratoryPage() {
  return (
    <ModulePage
      icon={FlaskConical}
      title="Laboratory"
      description="Manage lab tests, results, and reports"
    />
  );
}
