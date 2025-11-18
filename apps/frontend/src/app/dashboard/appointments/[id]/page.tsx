'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Stethoscope,
  Calendar,
  Clock,
  FileText,
  Plus,
} from 'lucide-react';
import { appointmentService } from '@/services/appointments.service';
import { pharmacyService } from '@/services/pharmacy.service';
import { prescriptionService } from '@/services/prescriptions.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { tenant } = useAuthStore();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [prescription, setPrescription] = useState<any | null>(null);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [items, setItems] = useState<any[]>([
    {
      medicineId: '',
      medicineSearch: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 1,
    },
  ]);
  const [activeMedicineIndex, setActiveMedicineIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchAppointment();
  }, []);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getById(params.id as string, tenant?.id || '');
      const data = response.data;
      setAppointment(data);
      await fetchPrescription(data.id);
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
      alert('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await pharmacyService.list({ page: 1, limit: 1000 }, tenant?.id || '');
      setMedicines(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
    }
  };

  const fetchPrescription = async (appointmentId: string) => {
    try {
      setPrescriptionLoading(true);
      const response = await prescriptionService.getByAppointment(
        appointmentId,
        tenant?.id || '',
      );
      const rx = response.data;
      setPrescription(rx);
      setPrescriptionNotes(rx.notes || '');
      if (rx.items && Array.isArray(rx.items) && rx.items.length > 0) {
        setItems(
          rx.items.map((item: any) => ({
            medicineId: item.medicineId,
            medicineSearch: item.medicine?.name || '',
            dosage: item.dosage || '',
            frequency: item.frequency || '',
            duration: item.duration || '',
            instructions: item.instructions || '',
            quantity: item.quantity || 1,
          })),
        );
      }
    } catch (error: any) {
      setPrescription(null);
      setPrescriptionNotes('');
      setItems([
        {
          medicineId: '',
          medicineSearch: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
          quantity: 1,
        },
      ]);
    } finally {
      setPrescriptionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      await appointmentService.remove(params.id as string, tenant?.id || '');
      router.push('/dashboard/appointments');
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      alert('Failed to delete appointment');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilteredMedicines = (searchTerm: string) => {
    if (!searchTerm?.trim()) {
      return medicines.slice(0, 50);
    }

    const term = searchTerm.toLowerCase();

    return medicines
      .filter((medicine) => {
        const nameMatch = medicine.name?.toLowerCase().includes(term);
        const brandMatch = medicine.brand?.toLowerCase().includes(term);
        const genericMatch = medicine.genericName?.toLowerCase().includes(term);
        const batchMatch = medicine.batchNumber?.toLowerCase().includes(term);
        return nameMatch || brandMatch || genericMatch || batchMatch;
      })
      .slice(0, 50);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'quantity' ? (parseInt(value, 10) || 0) : value,
    };
    setItems(newItems);
  };

  const handleSelectMedicine = (index: number, medicine: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      medicineId: medicine.id,
      medicineSearch: medicine.name,
    };
    setItems(newItems);
    setActiveMedicineIndex(null);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        medicineId: '',
        medicineSearch: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        quantity: 1,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSavePrescription = async () => {
    if (!appointment) return;

    const validItems = items.filter(
      (item) => item.medicineId && item.dosage && item.frequency && item.duration && item.quantity > 0,
    );

    if (validItems.length === 0) {
      alert('Please add at least one medicine with all details');
      return;
    }

    try {
      setSavingPrescription(true);
      const payload = {
        notes: prescriptionNotes || undefined,
        items: validItems.map((item) => ({
          medicineId: item.medicineId,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions || undefined,
          quantity: item.quantity,
        })),
      };

      const response = await prescriptionService.upsertForAppointment(
        appointment.id,
        payload,
        tenant?.id || '',
      );
      setPrescription(response.data);
      alert('Prescription saved successfully');
    } catch (error) {
      console.error('Failed to save prescription:', error);
      alert('Failed to save prescription');
    } finally {
      setSavingPrescription(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="text-gray-600 mt-4">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Appointment not found</h3>
          <Link href="/dashboard/appointments">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Appointments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/appointments">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Appointments
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Appointment Details
            </h1>
            <p className="text-gray-600 mt-1">
              {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                appointment.status
              )}`}
            >
              {appointment.status}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link href={`/dashboard/appointments/${appointment.id}/edit`}>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </Link>
        <Link href={`/dashboard/appointments/${appointment.id}/print`}>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Print Prescription
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={handleDelete}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.patient.firstName} {appointment.patient.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patient ID</p>
              <p className="text-base font-medium text-gray-900">{appointment.patient.patientId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.patient.phone || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.patient.email || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.patient.gender || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Prescription */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Prescription
              </span>
              {prescriptionLoading && (
                <span className="text-xs text-gray-500">Loading...</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start border border-gray-100 rounded-lg p-3"
                >
                  <div className="md:col-span-4">
                    <p className="text-xs text-gray-600 mb-1">Medicine</p>
                    <div className="relative">
                      <Input
                        value={item.medicineSearch}
                        onChange={(e) => {
                          handleItemChange(index, 'medicineSearch', e.target.value);
                          setActiveMedicineIndex(index);
                        }}
                        onFocus={() => setActiveMedicineIndex(index)}
                        placeholder="Type medicine name, brand, generic, batch..."
                        autoComplete="off"
                      />
                      {activeMedicineIndex === index && (
                        <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg">
                          {getFilteredMedicines(item.medicineSearch || '').length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">No medicines found</div>
                          ) : (
                            getFilteredMedicines(item.medicineSearch || '').map((medicine: any) => (
                              <button
                                type="button"
                                key={medicine.id}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex justify-between items-center"
                                onClick={() => handleSelectMedicine(index, medicine)}
                              >
                                <div>
                                  <div className="font-medium text-gray-900">{medicine.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {medicine.brand && <span>{medicine.brand}</span>}
                                    {medicine.genericName && (
                                      <span>
                                        {medicine.brand ? ' · ' : ''}
                                        {medicine.genericName}
                                      </span>
                                    )}
                                    {medicine.batchNumber && (
                                      <span> · Batch: {medicine.batchNumber}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 text-right">
                                  <div>Stock: {medicine.quantity}</div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-600 mb-1">Dose</p>
                    <Input
                      value={item.dosage}
                      onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                      placeholder="e.g. 500mg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-600 mb-1">Frequency</p>
                    <Input
                      value={item.frequency}
                      onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                      placeholder="e.g. 1-0-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-600 mb-1">Duration</p>
                    <Input
                      value={item.duration}
                      onChange={(e) => handleItemChange(index, 'duration', e.target.value)}
                      placeholder="e.g. 5 days"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <p className="text-xs text-gray-600 mb-1">Qty</p>
                    <Input
                      type="number"
                      min={0}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="text-red-600"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="md:col-span-12">
                    <p className="text-xs text-gray-600 mb-1">Instructions</p>
                    <Textarea
                      rows={2}
                      value={item.instructions}
                      onChange={(e) => handleItemChange(index, 'instructions', e.target.value)}
                      placeholder="Any special instructions for this medicine"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                Add Medicine
              </Button>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Prescription Notes</p>
              <Textarea
                rows={3}
                value={prescriptionNotes}
                onChange={(e) => setPrescriptionNotes(e.target.value)}
                placeholder="Additional notes or advice related to this prescription"
              />
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={handleSavePrescription} disabled={savingPrescription}>
                {savingPrescription ? 'Saving...' : 'Save Prescription'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Stethoscope className="w-5 h-5 mr-2" />
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-base font-medium text-gray-900">
                Dr. {appointment.doctor.user.firstName} {appointment.doctor.user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.doctor.department?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.doctor.user.phone || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.doctor.user.email || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="text-base font-medium text-gray-900">
                {formatDate(appointment.appointmentDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="text-base font-medium text-gray-900">{appointment.appointmentTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  appointment.status
                )}`}
              >
                {appointment.status}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Reason for Visit</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.reason || 'Not specified'}
              </p>
            </div>
            {appointment.notes && (
              <div>
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-base font-medium text-gray-900 whitespace-pre-wrap">
                  {appointment.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600">
              <p>
                <span className="font-medium">Created:</span>{' '}
                {formatDateTime(appointment.createdAt)}
              </p>
              <p>
                <span className="font-medium">Last Updated:</span>{' '}
                {formatDateTime(appointment.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
