'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Zap, Calendar, Download } from 'lucide-react';
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
  ZenSparkline,
  ZenStatusIndicator,
} from '@/components/ZenDataViz';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Production {
  id: string;
  plantId: string;
  plant: {
    plantName: string;
    plantType: string;
    region: string;
  };
  recordedAt: Date;
  production: number;
  temperature: number | null;
  humidity: number | null;
  irradiance: number | null;
  windSpeed: number | null;
  efficiency: number | null;
}

export default function EnergyProductionPage() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    fetchProductions();
    const interval = setInterval(fetchProductions, 10000); // 10초마다 업데이트
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchProductions = async () => {
    try {
      // 실제로는 time range에 따라 다른 데이터를 가져와야 함
      const res = await fetch('/api/energy/production');
      if (res.ok) {
        const data = await res.json();
        setProductions(data);
      }
    } catch (error) {
      console.error('Failed to fetch productions:', error);
    } finally {
      setLoading(false);
    }
  };

  // 발전소별 집계
  const plantProductionMap = productions.reduce((acc, prod) => {
    const plantName = prod.plant.plantName;
    if (!acc[plantName]) {
      acc[plantName] = {
        plantName,
        plantType: prod.plant.plantType,
        region: prod.plant.region,
        totalProduction: 0,
        avgEfficiency: 0,
        count: 0,
      };
    }
    acc[plantName].totalProduction += Number(prod.production);
    acc[plantName].avgEfficiency += Number(prod.efficiency || 0);
    acc[plantName].count += 1;
    return acc;
  }, {} as Record<string, any>);

  const plantProductions = Object.values(plantProductionMap).map((plant: any) => ({
    ...plant,
    avgEfficiency: plant.count > 0 ? (plant.avgEfficiency / plant.count).toFixed(1) : 0,
  }));

  // 시간별 생산량 (최근 데이터)
  const hourlyData = productions
    .slice(0, 24)
    .map(prod => ({
      time: new Date(prod.recordedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      production: Number(prod.production),
      efficiency: Number(prod.efficiency || 0),
    }))
    .reverse();

  const totalProduction = productions.reduce((sum, p) => sum + Number(p.production), 0);
  const avgEfficiency = productions.length > 0
    ? productions.reduce((sum, p) => sum + Number(p.efficiency || 0), 0) / productions.length
    : 0;

  const sparklineData = hourlyData.map(d => d.production);

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
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-thesis/5 rounded-full blur-[128px]" />
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
                  <span className="bg-gradient-to-r from-synthesis via-thesis to-synthesis bg-clip-text text-transparent">
                    생산 현황
                  </span>
                </h1>
                <ZenStatusIndicator status="success" label="Live" pulse size="md" />
              </div>
              <p className="text-sm text-pneuma/60 font-light tracking-wide">
                Production Status · 실시간 발전량 모니터링
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeRange('24h')}
                  className={`px-3 py-1 rounded-lg text-xs transition-all ${
                    timeRange === '24h'
                      ? 'bg-thesis text-void'
                      : 'bg-phenomenon/20 text-pneuma hover:bg-phenomenon/40'
                  }`}
                >
                  24시간
                </button>
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1 rounded-lg text-xs transition-all ${
                    timeRange === '7d'
                      ? 'bg-thesis text-void'
                      : 'bg-phenomenon/20 text-pneuma hover:bg-phenomenon/40'
                  }`}
                >
                  7일
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1 rounded-lg text-xs transition-all ${
                    timeRange === '30d'
                      ? 'bg-thesis text-void'
                      : 'bg-phenomenon/20 text-pneuma hover:bg-phenomenon/40'
                  }`}
                >
                  30일
                </button>
              </div>
              <ZenButton variant="ghost" size="sm" icon={Download}>
                Export
              </ZenButton>
            </div>
          </div>

          <ZenDivider />
        </motion.div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="총 생산량"
              value={totalProduction.toFixed(0)}
              unit="kWh"
              change={12.5}
              trend="up"
              icon={Zap}
              color="synthesis"
              description="전체 발전소 누적 생산량"
            />
            <div className="px-6 pb-6">
              <ZenSparkline data={sparklineData} color="#10B981" height={40} />
            </div>
          </ZenCard>

          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="평균 효율"
              value={avgEfficiency.toFixed(1)}
              unit="%"
              change={3.2}
              trend="up"
              icon={TrendingUp}
              color="thesis"
              description="전체 발전소 평균 효율"
            />
          </ZenCard>

          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="가동 발전소"
              value={plantProductions.length}
              unit="개"
              icon={Zap}
              color="synthesis"
              description="현재 생산 중인 발전소"
            />
          </ZenCard>

          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="데이터 포인트"
              value={productions.length}
              unit="건"
              icon={TrendingUp}
              color="thesis"
              description="수집된 생산 데이터 수"
            />
          </ZenCard>
        </div>

        {/* Production Trend Chart */}
        <ZenCard className="mb-8">
          <div className="p-8">
            <h2 className="text-2xl font-light text-logos mb-6">시간별 생산량 추이</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                <XAxis dataKey="time" stroke="#A0AEC0" style={{ fontSize: 12 }} />
                <YAxis stroke="#A0AEC0" style={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A202C',
                    border: '1px solid #4A5568',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="production" stroke="#10B981" name="생산량 (kWh)" strokeWidth={2} />
                <Line type="monotone" dataKey="efficiency" stroke="#00D9FF" name="효율 (%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ZenCard>

        {/* Plant-wise Production */}
        <ZenCard className="mb-8">
          <div className="p-8">
            <h2 className="text-2xl font-light text-logos mb-6">발전소별 생산량</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={plantProductions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                <XAxis dataKey="plantName" stroke="#A0AEC0" style={{ fontSize: 11 }} />
                <YAxis stroke="#A0AEC0" style={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A202C',
                    border: '1px solid #4A5568',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="totalProduction" fill="#10B981" name="생산량 (kWh)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ZenCard>

        {/* Production Table */}
        <ZenCard>
          <div className="p-8">
            <h2 className="text-2xl font-light text-logos mb-6">최근 생산 데이터</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-essence/20">
                    <th className="px-4 py-3 text-left text-xs font-medium text-nous uppercase">시간</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-nous uppercase">발전소</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-nous uppercase">유형</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-nous uppercase">지역</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-nous uppercase">생산량</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-nous uppercase">효율</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-nous uppercase">온도</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-nous uppercase">일사량</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-essence/10">
                  {productions.slice(0, 20).map((prod, idx) => (
                    <motion.tr
                      key={prod.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-phenomenon/10 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-pneuma">
                        {new Date(prod.recordedAt).toLocaleString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-logos font-medium">{prod.plant.plantName}</td>
                      <td className="px-4 py-3">
                        <ZenBadge variant="info" size="sm">{prod.plant.plantType}</ZenBadge>
                      </td>
                      <td className="px-4 py-3 text-sm text-nous">{prod.plant.region}</td>
                      <td className="px-4 py-3 text-sm text-synthesis text-right font-medium">
                        {Number(prod.production).toFixed(1)} kWh
                      </td>
                      <td className="px-4 py-3 text-sm text-thesis text-right">
                        {prod.efficiency ? `${Number(prod.efficiency).toFixed(1)}%` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-pneuma text-right">
                        {prod.temperature ? `${Number(prod.temperature).toFixed(1)}°C` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-pneuma text-right">
                        {prod.irradiance ? `${Number(prod.irradiance).toFixed(0)} W/m²` : '—'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ZenCard>
      </div>
    </div>
  );
}
