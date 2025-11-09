'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import inventoryService, { InventoryItem } from '@/services/inventory.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ReqItem {
  itemId: string;
  itemName: string;
  requestedQuantity: number;
}

export default function NewRequisitionPage() {
  const router = useRouter();
  const { tenant, user } = useAuthStore();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    departmentId: '',
    notes: '',
  });
  const [reqItems, setReqItems] = useState<ReqItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    itemId: '',
    requestedQuantity: 1,
  });

  useEffect(() => {
    if (tenant?.id) {
      fetchData();
    }
  }, [tenant]);

  const fetchData = async () => {
    try {
      const itemsRes = await inventoryService.getItems(tenant?.id || '');
      setItems(itemsRes.data);
      // In real app, fetch departments from department service
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addItem = () => {
    if (!currentItem.itemId || currentItem.requestedQuantity <= 0) {
      alert('Please fill all item details');
      return;
    }

    const item = items.find((i) => i.id === currentItem.itemId);
    if (!item) return;

    const newItem: ReqItem = {
      itemId: currentItem.itemId,
      itemName: item.itemName,
      requestedQuantity: currentItem.requestedQuantity,
    };

    setReqItems([...reqItems, newItem]);
    setCurrentItem({ itemId: '', requestedQuantity: 1 });
  };

  const removeItem = (index: number) => {
    setReqItems(reqItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (reqItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    if (!formData.departmentId) {
      alert('Please select a department');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        departmentId: formData.departmentId,
        notes: formData.notes,
        requestedById: user?.staff?.id || '',
        items: reqItems.map((item) => ({
          itemId: item.itemId,
          requestedQuantity: item.requestedQuantity,
        })),
      };

      await inventoryService.createRequisition(submitData, tenant?.id || '');
      router.push('/dashboard/inventory/requisitions');
    } catch (error) {
      console.error('Error creating requisition:', error);
      alert('Failed to create requisition');
    } finally {
      setLoading(false);
    }
  };

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
            <CardTitle>Create Requisition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Department *</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  required
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="">Select Department</option>
                  <option value="dept-1">Pharmacy</option>
                  <option value="dept-2">Laboratory</option>
                  <option value="dept-3">Surgery</option>
                  <option value="dept-4">Emergency</option>
                </select>
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
            </div>
          </CardContent>
        </Card>

        {/* Add Items */}
        <Card>
          <CardHeader>
            <CardTitle>Add Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  value={currentItem.requestedQuantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, requestedQuantity: parseInt(e.target.value) })}
                  min="1"
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
        {reqItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Requisition Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Item</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Requested Quantity</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reqItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm">{item.itemName}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">{item.requestedQuantity}</td>
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
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || reqItems.length === 0}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Requisition'}
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
