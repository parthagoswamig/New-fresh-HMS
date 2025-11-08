'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { LabReportPrint } from '@/components/lab/LabReportPrint';
import { labEntryService } from '@/services/lab-entry.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';

export default function PrintLabReportPage() {
  const params = useParams();
  const router = useRouter();
  const { tenant } = useAuthStore();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id && tenant?.id) {
      fetchEntry();
    }
  }, [params.id, tenant]);

  const fetchEntry = async () => {
    try {
      setLoading(true);
      const response = await labEntryService.getPrintData(
        params.id as string,
        tenant?.id || ''
      );
      setEntry(response.data);
    } catch (error) {
      console.error('Failed to fetch entry:', error);
      alert('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Lab_Report_${entry?.entryNumber || 'Report'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
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
    // For now, just trigger print - user can save as PDF
    // In production, you might want to use a library like jsPDF or html2pdf
    handlePrint();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading report...</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Report not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Action Bar - Hidden on print */}
      <div className="bg-white border-b px-6 py-4 print:hidden">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href={`/dashboard/lab-entries/${entry.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Order
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </Button>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="py-8">
        <LabReportPrint
          ref={componentRef}
          entry={entry}
          hospital={{
            name: tenant?.name || 'Hospital Management System',
            address: '123 Medical Street, Healthcare City',
            phone: '+91 1234567890',
            email: 'lab@hospital.com',
          }}
        />
      </div>
    </div>
  );
}
