'use client';

import { useEffect, useState } from 'react';
import { MapPin, Plus, Edit, Trash2, Filter, Search, Zap, Power } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ZenCard,
  ZenButton,
  ZenBadge,
  ZenSkeleton,
  ZenDivider,
} from '@/components/ZenDesignSystem';

interface PowerPlant {
  id: string;
  plantCode: string;
  plantName: string;
  plantType: string;
  region: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  capacity: number;
  installedDate: Date;
  status: string;
  lastMaintenanceAt: Date | null;
  nextMaintenanceAt: Date | null;
  contractType: string | null;
  unitPrice: number | null;
}

export default function EnergyPlantsPage() {
  const [plants, setPlants] = useState<PowerPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    type: 'ALL',
    region: 'ALL',
    status: 'ALL',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const res = await fetch('/api/energy/plants');
      const data = await res.json();

      console.log('API Response:', data);
      console.log('Is plants array?', Array.isArray(data.plants));

      if (res.ok) {
        const plantsData = Array.isArray(data.plants) ? data.plants : [];
        console.log('Setting plants:', plantsData);
        setPlants(plantsData);
        setError(null);
      } else {
        console.error('API Error:', data.error);
        setError(data.error || 'Failed to fetch plants');
        setPlants([]);
      }
    } catch (error) {
      console.error('Failed to fetch plants:', error);
      setError('Network error');
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlants = Array.isArray(plants) ? plants.filter(plant => {
    const typeMatch = filter.type === 'ALL' || plant.plantType === filter.type;
    const regionMatch = filter.region === 'ALL' || plant.region === filter.region;
    const statusMatch = filter.status === 'ALL' || plant.status === filter.status;
    const searchMatch = searchTerm === '' ||
      plant.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.plantCode.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && regionMatch && statusMatch && searchMatch;
  }) : [];

  const uniqueRegions = Array.isArray(plants) ? Array.from(new Set(plants.map(p => p.region))) : [];
  const uniqueTypes = Array.isArray(plants) ? Array.from(new Set(plants.map(p => p.plantType))) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return 'success';
      case 'MAINTENANCE': return 'warning';
      case 'STOPPED': return 'danger';
      case 'CONSTRUCTION': return 'info';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SOLAR': return 'warning';
      case 'WIND': return 'info';
      case 'HYDRO': return 'thesis';
      case 'BIOMASS': return 'success';
      case 'ESS': return 'synthesis';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <ZenSkeleton height="h-32" />
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <ZenSkeleton key={i} height="h-64" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-void p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <Power className="w-16 h-16 text-danger/40 mx-auto mb-4" />
            <h3 className="text-lg text-pneuma/60 font-light mb-2">데이터를 불러올 수 없습니다</h3>
            <p className="text-sm text-nous/40 font-light mb-6">{error}</p>
            <ZenButton variant="primary" onClick={fetchPlants}>
              다시 시도
            </ZenButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-warning/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-synthesis/5 rounded-full blur-[128px]" />
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
                  <span className="bg-gradient-to-r from-warning via-synthesis to-warning bg-clip-text text-transparent">
                    발전소 관리
                  </span>
                </h1>
                <ZenBadge variant="info" size="md">
                  {filteredPlants.length}개 발전소
                </ZenBadge>
              </div>
              <p className="text-sm text-pneuma/60 font-light tracking-wide">
                Power Plant Management · 전국 발전소 현황
              </p>
            </div>

            <ZenButton variant="primary" size="sm" icon={Plus}>
              발전소 등록
            </ZenButton>
          </div>

          <ZenDivider />
        </motion.div>

        {/* Filters */}
        <ZenCard className="mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nous/60" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="발전소명, 코드 검색..."
                    className="w-full pl-10 pr-4 py-2 bg-phenomenon/30 border border-essence/20 rounded-lg text-sm text-logos placeholder:text-nous/40 focus:outline-none focus:border-thesis/40"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={filter.type}
                  onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                  className="w-full px-3 py-2 bg-phenomenon/30 border border-essence/20 rounded-lg text-sm text-logos"
                >
                  <option value="ALL">모든 유형</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Region Filter */}
              <div>
                <select
                  value={filter.region}
                  onChange={(e) => setFilter({ ...filter, region: e.target.value })}
                  className="w-full px-3 py-2 bg-phenomenon/30 border border-essence/20 rounded-lg text-sm text-logos"
                >
                  <option value="ALL">모든 지역</option>
                  {uniqueRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  className="w-full px-3 py-2 bg-phenomenon/30 border border-essence/20 rounded-lg text-sm text-logos"
                >
                  <option value="ALL">모든 상태</option>
                  <option value="OPERATIONAL">가동중</option>
                  <option value="MAINTENANCE">점검중</option>
                  <option value="STOPPED">정지</option>
                  <option value="CONSTRUCTION">공사중</option>
                </select>
              </div>
            </div>
          </div>
        </ZenCard>

        {/* Plants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map((plant, idx) => (
            <motion.div
              key={plant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <ZenCard hover glow border="subtle">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning/20 to-synthesis/20 flex items-center justify-center border border-warning/30">
                          {plant.plantType === 'SOLAR' ? <Zap className="w-5 h-5 text-warning" /> : <Power className="w-5 h-5 text-synthesis" />}
                        </div>
                        <div>
                          <h3 className="text-lg font-light text-logos">{plant.plantName}</h3>
                          <p className="text-xs text-nous/60">{plant.plantCode}</p>
                        </div>
                      </div>
                    </div>

                    <ZenBadge variant={getStatusColor(plant.status) as any} size="sm">
                      {plant.status}
                    </ZenBadge>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-nous/60">유형</span>
                      <ZenBadge variant={getTypeColor(plant.plantType) as any} size="sm">
                        {plant.plantType}
                      </ZenBadge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-nous/60">용량</span>
                      <span className="text-logos font-medium">{plant.capacity.toFixed(0)} kW</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-nous/60">지역</span>
                      <span className="text-pneuma">{plant.region}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-nous/60">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{plant.address}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <ZenButton variant="ghost" size="sm" icon={Edit} className="flex-1">
                      수정
                    </ZenButton>
                    <ZenButton variant="ghost" size="sm" icon={Trash2}>
                      삭제
                    </ZenButton>
                  </div>
                </div>
              </ZenCard>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPlants.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Power className="w-16 h-16 text-nous/20 mx-auto mb-4" />
            <h3 className="text-lg text-pneuma/60 font-light mb-2">발전소가 없습니다</h3>
            <p className="text-sm text-nous/40 font-light mb-6">
              새로운 발전소를 등록하세요
            </p>
            <ZenButton variant="primary" icon={Plus}>
              발전소 등록
            </ZenButton>
          </motion.div>
        )}
      </div>
    </div>
  );
}
