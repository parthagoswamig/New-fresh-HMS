'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import inventoryService, { Supplier, InventoryItem } from '@/services/inventory.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface POItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  totalPrice: number;
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const { tenant, user } = useAuthStore();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplierId: '',
    expectedDeliveryDate: '',
    notes: '',
  });
  const [poItems, setPOItems] = useState<POItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    itemId: '',
    quantity: 1,
    unitPrice: 0,
    tax: 0,
  });

  useEffect(() => {
    if (tenant?.id) {
      fetchData();
    }
  }, [tenant]);

  const fetchData = async () => {
    try {
      const [suppliersRes, itemsRes] = await Promise.all([
        inventoryService.getSuppliers(tenant?.id || '', true),
        inventoryService.getItems(tenant?.id || ''),
      ]);
      setSuppliers(suppliersRes.data);
      setItems(itemsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addItem = () => {
    if (!currentItem.itemId || currentItem.quantity <= 0 || currentItem.unitPrice <= 0) {
      alert('Please fill all item details');
      return;
    }

    const item = items.find((i) => i.id === currentItem.itemId);
    if (!item) return;

    const itemTotal = currentItem.quantity * currentItem.unitPrice;
    const itemTax = (itemTotal * currentItem.tax) / 100;
    const totalPrice = itemTotal + itemTax;

    const newItem: POItem = {
      itemId: currentItem.itemId,
      itemName: item.itemName,
      quantity: currentItem.quantity,
      unitPrice: currentItem.unitPrice,
      tax: currentItem.tax,
      totalPrice,
    };

    setPOItems([...poItems, newItem]);
    setCurrentItem({ itemId: '', quantity: 1, unitPrice: 0, tax: 0 });
  };

  const removeItem = (index: number) => {
    setPOItems(poItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const totalAmount = poItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + itemTotal;
    }, 0);
    const totalTax = poItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + (itemTotal * item.tax) / 100;
    }, 0);
    const grandTotal = totalAmount + totalTax;
    return { totalAmount, totalTax, grandTotal };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (poItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    if (!formData.supplierId) {
      alert('Please select a supplier');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        supplierId: formData.supplierId,
        expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
        notes: formData.notes,
        createdById: user?.staff?.id || '',
        items: poItems.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          tax: item.tax,
        })),
      };

      await inventoryService.createPurchaseOrder(submitData, tenant?.id || '');
      router.push('/dashboard/inventory/purchase-orders');
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  const { totalAmount, totalTax, grandTotal } = calculateTotals();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Link
        href="/dashboard/inventory"
        className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Inventory
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Info */}
        <Card>
          <CardHeader>
            <CardTitle>Create Purchase Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Supplier *</label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  required
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expected Delivery Date</label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Add Items */}
        <Card>
          <CardHeader>
            <CardTitle>Add Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Item</label>
                <select
                  value={currentItem.itemId}
                  onChange={(e) => setCurrentItem({ ...currentItem, itemId: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="">Select Item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemName} ({item.itemCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <input
                  type="number"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
                  min="1"
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Unit Price</label>
                <input
                  type="number"
                  value={currentItem.unitPrice}
                  onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tax (%)</label>
                <input
                  type="number"
                  value={currentItem.tax}
                  onChange={(e) => setCurrentItem({ ...currentItem, tax: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </CardContent>
        </Card>

        {/* Items Table */}
        {poItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Item</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Quantity</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Unit Price</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Tax (%)</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Total</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {poItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm">{item.itemName}</td>
                        <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-right">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-right">{item.tax}%</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">₹{item.totalPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-sm text-right">Subtotal:</td>
                      <td className="px-4 py-3 text-sm text-right">₹{totalAmount.toFixed(2)}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-sm text-right">Tax:</td>
                      <td className="px-4 py-3 text-sm text-right">₹{totalTax.toFixed(2)}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-sm text-right">Grand Total:</td>
                      <td className="px-4 py-3 text-sm text-right text-lg">₹{grandTotal.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || poItems.length === 0}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Purchase Order'}
          </button>
          <Link
            href="/dashboard/inventory"
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
