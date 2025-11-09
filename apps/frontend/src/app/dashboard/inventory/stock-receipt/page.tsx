'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import inventoryService, { PurchaseOrder } from '@/services/inventory.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';

interface ReceiveItem {
  poItemId: string;
  itemId: string;
  itemName: string;
  orderedQty: number;
  receivedQty: number;
  batchNumber: string;
  costPrice: number;
  mrp: number;
  expiryDate: string;
  departmentId: string;
}

export default function StockReceiptPage() {
  const router = useRouter();
  const { tenant } = useAuthStore();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [receiveItems, setReceiveItems] = useState<ReceiveItem[]>([]);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    grnNumber: '',
  });

  useEffect(() => {
    if (tenant?.id) {
      fetchPurchaseOrders();
    }
  }, [tenant]);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await inventoryService.getPurchaseOrders(tenant?.id || '', { status: 'APPROVED' });
      setPurchaseOrders(response.data);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    }
  };

  const handlePOSelect = (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (po) {
      setSelectedPO(po);
      const items: ReceiveItem[] = po.items.map((item) => ({
        poItemId: item.id,
        itemId: item.itemId,
        itemName: item.item?.itemName || '',
        orderedQty: item.quantity,
        receivedQty: item.quantity - item.receivedQuantity,
        batchNumber: '',
        costPrice: item.unitPrice,
        mrp: 0,
        expiryDate: '',
        departmentId: '',
      }));
      setReceiveItems(items);
    }
  };

  const updateReceiveItem = (index: number, field: keyof ReceiveItem, value: any) => {
    const updated = [...receiveItems];
    updated[index] = { ...updated[index], [field]: value };
    setReceiveItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPO) {
      alert('Please select a purchase order');
      return;
    }

    const itemsToReceive = receiveItems.filter((item) => item.receivedQty > 0 && item.batchNumber);

    if (itemsToReceive.length === 0) {
      alert('Please add batch details for at least one item');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        purchaseOrderId: selectedPO.id,
        invoiceNumber: formData.invoiceNumber,
        grnNumber: formData.grnNumber,
        items: itemsToReceive.map((item) => ({
          poItemId: item.poItemId,
          itemId: item.itemId,
          batchNumber: item.batchNumber,
          receivedQuantity: item.receivedQty,
          costPrice: item.costPrice,
          mrp: item.mrp || undefined,
          expiryDate: item.expiryDate || undefined,
          departmentId: item.departmentId || undefined,
        })),
      };

      await inventoryService.receiveStock(submitData, tenant?.id || '');
      alert('Stock received successfully');
      router.push('/dashboard/inventory');
    } catch (error) {
      console.error('Error receiving stock:', error);
      alert('Failed to receive stock');
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
        {/* Select PO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Receive Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Purchase Order *</label>
                <select
                  onChange={(e) => handlePOSelect(e.target.value)}
                  required
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="">Select PO</option>
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.poNumber} - {po.supplier?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Invoice Number</label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">GRN Number</label>
                <input
                  type="text"
                  value={formData.grnNumber}
                  onChange={(e) => setFormData({ ...formData, grnNumber: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items to Receive */}
        {selectedPO && receiveItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Items to Receive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {receiveItems.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="font-medium text-lg">{item.itemName}</div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Ordered Qty</label>
                        <input
                          type="number"
                          value={item.orderedQty}
                          disabled
                          className="w-full border rounded px-3 py-2 bg-gray-50 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Receive Qty *</label>
                        <input
                          type="number"
                          value={item.receivedQty}
                          onChange={(e) => updateReceiveItem(index, 'receivedQty', parseInt(e.target.value))}
                          min="0"
                          max={item.orderedQty}
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Batch Number *</label>
                        <input
                          type="text"
                          value={item.batchNumber}
                          onChange={(e) => updateReceiveItem(index, 'batchNumber', e.target.value)}
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Cost Price *</label>
                        <input
                          type="number"
                          value={item.costPrice}
                          onChange={(e) => updateReceiveItem(index, 'costPrice', parseFloat(e.target.value))}
                          min="0"
                          step="0.01"
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">MRP</label>
                        <input
                          type="number"
                          value={item.mrp}
                          onChange={(e) => updateReceiveItem(index, 'mrp', parseFloat(e.target.value))}
                          min="0"
                          step="0.01"
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Expiry Date</label>
                        <input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => updateReceiveItem(index, 'expiryDate', e.target.value)}
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        {selectedPO && (
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Receiving...' : 'Receive Stock'}
            </button>
            <Link
              href="/dashboard/inventory"
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        )}
      </form>
    </div>
  );
}
