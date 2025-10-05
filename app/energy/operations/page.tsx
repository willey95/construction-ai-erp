'use client';

import { useEffect, useState } from 'react';
import { Zap, MapPin, TrendingUp, AlertTriangle, DollarSign, Activity, Sun, Wind, Droplet, Battery, ThermometerSun, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard, NeonMetricCard } from '@/components/InnovativeUI';

interface PowerPlant {
  id: string;
  plantCode: string;
  plantName: string;
  plantType: string;
  region: string;
  status: string;
  capacity: number;
  currentProduction?: number;
  todayProduction?: number;
  efficiency?: number;
  temperature?: number;
  weather?: string;
}

interface EnergyStats {
  totalPlants: number;
  operationalPlants: number;
  totalCapacity: number;
  currentProduction: number;
  todayProduction: number;
  todayRevenue: number;
  avgEfficiency: number;
  activeAlerts: number;
}

interface Alert {
  id: string;
  plantName: string;
  alertType: string;
  severity: string;
  title: string;
  message: string;
  createdAt: string;
}

const PLANT_TYPE_ICONS: Record<string, any> = {
  SOLAR: Sun,
  WIND: Wind,
  HYDRO: Droplet,
  ESS: Battery,
  BIOMASS: Activity,
  HYBRID: Zap,
};

const PLANT_TYPE_COLORS: Record<string, string> = {
  SOLAR: 'text-amber-400',
  WIND: 'text-sky-400',
  HYDRO: 'text-blue-400',
  ESS: 'text-purple-400',
  BIOMASS: 'text-green-400',
  HYBRID: 'text-thesis',
};

export default function EnergyOperationsPage() {
  const [plants, setPlants] = useState<PowerPlant[]>([]);
  const [stats, setStats] = useState<EnergyStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // 5초마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [plantsRes, statsRes, alertsRes] = await Promise.all([
        fetch('/api/energy/plants'),
        fetch('/api/energy/stats'),
        fetch('/api/energy/alerts?active=true'),
      ]);

      if (plantsRes.ok) {
        const data = await plantsRes.json();
        setPlants(data.plants || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Failed to fetch energy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlantIcon = (type: string) => {
    const Icon = PLANT_TYPE_ICONS[type] || Zap;
    return <Icon className={`w-5 h-5 ${PLANT_TYPE_COLORS[type] || 'text-thesis'}`} />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-danger bg-danger/10 border-danger/30';
      case 'HIGH': return 'text-warning bg-warning/10 border-warning/30';
      case 'MEDIUM': return 'text-synthesis bg-synthesis/10 border-synthesis/30';
      default: return 'text-nous bg-nous/10 border-nous/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return 'bg-synthesis';
      case 'MAINTENANCE': return 'bg-warning';
      case 'STOPPED': return 'bg-danger';
      default: return 'bg-nous';
    }
  };

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
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-thesis/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light bg-gradient-to-r from-amber-400 via-synthesis to-amber-400 bg-clip-text text-transparent mb-2">
            에너지 운영 대시보드
          </h1>
          <p className="text-pneuma">전국 발전소 실시간 모니터링 및 운영 관리</p>
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

        <div className="grid grid-cols-3 gap-6">
          {/* Power Plants Map */}
          <div className="col-span-2">
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-logos flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-synthesis" />
                  발전소 현황 ({plants.length})
                </h2>
                <div className="flex gap-2">
                  {Object.entries(PLANT_TYPE_COLORS).slice(0, 4).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-1 text-xs">
                      <div className={`w-2 h-2 rounded-full ${color}`} />
                      <span className="text-nous">{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                {plants.map((plant, idx) => (
                  <motion.div
                    key={plant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-4 rounded-lg bg-phenomenon/20 border border-essence/10 hover:border-thesis/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-essence/20 flex items-center justify-center">
                          {getPlantIcon(plant.plantType)}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-logos group-hover:text-thesis transition-colors">
                            {plant.plantName}
                          </h3>
                          <p className="text-xs text-nous">{plant.region}</p>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(plant.status)} animate-pulse`} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div>
                        <div className="text-[10px] text-nous mb-1">용량</div>
                        <div className="text-xs text-pneuma">{(plant.capacity / 1000).toFixed(1)}MW</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-nous mb-1">현재발전</div>
                        <div className="text-xs text-synthesis">{plant.currentProduction?.toFixed(0) || 0}kW</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-nous mb-1">효율</div>
                        <div className="text-xs text-amber-400">{plant.efficiency?.toFixed(1) || 0}%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-essence/10">
                      <div className="flex items-center gap-2 text-xs text-pneuma">
                        <ThermometerSun className="w-3 h-3" />
                        <span>{plant.temperature || 0}°C</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-nous">
                        <Cloud className="w-3 h-3" />
                        <span>{plant.weather || '정보없음'}</span>
                      </div>
                      <div className="text-xs text-thesis">
                        {plant.todayProduction?.toFixed(0) || 0}kWh
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Alerts & Weather */}
          <div className="space-y-6">
            {/* Active Alerts */}
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-logos flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  활성 알림
                </h2>
                <span className="px-2 py-1 bg-danger/20 text-danger rounded text-xs">
                  {alerts.length}건
                </span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-pneuma/60 text-sm">
                    활성 알림이 없습니다
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-xs font-medium">{alert.plantName}</h4>
                        <span className="text-[10px] opacity-60">
                          {new Date(alert.createdAt).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-xs mb-1">{alert.title}</p>
                      <p className="text-[10px] opacity-80">{alert.message}</p>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>

            {/* Production Trend */}
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-logos flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-synthesis" />
                  생산 추이
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-pneuma">금일 누적</span>
                    <span className="text-sm text-synthesis">
                      {(stats.todayProduction / 1000).toFixed(1)} MWh
                    </span>
                  </div>
                  <div className="h-2 bg-essence/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-synthesis to-thesis rounded-full"
                      style={{ width: `${(stats.todayProduction / stats.totalCapacity) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-pneuma">평균 효율</span>
                    <span className="text-sm text-amber-400">
                      {stats.avgEfficiency.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-essence/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                      style={{ width: `${stats.avgEfficiency}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-essence/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-nous mb-1">SMP 단가</div>
                      <div className="text-sm text-logos">125.5원/kWh</div>
                    </div>
                    <div>
                      <div className="text-xs text-nous mb-1">REC 단가</div>
                      <div className="text-sm text-logos">85.3원/kWh</div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
