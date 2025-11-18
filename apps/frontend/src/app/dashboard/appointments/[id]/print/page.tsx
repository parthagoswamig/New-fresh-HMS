'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { ProfessionalPrescription } from '@/components/appointments/ProfessionalPrescription';
import { appointmentService } from '@/services/appointments.service';
import { prescriptionService } from '@/services/prescriptions.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';

export default function AppointmentPrintPage() {
  const params = useParams();
  const { tenant } = useAuthStore();
  const [appointment, setAppointment] = useState<any>(null);
  const [prescription, setPrescription] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id && tenant?.id) {
      fetchAppointment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, tenant?.id]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getById(params.id as string, tenant?.id || '');
      const data = response.data;
      setAppointment(data);
      await fetchPrescription(data.id);
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
      alert('Failed to load appointment');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescription = async (appointmentId: string) => {
    try {
      setPrescriptionLoading(true);
      const response = await prescriptionService.getByAppointment(
        appointmentId,
        tenant?.id || '',
      );
      setPrescription(response.data);
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error('Failed to fetch prescription:', error);
      }
      setPrescription(null);
    } finally {
      setPrescriptionLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Prescription_${appointment?.patient?.patientId || 'Appointment'}`,
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
        <div className="text-center py-8">Loading prescription...</div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Appointment not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Action Bar - Hidden on print */}
      <div className="bg-white border-b px-6 py-4 print:hidden">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href={`/dashboard/appointments/${appointment.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Appointment
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Prescription
            </Button>
          </div>
        </div>
      </div>

      {/* Prescription Preview */}
      <div className="py-8">
        <ProfessionalPrescription
          ref={componentRef}
          appointment={appointment}
          prescription={prescription}
          hospital={{
            name: tenant?.name || 'Hospital Management System',
            address: '123 Medical Street, Healthcare City, State - 123456',
            phone: '+91 1234567890',
            email: 'info@hospital.com',
          }}
        />
      </div>
    </div>
  );
}
