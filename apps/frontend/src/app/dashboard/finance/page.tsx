'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { financeService, FinanceStats } from '@/services/finance.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export default function FinancePage() {
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (tenant?.id) {
      fetchStats();
    }
  }, [tenant, dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await financeService.getStats(
        tenant?.id || '',
        dateRange.startDate,
        dateRange.endDate
      );
      setStats(data);
    } catch (error) {
      console.error('Error fetching finance stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const summaryCards = [
    {
      title: 'Total Income',
      value: formatCurrency(stats?.totalIncome || 0),
      count: `${stats?.incomeCount || 0} transactions`,
      icon: TrendingUp,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(stats?.totalExpense || 0),
      count: `${stats?.expenseCount || 0} transactions`,
      icon: TrendingDown,
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(stats?.netProfit || 0),
      count: stats && stats.netProfit >= 0 ? 'Profit' : 'Loss',
      icon: DollarSign,
      bgColor: stats && stats.netProfit >= 0 ? 'bg-blue-100' : 'bg-orange-100',
      textColor: stats && stats.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600',
    },
    {
      title: 'Advances',
      value: formatCurrency(stats?.totalAdvance || 0),
      count: `${stats?.advanceCount || 0} advances`,
      icon: Wallet,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Finance Management</h1>
          <p className="text-gray-600 mt-1">Track income, expenses, and financial analytics</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/finance/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchStats}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filter
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {loading ? '...' : card.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{card.count}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${card.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Income by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Income by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : stats?.incomeByCategory && stats.incomeByCategory.length > 0 ? (
              <div className="space-y-3">
                {stats.incomeByCategory.slice(0, 5).map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.category.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-500">{item.count} transactions</p>
                    </div>
                    <p className="text-sm font-bold text-green-600">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No income data available</p>
            )}
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : stats?.expenseByCategory && stats.expenseByCategory.length > 0 ? (
              <div className="space-y-3">
                {stats.expenseByCategory.slice(0, 5).map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.category.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-500">{item.count} transactions</p>
                    </div>
                    <p className="text-sm font-bold text-red-600">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No expense data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions by Source */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions by Source Module</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : stats?.transactionsBySource && stats.transactionsBySource.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.transactionsBySource.map((item) => (
                <div key={item.source} className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {item.source.replace(/_/g, ' ')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {formatCurrency(item.amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{item.count} transactions</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No transaction data available</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/finance/transactions">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Filter className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900">View All Transactions</h3>
              <p className="text-sm text-gray-500 mt-1">Browse and filter all records</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/finance/reports">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Download className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Financial Reports</h3>
              <p className="text-sm text-gray-500 mt-1">Generate and export reports</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/finance/new">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Plus className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Add Manual Entry</h3>
              <p className="text-sm text-gray-500 mt-1">Record income or expense</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
