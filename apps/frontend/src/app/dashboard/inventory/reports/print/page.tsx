'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import inventoryService from '@/services/inventory.service';

export default function PrintInventoryReportPage() {
  const { tenant } = useAuthStore();
  const [inventoryReport, setInventoryReport] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [expiringItems, setExpiringItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant?.id) {
      fetchReports();
    }
  }, [tenant]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [inventoryRes, lowStockRes, expiringRes] = await Promise.all([
        inventoryService.getInventoryReport(tenant?.id || ''),
        inventoryService.getLowStockItems(tenant?.id || ''),
        inventoryService.getExpiringStock(tenant?.id || '', 30),
      ]);
      setInventoryReport(inventoryRes.data);
      setLowStockItems(lowStockRes.data);
      setExpiringItems(expiringRes.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && inventoryReport.length > 0) {
      // Auto-print after data loads
      setTimeout(() => window.print(), 500);
    }
  }, [loading, inventoryReport]);

  const totalValue = inventoryReport.reduce((sum, item) => sum + (item.totalValue || 0), 0);
  const totalStock = inventoryReport.reduce((sum, item) => sum + (item.totalStock || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="print-container">
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100%;
            max-width: none;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
        @page {
          size: A4;
          margin: 1cm;
        }
      `}</style>

      {/* Print Header */}
      <div className="mb-8 text-center border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-bold mb-2">Hospital Inventory Report</h1>
        <p className="text-gray-600">Generated on: {new Date().toLocaleString()}</p>
        <p className="text-gray-600">Tenant: {tenant?.name}</p>
      </div>

      {/* Summary Section */}
      <div className="mb-8 grid grid-cols-3 gap-4 border-2 border-gray-300 p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{inventoryReport.length}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalStock}</div>
          <div className="text-sm text-gray-600">Total Stock</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">₹{totalValue.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
      </div>

      {/* Inventory Valuation Report */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 bg-gray-100 p-2">Inventory Valuation Report</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-2 py-2 text-left">Item Code</th>
              <th className="border border-gray-300 px-2 py-2 text-left">Item Name</th>
              <th className="border border-gray-300 px-2 py-2 text-left">Category</th>
              <th className="border border-gray-300 px-2 py-2 text-right">Stock</th>
              <th className="border border-gray-300 px-2 py-2 text-right">Value</th>
              <th className="border border-gray-300 px-2 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {inventoryReport.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-2 py-2">{item.itemCode}</td>
                <td className="border border-gray-300 px-2 py-2 font-medium">{item.itemName}</td>
                <td className="border border-gray-300 px-2 py-2">{item.category}</td>
                <td className="border border-gray-300 px-2 py-2 text-right">{item.totalStock}</td>
                <td className="border border-gray-300 px-2 py-2 text-right">
                  ₹{item.totalValue?.toFixed(2) || 0}
                </td>
                <td className="border border-gray-300 px-2 py-2">{item.stockStatus}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-200 font-bold">
              <td colSpan={3} className="border border-gray-300 px-2 py-2 text-right">Total:</td>
              <td className="border border-gray-300 px-2 py-2 text-right">{totalStock}</td>
              <td className="border border-gray-300 px-2 py-2 text-right">₹{totalValue.toFixed(2)}</td>
              <td className="border border-gray-300 px-2 py-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Low Stock Items */}
      {lowStockItems.length > 0 && (
        <div className="mb-8 page-break-before">
          <h2 className="text-xl font-bold mb-4 bg-orange-100 p-2">Low Stock Items</h2>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-orange-200">
                <th className="border border-gray-300 px-2 py-2 text-left">Item Name</th>
                <th className="border border-gray-300 px-2 py-2 text-right">Current Stock</th>
                <th className="border border-gray-300 px-2 py-2 text-right">Reorder Level</th>
                <th className="border border-gray-300 px-2 py-2 text-left">Action Required</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-orange-50'}>
                  <td className="border border-gray-300 px-2 py-2 font-medium">{item.itemName}</td>
                  <td className="border border-gray-300 px-2 py-2 text-right text-orange-600 font-bold">
                    {item.totalStock}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right">{item.reorderLevel}</td>
                  <td className="border border-gray-300 px-2 py-2">Create Purchase Order</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Expiring Stock */}
      {expiringItems.length > 0 && (
        <div className="mb-8 page-break-before">
          <h2 className="text-xl font-bold mb-4 bg-red-100 p-2">Expiring Stock (Next 30 Days)</h2>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-red-200">
                <th className="border border-gray-300 px-2 py-2 text-left">Item Name</th>
                <th className="border border-gray-300 px-2 py-2 text-left">Batch Number</th>
                <th className="border border-gray-300 px-2 py-2 text-right">Quantity</th>
                <th className="border border-gray-300 px-2 py-2 text-left">Expiry Date</th>
                <th className="border border-gray-300 px-2 py-2 text-left">Days Left</th>
              </tr>
            </thead>
            <tbody>
              {expiringItems.map((batch, index) => {
                const daysLeft = Math.ceil(
                  (new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <tr key={batch.id} className={index % 2 === 0 ? 'bg-white' : 'bg-red-50'}>
                    <td className="border border-gray-300 px-2 py-2 font-medium">
                      {batch.item?.itemName}
                    </td>
                    <td className="border border-gray-300 px-2 py-2">{batch.batchNumber}</td>
                    <td className="border border-gray-300 px-2 py-2 text-right">
                      {batch.availableQuantity}
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      {new Date(batch.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 font-bold text-red-600">
                      {daysLeft} days
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t-2 border-gray-800 text-center text-sm text-gray-600">
        <p>This is a computer-generated report. No signature required.</p>
        <p className="mt-2">© {new Date().getFullYear()} Hospital Management System</p>
      </div>

      {/* Print Button (hidden when printing) */}
      <div className="no-print fixed bottom-4 right-4">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700"
        >
          Print Report
        </button>
      </div>
    </div>
  );
}
