import apiClient from '@/lib/api-client';

export interface FinanceTransaction {
  id: string;
  transactionNo: string;
  type: 'INCOME' | 'EXPENSE' | 'ADVANCE' | 'REFUND';
  amount: number;
  sourceModule: string;
  sourceReference?: string;
  reason: string;
  description?: string;
  paymentMethod: string;
  category: string;
  tags: string[];
  date: string;
  attachments?: string[];
  metadata?: any;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    patientId: string;
  };
  staff?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  createdBy?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDto {
  type: 'INCOME' | 'EXPENSE' | 'ADVANCE' | 'REFUND';
  amount: number;
  sourceModule: string;
  sourceReference?: string;
  reason: string;
  description?: string;
  paymentMethod: string;
  category: string;
  tags?: string[];
  date?: string;
  attachments?: string[];
  metadata?: any;
  patientId?: string;
  staffId?: string;
}

export interface FinanceStats {
  totalIncome: number;
  totalExpense: number;
  totalAdvance: number;
  netProfit: number;
  incomeCount: number;
  expenseCount: number;
  advanceCount: number;
  incomeByCategory: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  expenseByCategory: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  transactionsBySource: Array<{
    source: string;
    amount: number;
    count: number;
  }>;
}

export const financeService = {
  create: async (tenantId: string, data: CreateTransactionDto) => {
    const response = await apiClient.post('/finance/transactions', data, {
      headers: { 'x-tenant-id': tenantId },
    });
    return response.data;
  },

  list: async (
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string;
      type?: string;
      sourceModule?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const response = await apiClient.get('/finance/transactions', {
      params: { page, limit, ...filters },
      headers: { 'x-tenant-id': tenantId },
    });
    return response.data;
  },

  getById: async (tenantId: string, id: string) => {
    const response = await apiClient.get(`/finance/transactions/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    });
    return response.data;
  },

  update: async (tenantId: string, id: string, data: Partial<CreateTransactionDto>) => {
    const response = await apiClient.patch(`/finance/transactions/${id}`, data, {
      headers: { 'x-tenant-id': tenantId },
    });
    return response.data;
  },

  remove: async (tenantId: string, id: string) => {
    const response = await apiClient.delete(`/finance/transactions/${id}`, {
      headers: { 'x-tenant-id': tenantId },
    });
    return response.data;
  },

  getStats: async (tenantId: string, startDate?: string, endDate?: string): Promise<FinanceStats> => {
    const response = await apiClient.get('/finance/stats', {
      params: { startDate, endDate },
      headers: { 'x-tenant-id': tenantId },
    });
    return response.data;
  },
};
