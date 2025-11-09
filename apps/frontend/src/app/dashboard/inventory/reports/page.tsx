'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import inventoryService from '@/services/inventory.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertTriangle, TrendingDown, Package, ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';

export default function InventoryReportsPage() {
  const { tenant } = useAuthStore();
  const [inventoryReport, setInventoryReport] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [expiringItems, setExpiringItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    if (tenant?.id) {
      fetchReports();
    }
  }, [tenant, categoryFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [inventoryRes, lowStockRes, expiringRes] = await Promise.all([
        inventoryService.getInventoryReport(tenant?.id || '', categoryFilter || undefined),
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

  const totalValue = inventoryReport.reduce((sum, item) => sum + (item.totalValue || 0), 0);
  const totalStock = inventoryReport.reduce((sum, item) => sum + (item.totalStock || 0), 0);

  if (loading) {
    return <div className="p-6 text-center">Loading reports...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Link
        href="/dashboard/inventory"
        className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Inventory
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            Inventory Reports
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive inventory analytics and reports</p>
        </div>
        <Link
          href="/dashboard/inventory/reports/print"
          target="_blank"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Printer className="h-5 w-5" />
          Print Report
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inventoryReport.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">₹{totalValue.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{lowStockItems.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <label className="font-medium">Filter by Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">All Categories</option>
              <option value="MEDICINE">Medicine</option>
              <option value="CONSUMABLE">Consumable</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="SURGICAL">Surgical</option>
              <option value="LABORATORY">Laboratory</option>
              <option value="GENERAL">General</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Valuation Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Valuation Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Item Code</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Item Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Stock</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {inventoryReport.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{item.itemCode}</td>
                    <td className="px-4 py-3 text-sm font-medium">{item.itemName}</td>
                    <td className="px-4 py-3 text-sm">{item.category}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.totalStock}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      ₹{item.totalValue?.toFixed(2) || 0}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          item.stockStatus === 'IN_STOCK'
                            ? 'bg-green-100 text-green-800'
                            : item.stockStatus === 'LOW_STOCK'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.stockStatus?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm">Total</td>
                  <td className="px-4 py-3 text-sm text-right">{totalStock}</td>
                  <td className="px-4 py-3 text-sm text-right">₹{totalValue.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Low Stock Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Item Name</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Current Stock</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Reorder Level</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lowStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{item.itemName}</td>
                    <td className="px-4 py-3 text-sm text-right text-orange-600 font-bold">
                      {item.totalStock}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">{item.reorderLevel}</td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href="/dashboard/inventory/purchase-orders/new"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Create PO
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lowStockItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">No low stock items</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expiring Stock Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Expiring Stock (Next 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Item Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Batch Number</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Expiry Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Days Left</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expiringItems.map((batch) => {
                  const daysLeft = Math.ceil(
                    (new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <tr key={batch.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{batch.item?.itemName}</td>
                      <td className="px-4 py-3 text-sm">{batch.batchNumber}</td>
                      <td className="px-4 py-3 text-sm text-right">{batch.availableQuantity}</td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(batch.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            daysLeft <= 7
                              ? 'bg-red-100 text-red-800'
                              : daysLeft <= 15
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {daysLeft} days
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {expiringItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">No expiring items</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
