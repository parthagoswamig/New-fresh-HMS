import { ModulePage } from '@/components/layout/ModulePage';
import { Calendar } from 'lucide-react';

export default function AppointmentsPage() {
  return (
    <ModulePage
      icon={Calendar}
      title="Appointments"
      description="Schedule and manage patient appointments with doctors"
    />
  );
}
