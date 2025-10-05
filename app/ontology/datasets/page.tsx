'use client';

import { useEffect, useState } from 'react';
import { Database, FileText, Calendar, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';

interface Dataset {
  id: string;
  name: string;
  description?: string;
  dataType: string;
  sourceType: string;
  recordCount: number;
  syncStatus: string;
  lastSyncAt?: string;
  createdAt: string;
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDataset, setNewDataset] = useState({
    name: '',
    description: '',
    dataType: 'STRUCTURED',
    sourceType: 'POSTGRESQL',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const res = await fetch('/api/ontology/datasets');
      if (res.ok) {
        const data = await res.json();
        setDatasets(data);
      }
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-synthesis" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-danger" />;
      case 'IN_PROGRESS':
        return <AlertCircle className="w-4 h-4 text-thesis" />;
      default:
        return <AlertCircle className="w-4 h-4 text-nous" />;
    }
  };

  const getDataTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      STRUCTURED: 'text-synthesis',
      SEMI_STRUCTURED: 'text-thesis',
      UNSTRUCTURED: 'text-nous',
      GRAPH: 'text-logos',
      TIME_SERIES: 'text-pneuma',
    };
    return colors[type] || 'text-nous';
  };

  const getSourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      POSTGRESQL: 'PostgreSQL',
      NEO4J: 'Neo4j',
      REST_API: 'REST API',
      FILE_CSV: 'CSV File',
      FILE_EXCEL: 'Excel File',
      FILE_JSON: 'JSON File',
      MANUAL: 'Manual',
    };
    return labels[type] || type;
  };

  const handleAddDataset = async () => {
    if (!newDataset.name.trim()) {
      alert('데이터셋 이름을 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ontology/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDataset,
          recordCount: 0,
          syncStatus: 'PENDING',
        }),
      });

      if (res.ok) {
        await fetchDatasets();
        setShowAddModal(false);
        setNewDataset({
          name: '',
          description: '',
          dataType: 'STRUCTURED',
          sourceType: 'POSTGRESQL',
        });
        alert('데이터셋이 추가되었습니다');
      } else {
        alert('데이터셋 추가에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to add dataset:', error);
      alert('데이터셋 추가 중 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void p-6">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-8 bg-essence rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-essence rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-light text-logos mb-2">데이터셋 관리</h1>
            <p className="text-sm text-nous">Ontology 생성에 사용되는 데이터 소스 관리</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-thesis/20 hover:bg-thesis/30 text-thesis rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">데이터셋 추가</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="phenomenal p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-thesis" />
              <span className="text-xs text-nous">전체 데이터셋</span>
            </div>
            <div className="text-2xl text-logos font-light">{datasets.length}</div>
          </div>
          <div className="phenomenal p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-synthesis" />
              <span className="text-xs text-nous">동기화 완료</span>
            </div>
            <div className="text-2xl text-logos font-light">
              {datasets.filter(d => d.syncStatus === 'COMPLETED').length}
            </div>
          </div>
          <div className="phenomenal p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-thesis" />
              <span className="text-xs text-nous">진행 중</span>
            </div>
            <div className="text-2xl text-logos font-light">
              {datasets.filter(d => d.syncStatus === 'IN_PROGRESS').length}
            </div>
          </div>
          <div className="phenomenal p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-nous" />
              <span className="text-xs text-nous">총 레코드</span>
            </div>
            <div className="text-2xl text-logos font-light">
              {datasets.reduce((sum, d) => sum + d.recordCount, 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Datasets Table */}
        <div className="phenomenal p-6">
          <h2 className="text-lg font-light text-logos mb-4">데이터셋 목록</h2>
          {datasets.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-nous mx-auto mb-3" />
              <p className="text-pneuma mb-2">등록된 데이터셋이 없습니다</p>
              <p className="text-sm text-nous">데이터셋을 추가하여 Ontology 생성을 시작하세요</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-essence">
                    <th className="text-left py-3 px-4 text-nous font-medium">이름</th>
                    <th className="text-left py-3 px-4 text-nous font-medium">설명</th>
                    <th className="text-left py-3 px-4 text-nous font-medium">데이터 타입</th>
                    <th className="text-left py-3 px-4 text-nous font-medium">소스</th>
                    <th className="text-right py-3 px-4 text-nous font-medium">레코드</th>
                    <th className="text-left py-3 px-4 text-nous font-medium">상태</th>
                    <th className="text-left py-3 px-4 text-nous font-medium">마지막 동기화</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((dataset) => (
                    <tr
                      key={dataset.id}
                      className="border-b border-essence/50 hover:bg-essence/30 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-thesis" />
                          <span className="text-logos font-medium">{dataset.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-pneuma max-w-xs truncate">
                        {dataset.description || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${getDataTypeColor(dataset.dataType)}`}>
                          {dataset.dataType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-pneuma">
                        {getSourceTypeLabel(dataset.sourceType)}
                      </td>
                      <td className="py-3 px-4 text-right text-logos">
                        {dataset.recordCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(dataset.syncStatus)}
                          <span className="text-xs text-pneuma">{dataset.syncStatus}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-pneuma text-xs">
                        {dataset.lastSyncAt
                          ? new Date(dataset.lastSyncAt).toLocaleString('ko-KR')
                          : '동기화 안됨'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Dataset Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-void/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="phenomenal p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-light text-logos mb-4">데이터셋 추가</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-nous mb-2">데이터셋 이름 *</label>
                  <input
                    type="text"
                    value={newDataset.name}
                    onChange={(e) => setNewDataset({ ...newDataset, name: e.target.value })}
                    placeholder="예: 프로젝트 데이터셋"
                    className="w-full px-3 py-2 bg-phenomenon border border-essence rounded text-logos focus:outline-none focus:border-thesis"
                  />
                </div>

                <div>
                  <label className="block text-sm text-nous mb-2">설명</label>
                  <textarea
                    value={newDataset.description}
                    onChange={(e) => setNewDataset({ ...newDataset, description: e.target.value })}
                    placeholder="데이터셋에 대한 설명"
                    rows={3}
                    className="w-full px-3 py-2 bg-phenomenon border border-essence rounded text-logos focus:outline-none focus:border-thesis resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-nous mb-2">데이터 타입</label>
                  <select
                    value={newDataset.dataType}
                    onChange={(e) => setNewDataset({ ...newDataset, dataType: e.target.value })}
                    className="w-full px-3 py-2 bg-phenomenon border border-essence rounded text-logos focus:outline-none focus:border-thesis"
                  >
                    <option value="STRUCTURED">STRUCTURED</option>
                    <option value="SEMI_STRUCTURED">SEMI_STRUCTURED</option>
                    <option value="UNSTRUCTURED">UNSTRUCTURED</option>
                    <option value="GRAPH">GRAPH</option>
                    <option value="TIME_SERIES">TIME_SERIES</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-nous mb-2">소스 타입</label>
                  <select
                    value={newDataset.sourceType}
                    onChange={(e) => setNewDataset({ ...newDataset, sourceType: e.target.value })}
                    className="w-full px-3 py-2 bg-phenomenon border border-essence rounded text-logos focus:outline-none focus:border-thesis"
                  >
                    <option value="POSTGRESQL">PostgreSQL</option>
                    <option value="NEO4J">Neo4j</option>
                    <option value="REST_API">REST API</option>
                    <option value="FILE_CSV">CSV File</option>
                    <option value="FILE_EXCEL">Excel File</option>
                    <option value="FILE_JSON">JSON File</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleAddDataset}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-thesis text-void rounded hover:bg-thesis/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '추가 중...' : '추가'}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-phenomenon border border-essence text-pneuma rounded hover:bg-essence transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
