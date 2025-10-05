'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ZenCard,
  ZenButton,
  ZenBadge,
  ZenSkeleton,
  ZenDivider,
  ZenMetric,
} from '@/components/ZenDesignSystem';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Settlement {
  id: string;
  plant: {
    plantName: string;
    plantType: string;
    region: string;
  };
  settlementMonth: Date;
  smpRevenue: number;
  recRevenue: number;
  incentive: number;
  totalRevenue: number;
  operationCost: number;
  maintenanceCost: number;
  totalCost: number;
  netProfit: number;
  status: string;
  settledAt: Date | null;
}

export default function EnergySettlementPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      const res = await fetch('/api/energy/settlement');
      if (res.ok) {
        const data = await res.json();
        setSettlements(data);
      }
    } catch (error) {
      console.error('Failed to fetch settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSettlements = settlements.filter(s =>
    statusFilter === 'ALL' || s.status === statusFilter
  );

  const totalRevenue = settlements.reduce((sum, s) => sum + Number(s.totalRevenue), 0);
  const totalCost = settlements.reduce((sum, s) => sum + Number(s.totalCost), 0);
  const totalProfit = settlements.reduce((sum, s) => sum + Number(s.netProfit), 0);
  const completedCount = settlements.filter(s => s.status === 'COMPLETED').length;

  // Revenue breakdown
  const revenueBreakdown = [
    {
      name: 'SMP 수익',
      value: settlements.reduce((sum, s) => sum + Number(s.smpRevenue), 0),
      color: '#00D9FF',
    },
    {
      name: 'REC 수익',
      value: settlements.reduce((sum, s) => sum + Number(s.recRevenue), 0),
      color: '#10B981',
    },
    {
      name: '인센티브',
      value: settlements.reduce((sum, s) => sum + Number(s.incentive), 0),
      color: '#8B5CF6',
    },
  ];

  // Monthly trend
  const monthlyData = settlements.slice(0, 12).map(s => ({
    month: new Date(s.settlementMonth).toLocaleDateString('ko-KR', { month: 'short' }),
    revenue: Number(s.totalRevenue),
    cost: Number(s.totalCost),
    profit: Number(s.netProfit),
  })).reverse();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PROCESSING': return 'info';
      case 'FAILED': return 'danger';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <ZenSkeleton height="h-32" />
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <ZenSkeleton key={i} height="h-40" />)}
          </div>
          <ZenSkeleton height="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-synthesis/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-warning/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-5xl font-extralight tracking-tight">
                  <span className="bg-gradient-to-r from-synthesis via-warning to-synthesis bg-clip-text text-transparent">
                    정산 관리
                  </span>
                </h1>
                <ZenBadge variant="success" size="md">
                  {completedCount}/{settlements.length} 완료
                </ZenBadge>
              </div>
              <p className="text-sm text-pneuma/60 font-light tracking-wide">
                Settlement Management · 발전소별 월간 정산 현황
              </p>
            </div>

            <ZenButton variant="ghost" size="sm" icon={Download}>
              Export
            </ZenButton>
          </div>

          <ZenDivider />
        </motion.div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="총 매출"
              value={(totalRevenue / 100).toFixed(1)}
              unit="억원"
              change={8.5}
              trend="up"
              icon={DollarSign}
              color="synthesis"
              description="전체 발전소 매출 합계"
            />
          </ZenCard>

          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="총 비용"
              value={(totalCost / 100).toFixed(1)}
              unit="억원"
              change={-3.2}
              trend="down"
              icon={TrendingDown}
              color="warning"
              description="운영 및 유지보수 비용"
            />
          </ZenCard>

          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="순이익"
              value={(totalProfit / 100).toFixed(1)}
              unit="억원"
              change={15.3}
              trend="up"
              icon={TrendingUp}
              color="synthesis"
              description="매출 - 비용"
            />
          </ZenCard>

          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="이익률"
              value={((totalProfit / totalRevenue) * 100).toFixed(1)}
              unit="%"
              icon={TrendingUp}
              color="thesis"
              description="순이익 / 총매출"
            />
          </ZenCard>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Revenue Breakdown */}
          <ZenCard>
            <div className="p-8">
              <h2 className="text-2xl font-light text-logos mb-6">매출 구성</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${(entry.value / 100).toFixed(1)}억`}
                  >
                    {revenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => `${(value / 100).toFixed(1)}억원`}
                    contentStyle={{
                      backgroundColor: '#1A202C',
                      border: '1px solid #4A5568',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ZenCard>

          {/* Monthly Trend */}
          <ZenCard>
            <div className="p-8">
              <h2 className="text-2xl font-light text-logos mb-6">월별 추이</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                  <XAxis dataKey="month" stroke="#A0AEC0" style={{ fontSize: 12 }} />
                  <YAxis stroke="#A0AEC0" style={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: any) => `${(value / 100).toFixed(1)}억원`}
                    contentStyle={{
                      backgroundColor: '#1A202C',
                      border: '1px solid #4A5568',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#00D9FF" name="매출" />
                  <Bar dataKey="cost" fill="#F59E0B" name="비용" />
                  <Bar dataKey="profit" fill="#10B981" name="이익" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ZenCard>
        </div>

        {/* Filter */}
        <div className="flex gap-3 mb-6">
          {['ALL', 'COMPLETED', 'PROCESSING', 'PENDING', 'FAILED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                statusFilter === status
                  ? 'bg-thesis text-void'
                  : 'bg-phenomenon/20 text-pneuma hover:bg-phenomenon/40'
              }`}
            >
              {status === 'ALL' ? '전체' : status}
            </button>
          ))}
        </div>

        {/* Settlements Table */}
        <ZenCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-essence/20">
                  <th className="px-6 py-4 text-left text-xs font-medium text-nous uppercase">상태</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-nous uppercase">정산월</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-nous uppercase">발전소</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-nous uppercase">유형</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-nous uppercase">SMP 수익</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-nous uppercase">REC 수익</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-nous uppercase">총 매출</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-nous uppercase">총 비용</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-nous uppercase">순이익</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-nous uppercase">정산일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-essence/10">
                {filteredSettlements.map((settlement, idx) => (
                  <motion.tr
                    key={settlement.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-phenomenon/10 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ZenBadge variant={getStatusColor(settlement.status) as any} size="sm">
                        {settlement.status}
                      </ZenBadge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pneuma">
                      {new Date(settlement.settlementMonth).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-logos font-medium">
                      {settlement.plant.plantName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ZenBadge variant="info" size="sm">{settlement.plant.plantType}</ZenBadge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-thesis text-right">
                      {(Number(settlement.smpRevenue) / 100).toFixed(1)}억
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-synthesis text-right">
                      {(Number(settlement.recRevenue) / 100).toFixed(1)}억
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-synthesis text-right font-medium">
                      {(Number(settlement.totalRevenue) / 100).toFixed(1)}억
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-warning text-right">
                      {(Number(settlement.totalCost) / 100).toFixed(1)}억
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <span className={Number(settlement.netProfit) >= 0 ? 'text-synthesis' : 'text-danger'}>
                        {(Number(settlement.netProfit) / 100).toFixed(1)}억
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-nous">
                      {settlement.settledAt
                        ? new Date(settlement.settledAt).toLocaleDateString('ko-KR')
                        : '—'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </ZenCard>
      </div>
    </div>
  );
}
