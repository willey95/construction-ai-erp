'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap,
  MapPin,
  TrendingUp,
  DollarSign,
  Activity,
  Battery,
  Sun,
  Wind,
  ArrowRight,
  AlertTriangle,
  Power,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard, NeonMetricCard } from '@/components/InnovativeUI';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

interface DashboardStats {
  totalPlants: number;
  operationalPlants: number;
  totalCapacity: number;
  currentProduction: number;
  todayProduction: number;
  todayRevenue: number;
  avgEfficiency: number;
  activeAlerts: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  profitMargin: number;
}

interface PlantSummary {
  plantType: string;
  count: number;
  totalCapacity: number;
  color: string;
  [key: string]: any;
}

interface ProductionTrend {
  time: string;
  production: number;
  efficiency: number;
}

export default function EnergyDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // 10초마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, plantsRes, settlementRes] = await Promise.all([
        fetch('/api/energy/stats'),
        fetch('/api/energy/plants'),
        fetch('/api/energy/settlement'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();

        // 정산 데이터에서 월간 매출/이익 계산
        let monthlyRevenue = 0;
        let monthlyProfit = 0;
        if (settlementRes.ok) {
          const settlements = await settlementRes.json();
          const currentMonth = new Date().getMonth();
          const currentMonthSettlements = settlements.filter((s: any) =>
            new Date(s.settlementMonth).getMonth() === currentMonth
          );
          monthlyRevenue = currentMonthSettlements.reduce((sum: number, s: any) =>
            sum + Number(s.totalRevenue), 0
          );
          monthlyProfit = currentMonthSettlements.reduce((sum: number, s: any) =>
            sum + Number(s.netProfit), 0
          );
        }

        setStats({
          ...statsData,
          monthlyRevenue,
          monthlyProfit,
          profitMargin: monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts (실제로는 API에서 가져와야 함)
  const plantTypeDistribution: PlantSummary[] = [
    { plantType: 'SOLAR', count: 8, totalCapacity: 4500, color: '#F59E0B' },
    { plantType: 'WIND', count: 3, totalCapacity: 2100, color: '#0EA5E9' },
    { plantType: 'HYDRO', count: 2, totalCapacity: 1800, color: '#3B82F6' },
    { plantType: 'ESS', count: 2, totalCapacity: 1200, color: '#8B5CF6' },
  ];

  const recentProductionTrend: ProductionTrend[] = [
    { time: '00:00', production: 1200, efficiency: 72 },
    { time: '04:00', production: 800, efficiency: 65 },
    { time: '08:00', production: 3200, efficiency: 85 },
    { time: '12:00', production: 5800, efficiency: 92 },
    { time: '16:00', production: 4200, efficiency: 88 },
    { time: '20:00', production: 2100, efficiency: 78 },
  ];

  const quickLinks = [
    {
      title: '운영 모니터링',
      description: '실시간 발전소 운영 현황',
      icon: Activity,
      color: 'from-amber-400 to-synthesis',
      href: '/energy/operations',
      stats: stats ? `${stats.operationalPlants}/${stats.totalPlants} 가동중` : '...',
    },
    {
      title: '발전소 관리',
      description: '발전소 정보 및 관리',
      icon: MapPin,
      color: 'from-synthesis to-thesis',
      href: '/energy/plants',
      stats: stats ? `${stats.totalPlants}개 발전소` : '...',
    },
    {
      title: '생산 현황',
      description: '발전량 및 효율 분석',
      icon: TrendingUp,
      color: 'from-thesis to-synthesis',
      href: '/energy/production',
      stats: stats ? `${stats.avgEfficiency.toFixed(1)}% 평균 효율` : '...',
    },
    {
      title: '정산 관리',
      description: '매출 및 수익 관리',
      icon: DollarSign,
      color: 'from-synthesis to-warning',
      href: '/energy/settlement',
      stats: stats ? `${(stats.monthlyRevenue / 100).toFixed(1)}억원/월` : '...',
    },
  ];

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-void p-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="h-8 bg-phenomenon/30 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-phenomenon/30 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void p-6">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-synthesis/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-warning/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light bg-gradient-to-r from-synthesis via-thesis to-synthesis bg-clip-text text-transparent mb-2">
            에너지 종합 대시보드
          </h1>
          <p className="text-pneuma">신재생에너지 발전사업 통합 모니터링 시스템</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <NeonMetricCard
            label="총 발전소"
            value={stats.totalPlants}
            unit="개"
            change={stats.operationalPlants}
            color="thesis"
            icon={Zap}
          />
          <NeonMetricCard
            label="총 설비용량"
            value={(stats.totalCapacity / 1000).toFixed(1)}
            unit="MW"
            color="synthesis"
            icon={Battery}
          />
          <NeonMetricCard
            label="현재 발전량"
            value={(stats.currentProduction / 1000).toFixed(1)}
            unit="MWh"
            change={stats.avgEfficiency}
            color="amber"
            icon={Activity}
          />
          <NeonMetricCard
            label="금일 매출"
            value={(stats.todayRevenue / 1000000).toFixed(1)}
            unit="백만원"
            change={15.2}
            color="synthesis"
            icon={DollarSign}
          />
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {quickLinks.map((link, idx) => (
            <motion.div
              key={link.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <GlassCard>
                <button
                  onClick={() => router.push(link.href)}
                  className="w-full p-6 text-left group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center`}>
                      <link.icon className="w-6 h-6 text-void" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-nous group-hover:text-thesis group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-medium text-logos mb-2 group-hover:text-thesis transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-nous mb-3">{link.description}</p>
                  <div className="text-xs text-synthesis">{link.stats}</div>
                </button>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Plant Type Distribution */}
          <GlassCard>
            <div className="p-6">
              <h2 className="text-xl font-light text-logos mb-6 flex items-center gap-2">
                <Power className="w-5 h-5 text-synthesis" />
                발전소 유형별 분포
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={plantTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalCapacity"
                    label={(entry) => `${entry.plantType} (${entry.count})`}
                  >
                    {plantTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => `${(value / 1000).toFixed(1)} MW`}
                    contentStyle={{
                      backgroundColor: '#1A202C',
                      border: '1px solid #4A5568',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {plantTypeDistribution.map((plant) => (
                  <div key={plant.plantType} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plant.color }} />
                    <div className="text-xs">
                      <div className="text-nous">{plant.plantType}</div>
                      <div className="text-pneuma">{(plant.totalCapacity / 1000).toFixed(1)}MW</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Production Trend */}
          <div className="col-span-2">
            <GlassCard>
              <div className="p-6">
                <h2 className="text-xl font-light text-logos mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-synthesis" />
                  금일 생산량 추이
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={recentProductionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                    <XAxis dataKey="time" stroke="#A0AEC0" style={{ fontSize: 11 }} />
                    <YAxis stroke="#A0AEC0" style={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1A202C',
                        border: '1px solid #4A5568',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="production"
                      stroke="#10B981"
                      name="발전량 (kW)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="efficiency"
                      stroke="#00D9FF"
                      name="효율 (%)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Bottom Stats Row */}
        <div className="grid grid-cols-3 gap-6">
          {/* Monthly Performance */}
          <GlassCard>
            <div className="p-6">
              <h3 className="text-sm text-nous mb-4">이번 달 실적</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-pneuma">매출</span>
                    <span className="text-lg font-medium text-synthesis">
                      {(stats.monthlyRevenue / 100).toFixed(1)}억원
                    </span>
                  </div>
                  <div className="h-2 bg-essence/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-synthesis to-thesis rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-pneuma">순이익</span>
                    <span className="text-lg font-medium text-thesis">
                      {(stats.monthlyProfit / 100).toFixed(1)}억원
                    </span>
                  </div>
                  <div className="h-2 bg-essence/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-thesis to-amber-400 rounded-full" style={{ width: '68%' }} />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-essence/10">
                  <span className="text-sm text-pneuma">이익률</span>
                  <span className="text-lg font-medium text-amber-400">
                    {stats.profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* System Status */}
          <GlassCard>
            <div className="p-6">
              <h3 className="text-sm text-nous mb-4">시스템 현황</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-pneuma">가동률</span>
                  <span className="text-sm text-synthesis">
                    {((stats.operationalPlants / stats.totalPlants) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-pneuma">평균 효율</span>
                  <span className="text-sm text-thesis">
                    {stats.avgEfficiency.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-pneuma">금일 생산</span>
                  <span className="text-sm text-amber-400">
                    {(stats.todayProduction / 1000).toFixed(1)} MWh
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-essence/10">
                  <span className="text-sm text-pneuma flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    활성 알림
                  </span>
                  <span className="text-sm text-warning font-medium">
                    {stats.activeAlerts}건
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Quick Stats */}
          <GlassCard>
            <div className="p-6">
              <h3 className="text-sm text-nous mb-4">오늘의 요약</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-synthesis/10 border border-synthesis/20">
                  <div className="text-xs text-nous mb-1">SMP 단가</div>
                  <div className="text-lg font-medium text-synthesis">125.5원/kWh</div>
                </div>
                <div className="p-3 rounded-lg bg-thesis/10 border border-thesis/20">
                  <div className="text-xs text-nous mb-1">REC 단가</div>
                  <div className="text-lg font-medium text-thesis">85.3원/kWh</div>
                </div>
                <div className="p-3 rounded-lg bg-amber-400/10 border border-amber-400/20">
                  <div className="text-xs text-nous mb-1">금일 예상 매출</div>
                  <div className="text-lg font-medium text-amber-400">
                    {(stats.todayRevenue / 1000000).toFixed(1)}M원
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
