'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { ProfessionalInvoice } from '@/components/billing/ProfessionalInvoice';
import { billingService } from '@/services/billing.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';

export default function BillPrintPage() {
  const params = useParams();
  const router = useRouter();
  const { tenant } = useAuthStore();
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id && tenant?.id) {
      fetchBill();
    }
  }, [params.id, tenant]);

  const fetchBill = async () => {
    try {
      setLoading(true);
      const response = await billingService.getById(params.id as string, tenant?.id || '');
      setBill(response.data);
    } catch (error) {
      console.error('Failed to fetch bill:', error);
      alert('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice_${bill?.billNumber || 'Bill'}`,
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
        <div className="text-center py-8">Loading invoice...</div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Invoice not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Action Bar - Hidden on print */}
      <div className="bg-white border-b px-6 py-4 print:hidden">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href={`/dashboard/billing/${bill.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoice
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="py-8">
        <ProfessionalInvoice
          ref={componentRef}
          bill={bill}
          hospital={{
            name: tenant?.name || 'Hospital Management System',
            address: '123 Medical Street, Healthcare City, State - 123456',
            phone: '+91 1234567890',
            email: 'billing@hospital.com',
            registrationNo: 'REG/2024/12345',
            taxId: '29ABCDE1234F1Z5',
          }}
        />
      </div>
    </div>
  );
}
