'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/InnovativeUI';
import { Database, GitBranch, Edit, Trash2, Plus, Save, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OntologyEntity {
  id: string;
  entityType: string;
  name: string;
  label: string;
  description: string;
  properties: any;
  confidence: number;
  verified: boolean;
  source: string;
  createdAt: string;
}

interface OntologyRelation {
  id: string;
  fromEntity: { id: string; name: string; entityType: string };
  toEntity: { id: string; name: string; entityType: string };
  relationType: string;
  properties: any;
  confidence: number;
  verified: boolean;
  createdAt: string;
}

const ENTITY_TYPES = [
  'PROJECT', 'ORGANIZATION', 'PERSON', 'LOCATION', 'DOCUMENT',
  'TASK', 'MATERIAL', 'EQUIPMENT', 'COST_ITEM', 'RISK',
  'MILESTONE', 'CONTRACT', 'REGULATION', 'CONCEPT', 'EVENT'
];

const RELATION_TYPES = [
  'HAS_SUBPROJECT', 'MANAGED_BY', 'LOCATED_IN', 'RELATED_TO',
  'DEPENDS_ON', 'PART_OF', 'USES', 'PRODUCES', 'REQUIRES',
  'AFFECTS', 'CONTAINS', 'FOLLOWS'
];

export default function OntologyEditorPage() {
  const [entities, setEntities] = useState<OntologyEntity[]>([]);
  const [relations, setRelations] = useState<OntologyRelation[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<OntologyEntity | null>(null);
  const [editingEntity, setEditingEntity] = useState<OntologyEntity | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
      console.error('Failed to fetch data:', error);
    }
  };

  const handleEditEntity = (entity: OntologyEntity) => {
    setEditingEntity({ ...entity });
  };

  const handleSaveEntity = async () => {
    if (!editingEntity) return;

    try {
      const res = await fetch('/api/ontology/entities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEntity),
      });

      if (res.ok) {
        await fetchData();
        setEditingEntity(null);
        alert('저장되었습니다');
      } else {
        alert('저장 실패');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('저장 중 오류 발생');
    }
  };

  const handleDeleteEntity = async (entityId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/ontology/entities?id=${entityId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchData();
        setSelectedEntity(null);
        alert('삭제되었습니다');
      } else {
        alert('삭제 실패');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('삭제 중 오류 발생');
    }
  };

  const handleVerify = async (entity: OntologyEntity) => {
    try {
      const res = await fetch('/api/ontology/entities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...entity, verified: !entity.verified }),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Verify failed:', error);
    }
  };

  // Group entities by type
  const entitiesByType = entities.reduce((acc, entity) => {
    if (!acc[entity.entityType]) {
      acc[entity.entityType] = [];
    }
    acc[entity.entityType].push(entity);
    return acc;
  }, {} as Record<string, OntologyEntity[]>);

  // Get relations for selected entity
  const entityRelations = selectedEntity
    ? relations.filter(
        (r) => r.fromEntity.id === selectedEntity.id || r.toEntity.id === selectedEntity.id
      )
    : [];

  return (
    <div className="min-h-screen bg-void p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-light bg-gradient-to-r from-thesis to-synthesis bg-clip-text text-transparent mb-2">
              온톨로지 편집기
            </h1>
            <p className="text-pneuma">엔티티 및 관계 직접 편집 및 관리</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-synthesis/20 text-synthesis rounded-lg hover:bg-synthesis/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            엔티티 추가
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Entity List */}
          <div className="col-span-1">
            <GlassCard>
              <h2 className="text-lg font-light text-logos mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-thesis" />
                엔티티 ({entities.length})
              </h2>

              <div className="space-y-2 max-h-[700px] overflow-y-auto">
                {Object.entries(entitiesByType).map(([type, typeEntities]) => (
                  <div key={type} className="border border-essence/30 rounded-lg overflow-hidden">
                    <div className="p-2 bg-phenomenon/30 text-xs text-nous font-medium">
                      {type} ({typeEntities.length})
                    </div>
                    <div className="p-1 space-y-1">
                      {typeEntities.map((entity) => (
                        <button
                          key={entity.id}
                          onClick={() => setSelectedEntity(entity)}
                          className={`w-full text-left p-2 rounded text-xs transition-all ${
                            selectedEntity?.id === entity.id
                              ? 'bg-thesis/20 border border-thesis text-logos'
                              : 'hover:bg-phenomenon/50 text-pneuma'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{entity.name}</span>
                            {entity.verified && (
                              <Check className="w-3 h-3 text-synthesis flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Right: Entity Details & Editor */}
          <div className="col-span-2 space-y-6">
            {selectedEntity ? (
              <>
                {/* Entity Details */}
                <GlassCard>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-light text-logos">엔티티 상세</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(selectedEntity)}
                        className={`px-3 py-1 rounded text-xs transition-all ${
                          selectedEntity.verified
                            ? 'bg-synthesis/20 text-synthesis'
                            : 'bg-nous/20 text-nous hover:bg-nous/30'
                        }`}
                      >
                        {selectedEntity.verified ? '검증됨' : '검증하기'}
                      </button>
                      <button
                        onClick={() => handleEditEntity(selectedEntity)}
                        className="px-3 py-1 bg-thesis/20 text-thesis rounded text-xs hover:bg-thesis/30 transition-all"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteEntity(selectedEntity.id)}
                        className="px-3 py-1 bg-danger/20 text-danger rounded text-xs hover:bg-danger/30 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {editingEntity?.id === selectedEntity.id ? (
                    /* Edit Mode */
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-nous mb-1">엔티티 타입</label>
                        <select
                          value={editingEntity.entityType}
                          onChange={(e) =>
                            setEditingEntity({ ...editingEntity, entityType: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-phenomenon border border-essence rounded text-logos text-sm"
                        >
                          {ENTITY_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-nous mb-1">이름</label>
                        <input
                          type="text"
                          value={editingEntity.name}
                          onChange={(e) =>
                            setEditingEntity({ ...editingEntity, name: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-phenomenon border border-essence rounded text-logos text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-nous mb-1">레이블</label>
                        <input
                          type="text"
                          value={editingEntity.label}
                          onChange={(e) =>
                            setEditingEntity({ ...editingEntity, label: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-phenomenon border border-essence rounded text-logos text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-nous mb-1">설명</label>
                        <textarea
                          value={editingEntity.description}
                          onChange={(e) =>
                            setEditingEntity({ ...editingEntity, description: e.target.value })
                          }
                          rows={3}
                          className="w-full px-3 py-2 bg-phenomenon border border-essence rounded text-logos text-sm resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-nous mb-1">신뢰도</label>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={editingEntity.confidence}
                          onChange={(e) =>
                            setEditingEntity({
                              ...editingEntity,
                              confidence: parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-phenomenon border border-essence rounded text-logos text-sm"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEntity}
                          className="flex-1 px-4 py-2 bg-thesis text-void rounded hover:bg-thesis/90 transition-all flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          저장
                        </button>
                        <button
                          onClick={() => setEditingEntity(null)}
                          className="px-4 py-2 bg-phenomenon border border-essence text-pneuma rounded hover:bg-essence transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-nous mb-1">이름</div>
                          <div className="text-logos">{selectedEntity.name}</div>
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
                          <div className="text-xs text-nous mb-1">신뢰도</div>
                          <div className="text-pneuma">{selectedEntity.confidence.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-nous mb-1">소스</div>
                          <div className="text-pneuma">{selectedEntity.source}</div>
                        </div>
                        <div>
                          <div className="text-xs text-nous mb-1">생성일</div>
                          <div className="text-pneuma text-xs">
                            {new Date(selectedEntity.createdAt).toLocaleString('ko-KR')}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-nous mb-1">설명</div>
                        <div className="text-sm text-pneuma">{selectedEntity.description || '-'}</div>
                      </div>

                      {selectedEntity.properties && Object.keys(selectedEntity.properties).length > 0 && (
                        <div>
                          <div className="text-xs text-nous mb-2">속성</div>
                          <div className="p-3 bg-phenomenon/30 rounded text-xs">
                            <pre className="text-pneuma overflow-auto">
                              {JSON.stringify(selectedEntity.properties, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </GlassCard>

                {/* Relations */}
                <GlassCard>
                  <h2 className="text-lg font-light text-logos mb-4 flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-synthesis" />
                    관계 ({entityRelations.length})
                  </h2>

                  {entityRelations.length === 0 ? (
                    <div className="text-center py-8 text-pneuma text-sm">관계가 없습니다</div>
                  ) : (
                    <div className="space-y-2">
                      {entityRelations.map((relation) => (
                        <div
                          key={relation.id}
                          className="p-3 bg-phenomenon/30 rounded-lg border border-essence/30 text-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-logos">{relation.fromEntity.name}</span>
                              <span className="text-synthesis">→</span>
                              <span className="px-2 py-0.5 bg-synthesis/20 text-synthesis rounded text-xs">
                                {relation.relationType}
                              </span>
                              <span className="text-synthesis">→</span>
                              <span className="text-logos">{relation.toEntity.name}</span>
                            </div>
                            {relation.verified && (
                              <Check className="w-4 h-4 text-synthesis" />
                            )}
                          </div>
                          <div className="text-xs text-nous">
                            신뢰도: {relation.confidence.toFixed(2)} | 생성:{' '}
                            {new Date(relation.createdAt).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </>
            ) : (
              <GlassCard>
                <div className="text-center py-12">
                  <Database className="w-16 h-16 text-nous mx-auto mb-4 opacity-30" />
                  <p className="text-pneuma">엔티티를 선택하세요</p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
