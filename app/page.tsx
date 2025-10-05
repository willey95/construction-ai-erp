'use client';

import { useEffect, useState } from 'react';
import { dashboardKPIs, sampleProjects } from '@/lib/sampleData';
import { useGlobalStore, autoConnectData } from '@/lib/globalStore';
import {
  GlassCard,
  NeonMetricCard,
  HolographicHeader,
  DataStreamBackground,
  ConnectionVisualization,
  LiveActivityIndicator,
  ConnectionNode,
  InteractiveTooltip,
} from '@/components/InnovativeUI';
import { Activity, Zap, TrendingUp, Network, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const {
    projects,
    setProjects,
    realtimeMetrics,
    selectedProjectId,
    selectProject,
    dataConnections,
    dataFlowHistory,
  } = useGlobalStore();

  const [mounted, setMounted] = useState(false);
  const [ontologyEntities, setOntologyEntities] = useState<any[]>([]);
  const [ontologyRelations, setOntologyRelations] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    // 초기 데이터 로드 및 자동 연결
    const initialProjects = sampleProjects.map(p => ({
      ...p,
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString(),
      contractDate: p.contractDate.toISOString(),
      financialMetrics: {
        npv: Math.random() * 1000 + 500,
        irr: Math.random() * 10 + 8,
        roi: Math.random() * 20 + 10,
        margin: Math.random() * 5 + 12,
      },
      riskScore: Math.random() * 100,
    }));

    setProjects(initialProjects);
    autoConnectData(initialProjects);

    // 온톨로지 데이터 로드
    fetchOntologyData();
    fetchAIInsights();
  }, [setProjects]);

  const fetchOntologyData = async () => {
    try {
      const [entitiesRes, relationsRes] = await Promise.all([
        fetch('/api/ontology/entities?limit=30'),
        fetch('/api/ontology/relations?limit=50'),
      ]);
      const entitiesData = await entitiesRes.json();
      const relationsData = await relationsRes.json();
      setOntologyEntities(entitiesData.entities || []);
      setOntologyRelations(relationsData.relations || []);
    } catch (error) {
      console.error('Failed to fetch ontology:', error);
    }
  };

  const fetchAIInsights = async () => {
    try {
      const res = await fetch('/api/ai/insights?limit=3');
      const data = await res.json();
      setAiInsights(data.insights || []);
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-void relative overflow-hidden">
      {/* 데이터 스트림 배경 */}
      <DataStreamBackground />

      <main className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        {/* 홀로그래픽 헤더 */}
        <HolographicHeader
          title="건설 ERP 대시보드"
          subtitle="Construction Management Information System - AI Powered & Data Interconnected"
        />

        {/* 실시간 활동 표시 */}
        <div className="flex justify-between items-center mb-8">
          <LiveActivityIndicator active pulse />
          <div className="flex items-center gap-4 text-xs text-pneuma">
            <span>데이터 흐름: {dataFlowHistory.length}건</span>
            <span>활성 연결: {dataConnections.length}개</span>
            <span>동기화: {new Date(realtimeMetrics.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* 네온 KPI 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div onClick={() => window.location.href = '/finance/forecast'} className="cursor-pointer">
            <NeonMetricCard
              label="총 매출"
              value={realtimeMetrics.totalRevenue.toFixed(0)}
              change={15.2}
              unit="억"
              color="thesis"
              icon={TrendingUp}
            />
          </div>
          <div onClick={() => window.location.href = '/finance/accounting'} className="cursor-pointer">
            <NeonMetricCard
              label="순이익"
              value={realtimeMetrics.totalProfit.toFixed(0)}
              change={18.5}
              unit="억"
              color="synthesis"
              icon={Zap}
            />
          </div>
          <div onClick={() => window.location.href = '/analysis/performance'} className="cursor-pointer">
            <NeonMetricCard
              label="평균 이익률"
              value={realtimeMetrics.avgMargin.toFixed(1)}
              change={2.3}
              unit="%"
              color="thesis"
              icon={Activity}
            />
          </div>
          <div onClick={() => window.location.href = '/analysis/simulation'} className="cursor-pointer">
            <NeonMetricCard
              label="리스크 프로젝트"
              value={realtimeMetrics.riskProjects}
              change={-12}
              unit="개"
              color="warning"
              icon={AlertTriangle}
            />
          </div>
        </div>

        {/* 데이터 연결 네트워크 */}
        <GlassCard className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-light text-logos flex items-center gap-2">
              <Network className="w-6 h-6 text-thesis" />
              데이터 연결 네트워크
              <span className="text-sm text-pneuma">Data Connection Network</span>
            </h2>
            <div className="text-xs text-pneuma">
              {dataConnections.length}개의 연결 활성
            </div>
          </div>

          <ConnectionVisualization
            connections={dataConnections.slice(0, 4)}
            onNodeClick={(id) => console.log('Node clicked:', id)}
          />

          <div className="grid grid-cols-4 gap-4 mt-6">
            {projects.slice(0, 4).map((project, idx) => (
              <InteractiveTooltip
                key={project.id}
                content={
                  <div className="space-y-1">
                    <div className="text-xs text-nous">{project.client}</div>
                    <div className="text-sm text-logos">{project.projectName}</div>
                    <div className="text-xs text-pneuma">
                      이익률: {project.financialMetrics?.margin.toFixed(1)}%
                    </div>
                  </div>
                }
              >
                <ConnectionNode
                  id={project.id}
                  label={project.projectCode}
                  type="project"
                  active={selectedProjectId === project.id}
                  onClick={() => selectProject(project.id)}
                />
              </InteractiveTooltip>
            ))}
          </div>
        </GlassCard>

        {/* 프로젝트 카드 그리드 */}
        <section className="mb-12">
          <h2 className="text-2xl font-light text-logos mb-6 bg-gradient-to-r from-thesis to-synthesis bg-clip-text text-transparent">
            진행중 프로젝트 Ongoing Projects
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.slice(0, 4).map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCard
                  glow={selectedProjectId === project.id}
                  onClick={() => window.location.href = `/projects/${project.id}`}
                  className="cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg text-logos font-medium mb-1">
                        {project.projectName}
                      </h3>
                      <p className="text-sm text-nous">{project.client}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl text-thesis font-light">
                        {project.contractPrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-pneuma">억원</div>
                    </div>
                  </div>

                  {/* 진행률 바 with gradient */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-nous mb-2">
                      <span>진행률</span>
                      <span className="text-thesis">{project.progressRate.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-essence/30 rounded-full overflow-hidden backdrop-blur-sm">
                      <motion.div
                        className="h-full bg-gradient-to-r from-thesis via-synthesis to-thesis"
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progressRate}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                      />
                    </div>
                  </div>

                  {/* 메트릭 그리드 */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-phenomenon/50 rounded">
                      <div className="text-xs text-nous">이익률</div>
                      <div className="text-sm text-synthesis">
                        {project.financialMetrics?.margin.toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-2 bg-phenomenon/50 rounded">
                      <div className="text-xs text-nous">리스크</div>
                      <div className={`text-sm ${(project.riskScore || 0) > 70 ? 'text-warning' : 'text-synthesis'}`}>
                        {project.riskScore?.toFixed(0)}
                      </div>
                    </div>
                    <div className="p-2 bg-phenomenon/50 rounded">
                      <div className="text-xs text-nous">ROI</div>
                      <div className="text-sm text-thesis">
                        {project.financialMetrics?.roi.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* 연결 표시 */}
                  <div className="mt-4 pt-4 border-t border-essence/50">
                    <div className="flex items-center gap-2 text-xs text-pneuma">
                      <Network className="w-3 h-3" />
                      <span>
                        {dataConnections.filter(c => c.from === project.id || c.to === project.id).length}개 연결
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AI 인사이트 */}
        <GlassCard className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light bg-gradient-to-r from-synthesis to-amber bg-clip-text text-transparent flex items-center gap-2">
              <Zap className="w-6 h-6 text-synthesis" />
              AI 인사이트 Insights
            </h2>
            <a href="/ai/insights" className="text-xs text-thesis hover:text-synthesis transition-colors">
              전체 보기 →
            </a>
          </div>

          <div className="space-y-4">
            {aiInsights.length > 0 ? (
              aiInsights.map((insight, idx) => {
                const getCategoryIcon = (cat: string) => {
                  const icons: Record<string, string> = {
                    real_estate: '🏢',
                    finance: '💰',
                    construction: '🏗️',
                    regulation: '📋',
                    market: '📊',
                  };
                  return icons[cat] || '📰';
                };

                const getCategoryColor = (cat: string) => {
                  const colors: Record<string, string> = {
                    real_estate: 'thesis',
                    finance: 'synthesis',
                    construction: 'amber',
                    regulation: 'nous',
                    market: 'pneuma',
                  };
                  return colors[cat] || 'thesis';
                };

                const color = getCategoryColor(insight.properties?.category);

                return (
                  <motion.div
                    key={insight.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                    className={`flex items-start gap-4 p-4 bg-gradient-to-r from-${color}/10 to-transparent rounded-lg border-l-2 border-${color}`}
                  >
                    <div className="text-2xl">{getCategoryIcon(insight.properties?.category)}</div>
                    <div className="flex-1">
                      <div className="text-xs text-nous uppercase tracking-wider mb-1">
                        {insight.properties?.source || 'AI 크롤러'}
                      </div>
                      <h3 className="text-sm text-logos font-medium mb-1">{insight.name}</h3>
                      <p className="text-sm text-pneuma">
                        {insight.description}
                      </p>
                      {insight.outgoingRelations && insight.outgoingRelations.length > 0 && (
                        <div className="mt-2 text-xs text-synthesis">
                          연결: {insight.outgoingRelations.slice(0, 2).map((r: any) => r.toEntity.name).join(', ')}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-4 p-4 bg-gradient-to-r from-thesis/10 to-transparent rounded-lg border-l-2 border-thesis"
                >
                  <div className="text-2xl text-thesis">📊</div>
                  <div className="flex-1">
                    <div className="text-xs text-nous uppercase tracking-wider mb-1">
                      데이터 패턴 분석
                    </div>
                    <p className="text-sm text-pneuma">
                      {projects.length}개 프로젝트 중 {Math.round(projects.length * 0.65)}개가 동일 발주사로 연결되어 있으며,
                      평균 이익률이 일반 대비 2.3% 높습니다.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-4 p-4 bg-gradient-to-r from-synthesis/10 to-transparent rounded-lg border-l-2 border-synthesis"
                >
                  <div className="text-2xl text-synthesis">🔮</div>
                  <div className="flex-1">
                    <div className="text-xs text-nous uppercase tracking-wider mb-1">
                      AI 예측
                    </div>
                    <p className="text-sm text-pneuma">
                      현재 공정 속도로 진행 시, 3개월 내 {realtimeMetrics.riskProjects}개 프로젝트에서
                      현금흐름 부족 가능성이 감지되었습니다.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-start gap-4 p-4 bg-gradient-to-r from-amber/10 to-transparent rounded-lg border-l-2 border-amber"
                >
                  <div className="text-2xl text-amber">💡</div>
                  <div className="flex-1">
                    <div className="text-xs text-nous uppercase tracking-wider mb-1">
                      최적화 제안
                    </div>
                    <p className="text-sm text-logos font-medium">
                      선급금 조기 회수 및 유보금 조정을 통해 현금흐름 {realtimeMetrics.cashFlow.toFixed(0)}억원 개선 예상
                    </p>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </GlassCard>

        {/* 온톨로지 지식 그래프 */}
        <GlassCard className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light bg-gradient-to-r from-thesis to-synthesis bg-clip-text text-transparent flex items-center gap-2">
              <Network className="w-6 h-6 text-synthesis" />
              온톨로지 지식 그래프 Knowledge Graph
            </h2>
            <a href="/ontology" className="text-xs text-thesis hover:text-synthesis transition-colors">
              전체 보기 →
            </a>
          </div>

          {ontologyEntities.length === 0 ? (
            <div className="text-center py-12">
              <Network className="w-16 h-16 text-nous mx-auto mb-4 opacity-30" />
              <p className="text-pneuma mb-2">구축된 온톨로지가 없습니다</p>
              <p className="text-sm text-nous mb-4">AI 생성기로 지식 그래프를 구축하세요</p>
              <a href="/ontology/builder">
                <button className="px-6 py-3 bg-gradient-to-r from-thesis to-synthesis text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-2 mx-auto">
                  <Zap className="w-5 h-5" />
                  <span>AI 생성기</span>
                </button>
              </a>
            </div>
          ) : (
            <>
              {/* 지식 그래프 시각화 */}
              <div className="relative bg-phenomenon/20 rounded-xl p-8 mb-6" style={{ minHeight: '400px' }}>
                {/* 엔티티 노드 */}
                {ontologyEntities.slice(0, 20).map((entity, idx) => {
                  const angle = (idx / Math.min(ontologyEntities.length, 20)) * 2 * Math.PI;
                  const radius = 120 + (idx % 3) * 40;
                  const x = Math.cos(angle) * radius + 300;
                  const y = Math.sin(angle) * radius + 200;

                  const colors: Record<string, string> = {
                    PROJECT: 'text-thesis border-thesis',
                    ORGANIZATION: 'text-synthesis border-synthesis',
                    PERSON: 'text-amber border-amber',
                    LOCATION: 'text-nous border-nous',
                    MILESTONE: 'text-pneuma border-pneuma',
                    RISK: 'text-warning border-warning',
                  };

                  const colorClass = colors[entity.entityType] || 'text-pneuma border-pneuma';

                  return (
                    <motion.div
                      key={entity.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="absolute cursor-pointer group"
                      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
                      onClick={() => window.location.href = `/ontology?entity=${entity.id}`}
                    >
                      <div className={`px-3 py-2 rounded-lg bg-phenomenon border ${colorClass} hover:bg-essence/50 transition-all`}>
                        <div className="text-xs font-medium whitespace-nowrap max-w-[100px] truncate">
                          {entity.name}
                        </div>
                        <div className="text-xs opacity-70">{entity.entityType}</div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* 관계 라인 */}
                <svg className="absolute inset-0 pointer-events-none" width="600" height="400">
                  {ontologyRelations.slice(0, 30).map((relation, idx) => {
                    const fromIdx = ontologyEntities.findIndex((e) => e.id === relation.fromEntity?.id);
                    const toIdx = ontologyEntities.findIndex((e) => e.id === relation.toEntity?.id);

                    if (fromIdx === -1 || toIdx === -1 || fromIdx >= 20 || toIdx >= 20) return null;

                    const fromAngle = (fromIdx / Math.min(ontologyEntities.length, 20)) * 2 * Math.PI;
                    const toAngle = (toIdx / Math.min(ontologyEntities.length, 20)) * 2 * Math.PI;
                    const fromRadius = 120 + (fromIdx % 3) * 40;
                    const toRadius = 120 + (toIdx % 3) * 40;

                    const x1 = Math.cos(fromAngle) * fromRadius + 300;
                    const y1 = Math.sin(fromAngle) * fromRadius + 200;
                    const x2 = Math.cos(toAngle) * toRadius + 300;
                    const y2 = Math.sin(toAngle) * toRadius + 200;

                    return (
                      <line
                        key={relation.id}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="rgba(99, 102, 241, 0.15)"
                        strokeWidth="1"
                      />
                    );
                  })}
                </svg>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-4 gap-4">
                <div className="phenomenal p-4 text-center">
                  <div className="text-2xl text-thesis font-light mb-1">{ontologyEntities.length}</div>
                  <div className="text-xs text-nous">엔티티</div>
                </div>
                <div className="phenomenal p-4 text-center">
                  <div className="text-2xl text-synthesis font-light mb-1">{ontologyRelations.length}</div>
                  <div className="text-xs text-nous">관계</div>
                </div>
                <div className="phenomenal p-4 text-center">
                  <div className="text-2xl text-amber font-light mb-1">
                    {new Set(ontologyEntities.map((e) => e.entityType)).size}
                  </div>
                  <div className="text-xs text-nous">엔티티 타입</div>
                </div>
                <div className="phenomenal p-4 text-center">
                  <div className="text-2xl text-pneuma font-light mb-1">
                    {(ontologyRelations.length / Math.max(ontologyEntities.length, 1)).toFixed(1)}
                  </div>
                  <div className="text-xs text-nous">평균 연결</div>
                </div>
              </div>
            </>
          )}
        </GlassCard>

        {/* 데이터 흐름 히스토리 */}
        <GlassCard>
          <h2 className="text-xl font-light text-logos mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-thesis" />
            실시간 데이터 흐름
            <span className="text-sm text-pneuma">Data Flow History</span>
          </h2>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {dataFlowHistory.slice(-10).reverse().map((flow, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-2 bg-phenomenon/30 rounded text-xs"
              >
                <div className="text-nous w-20">
                  {new Date(flow.timestamp).toLocaleTimeString()}
                </div>
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-thesis">{flow.source}</span>
                  <span className="text-pneuma">→</span>
                  <span className="text-synthesis">{flow.target}</span>
                </div>
                <div className="text-pneuma">{flow.action}</div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
