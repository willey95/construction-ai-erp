'use client';

import { useEffect, useState } from 'react';
import { Bot, CheckCircle, XCircle, Clock, Play, RefreshCw, Database, Loader } from 'lucide-react';

interface Project {
  id: string;
  projectCode: string;
  projectName: string;
  projectType: string;
  status: string;
  client: string;
  contractPrice: number;
  createdAt: string;
  hasOntology?: boolean;
  ontologyStatus?: 'none' | 'generating' | 'success' | 'failed';
  ontologyCount?: number;
}

export default function ProjectOntologyGenerationPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [generatingProjects, setGeneratingProjects] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'new' | 'existing'>('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();

        // 각 프로젝트의 ontology 상태 확인
        const projectsWithStatus = await Promise.all(
          data.map(async (project: Project) => {
            try {
              const ontologyRes = await fetch(`/api/projects/${project.id}/ontology`);
              const hasOntology = ontologyRes.ok;
              const ontologyData = hasOntology ? await ontologyRes.json() : null;

              return {
                ...project,
                hasOntology,
                ontologyStatus: hasOntology ? 'success' : 'none',
                ontologyCount: ontologyData?.entities?.length || 0,
              };
            } catch (error) {
              return {
                ...project,
                hasOntology: false,
                ontologyStatus: 'none',
                ontologyCount: 0,
              };
            }
          })
        );

        setProjects(projectsWithStatus);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProjectSelection = (projectId: string) => {
    const newSet = new Set(selectedProjects);
    if (newSet.has(projectId)) {
      newSet.delete(projectId);
    } else {
      newSet.add(projectId);
    }
    setSelectedProjects(newSet);
  };

  const selectAll = (type: 'new' | 'existing') => {
    const filtered = projects.filter((p) =>
      type === 'new' ? !p.hasOntology : p.hasOntology
    );
    setSelectedProjects(new Set(filtered.map((p) => p.id)));
  };

  const clearSelection = () => {
    setSelectedProjects(new Set());
  };

  const generateOntology = async (projectId: string, isNewProject: boolean) => {
    try {
      setGeneratingProjects((prev) => new Set(prev).add(projectId));

      // 프로젝트 상태 업데이트
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, ontologyStatus: 'generating' } : p
        )
      );

      const res = await fetch(`/api/projects/${projectId}/ontology`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          includeFinancial: true,
          includeSchedule: true,
          includeRisk: true,
          includeResources: true,
          isUpdate: !isNewProject, // 기존 프로젝트는 업데이트 모드
        }),
      });

      if (res.ok) {
        const ontology = await res.json();

        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  hasOntology: true,
                  ontologyStatus: 'success',
                  ontologyCount: ontology.entities?.length || 0,
                }
              : p
          )
        );
      } else {
        throw new Error('Ontology generation failed');
      }
    } catch (error) {
      console.error(`Failed to generate ontology for project ${projectId}:`, error);

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, ontologyStatus: 'failed' } : p
        )
      );
    } finally {
      setGeneratingProjects((prev) => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }
  };

  const batchGenerateOntologies = async () => {
    const selectedProjectsList = projects.filter((p) => selectedProjects.has(p.id));

    // 신규와 기존 프로젝트 분리
    const newProjects = selectedProjectsList.filter((p) => !p.hasOntology);
    const existingProjects = selectedProjectsList.filter((p) => p.hasOntology);

    // 신규 프로젝트 먼저 처리
    for (const project of newProjects) {
      await generateOntology(project.id, true);
      // 각 프로젝트 생성 간 짧은 딜레이 (API 과부하 방지)
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // 기존 프로젝트 업데이트 처리
    for (const project of existingProjects) {
      await generateOntology(project.id, false);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    alert(`완료: 신규 ${newProjects.length}건, 기존 업데이트 ${existingProjects.length}건`);
    clearSelection();
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-synthesis" />;
      case 'generating':
        return <Loader className="w-4 h-4 text-thesis animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-danger" />;
      default:
        return <Clock className="w-4 h-4 text-nous" />;
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (filter === 'new') return !p.hasOntology;
    if (filter === 'existing') return p.hasOntology;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-void p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-thesis animate-spin mx-auto mb-4" />
          <p className="text-pneuma">프로젝트 로딩 중...</p>
        </div>
      </div>
    );
  }

  const newProjectsCount = projects.filter((p) => !p.hasOntology).length;
  const existingProjectsCount = projects.filter((p) => p.hasOntology).length;
  const selectedNewCount = projects.filter((p) => selectedProjects.has(p.id) && !p.hasOntology).length;
  const selectedExistingCount = projects.filter((p) => selectedProjects.has(p.id) && p.hasOntology).length;

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-light text-logos mb-1">
              프로젝트 온톨로지 생성 Project Ontology Generation
            </h1>
            <p className="text-sm text-pneuma">AI 에이전트가 프로젝트별 온톨로지 객체를 자동 생성합니다</p>
          </div>
          <div className="flex items-center gap-2 text-synthesis">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="text-sm">AI Agent Ready</span>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">전체 프로젝트</div>
            <div className="text-2xl text-logos font-light">{projects.length}</div>
          </div>
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">신규 (온톨로지 없음)</div>
            <div className="text-2xl text-thesis font-light">{newProjectsCount}</div>
          </div>
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">기존 (온톨로지 있음)</div>
            <div className="text-2xl text-synthesis font-light">{existingProjectsCount}</div>
          </div>
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">선택됨</div>
            <div className="text-2xl text-amber font-light">{selectedProjects.size}</div>
          </div>
        </div>

        {/* 액션 바 */}
        <div className="phenomenal p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded text-sm transition-colors ${
                  filter === 'all'
                    ? 'bg-thesis text-void'
                    : 'bg-phenomenon text-pneuma hover:bg-essence'
                }`}
              >
                전체 ({projects.length})
              </button>
              <button
                onClick={() => setFilter('new')}
                className={`px-4 py-2 rounded text-sm transition-colors ${
                  filter === 'new'
                    ? 'bg-thesis text-void'
                    : 'bg-phenomenon text-pneuma hover:bg-essence'
                }`}
              >
                신규 ({newProjectsCount})
              </button>
              <button
                onClick={() => setFilter('existing')}
                className={`px-4 py-2 rounded text-sm transition-colors ${
                  filter === 'existing'
                    ? 'bg-synthesis text-void'
                    : 'bg-phenomenon text-pneuma hover:bg-essence'
                }`}
              >
                기존 ({existingProjectsCount})
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => selectAll('new')}
                className="px-3 py-2 bg-phenomenon border border-essence text-pneuma rounded text-sm hover:bg-essence transition-colors"
              >
                신규 전체 선택
              </button>
              <button
                onClick={() => selectAll('existing')}
                className="px-3 py-2 bg-phenomenon border border-essence text-pneuma rounded text-sm hover:bg-essence transition-colors"
              >
                기존 전체 선택
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-2 bg-phenomenon border border-essence text-pneuma rounded text-sm hover:bg-essence transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={batchGenerateOntologies}
                disabled={selectedProjects.size === 0 || generatingProjects.size > 0}
                className="px-4 py-2 bg-gradient-to-r from-thesis to-synthesis text-void rounded font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                선택한 프로젝트 생성 ({selectedProjects.size})
              </button>
            </div>
          </div>

          {selectedProjects.size > 0 && (
            <div className="mt-3 p-3 bg-thesis/10 border border-thesis/30 rounded text-sm">
              <p className="text-thesis">
                선택됨: 신규 {selectedNewCount}건, 기존 업데이트 {selectedExistingCount}건
              </p>
            </div>
          )}
        </div>

        {/* 프로젝트 테이블 */}
        <div className="phenomenal">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-essence">
                  <th className="text-left py-3 px-4 text-nous text-xs font-medium">선택</th>
                  <th className="text-left py-3 px-4 text-nous text-xs font-medium">프로젝트 코드</th>
                  <th className="text-left py-3 px-4 text-nous text-xs font-medium">프로젝트명</th>
                  <th className="text-left py-3 px-4 text-nous text-xs font-medium">발주처</th>
                  <th className="text-left py-3 px-4 text-nous text-xs font-medium">타입</th>
                  <th className="text-left py-3 px-4 text-nous text-xs font-medium">상태</th>
                  <th className="text-left py-3 px-4 text-nous text-xs font-medium">온톨로지</th>
                  <th className="text-left py-3 px-4 text-nous text-xs font-medium">엔티티 수</th>
                  <th className="text-left py-3 px-4 text-nous text-xs font-medium">액션</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-essence/50 hover:bg-essence/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedProjects.has(project.id)}
                        onChange={() => toggleProjectSelection(project.id)}
                        className="w-4 h-4 rounded border-essence/50"
                      />
                    </td>
                    <td className="py-3 px-4 text-sm text-pneuma">{project.projectCode}</td>
                    <td className="py-3 px-4 text-sm text-logos font-medium">{project.projectName}</td>
                    <td className="py-3 px-4 text-sm text-pneuma">{project.client}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-1 bg-phenomenon text-pneuma rounded">
                        {project.projectType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-1 bg-thesis/20 text-thesis rounded">
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(project.ontologyStatus)}
                        <span className="text-xs text-pneuma">
                          {project.hasOntology ? '기존' : '신규'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-synthesis">
                      {project.ontologyCount || 0}개
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => generateOntology(project.id, !project.hasOntology)}
                        disabled={generatingProjects.has(project.id)}
                        className="px-3 py-1 bg-thesis/20 text-thesis rounded text-xs hover:bg-thesis/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {generatingProjects.has(project.id) ? (
                          <>
                            <Loader className="w-3 h-3 animate-spin" />
                            생성중
                          </>
                        ) : (
                          <>
                            <Database className="w-3 h-3" />
                            {project.hasOntology ? '업데이트' : '생성'}
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-nous mx-auto mb-4" />
              <p className="text-pneuma">프로젝트가 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
