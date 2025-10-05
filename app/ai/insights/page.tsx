'use client';

import { useEffect, useState } from 'react';
import { GlassCard, NeonMetricCard } from '@/components/InnovativeUI';
import { Zap, Play, Square, RefreshCw, TrendingUp, Network, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Insight {
  id: string;
  name: string;
  description: string;
  properties: {
    source: string;
    url: string;
    category: string;
    keywords: string[];
    publishedAt: string;
  };
  createdAt: string;
  outgoingRelations: Array<{
    toEntity: {
      id: string;
      name: string;
      entityType: string;
    };
  }>;
}

interface SchedulerStatus {
  isActive: boolean;
  isRunning: boolean;
  lastRun: string | null;
  runCount: number;
  stats: {
    totalInsights: number;
    totalEntities: number;
    totalRelations: number;
  };
}

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInsights();
    const interval = setInterval(fetchInsights, 10000); // 10초마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await fetch('/api/ai/insights');
      const data = await res.json();
      setInsights(data.insights || []);
      setStatus(data.schedulerStatus);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    }
  };

  const handleSchedulerAction = async (action: 'start' | 'stop' | 'run_now') => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setStatus(data.status);
      await fetchInsights();
      alert(data.message);
    } catch (error) {
      console.error('Scheduler action failed:', error);
      alert('작업 실패');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      real_estate: 'text-thesis',
      finance: 'text-synthesis',
      construction: 'text-amber',
      regulation: 'text-nous',
      market: 'text-pneuma',
    };
    return colors[category] || 'text-pneuma';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      real_estate: '부동산',
      finance: '금융',
      construction: '건설',
      regulation: '규제',
      market: '시장',
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-void p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-light bg-gradient-to-r from-synthesis to-amber bg-clip-text text-transparent mb-2">
            AI 인사이트 & 크롤러
          </h1>
          <p className="text-pneuma">실시간 부동산/금융 정보 수집 및 온톨로지 자동 연결</p>
        </div>

        {/* Scheduler Controls */}
        <GlassCard className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-light text-logos flex items-center gap-2">
              <Zap className="w-5 h-5 text-synthesis" />
              크롤러 상태
            </h2>
            <div className="flex gap-2">
              {status?.isActive ? (
                <button
                  onClick={() => handleSchedulerAction('stop')}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-danger/20 text-danger rounded-lg hover:bg-danger/30 transition-all disabled:opacity-50"
                >
                  <Square className="w-4 h-4" />
                  중지
                </button>
              ) : (
                <button
                  onClick={() => handleSchedulerAction('start')}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-synthesis/20 text-synthesis rounded-lg hover:bg-synthesis/30 transition-all disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  시작
                </button>
              )}
              <button
                onClick={() => handleSchedulerAction('run_now')}
                disabled={loading || status?.isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-thesis/20 text-thesis rounded-lg hover:bg-thesis/30 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${status?.isRunning ? 'animate-spin' : ''}`} />
                즉시 실행
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="phenomenal p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${status?.isActive ? 'bg-synthesis animate-pulse' : 'bg-nous'}`} />
                <span className="text-xs text-nous">상태</span>
              </div>
              <div className="text-lg text-logos">
                {status?.isActive ? '실행 중' : '중지됨'}
              </div>
            </div>

            <div className="phenomenal p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-thesis" />
                <span className="text-xs text-nous">마지막 실행</span>
              </div>
              <div className="text-sm text-logos">
                {status?.lastRun ? new Date(status.lastRun).toLocaleTimeString('ko-KR') : '-'}
              </div>
            </div>

            <div className="phenomenal p-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-synthesis" />
                <span className="text-xs text-nous">실행 횟수</span>
              </div>
              <div className="text-lg text-logos">{status?.runCount || 0}회</div>
            </div>

            <div className="phenomenal p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-amber" />
                <span className="text-xs text-nous">수집 인사이트</span>
              </div>
              <div className="text-lg text-logos">{status?.stats.totalInsights || 0}개</div>
            </div>
          </div>
        </GlassCard>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <NeonMetricCard
            label="총 인사이트"
            value={insights.length}
            unit="개"
            color="thesis"
            icon={Zap}
          />
          <NeonMetricCard
            label="생성된 엔티티"
            value={status?.stats.totalEntities || 0}
            unit="개"
            color="synthesis"
            icon={Network}
          />
          <NeonMetricCard
            label="생성된 관계"
            value={status?.stats.totalRelations || 0}
            unit="개"
            color="amber"
            icon={CheckCircle}
          />
        </div>

        {/* Insights List */}
        <GlassCard>
          <h2 className="text-2xl font-light text-logos mb-6">최근 인사이트</h2>

          {insights.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-16 h-16 text-nous mx-auto mb-4 opacity-30" />
              <p className="text-pneuma mb-2">수집된 인사이트가 없습니다</p>
              <p className="text-sm text-nous">크롤러를 시작하거나 즉시 실행해 보세요</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 bg-phenomenon/30 rounded-xl border border-essence/50 hover:border-thesis transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(insight.properties.category)} bg-current/10`}>
                          {getCategoryLabel(insight.properties.category)}
                        </span>
                        <span className="text-xs text-nous">{insight.properties.source}</span>
                        <span className="text-xs text-pneuma">
                          {new Date(insight.properties.publishedAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <h3 className="text-lg text-logos font-medium mb-2">{insight.name}</h3>
                      <p className="text-sm text-pneuma mb-3">{insight.description}</p>

                      {/* Keywords */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {insight.properties.keywords.map((keyword, kidx) => (
                          <span key={kidx} className="px-2 py-1 bg-essence/30 text-nous rounded text-xs">
                            #{keyword}
                          </span>
                        ))}
                      </div>

                      {/* Connected Entities */}
                      {insight.outgoingRelations.length > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          <Network className="w-3 h-3 text-synthesis" />
                          <span className="text-pneuma">연결됨:</span>
                          {insight.outgoingRelations.slice(0, 3).map((rel, ridx) => (
                            <span key={ridx} className="text-synthesis">
                              {rel.toEntity.name}
                              {ridx < insight.outgoingRelations.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                          {insight.outgoingRelations.length > 3 && (
                            <span className="text-nous">+{insight.outgoingRelations.length - 3}개</span>
                          )}
                        </div>
                      )}
                    </div>

                    <a
                      href={insight.properties.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-thesis hover:text-synthesis transition-colors"
                    >
                      원문 →
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
