'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/InnovativeUI';
import { Database, GitBranch, Network, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

// Prisma 엔티티 타입 정의
const ENTITY_TYPES = [
  { name: 'PROJECT', label: '프로젝트', color: 'text-thesis', desc: '건설 프로젝트' },
  { name: 'ORGANIZATION', label: '조직', color: 'text-synthesis', desc: '발주처, 협력사' },
  { name: 'PERSON', label: '담당자', color: 'text-amber', desc: '프로젝트 담당자' },
  { name: 'LOCATION', label: '위치', color: 'text-nous', desc: '프로젝트 위치' },
  { name: 'DOCUMENT', label: '문서', color: 'text-pneuma', desc: '계약서, 도면 등' },
  { name: 'TASK', label: '작업', color: 'text-thesis', desc: '시공 작업' },
  { name: 'MATERIAL', label: '자재', color: 'text-synthesis', desc: '건설 자재' },
  { name: 'EQUIPMENT', label: '장비', color: 'text-amber', desc: '건설 장비' },
  { name: 'COST_ITEM', label: '원가 항목', color: 'text-danger', desc: '비용 항목' },
  { name: 'RISK', label: '리스크', color: 'text-warning', desc: '프로젝트 리스크' },
  { name: 'MILESTONE', label: '마일스톤', color: 'text-synthesis', desc: '주요 일정' },
  { name: 'CONTRACT', label: '계약', color: 'text-thesis', desc: '계약 관계' },
  { name: 'REGULATION', label: '규제', color: 'text-nous', desc: '법규, 규정' },
  { name: 'CONCEPT', label: '개념', color: 'text-pneuma', desc: '추상 개념' },
  { name: 'EVENT', label: '이벤트', color: 'text-amber', desc: '이벤트' },
];

const RELATION_TYPES = [
  { name: 'HAS_SUBPROJECT', label: '하위 프로젝트', from: 'PROJECT', to: 'PROJECT' },
  { name: 'MANAGED_BY', label: '관리됨', from: 'PROJECT', to: 'PERSON' },
  { name: 'LOCATED_IN', label: '위치함', from: 'PROJECT', to: 'LOCATION' },
  { name: 'RELATED_TO', label: '관련됨', from: '*', to: '*' },
  { name: 'DEPENDS_ON', label: '의존함', from: 'TASK', to: 'TASK' },
  { name: 'PART_OF', label: '부분임', from: '*', to: '*' },
  { name: 'USES', label: '사용함', from: 'TASK', to: 'MATERIAL' },
  { name: 'PRODUCES', label: '생산함', from: 'TASK', to: '*' },
  { name: 'REQUIRES', label: '요구함', from: '*', to: '*' },
  { name: 'AFFECTS', label: '영향줌', from: 'RISK', to: 'PROJECT' },
  { name: 'CONTAINS', label: '포함함', from: 'PROJECT', to: 'MILESTONE' },
  { name: 'FOLLOWS', label: '후행함', from: 'TASK', to: 'TASK' },
];

interface OntologyEntity {
  id: string;
  entityType: string;
  name: string;
  label: string;
}

interface OntologyRelation {
  id: string;
  fromEntity: OntologyEntity;
  toEntity: OntologyEntity;
  relationType: string;
}

export default function SchemaPage() {
  const [entities, setEntities] = useState<OntologyEntity[]>([]);
  const [relations, setRelations] = useState<OntologyRelation[]>([]);
  const [viewMode, setViewMode] = useState<'schema' | 'graph'>('schema');

  useEffect(() => {
    fetchOntologyData();
  }, []);

  const fetchOntologyData = async () => {
    try {
      const [entitiesRes, relationsRes] = await Promise.all([
        fetch('/api/ontology/entities?limit=100'),
        fetch('/api/ontology/relations?limit=100'),
      ]);

      const entitiesData = await entitiesRes.json();
      const relationsData = await relationsRes.json();

      setEntities(entitiesData.entities || []);
      setRelations(relationsData.relations || []);
    } catch (error) {
      console.error('Failed to fetch ontology data:', error);
    }
  };

  // 엔티티 타입별 개수 계산
  const entityCounts = ENTITY_TYPES.map((type) => ({
    ...type,
    count: entities.filter((e) => e.entityType === type.name).length,
  }));

  // 관계 타입별 개수 계산
  const relationCounts = RELATION_TYPES.map((type) => ({
    ...type,
    count: relations.filter((r) => r.relationType === type.name).length,
  }));

  return (
    <div className="min-h-screen bg-void p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-light bg-gradient-to-r from-thesis to-synthesis bg-clip-text text-transparent mb-2">
            엔티티 스키마 & 지식 그래프
          </h1>
          <p className="text-pneuma">시스템 데이터 구조 및 관계 시각화</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('schema')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'schema' ? 'bg-thesis text-void' : 'bg-phenomenon text-pneuma hover:text-logos'
            }`}
          >
            스키마 보기
          </button>
          <button
            onClick={() => setViewMode('graph')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'graph' ? 'bg-synthesis text-void' : 'bg-phenomenon text-pneuma hover:text-logos'
            }`}
          >
            그래프 보기
          </button>
        </div>

        {/* SCHEMA VIEW */}
        {viewMode === 'schema' && (
          <div className="space-y-6">
            {/* Entity Types */}
            <GlassCard>
              <h2 className="text-2xl font-light text-logos mb-6 flex items-center gap-2">
                <Database className="w-6 h-6 text-thesis" />
                엔티티 타입 ({ENTITY_TYPES.length}종)
              </h2>

              <div className="grid grid-cols-5 gap-4">
                {entityCounts.map((type, idx) => (
                  <motion.div
                    key={type.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-4 bg-phenomenon/30 rounded-xl border border-essence/50 hover:border-thesis transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${type.color}`}>{type.label}</span>
                      <span className="text-xl text-logos font-light">{type.count}</span>
                    </div>
                    <div className="text-xs text-nous mb-2">{type.name}</div>
                    <div className="text-xs text-pneuma">{type.desc}</div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* Relation Types */}
            <GlassCard>
              <h2 className="text-2xl font-light text-logos mb-6 flex items-center gap-2">
                <GitBranch className="w-6 h-6 text-synthesis" />
                관계 타입 ({RELATION_TYPES.length}종)
              </h2>

              <div className="grid grid-cols-4 gap-3">
                {relationCounts.map((type, idx) => (
                  <motion.div
                    key={type.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-3 bg-phenomenon/30 rounded-lg border border-essence/30 hover:border-synthesis transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-synthesis font-medium">{type.label}</span>
                      <span className="text-lg text-logos font-light">{type.count}</span>
                    </div>
                    <div className="text-xs text-nous mb-1">{type.name}</div>
                    <div className="text-xs text-pneuma">
                      {type.from} → {type.to}
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* Schema Diagram */}
            <GlassCard>
              <h2 className="text-2xl font-light text-logos mb-6 flex items-center gap-2">
                <Network className="w-6 h-6 text-amber" />
                스키마 다이어그램
              </h2>

              <div className="relative bg-phenomenon/20 rounded-xl p-8" style={{ minHeight: '700px' }}>
                {/* Connection lines - DRAW FIRST */}
                <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '700px' }}>
                  {ENTITY_TYPES.filter((t) => t.name !== 'PROJECT').map((type, idx) => {
                    const totalNodes = ENTITY_TYPES.length - 1;
                    const angle = (idx / totalNodes) * 2 * Math.PI;
                    const radius = 280;
                    const x = Math.cos(angle) * radius + 400;
                    const y = Math.sin(angle) * radius + 350;

                    // Center coordinates
                    const centerX = 400;
                    const centerY = 350;

                    return (
                      <g key={type.name}>
                        <line
                          x1={centerX}
                          y1={centerY}
                          x2={x}
                          y2={y}
                          stroke="rgba(99, 102, 241, 0.4)"
                          strokeWidth="3"
                          strokeDasharray="8 4"
                        />
                        {/* Relation label */}
                        <text
                          x={(centerX + x) / 2}
                          y={(centerY + y) / 2}
                          fill="rgba(160, 174, 192, 0.7)"
                          fontSize="11"
                          textAnchor="middle"
                          className="pointer-events-none"
                        >
                          {RELATION_TYPES.find(r => r.to === type.name || r.from === type.name)?.label || 'RELATED'}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Central PROJECT node */}
                <div
                  className="absolute z-10"
                  style={{
                    left: '400px',
                    top: '350px',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    className="w-40 h-40 rounded-2xl bg-gradient-to-br from-thesis to-synthesis flex items-center justify-center shadow-2xl border-4 border-white/20"
                  >
                    <div className="text-center">
                      <Database className="w-10 h-10 text-white mx-auto mb-2" />
                      <div className="text-white font-bold text-lg">PROJECT</div>
                      <div className="text-white/80 text-sm mt-1">핵심 엔티티</div>
                      <div className="text-white/90 text-2xl font-light mt-2">
                        {entityCounts.find(e => e.name === 'PROJECT')?.count || 0}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Surrounding nodes in circular layout */}
                {ENTITY_TYPES.filter((t) => t.name !== 'PROJECT').map((type, idx) => {
                  const totalNodes = ENTITY_TYPES.length - 1;
                  const angle = (idx / totalNodes) * 2 * Math.PI;
                  const radius = 280;
                  const x = Math.cos(angle) * radius + 400;
                  const y = Math.sin(angle) * radius + 350;

                  return (
                    <motion.div
                      key={type.name}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.08, duration: 0.4 }}
                      className="absolute z-10"
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div className="w-28 h-28 rounded-2xl bg-phenomenon/90 backdrop-blur-sm border-3 border-essence hover:border-thesis hover:scale-110 transition-all flex items-center justify-center cursor-pointer group shadow-xl">
                        <div className="text-center px-2">
                          <div className={`text-sm font-bold ${type.color} group-hover:text-thesis transition-colors mb-1`}>
                            {type.label}
                          </div>
                          <div className="text-2xl text-logos font-light mb-1">
                            {entityCounts.find((e) => e.name === type.name)?.count || 0}
                          </div>
                          <div className="text-xs text-nous/70">{type.name}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Info panel */}
                <div className="absolute bottom-4 left-4 bg-phenomenon/90 backdrop-blur-sm rounded-xl p-4 border border-essence">
                  <div className="text-xs text-nous mb-2">엔티티 관계도</div>
                  <div className="flex items-center gap-2 text-xs text-pneuma">
                    <div className="w-8 h-0.5 bg-thesis" />
                    <span>PROJECT 기준 연결</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* GRAPH VIEW */}
        {viewMode === 'graph' && (
          <GlassCard>
            <h2 className="text-2xl font-light text-logos mb-6 flex items-center gap-2">
              <Network className="w-6 h-6 text-synthesis" />
              지식 그래프 ({entities.length}개 노드, {relations.length}개 엣지)
            </h2>

            {entities.length === 0 ? (
              <div className="text-center py-12">
                <Network className="w-16 h-16 text-nous mx-auto mb-4 opacity-50" />
                <p className="text-pneuma mb-2">등록된 온톨로지가 없습니다</p>
                <p className="text-sm text-nous mb-4">AI 생성기에서 온톨로지를 생성해 보세요</p>
                <a href="/ontology/builder">
                  <button className="px-6 py-3 bg-gradient-to-r from-thesis to-synthesis text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-2 mx-auto">
                    <Zap className="w-5 h-5" />
                    <span>AI 생성기로 이동</span>
                  </button>
                </a>
              </div>
            ) : (
              <div className="relative bg-phenomenon/20 rounded-xl p-8 overflow-hidden" style={{ minHeight: '700px', width: '100%' }}>
                {/* Relations as lines - DRAW FIRST so nodes are on top */}
                <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '700px' }}>
                  {relations.slice(0, 100).map((relation, idx) => {
                    const fromIdx = entities.findIndex((e) => e.id === relation.fromEntity.id);
                    const toIdx = entities.findIndex((e) => e.id === relation.toEntity.id);

                    if (fromIdx === -1 || toIdx === -1 || fromIdx >= 50 || toIdx >= 50) return null;

                    const fromAngle = (fromIdx / Math.min(entities.length, 50)) * 2 * Math.PI;
                    const toAngle = (toIdx / Math.min(entities.length, 50)) * 2 * Math.PI;
                    const fromRadius = 200 + (fromIdx % 4) * 60;
                    const toRadius = 200 + (toIdx % 4) * 60;

                    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2.5 : 500;
                    const centerY = 350;

                    const x1 = Math.cos(fromAngle) * fromRadius + centerX;
                    const y1 = Math.sin(fromAngle) * fromRadius + centerY;
                    const x2 = Math.cos(toAngle) * toRadius + centerX;
                    const y2 = Math.sin(toAngle) * toRadius + centerY;

                    // 관계 타입별 색상
                    const relationInfo = RELATION_TYPES.find(r => r.name === relation.relationType);
                    const strokeColor = relationInfo
                      ? 'rgba(99, 102, 241, 0.4)'  // 더 진하게
                      : 'rgba(16, 185, 129, 0.3)';

                    return (
                      <g key={relation.id}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={strokeColor}
                          strokeWidth="2"  // 더 두껍게
                          markerEnd="url(#arrowhead)"
                        />
                        {/* 관계 레이블 */}
                        <text
                          x={(x1 + x2) / 2}
                          y={(y1 + y2) / 2}
                          fill="rgba(160, 174, 192, 0.8)"
                          fontSize="10"
                          textAnchor="middle"
                        >
                          {relationInfo?.label || relation.relationType}
                        </text>
                      </g>
                    );
                  })}
                  {/* Arrow marker definition */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3, 0 6" fill="rgba(99, 102, 241, 0.4)" />
                    </marker>
                  </defs>
                </svg>

                {/* Entities as nodes - DRAW SECOND so they're on top */}
                {entities.slice(0, 50).map((entity, idx) => {
                  const angle = (idx / Math.min(entities.length, 50)) * 2 * Math.PI;
                  const radius = 200 + (idx % 4) * 60;
                  const centerX = typeof window !== 'undefined' ? window.innerWidth / 2.5 : 500;
                  const centerY = 350;
                  const x = Math.cos(angle) * radius + centerX;
                  const y = Math.sin(angle) * radius + centerY;

                  const typeInfo = ENTITY_TYPES.find((t) => t.name === entity.entityType);

                  return (
                    <motion.div
                      key={entity.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="absolute z-10"
                      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
                    >
                      <div className={`px-4 py-3 rounded-xl bg-phenomenon/90 backdrop-blur-sm border-2 border-essence hover:border-thesis transition-all cursor-pointer group shadow-lg ${typeInfo?.color || 'text-nous'}`}>
                        <div className="text-sm font-semibold whitespace-nowrap max-w-[150px] truncate">
                          {entity.name}
                        </div>
                        <div className="text-xs text-nous/80 mt-1">{typeInfo?.label || entity.entityType}</div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Enhanced Legend */}
                <div className="absolute bottom-4 right-4 bg-phenomenon/90 backdrop-blur-sm rounded-xl p-6 border-2 border-essence shadow-xl">
                  <div className="text-sm text-logos mb-3 font-medium">범례</div>
                  <div className="space-y-2 mb-4">
                    {entityCounts.filter((t) => t.count > 0).slice(0, 8).map((type) => (
                      <div key={type.name} className="flex items-center gap-3 text-xs">
                        <div className={`w-4 h-4 rounded-lg ${type.color} bg-current opacity-40 border border-current`} />
                        <span className="text-pneuma font-medium">{type.label}</span>
                        <span className="text-nous ml-auto">({type.count})</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-essence/30 pt-3 mt-3">
                    <div className="text-xs text-nous mb-2">관계 타입</div>
                    <div className="space-y-1">
                      {relationCounts.filter(r => r.count > 0).slice(0, 5).map(rel => (
                        <div key={rel.name} className="flex items-center gap-2 text-xs">
                          <div className="w-8 h-0.5 bg-thesis opacity-50" />
                          <span className="text-pneuma text-xs">{rel.label} ({rel.count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats overlay */}
                <div className="absolute top-4 right-4 bg-phenomenon/90 backdrop-blur-sm rounded-xl p-4 border border-essence">
                  <div className="text-xs text-nous mb-1">표시 중</div>
                  <div className="text-2xl font-light text-logos">{Math.min(entities.length, 50)}</div>
                  <div className="text-xs text-pneuma">/ {entities.length} 노드</div>
                </div>
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
}
