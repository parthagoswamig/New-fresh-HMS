'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, Building2, FileText, Clock, CheckCircle, 
  XCircle, TrendingUp, Plus 
} from 'lucide-react';
import { insuranceService } from '@/services/insurance.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function InsurancePage() {
  const { tenant } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [claimStats, setClaimStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [companyData, claimData] = await Promise.all([
        insuranceService.getCompanyStats(tenant?.id || ''),
        insuranceService.getClaimStats(tenant?.id || ''),
      ]);
      setStats(companyData.data);
      setClaimStats(claimData.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Insurance Management
          </h1>
          <p className="text-gray-500">
            Manage insurance companies, policies, and claims
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/insurance/companies">
            <Button variant="outline">
              <Building2 className="w-4 h-4 mr-2" />
              Companies
            </Button>
          </Link>
          <Link href="/dashboard/insurance/claims">
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Claims
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCompanies || 0}</div>
            <p className="text-xs text-gray-500">Insurance providers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activePolicies || 0}</div>
            <p className="text-xs text-gray-500">Available for patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claimStats?.total || 0}</div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{claimStats?.totalApprovedAmount?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500">Total covered</p>
          </CardContent>
        </Card>
      </div>

      {/* Claims Status Overview */}
      {claimStats && (
        <Card>
          <CardHeader>
            <CardTitle>Claims Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{claimStats.initiated || 0}</div>
                <div className="text-sm text-gray-600">Initiated</div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{claimStats.underReview || 0}</div>
                <div className="text-sm text-gray-600">Under Review</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{claimStats.approved || 0}</div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{claimStats.rejected || 0}</div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Shield className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {((claimStats.approved / (claimStats.total || 1)) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Approval Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/insurance/companies">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <Building2 className="w-8 h-8" />
                <span>Manage Companies</span>
              </Button>
            </Link>

            <Link href="/dashboard/insurance/claims/new">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <Plus className="w-8 h-8" />
                <span>Create Claim</span>
              </Button>
            </Link>

            <Link href="/dashboard/insurance/claims">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <FileText className="w-8 h-8" />
                <span>View All Claims</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
