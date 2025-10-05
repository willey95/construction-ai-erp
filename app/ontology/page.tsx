'use client';

import { useEffect, useState } from 'react';
import { GlassCard, NeonMetricCard, LiveActivityIndicator } from '@/components/InnovativeUI';
import { Network, Database, GitBranch, Activity, Zap, CheckCircle2, Clock, ChevronRight, ChevronDown, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OntologyEntity {
  id: string;
  entityType: string;
  name: string;
  label: string;
  description: string;
  properties: any;
  createdAt: string;
  outgoingRelations?: { toEntity: { name: string; entityType: string } }[];
  incomingRelations?: { fromEntity: { name: string; entityType: string } }[];
}

interface OntologyStats {
  entityCount: number;
  relationCount: number;
  entityTypeDistribution: { entityType: string; _count: number }[];
  relationTypeDistribution: { relationType: string; _count: number }[];
  unverifiedEntities: number;
  unverifiedRelations: number;
  verificationRate: {
    entities: number;
    relations: number;
  };
}

interface Neo4jStats {
  nodeCount: number;
  relationshipCount: number;
  labels: string[];
  relationshipTypes: string[];
}

export default function OntologyPage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<OntologyStats | null>(null);
  const [neo4jStats, setNeo4jStats] = useState<Neo4jStats | null>(null);
  const [syncStatus, setSyncStatus] = useState({ inSync: true, postgresqlCount: 0, neo4jCount: 0 });
  const [entities, setEntities] = useState<OntologyEntity[]>([]);

  // View modes
  const [viewMode, setViewMode] = useState<'stats' | 'hierarchy' | 'timeline'>('stats');
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [selectedEntity, setSelectedEntity] = useState<OntologyEntity | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchStats();
    fetchEntities();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/ontology/stats');
      const data = await res.json();
      setStats(data.stats);
      setSyncStatus(data.syncStatus);
      setNeo4jStats(data.neo4jStats);
    } catch (error) {
      console.error('Failed to fetch ontology stats:', error);
    }
  };

  const fetchEntities = async () => {
    try {
      const res = await fetch('/api/ontology/entities?limit=100');
      const data = await res.json();
      setEntities(data.entities || []);
    } catch (error) {
      console.error('Failed to fetch entities:', error);
    }
  };

  const toggleTypeExpansion = (type: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  // Group entities by type for hierarchy view
  const entitiesByType = entities.reduce((acc, entity) => {
    if (!acc[entity.entityType]) {
      acc[entity.entityType] = [];
    }
    acc[entity.entityType].push(entity);
    return acc;
  }, {} as Record<string, OntologyEntity[]>);

  // Sort entities by creation date for timeline
  const entitiesByTime = [...entities].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header with explanation */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-light bg-gradient-to-r from-thesis to-synthesis bg-clip-text text-transparent mb-2">
                온톨로지 & 지식 그래프
              </h1>
              <p className="text-pneuma mb-3">Ontology & Knowledge Graph - 시스템의 데이터 연결 중추</p>
            </div>
            <LiveActivityIndicator active pulse />
          </div>

          {/* Explanation card */}
          <GlassCard className="mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-thesis mt-0.5 flex-shrink-0" />
              <div className="text-sm text-pneuma space-y-2">
                <p className="text-logos font-medium">온톨로지의 역할: 데이터 연결과 의미 부여</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li><span className="text-thesis">프로젝트 → 비용 → 거래처</span> 관계를 자동으로 학습하고 연결</li>
                  <li><span className="text-synthesis">AI 챗봇</span>이 질문에 답할 때 이 지식 그래프를 활용하여 정확한 답변 생성</li>
                  <li><span className="text-amber">재무 예측</span> 시 과거 프로젝트 패턴을 참조하여 더 정확한 예측 제공</li>
                  <li><span className="text-nous">대시보드 KPI</span>들이 이 온톨로지를 통해 서로 연결되어 드릴다운 가능</li>
                </ul>
                <p className="text-xs text-nous pt-1">
                  💡 예: "A 프로젝트"를 클릭하면 → 관련 비용, 거래처, 담당자, 리스크 모두 자동으로 연결되어 표시
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* View mode toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('stats')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'stats' ? 'bg-thesis text-void' : 'bg-phenomenon text-pneuma hover:text-logos'
            }`}
          >
            통계 보기
          </button>
          <button
            onClick={() => setViewMode('hierarchy')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'hierarchy' ? 'bg-synthesis text-void' : 'bg-phenomenon text-pneuma hover:text-logos'
            }`}
          >
            계층구조 보기
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'timeline' ? 'bg-amber text-void' : 'bg-phenomenon text-pneuma hover:text-logos'
            }`}
          >
            타임라인 보기
          </button>
        </div>

        {/* STATS VIEW */}
        {viewMode === 'stats' && (
          <>
            {/* 메트릭 카드 */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <NeonMetricCard
                label="엔티티"
                value={stats?.entityCount || 0}
                unit="개"
                color="thesis"
                icon={Database}
              />
              <NeonMetricCard
                label="관계"
                value={stats?.relationCount || 0}
                unit="개"
                color="synthesis"
                icon={GitBranch}
              />
              <NeonMetricCard
                label="검증률"
                value={stats?.verificationRate.entities.toFixed(1) || '0'}
                unit="%"
                color="thesis"
                icon={CheckCircle2}
              />
              <NeonMetricCard
                label="동기화 상태"
                value={syncStatus.inSync ? '정상' : '불일치'}
                color={syncStatus.inSync ? 'synthesis' : 'warning'}
                icon={Activity}
              />
            </div>

            {/* Neo4j vs PostgreSQL 비교 */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <GlassCard>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-thesis/20 flex items-center justify-center">
                    <Database className="w-6 h-6 text-thesis" />
                  </div>
                  <div>
                    <h2 className="text-lg font-light text-logos">PostgreSQL</h2>
                    <p className="text-xs text-pneuma">관계형 데이터베이스</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-phenomenon rounded">
                    <span className="text-sm text-nous">엔티티 수</span>
                    <span className="text-thesis">{syncStatus.postgresqlCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-phenomenon rounded">
                    <span className="text-sm text-nous">관계 수</span>
                    <span className="text-thesis">{stats?.relationCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-phenomenon rounded">
                    <span className="text-sm text-nous">검증 대기</span>
                    <span className="text-warning">{stats?.unverifiedEntities || 0}</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-synthesis/20 flex items-center justify-center">
                    <Network className="w-6 h-6 text-synthesis" />
                  </div>
                  <div>
                    <h2 className="text-lg font-light text-logos">Neo4j</h2>
                    <p className="text-xs text-pneuma">그래프 데이터베이스</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-phenomenon rounded">
                    <span className="text-sm text-nous">노드 수</span>
                    <span className="text-synthesis">{syncStatus.neo4jCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-phenomenon rounded">
                    <span className="text-sm text-nous">관계 수</span>
                    <span className="text-synthesis">{neo4jStats?.relationshipCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-phenomenon rounded">
                    <span className="text-sm text-nous">레이블 종류</span>
                    <span className="text-synthesis">{neo4jStats?.labels.length || 0}</span>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* 엔티티 타입 분포 */}
            <GlassCard className="mb-8">
              <h2 className="text-xl font-light text-logos mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-thesis" />
                엔티티 타입 분포
              </h2>

              <div className="grid grid-cols-5 gap-3">
                {stats?.entityTypeDistribution.map((item, idx) => (
                  <motion.div
                    key={item.entityType}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 bg-phenomenon/50 rounded-lg border border-essence/50 hover:border-thesis transition-all cursor-pointer"
                    onClick={() => {
                      setViewMode('hierarchy');
                      setExpandedTypes(new Set([item.entityType]));
                    }}
                  >
                    <div className="text-xs text-nous mb-1">{item.entityType}</div>
                    <div className="text-xl text-thesis font-light">{item._count}</div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* 관계 타입 분포 */}
            <GlassCard className="mb-8">
              <h2 className="text-xl font-light text-logos mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-synthesis" />
                관계 타입 분포
              </h2>

              <div className="grid grid-cols-6 gap-2">
                {stats?.relationTypeDistribution.map((item, idx) => (
                  <motion.div
                    key={item.relationType}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-2 bg-phenomenon/50 rounded border border-essence/30 hover:border-synthesis transition-all text-center"
                  >
                    <div className="text-xs text-pneuma mb-1">{item.relationType}</div>
                    <div className="text-synthesis font-light">{item._count}</div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </>
        )}

        {/* HIERARCHY VIEW */}
        {viewMode === 'hierarchy' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Left: Entity types tree */}
            <div className="col-span-2">
              <GlassCard>
                <h2 className="text-xl font-light text-logos mb-4 flex items-center gap-2">
                  <Network className="w-5 h-5 text-synthesis" />
                  엔티티 계층구조
                </h2>

                {entities.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 text-nous mx-auto mb-3 opacity-50" />
                    <p className="text-pneuma mb-1">등록된 엔티티가 없습니다</p>
                    <p className="text-sm text-nous">AI 생성기에서 온톨로지를 생성해 보세요</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(entitiesByType).map(([type, typeEntities]) => (
                      <div key={type} className="border border-essence/30 rounded-lg overflow-hidden">
                        {/* Type header */}
                        <button
                          onClick={() => toggleTypeExpansion(type)}
                          className="w-full flex items-center justify-between p-3 bg-phenomenon/30 hover:bg-phenomenon/50 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            {expandedTypes.has(type) ? (
                              <ChevronDown className="w-4 h-4 text-thesis" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-nous" />
                            )}
                            <span className="text-thesis font-medium">{type}</span>
                            <span className="text-xs text-nous">({typeEntities.length})</span>
                          </div>
                        </button>

                        {/* Entity list */}
                        <AnimatePresence>
                          {expandedTypes.has(type) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-2 space-y-1">
                                {typeEntities.map((entity) => (
                                  <button
                                    key={entity.id}
                                    onClick={() => setSelectedEntity(entity)}
                                    className={`w-full text-left p-2 rounded transition-all ${
                                      selectedEntity?.id === entity.id
                                        ? 'bg-thesis/20 border border-thesis'
                                        : 'hover:bg-phenomenon/50 border border-transparent'
                                    }`}
                                  >
                                    <div className="text-sm text-logos">{entity.name}</div>
                                    <div className="text-xs text-pneuma">{entity.label}</div>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Right: Selected entity details */}
            <div>
              <GlassCard>
                <h3 className="text-lg font-light text-logos mb-4">엔티티 상세</h3>

                {selectedEntity ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-nous mb-1">이름</div>
                      <div className="text-logos font-medium">{selectedEntity.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-nous mb-1">레이블</div>
                      <div className="text-pneuma">{selectedEntity.label}</div>
                    </div>
                    <div>
                      <div className="text-xs text-nous mb-1">타입</div>
                      <div className="px-2 py-1 bg-thesis/20 text-thesis rounded text-sm inline-block">
                        {selectedEntity.entityType}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-nous mb-1">설명</div>
                      <div className="text-sm text-pneuma">{selectedEntity.description || '-'}</div>
                    </div>

                    {selectedEntity.outgoingRelations && selectedEntity.outgoingRelations.length > 0 && (
                      <div>
                        <div className="text-xs text-nous mb-2">나가는 관계</div>
                        <div className="space-y-1">
                          {selectedEntity.outgoingRelations.map((rel, idx) => (
                            <div key={idx} className="text-xs p-2 bg-phenomenon rounded flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-synthesis" />
                              <span className="text-pneuma">{rel.toEntity.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedEntity.incomingRelations && selectedEntity.incomingRelations.length > 0 && (
                      <div>
                        <div className="text-xs text-nous mb-2">들어오는 관계</div>
                        <div className="space-y-1">
                          {selectedEntity.incomingRelations.map((rel, idx) => (
                            <div key={idx} className="text-xs p-2 bg-phenomenon rounded flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-amber rotate-180" />
                              <span className="text-pneuma">{rel.fromEntity.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 text-nous mx-auto mb-3 opacity-30" />
                    <p className="text-sm text-pneuma">엔티티를 선택하세요</p>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        )}

        {/* TIMELINE VIEW */}
        {viewMode === 'timeline' && (
          <GlassCard>
            <h2 className="text-xl font-light text-logos mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber" />
              생성 타임라인
            </h2>

            {entitiesByTime.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-nous mx-auto mb-3 opacity-50" />
                <p className="text-pneuma mb-1">생성된 엔티티가 없습니다</p>
                <p className="text-sm text-nous">AI 생성기에서 온톨로지를 생성해 보세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {entitiesByTime.map((entity, idx) => {
                  const date = new Date(entity.createdAt);
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <motion.div
                      key={entity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex gap-4 items-start"
                    >
                      {/* Timeline marker */}
                      <div className="flex flex-col items-center pt-1">
                        <div className={`w-3 h-3 rounded-full ${isToday ? 'bg-synthesis' : 'bg-thesis/50'}`} />
                        {idx < entitiesByTime.length - 1 && (
                          <div className="w-0.5 h-16 bg-essence/30 mt-1" />
                        )}
                      </div>

                      {/* Entity card */}
                      <div className="flex-1 p-3 bg-phenomenon/30 rounded-lg border border-essence/30 hover:border-thesis transition-all cursor-pointer"
                           onClick={() => setSelectedEntity(entity)}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-thesis/20 text-thesis rounded text-xs">
                              {entity.entityType}
                            </span>
                            <span className="text-logos font-medium">{entity.name}</span>
                          </div>
                          <span className="text-xs text-nous">
                            {date.toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="text-sm text-pneuma">{entity.label}</div>
                        {entity.description && (
                          <div className="text-xs text-nous mt-1">{entity.description}</div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        )}

        {/* 빠른 액션 */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <a href="/ontology/datasets">
            <GlassCard className="hover:border-thesis transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <Database className="w-8 h-8 text-thesis" />
                <div>
                  <h3 className="text-logos mb-1">데이터셋 관리</h3>
                  <p className="text-sm text-pneuma">ETL 소스 설정</p>
                </div>
              </div>
            </GlassCard>
          </a>

          <a href="/ontology/builder">
            <GlassCard className="hover:border-synthesis transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <Zap className="w-8 h-8 text-synthesis" />
                <div>
                  <h3 className="text-logos mb-1">AI 생성기</h3>
                  <p className="text-sm text-pneuma">온톨로지 자동 생성</p>
                </div>
              </div>
            </GlassCard>
          </a>

          <a href="/ontology/etl">
            <GlassCard className="hover:border-amber transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <Network className="w-8 h-8 text-amber" />
                <div>
                  <h3 className="text-logos mb-1">ETL 작업</h3>
                  <p className="text-sm text-pneuma">동기화 모니터</p>
                </div>
              </div>
            </GlassCard>
          </a>
        </div>
      </div>
    </div>
  );
}
