import apiClient from '@/lib/api-client';

export const dashboardService = {
  // Get all dashboard statistics
  getStats: async (tenantId: string) => {
    try {
      const [
        patientsStats,
        appointmentsStats,
        opdStats,
        ipdStats,
        billingStats,
      ] = await Promise.all([
        apiClient.get('/patients/stats', {
          headers: { 'x-tenant-id': tenantId },
        }).catch(() => ({ data: { total: 0 } })),
        apiClient.get('/appointments/stats', {
          headers: { 'x-tenant-id': tenantId },
        }).catch(() => ({ data: { total: 0, today: 0 } })),
        apiClient.get('/opd/stats', {
          headers: { 'x-tenant-id': tenantId },
        }).catch(() => ({ data: { total: 0 } })),
        apiClient.get('/ipd/stats', {
          headers: { 'x-tenant-id': tenantId },
        }).catch(() => ({ data: { total: 0, active: 0 } })),
        apiClient.get('/billing/stats', {
          headers: { 'x-tenant-id': tenantId },
        }).catch(() => ({ data: { pendingAmount: 0, totalRevenue: 0 } })),
      ]);

      return {
        patients: patientsStats.data,
        appointments: appointmentsStats.data,
        opd: opdStats.data,
        ipd: ipdStats.data,
        billing: {
          pending: billingStats.data.pendingAmount || 0,
          revenue: billingStats.data.totalRevenue || 0,
        },
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        patients: { total: 0 },
        appointments: { total: 0, today: 0 },
        opd: { total: 0 },
        ipd: { total: 0, active: 0 },
        billing: { pending: 0, revenue: 0 },
      };
    }
  },

  // Get recent activities
  getRecentActivities: async (tenantId: string, limit: number = 10) => {
    try {
      const [appointments, bills, labEntries] = await Promise.all([
        apiClient.get('/appointments', {
          params: { page: 1, limit: 5 },
          headers: { 'x-tenant-id': tenantId },
        }),
        apiClient.get('/billing', {
          params: { page: 1, limit: 5 },
          headers: { 'x-tenant-id': tenantId },
        }),
        apiClient.get('/lab-entries', {
          params: { page: 1, limit: 5 },
          headers: { 'x-tenant-id': tenantId },
        }),
      ]);

      // Combine and sort by date
      const activities = [
        ...appointments.data.data.map((item: any) => ({
          ...item,
          type: 'appointment',
          date: item.appointmentDate,
        })),
        ...bills.data.data.map((item: any) => ({
          ...item,
          type: 'bill',
          date: item.createdAt,
        })),
        ...labEntries.data.data.map((item: any) => ({
          ...item,
          type: 'lab',
          date: item.createdAt,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return activities.slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  },
};
