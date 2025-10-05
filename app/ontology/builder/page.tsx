'use client';

import { useState, useEffect } from 'react';
import { GlassCard, NeonMetricCard } from '@/components/InnovativeUI';
import { Bot, Sparkles, Database, GitBranch, Check, X, Eye, Save, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Entity {
  id: string;
  type: string;
  name: string;
  label: string;
  description: string;
  properties?: any;
  confidence: number;
  isNew?: boolean;
}

interface Relation {
  id: string;
  fromEntity: string;
  toEntity: string;
  type: string;
  properties?: any;
  confidence: number;
  isNew?: boolean;
}

interface AIRecommendation {
  entities: Entity[];
  relations: Relation[];
}

interface Project {
  id: string;
  projectCode: string;
  projectName: string;
  client: string;
}

const ENTITY_TYPES = [
  'PROJECT', 'ORGANIZATION', 'PERSON', 'LOCATION', 'DOCUMENT',
  'TASK', 'MATERIAL', 'EQUIPMENT', 'COST_ITEM', 'RISK',
  'MILESTONE', 'CONTRACT', 'REGULATION', 'CONCEPT', 'EVENT'
];

const RELATION_TYPES = [
  'HAS_SUBPROJECT', 'MANAGED_BY', 'LOCATED_IN', 'RELATED_TO',
  'DEPENDS_ON', 'PART_OF', 'USES', 'PRODUCES', 'REQUIRES',
  'AFFECTS', 'CONTAINS', 'FOLLOWS', 'PRECEDES', 'COLLABORATES_WITH',
  'SUPPLIES', 'OWNS', 'REPORTS_TO', 'COMPLIES_WITH'
];

export default function OntologyBuilderPage() {
  // Step 1: 소스 선택
  const [step, setStep] = useState<'select' | 'generate' | 'review' | 'complete'>('select');
  const [sourceType, setSourceType] = useState<'project' | 'database' | 'text'>('project');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [textContent, setTextContent] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);

  // Step 2: AI 생성 결과
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);

  // Step 3: 검토 및 선택
  const [selectedEntities, setSelectedEntities] = useState<Set<string>>(new Set());
  const [selectedRelations, setSelectedRelations] = useState<Set<string>>(new Set());

  // Step 4: 등록 결과
  const [savedEntities, setSavedEntities] = useState<any[]>([]);
  const [savedRelations, setSavedRelations] = useState<any[]>([]);
  const [saveErrors, setSaveErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('프로젝트 조회 실패:', error);
    }
  };

  // Step 1 → Step 2: AI 추천 생성
  const handleGenerateRecommendation = async () => {
    if (sourceType === 'project' && !selectedProjectId) {
      alert('프로젝트를 선택해주세요');
      return;
    }

    if (sourceType === 'text' && !textContent.trim()) {
      alert('텍스트를 입력해주세요');
      return;
    }

    setLoading(true);
    setStep('generate');

    try {
      const res = await fetch('/api/ontology/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType,
          sourceId: sourceType === 'project' ? selectedProjectId : undefined,
          textContent: sourceType === 'text' ? textContent : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const entities = data.recommendation.entities.map((e: any, idx: number) => ({
          id: `temp-entity-${idx}`,
          type: e.type,
          name: e.name,
          label: e.label || e.name,
          description: e.description || '',
          properties: e.properties || {},
          confidence: e.confidence,
          isNew: true,
        }));

        const relations = data.recommendation.relations.map((r: any, idx: number) => ({
          id: `temp-relation-${idx}`,
          fromEntity: r.fromEntity,
          toEntity: r.toEntity,
          type: r.type,
          properties: r.properties || {},
          confidence: r.confidence,
          isNew: true,
        }));

        setRecommendation({ entities, relations });
        setSelectedEntities(new Set(entities.map((e: Entity) => e.id)));
        setSelectedRelations(new Set(relations.map((r: Relation) => r.id)));
        setStep('review');
      } else {
        alert('온톨로지 생성 실패: ' + (data.error || '알 수 없는 오류'));
        setStep('select');
      }
    } catch (error) {
      console.error('Failed to generate recommendation:', error);
      alert('온톨로지 생성 중 오류가 발생했습니다');
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 → Step 4: 선택된 항목 저장
  const handleSaveSelected = async () => {
    if (!recommendation) return;

    const entitiesToSave = recommendation.entities.filter(e => selectedEntities.has(e.id));
    const relationsToSave = recommendation.relations.filter(r => selectedRelations.has(r.id));

    if (entitiesToSave.length === 0) {
      alert('저장할 엔티티를 선택해주세요');
      return;
    }

    setLoading(true);
    setSavedEntities([]);
    setSavedRelations([]);
    setSaveErrors([]);

    try {
      // 엔티티 저장
      const entityMap = new Map<string, string>(); // temp-id -> real-id

      for (const entity of entitiesToSave) {
        try {
          const res = await fetch('/api/ontology/entities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entityType: entity.type,
              name: entity.name,
              label: entity.label,
              description: entity.description,
              properties: entity.properties,
              confidence: entity.confidence,
              source: 'ai_agent',
              verified: false,
            }),
          });

          const result = await res.json();

          if (result.success && result.entity) {
            entityMap.set(entity.name, result.entity.id);
            setSavedEntities(prev => [...prev, result.entity]);
          } else {
            setSaveErrors(prev => [...prev, `엔티티 저장 실패: ${entity.name}`]);
          }
        } catch (error) {
          console.error(`엔티티 저장 실패: ${entity.name}`, error);
          setSaveErrors(prev => [...prev, `엔티티 저장 오류: ${entity.name}`]);
        }
      }

      // 관계 저장 (엔티티 ID 매핑 필요)
      for (const relation of relationsToSave) {
        try {
          const fromEntityId = entityMap.get(relation.fromEntity);
          const toEntityId = entityMap.get(relation.toEntity);

          if (!fromEntityId || !toEntityId) {
            setSaveErrors(prev => [...prev, `관계 저장 실패 (엔티티 없음): ${relation.fromEntity} → ${relation.toEntity}`]);
            continue;
          }

          const res = await fetch('/api/ontology/relations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromEntityId,
              toEntityId,
              relationType: relation.type,
              properties: relation.properties,
              confidence: relation.confidence,
              verified: false,
            }),
          });

          const result = await res.json();

          if (result.success || result.relation) {
            setSavedRelations(prev => [...prev, result.relation || result]);
          } else {
            setSaveErrors(prev => [...prev, `관계 저장 실패: ${relation.fromEntity} → ${relation.toEntity}`]);
          }
        } catch (error) {
          console.error(`관계 저장 실패: ${relation.fromEntity} → ${relation.toEntity}`, error);
          setSaveErrors(prev => [...prev, `관계 저장 오류: ${relation.fromEntity} → ${relation.toEntity}`]);
        }
      }

      setStep('complete');
    } catch (error) {
      console.error('저장 중 오류:', error);
      alert('저장 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 처음부터 다시 시작
  const handleReset = () => {
    setStep('select');
    setSourceType('project');
    setSelectedProjectId('');
    setTextContent('');
    setRecommendation(null);
    setSelectedEntities(new Set());
    setSelectedRelations(new Set());
    setSavedEntities([]);
    setSavedRelations([]);
    setSaveErrors([]);
  };

  // 온톨로지 뷰어로 이동
  const goToViewer = () => {
    window.location.href = '/ontology';
  };

  const toggleEntitySelection = (id: string) => {
    const newSet = new Set(selectedEntities);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedEntities(newSet);
  };

  const toggleRelationSelection = (id: string) => {
    const newSet = new Set(selectedRelations);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedRelations(newSet);
  };

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-light bg-gradient-to-r from-thesis to-synthesis bg-clip-text text-transparent mb-2">
              AI 온톨로지 생성기
            </h1>
            <p className="text-pneuma">AI Agent Powered Ontology Builder</p>
          </div>
          <div className="flex items-center gap-2 text-synthesis">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="text-sm">AI Assistant Active</span>
          </div>
        </div>

        {/* 단계 표시 */}
        <div className="flex items-center gap-4 mb-8">
          {[
            { key: 'select', label: '1. 소스 선택' },
            { key: 'review', label: '2. AI 생성 및 검토' },
            { key: 'complete', label: '3. 등록 완료' },
          ].map((s, idx) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === s.key
                    ? 'bg-thesis text-void'
                    : step === 'complete' || (step === 'review' && idx < 1)
                    ? 'bg-synthesis text-void'
                    : 'bg-essence text-nous'
                }`}
              >
                {step === 'complete' || (step === 'review' && idx < 1) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-sm ${
                  step === s.key ? 'text-thesis font-medium' : 'text-pneuma'
                }`}
              >
                {s.label}
              </span>
              {idx < 2 && <span className="text-essence mx-2">→</span>}
            </div>
          ))}
        </div>

        {/* Step 1: 소스 선택 */}
        {step === 'select' && (
          <GlassCard>
            <h2 className="text-2xl font-light text-logos mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-synthesis" />
              소스 선택
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setSourceType('project')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  sourceType === 'project'
                    ? 'border-thesis bg-thesis/10'
                    : 'border-essence/30 hover:border-essence'
                }`}
              >
                <Database className="w-8 h-8 text-thesis mb-2" />
                <div className="text-sm text-logos">프로젝트에서</div>
                <div className="text-xs text-pneuma">기존 프로젝트 분석</div>
              </button>

              <button
                onClick={() => setSourceType('database')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  sourceType === 'database'
                    ? 'border-synthesis bg-synthesis/10'
                    : 'border-essence/30 hover:border-essence'
                }`}
              >
                <Database className="w-8 h-8 text-synthesis mb-2" />
                <div className="text-sm text-logos">전체 DB에서</div>
                <div className="text-xs text-pneuma">모든 데이터 분석</div>
              </button>

              <button
                onClick={() => setSourceType('text')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  sourceType === 'text'
                    ? 'border-amber bg-amber/10'
                    : 'border-essence/30 hover:border-essence'
                }`}
              >
                <Sparkles className="w-8 h-8 text-amber mb-2" />
                <div className="text-sm text-logos">텍스트에서</div>
                <div className="text-xs text-pneuma">자유 텍스트 입력</div>
              </button>
            </div>

            {sourceType === 'project' && (
              <div>
                <label className="block text-sm text-nous mb-2">프로젝트 선택</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-4 py-3 bg-phenomenon border border-essence/50 rounded-lg text-logos focus:outline-none focus:border-thesis"
                >
                  <option value="">프로젝트를 선택하세요</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.projectCode}] {p.projectName} - {p.client}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {sourceType === 'text' && (
              <div>
                <label className="block text-sm text-nous mb-2">텍스트 입력</label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="분석할 텍스트를 입력하세요..."
                  rows={6}
                  className="w-full px-4 py-3 bg-phenomenon border border-essence/50 rounded-lg text-logos focus:outline-none focus:border-thesis resize-none"
                />
              </div>
            )}

            <button
              onClick={handleGenerateRecommendation}
              disabled={loading}
              className="mt-6 w-full px-6 py-4 bg-gradient-to-r from-thesis to-synthesis text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  AI 분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  AI로 온톨로지 생성
                </>
              )}
            </button>
          </GlassCard>
        )}

        {/* Step 2 & 3: AI 추천 검토 */}
        {step === 'review' && recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* 메트릭 */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <NeonMetricCard
                label="추천 엔티티"
                value={recommendation.entities.length}
                unit="개"
                color="thesis"
                icon={Database}
              />
              <NeonMetricCard
                label="추천 관계"
                value={recommendation.relations.length}
                unit="개"
                color="synthesis"
                icon={GitBranch}
              />
              <NeonMetricCard
                label="선택됨"
                value={selectedEntities.size + selectedRelations.size}
                unit="개"
                color="amber"
                icon={Check}
              />
            </div>

            <GlassCard className="mb-8">
              <h2 className="text-2xl font-light text-logos mb-6 flex items-center gap-2">
                <Bot className="w-6 h-6 text-synthesis" />
                AI 추천 검토 및 수정
              </h2>

              {/* 엔티티 목록 */}
              <div className="mb-8">
                <h3 className="text-xl text-logos mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-thesis" />
                  추천 엔티티 ({recommendation.entities.length}개)
                </h3>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recommendation.entities.map((entity) => (
                    <div
                      key={entity.id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedEntities.has(entity.id)
                          ? 'border-thesis bg-thesis/10'
                          : 'border-essence/30 hover:border-essence'
                      }`}
                      onClick={() => toggleEntitySelection(entity.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <input
                              type="checkbox"
                              checked={selectedEntities.has(entity.id)}
                              onChange={() => toggleEntitySelection(entity.id)}
                              className="w-5 h-5 rounded border-essence/50"
                            />
                            <span className="text-xs px-2 py-1 bg-thesis/20 text-thesis rounded">
                              {entity.type}
                            </span>
                            <h4 className="text-lg text-logos font-medium">{entity.name}</h4>
                          </div>
                          <p className="text-sm text-pneuma ml-8">{entity.description}</p>
                        </div>
                        <div className="text-xs text-nous">
                          신뢰도: {(entity.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 관계 목록 */}
              <div className="mb-8">
                <h3 className="text-xl text-logos mb-4 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-synthesis" />
                  추천 관계 ({recommendation.relations.length}개)
                </h3>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recommendation.relations.map((relation) => (
                    <div
                      key={relation.id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedRelations.has(relation.id)
                          ? 'border-synthesis bg-synthesis/10'
                          : 'border-essence/30 hover:border-essence'
                      }`}
                      onClick={() => toggleRelationSelection(relation.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedRelations.has(relation.id)}
                            onChange={() => toggleRelationSelection(relation.id)}
                            className="w-5 h-5 rounded border-essence/50"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-sm text-thesis">{relation.fromEntity}</span>
                            <span className="text-xs px-2 py-1 bg-synthesis/20 text-synthesis rounded">
                              {relation.type}
                            </span>
                            <span className="text-sm text-synthesis">{relation.toEntity}</span>
                          </div>
                        </div>
                        <div className="text-xs text-nous">
                          신뢰도: {(relation.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 저장 버튼 */}
              <div className="flex gap-4">
                <button
                  onClick={handleSaveSelected}
                  disabled={loading || selectedEntities.size === 0}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-thesis to-synthesis text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      선택한 항목 저장 ({selectedEntities.size + selectedRelations.size}개)
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="px-6 py-4 bg-phenomenon border border-essence/50 text-pneuma rounded-xl hover:border-essence transition-all disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Step 4: 완료 */}
        {step === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard>
              <div className="text-center mb-8">
                <Check className="w-16 h-16 text-synthesis mx-auto mb-4" />
                <h2 className="text-3xl font-light text-logos mb-2">온톨로지 등록 완료!</h2>
                <p className="text-pneuma">선택한 엔티티와 관계가 성공적으로 등록되었습니다</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="phenomenal p-6 text-center">
                  <Database className="w-8 h-8 text-thesis mx-auto mb-2" />
                  <div className="text-3xl text-thesis font-light mb-1">{savedEntities.length}</div>
                  <div className="text-sm text-nous">엔티티 등록됨</div>
                </div>
                <div className="phenomenal p-6 text-center">
                  <GitBranch className="w-8 h-8 text-synthesis mx-auto mb-2" />
                  <div className="text-3xl text-synthesis font-light mb-1">{savedRelations.length}</div>
                  <div className="text-sm text-nous">관계 등록됨</div>
                </div>
              </div>

              {saveErrors.length > 0 && (
                <div className="phenomenal p-4 mb-6 bg-warning/10 border border-warning/30">
                  <h3 className="text-sm text-warning mb-2 flex items-center gap-2">
                    <X className="w-4 h-4" />
                    저장 중 오류 ({saveErrors.length}개)
                  </h3>
                  <ul className="text-xs text-pneuma space-y-1">
                    {saveErrors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={goToViewer}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-thesis to-synthesis text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  온톨로지 뷰어에서 보기
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-4 bg-phenomenon border border-essence/50 text-pneuma rounded-xl hover:border-essence transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  다시 생성하기
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
