'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { ProfessionalDischargeReport } from '@/components/ipd/ProfessionalDischargeReport';
import { ipdService } from '@/services/ipd.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';

export default function DischargePrintPage() {
  const params = useParams();
  const router = useRouter();
  const { tenant } = useAuthStore();
  const [admission, setAdmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id && tenant?.id) {
      fetchAdmission();
    }
  }, [params.id, tenant]);

  const fetchAdmission = async () => {
    try {
      setLoading(true);
      const response = await ipdService.getById(params.id as string, tenant?.id || '');
      setAdmission(response.data);
    } catch (error) {
      console.error('Failed to fetch admission:', error);
      alert('Failed to load discharge summary');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Discharge_Summary_${admission?.patient?.patientId || 'Report'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });

  const handleDownloadPDF = () => {
    handlePrint();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading discharge summary...</div>
      </div>
    );
  }

  if (!admission) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Discharge summary not found</div>
      </div>
    );
  }

  if (admission.status !== 'DISCHARGED') {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-red-600 font-semibold">Patient has not been discharged yet.</p>
          <Link href={`/dashboard/ipd/${admission.id}`}>
            <Button className="mt-4">Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Action Bar - Hidden on print */}
      <div className="bg-white border-b px-6 py-4 print:hidden">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href={`/dashboard/ipd/${admission.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admission
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Summary
            </Button>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="py-8">
        <ProfessionalDischargeReport
          ref={componentRef}
          admission={admission}
          hospital={{
            name: tenant?.name || 'Hospital Management System',
            address: '123 Medical Street, Healthcare City',
            phone: '+91 1234567890',
            email: 'info@hospital.com',
            registrationNo: 'REG/2024/12345',
          }}
        />
      </div>
    </div>
  );
}
