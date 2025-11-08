'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileText, Printer } from 'lucide-react';
import { labEntryService } from '@/services/lab-entry.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function LabEntriesPage() {
  const router = useRouter();
  const { tenant } = useAuthStore();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    ordered: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    if (tenant?.id) {
      fetchEntries();
      fetchStats();
    }
  }, [tenant, statusFilter]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter.toUpperCase();
      }
      const response = await labEntryService.listEntries(params, tenant?.id || '');
      // Handle both array and object response formats
      const entriesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || response.data?.entries || []);
      setEntries(entriesData);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await labEntryService.getStats(tenant?.id || '');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const searchLower = search.toLowerCase();
    return (
      entry.entryNumber.toLowerCase().includes(searchLower) ||
      entry.patient?.firstName?.toLowerCase().includes(searchLower) ||
      entry.patient?.lastName?.toLowerCase().includes(searchLower) ||
      entry.patient?.patientId?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ORDERED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Laboratory Orders</h1>
          <p className="text-muted-foreground">Manage patient lab test orders and results</p>
        </div>
        <Link href="/dashboard/lab-entries/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Lab Order
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ordered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.ordered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by order number, patient name, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'ordered' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('ordered')}
              >
                Ordered
              </Button>
              <Button
                variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('in_progress')}
              >
                In Progress
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('completed')}
              >
                Completed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Lab Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No lab orders found</p>
              <Link href="/dashboard/lab-entries/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Order
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Order #</th>
                    <th className="text-left p-4 font-medium">Patient</th>
                    <th className="text-left p-4 font-medium">Tests</th>
                    <th className="text-left p-4 font-medium">Amount</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{entry.entryNumber}</td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">
                            {entry.patient?.firstName} {entry.patient?.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.patient?.patientId}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{entry.items?.length || 0} tests</div>
                      </td>
                      <td className="p-4 font-medium">₹{entry.totalAmount}</td>
                      <td className="p-4">
                        <Badge className={getStatusColor(entry.status)}>
                          {getStatusLabel(entry.status)}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link href={`/dashboard/lab-entries/${entry.id}`}>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </Link>
                          {entry.status === 'COMPLETED' && (
                            <Link href={`/dashboard/lab-entries/${entry.id}/print`}>
                              <Button variant="outline" size="sm">
                                <Printer className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
