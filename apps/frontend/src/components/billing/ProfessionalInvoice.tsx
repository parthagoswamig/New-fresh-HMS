'use client';

import React from 'react';
import { forwardRef } from 'react';

interface ProfessionalInvoiceProps {
  bill: any;
  hospital: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
    registrationNo?: string;
    taxId?: string;
  };
}

export const ProfessionalInvoice = forwardRef<HTMLDivElement, ProfessionalInvoiceProps>(
  ({ bill, hospital }, ref) => {
    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    const formatCurrency = (amount: number) => {
      return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const subtotal = bill.totalAmount + bill.discountAmount;
    const balanceDue = bill.totalAmount - bill.paidAmount - (bill.insuranceCovered || 0);

    return (
      <div ref={ref} className="bg-white p-12 max-w-[210mm] mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Hospital Header */}
        <div className="border-b-4 border-blue-600 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-blue-900 mb-2">{hospital.name}</h1>
              <p className="text-sm text-gray-700">{hospital.address}</p>
              <p className="text-sm text-gray-700">
                Phone: {hospital.phone} | Email: {hospital.email}
              </p>
              {hospital.registrationNo && (
                <p className="text-xs text-gray-600 mt-1">Reg. No: {hospital.registrationNo}</p>
              )}
              {hospital.taxId && (
                <p className="text-xs text-gray-600">GSTIN: {hospital.taxId}</p>
              )}
            </div>
            {hospital.logo && (
              <div className="w-24 h-24">
                <img src={hospital.logo} alt="Hospital Logo" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* Invoice Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
            TAX INVOICE
          </h2>
          <div className="h-1 w-32 bg-blue-600 mx-auto mt-2"></div>
        </div>

        {/* Invoice Info & Patient Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Left: Invoice Details */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase border-b pb-2">Invoice Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice No:</span>
                <span className="font-semibold text-gray-900">{bill.billNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Date:</span>
                <span className="font-semibold text-gray-900">{formatDate(bill.billDate)}</span>
              </div>
              {bill.dueDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-semibold text-gray-900">{formatDate(bill.dueDate)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${
                  bill.status === 'PAID' ? 'text-green-600' : 
                  bill.status === 'PARTIALLY_PAID' ? 'text-blue-600' : 
                  'text-yellow-600'
                }`}>
                  {bill.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Patient Details */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase border-b pb-2">Bill To</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-bold text-gray-900 text-base">
                  {bill.patient.firstName} {bill.patient.lastName}
                </p>
                <p className="text-gray-600 text-xs">Patient ID: {bill.patient.patientId}</p>
              </div>
              {bill.patient.phone && (
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 text-gray-900">{bill.patient.phone}</span>
                </div>
              )}
              {bill.patient.email && (
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 text-gray-900">{bill.patient.email}</span>
                </div>
              )}
              {bill.patient.address && (
                <div>
                  <span className="text-gray-600">Address:</span>
                  <p className="text-gray-900 mt-1">{bill.patient.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">
                  #
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">
                  Description of Services
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase">
                  Qty
                </th>
                <th className="border border-gray-300 px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase">
                  Rate
                </th>
                <th className="border border-gray-300 px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {item.description}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 text-center">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 text-right">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-full md:w-1/2">
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              {/* Subtotal */}
              <div className="flex justify-between px-4 py-2 bg-gray-50 border-b border-gray-300">
                <span className="text-sm font-semibold text-gray-700">Subtotal:</span>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>

              {/* Discount */}
              {bill.discountAmount > 0 && (
                <div className="flex justify-between px-4 py-2 bg-gray-50 border-b border-gray-300">
                  <span className="text-sm font-semibold text-gray-700">Discount:</span>
                  <span className="text-sm font-semibold text-red-600">
                    -{formatCurrency(bill.discountAmount)}
                  </span>
                </div>
              )}

              {/* Insurance Covered */}
              {bill.insuranceCovered > 0 && (
                <div className="flex justify-between px-4 py-2 bg-green-50 border-b border-gray-300">
                  <span className="text-sm font-semibold text-gray-700">Insurance Covered:</span>
                  <span className="text-sm font-semibold text-green-600">
                    -{formatCurrency(bill.insuranceCovered)}
                  </span>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between px-4 py-3 bg-blue-600 text-white">
                <span className="text-base font-bold">Total Amount:</span>
                <span className="text-base font-bold">{formatCurrency(bill.totalAmount)}</span>
              </div>

              {/* Paid Amount */}
              {bill.paidAmount > 0 && (
                <div className="flex justify-between px-4 py-2 bg-gray-50 border-b border-gray-300">
                  <span className="text-sm font-semibold text-gray-700">Paid Amount:</span>
                  <span className="text-sm font-semibold text-green-600">
                    -{formatCurrency(bill.paidAmount)}
                  </span>
                </div>
              )}

              {/* Balance Due */}
              {balanceDue > 0 && (
                <div className="flex justify-between px-4 py-3 bg-yellow-50 border-t-2 border-yellow-400">
                  <span className="text-base font-bold text-gray-900">Balance Due:</span>
                  <span className="text-base font-bold text-red-600">{formatCurrency(balanceDue)}</span>
                </div>
              )}

              {/* Fully Paid */}
              {balanceDue <= 0 && bill.status === 'PAID' && (
                <div className="flex justify-center px-4 py-3 bg-green-50 border-t-2 border-green-400">
                  <span className="text-base font-bold text-green-600">✓ PAID IN FULL</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="mb-6 p-3 bg-gray-50 border border-gray-300 rounded">
          <p className="text-sm">
            <span className="font-semibold text-gray-700">Amount in Words:</span>
            <span className="ml-2 text-gray-900 italic">
              {/* You can add a number-to-words converter here */}
              {bill.totalAmount.toLocaleString('en-IN')} Rupees Only
            </span>
          </p>
        </div>

        {/* Notes */}
        {bill.notes && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Notes:</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{bill.notes}</p>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="mb-8 p-4 bg-gray-50 border border-gray-300 rounded">
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Terms & Conditions:</h4>
          <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
            <li>Payment is due within 30 days of invoice date unless otherwise specified.</li>
            <li>Please make checks payable to {hospital.name}.</li>
            <li>For any queries regarding this invoice, please contact our billing department.</li>
            <li>This is a computer-generated invoice and does not require a signature.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-gray-600 mb-8">Authorized Signature</p>
              <div className="border-t border-gray-400 pt-2">
                <p className="font-semibold text-gray-900 text-sm">{hospital.name}</p>
                <p className="text-xs text-gray-600">Billing Department</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 mb-2">Date of Issue</p>
              <p className="font-semibold text-gray-900 text-sm">{formatDate(bill.billDate)}</p>
              <div className="mt-8">
                <p className="text-xs text-gray-500 italic">This is a computer-generated invoice.</p>
                <p className="text-xs text-gray-500 italic">No signature is required.</p>
                <p className="text-xs text-gray-500 mt-2">Invoice ID: {bill.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center">
          <p className="text-xs text-gray-600">
            Thank you for choosing {hospital.name}
          </p>
          <p className="text-xs text-gray-600">
            For billing inquiries: {hospital.phone} | {hospital.email}
          </p>
        </div>
      </div>
    );
  }
);

ProfessionalInvoice.displayName = 'ProfessionalInvoice';
