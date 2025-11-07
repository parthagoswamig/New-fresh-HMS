import { ModulePage } from '@/components/layout/ModulePage';
import { Scan } from 'lucide-react';

export default function RadiologyPage() {
  return (
    <ModulePage
      icon={Scan}
      title="Radiology"
      description="Manage X-rays, CT scans, MRI, and imaging reports"
    />
  );
}
