'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { pharmacyService } from '@/services/pharmacy.service';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';

export default function SellMedicinePage() {
  const router = useRouter();
  const { tenant, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    paymentMethod: 'CASH',
    notes: '',
  });
  const [items, setItems] = useState([
    { medicineId: '', medicineSearch: '', quantity: 1, unitPrice: 0, discount: 0 },
  ]);

  const [lastSale, setLastSale] = useState<any | null>(null);
  const receiptRef = useRef<HTMLDivElement | null>(null);
  const [activeMedicineIndex, setActiveMedicineIndex] = useState<number | null>(null);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: lastSale?.invoiceNumber
      ? `Pharmacy_Bill_${lastSale.invoiceNumber}`
      : 'Pharmacy_Bill',
    pageStyle: `
      @page {
        size: A5;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (lastSale) {
      handlePrint();
    }
  }, [lastSale, handlePrint]);

  const fetchMedicines = async () => {
    try {
      const response = await pharmacyService.list(
        { page: 1, limit: 1000 },
        tenant?.id || '',
      );
      setMedicines(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
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

  const handleSelectMedicine = (index: number, medicine: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      medicineId: medicine.id,
      medicineSearch: medicine.name,
      unitPrice:
        medicine.sellingPrice || medicine.price || medicine.unitPrice || 0,
    };
    setItems(newItems);
    setActiveMedicineIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validItems = items.filter(
        (item) => item.medicineId && item.quantity > 0
      );

      if (validItems.length === 0) {
        alert('Please add at least one medicine');
        setLoading(false);
        return;
      }

      const payloadItems = validItems.map((item) => {
        const discountAmount = calculateItemDiscountAmount(item);
        return {
          medicineId: item.medicineId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          // backend receives final discount amount in currency
          discount: discountAmount,
        };
      });

      const payload = {
        ...formData,
        items: payloadItems,
        soldBy: user?.staff?.id || '',
      };

      const response = await apiClient.post('/pharmacy/sell', payload, {
        headers: { 'x-tenant-id': tenant?.id },
      });

      const saleItems = validItems.map((item) => {
        const medicine = medicines.find((m) => m.id === item.medicineId);
        const lineTotal = item.quantity * item.unitPrice;
        const discountAmount = calculateItemDiscountAmount(item);
        const netAmount = lineTotal - discountAmount;
        return {
          ...item,
          name: medicine?.name || 'Medicine',
          brand: medicine?.brand || '',
          batchNumber: medicine?.batchNumber || '',
          discountPercent: item.discount || 0,
          discountAmount,
          lineTotal,
          netAmount,
        };
      });

      const subtotal = saleItems.reduce(
        (sum, item) => sum + item.lineTotal,
        0,
      );
      const totalDiscount = saleItems.reduce(
        (sum, item) => sum + item.discountAmount,
        0,
      );
      const totalAmount = saleItems.reduce(
        (sum, item) => sum + item.netAmount,
        0,
      );

      setLastSale({
        id: response?.data?.id,
        invoiceNumber:
          response?.data?.invoiceNumber ||
          response?.data?.billNumber ||
          undefined,
        date: new Date().toISOString(),
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        items: saleItems,
        subtotal,
        totalDiscount,
        totalAmount,
      });

      alert('Medicine sold successfully! Printing bill...');

      setFormData({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        paymentMethod: 'CASH',
        notes: '',
      });
      setItems([
        { medicineId: '', medicineSearch: '', quantity: 1, unitPrice: 0, discount: 0 },
      ]);
    } catch (error: any) {
      console.error('Failed to sell medicine:', error);
      alert(error.response?.data?.message || 'Failed to sell medicine');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]:
        field === 'quantity' || field === 'unitPrice' || field === 'discount'
          ? parseFloat(value) || 0
          : value,
    };

    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { medicineId: '', medicineSearch: '', quantity: 1, unitPrice: 0, discount: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateItemDiscountAmount = (item: any) => {
    const lineTotal = item.quantity * item.unitPrice;
    const percent = item.discount || 0;
    return (lineTotal * percent) / 100;
  };

  const calculateItemTotal = (item: any) => {
    const lineTotal = item.quantity * item.unitPrice;
    const discountAmount = calculateItemDiscountAmount(item);
    return lineTotal - discountAmount;
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6">
        <Link href="/dashboard/pharmacy">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pharmacy
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-8 h-8 text-green-600" />
          Sell Medicine
        </h1>
        <p className="text-gray-600 mt-1">Direct medicine sale to customers</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="customerAddress">Address</Label>
                <Input
                  id="customerAddress"
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Medicine Items</CardTitle>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-12 md:col-span-4">
                    <Label htmlFor={`medicine-${index}`}>Medicine *</Label>
                    <div className="relative mt-1">
                      <Input
                        id={`medicine-${index}`}
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
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No medicines found
                            </div>
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
                                      <span>
                                        {' '}
                                        · Batch: {medicine.batchNumber}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 text-right">
                                  <div>Stock: {medicine.quantity}</div>
                                  {(medicine.sellingPrice || medicine.price) && (
                                    <div>
                                      ₹{(
                                        medicine.sellingPrice ||
                                        medicine.price
                                      ).toFixed(2)}
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <Label htmlFor={`qty-${index}`}>Quantity *</Label>
                    <Input
                      id={`qty-${index}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', e.target.value)
                      }
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <Label htmlFor={`price-${index}`}>Price *</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(index, 'unitPrice', e.target.value)
                      }
                      min="0"
                      required
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <Label htmlFor={`discount-${index}`}>Discount %</Label>
                    <Input
                      id={`discount-${index}`}
                      type="number"
                      step="0.01"
                      value={item.discount}
                      onChange={(e) =>
                        handleItemChange(index, 'discount', e.target.value)
                      }
                      min="0"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label>Total</Label>
                    <div className="px-3 py-2 bg-gray-50 rounded-md text-sm font-medium">
                      ₹{calculateItemTotal(item).toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4 space-y-2">
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total Amount:</span>
                <span className="text-green-600">₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Processing...' : 'Complete Sale'}
          </Button>
          <Link href="/dashboard/pharmacy">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>

      {lastSale && (
        <div className="mt-8 bg-white p-6 shadow rounded-md max-w-xl mx-auto print:shadow-none">
          <div ref={receiptRef}>
            <div className="text-center mb-3">
              <h2 className="text-xl font-bold text-gray-900">
                {tenant?.name || 'Pharmacy'}
              </h2>
              <p className="text-xs text-gray-600">Pharmacy Bill</p>
            </div>

            <div className="flex justify-between text-xs mb-3">
              <div className="space-y-1">
                <p>
                  <span className="font-semibold">Customer: </span>
                  {lastSale.customerName}
                </p>
                <p>
                  <span className="font-semibold">Phone: </span>
                  {lastSale.customerPhone}
                </p>
                {lastSale.customerAddress && (
                  <p>
                    <span className="font-semibold">Address: </span>
                    {lastSale.customerAddress}
                  </p>
                )}
              </div>
              <div className="text-right space-y-1">
                {lastSale.invoiceNumber && (
                  <p>
                    <span className="font-semibold">Bill No: </span>
                    {lastSale.invoiceNumber}
                  </p>
                )}
                <p>
                  <span className="font-semibold">Date: </span>
                  {new Date(lastSale.date).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p>
                  <span className="font-semibold">Payment: </span>
                  {lastSale.paymentMethod}
                </p>
              </div>
            </div>

            <table className="w-full text-[11px] border-t border-b border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left">#</th>
                  <th className="px-2 py-1 text-left">Medicine</th>
                  <th className="px-2 py-1 text-right">Qty</th>
                  <th className="px-2 py-1 text-right">Price</th>
                  <th className="px-2 py-1 text-right">Disc (%)</th>
                  <th className="px-2 py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lastSale.items.map((item: any, index: number) => (
                  <tr key={index} className="border-t border-gray-100">
                    <td className="px-2 py-1 align-top">{index + 1}</td>
                    <td className="px-2 py-1 align-top">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      {item.brand && (
                        <div className="text-[10px] text-gray-500">{item.brand}</div>
                      )}
                      {item.batchNumber && (
                        <div className="text-[10px] text-gray-500">Batch: {item.batchNumber}</div>
                      )}
                    </td>
                    <td className="px-2 py-1 text-right align-top">{item.quantity}</td>
                    <td className="px-2 py-1 text-right align-top">
                      ₹{item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-2 py-1 text-right align-top">
                      {item.discountPercent
                        ? `${item.discountPercent.toFixed(2)}% (₹${item.discountAmount.toFixed(2)})`
                        : '0% (₹0.00)'}
                    </td>
                    <td className="px-2 py-1 text-right align-top">
                      ₹{item.netAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-3 flex justify-end">
              <div className="text-xs w-48 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ₹{lastSale.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-red-600">
                    -₹{lastSale.totalDiscount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1 mt-1">
                  <span className="font-semibold">Net Amount</span>
                  <span className="font-semibold text-gray-900">
                    ₹{lastSale.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {lastSale.notes && (
              <div className="mt-3 text-[10px] text-gray-600">
                <span className="font-semibold">Notes: </span>
                {lastSale.notes}
              </div>
            )}

            <div className="mt-4 text-[10px] text-gray-500 text-center border-t pt-2">
              Thank you for your purchase. Medicines once sold cannot be returned.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
