'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import inventoryService, { InventoryItem } from '@/services/inventory.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, TrendingDown, DollarSign, Plus, Search } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
  const { tenant } = useAuthStore();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [expiringItems, setExpiringItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    if (tenant?.id) {
      fetchData();
    }
  }, [tenant, categoryFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, lowStockRes, expiringRes] = await Promise.all([
        inventoryService.getItems(tenant?.id || '', { category: categoryFilter || undefined }),
        inventoryService.getLowStockItems(tenant?.id || ''),
        inventoryService.getExpiringStock(tenant?.id || '', 30),
      ]);
      setItems(itemsRes.data);
      setLowStockItems(lowStockRes.data);
      setExpiringItems(expiringRes.data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = items.reduce((sum, item) => {
    const stock = item.stockBatches?.reduce((s, b) => s + b.availableQuantity, 0) || 0;
    const avgCost = item.stockBatches?.[0]?.costPrice || 0;
    return sum + (stock * avgCost);
  }, 0);

  if (loading) {
    return <div className="p-6 text-center">Loading inventory...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-1">Manage stock, suppliers, and requisitions</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/inventory/suppliers/new"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Add Supplier
          </Link>
          <Link
            href="/dashboard/inventory/items/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Item
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{items.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{lowStockItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{expiringItems.length}</div>
            <p className="text-xs text-gray-500 mt-1">Next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">₹{totalValue.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/dashboard/inventory/purchase-orders/new"
          className="p-4 border-2 border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
        >
          <div className="text-sm font-medium">Create Purchase Order</div>
        </Link>
        <Link
          href="/dashboard/inventory/requisitions/new"
          className="p-4 border-2 border-dashed rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
        >
          <div className="text-sm font-medium">New Requisition</div>
        </Link>
        <Link
          href="/dashboard/inventory/transfers/new"
          className="p-4 border-2 border-dashed rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
        >
          <div className="text-sm font-medium">Stock Transfer</div>
        </Link>
        <Link
          href="/dashboard/inventory/reports"
          className="p-4 border-2 border-dashed rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center"
        >
          <div className="text-sm font-medium">View Reports</div>
        </Link>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search items by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
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

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Item Code</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Item Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Unit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredItems.map((item) => {
                  const totalStock = item.stockBatches?.reduce((sum, batch) => sum + batch.availableQuantity, 0) || 0;
                  const status = totalStock === 0 ? 'OUT_OF_STOCK' : totalStock <= item.reorderLevel ? 'LOW_STOCK' : 'IN_STOCK';
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{item.itemCode}</td>
                      <td className="px-4 py-3 text-sm font-medium">{item.itemName}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{item.unit}</td>
                      <td className="px-4 py-3 text-sm font-medium">{totalStock}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            status === 'IN_STOCK'
                              ? 'bg-green-100 text-green-800'
                              : status === 'LOW_STOCK'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Link
                          href={`/dashboard/inventory/items/${item.id}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">No items found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
