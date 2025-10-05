'use client';

import { useState, useMemo } from 'react';
import { Network, Maximize2, Filter, Download, Layers } from 'lucide-react';

// 노드 타입별 색상 정의
const NODE_COLORS = {
  project: '#00D9FF',   // 청록색 - 프로젝트
  company: '#10B981',   // 녹색 - 발주사
  person: '#F59E0B',    // 주황색 - 담당자
  partner: '#8B5CF6',   // 보라색 - 협력사
};

export default function KnowledgeGraphPage() {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'network' | 'hierarchy' | 'timeline'>('network');

  // 지식 그래프 노드 데이터
  const nodes = [
    { id: 1, name: '강동 오피스텔 A동', type: 'project', status: 'active', connections: 8, value: 850 },
    { id: 2, name: '삼성건설', type: 'company', status: 'active', connections: 12, value: 0 },
    { id: 3, name: '김철수 PM', type: 'person', status: 'active', connections: 5, value: 0 },
    { id: 4, name: '송파 상가', type: 'project', status: 'active', connections: 6, value: 420 },
    { id: 5, name: '현대건설', type: 'company', status: 'active', connections: 15, value: 0 },
    { id: 6, name: '판교 도로', type: 'project', status: 'active', connections: 7, value: 680 },
  ];

  // 관계 데이터
  const relationships = [
    { from: 1, to: 2, fromName: '강동 오피스텔 A동', toName: '삼성건설', type: '발주', strength: 'strong' },
    { from: 1, to: 3, fromName: '강동 오피스텔 A동', toName: '김철수 PM', type: '담당', strength: 'strong' },
    { from: 4, to: 5, fromName: '송파 상가', toName: '현대건설', type: '발주', strength: 'strong' },
    { from: 6, to: 3, fromName: '판교 도로', toName: '김철수 PM', type: '담당', strength: 'medium' },
    { from: 1, to: 4, fromName: '강동 오피스텔 A동', toName: '송파 상가', type: '유사공법', strength: 'medium' },
    { from: 6, to: 1, fromName: '판교 도로', toName: '강동 오피스텔 A동', type: '자재공급', strength: 'weak' },
  ];

  // 노드 크기 계산 (value와 connections 기반)
  const getNodeRadius = (node: typeof nodes[0]) => {
    const baseSize = 25;
    const valueWeight = node.value ? Math.sqrt(node.value) / 5 : 0;
    const connectionWeight = node.connections * 2;
    return baseSize + valueWeight + connectionWeight;
  };

  // 노드 위치 계산 (원형 레이아웃)
  const nodePositions = useMemo(() => {
    const centerX = 400;
    const centerY = 250;
    const radius = 180;

    return nodes.map((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2;
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        radius: getNodeRadius(node),
        color: NODE_COLORS[node.type as keyof typeof NODE_COLORS] || '#999'
      };
    });
  }, [nodes]);

  // 강도별 선 굵기
  const getStrokeWidth = (strength: string) => {
    switch (strength) {
      case 'strong': return 4;
      case 'medium': return 2.5;
      case 'weak': return 1.5;
      default: return 2;
    }
  };

  // 강도별 선 색상
  const getStrokeColor = (strength: string) => {
    switch (strength) {
      case 'strong': return '#00D9FF';
      case 'medium': return '#6B7280';
      case 'weak': return '#3A3A3A';
      default: return '#4B5563';
    }
  };

  // 인사이트 데이터
  const insights = [
    {
      type: 'pattern',
      title: '삼성건설 발주 프로젝트 공통점',
      description: '삼성건설이 발주한 프로젝트들은 평균 이익률이 15.2%로 타 발주사 대비 2.3% 높습니다.',
      impact: 'positive',
      projects: ['강동 오피스텔 A동', '용인 아파트 B단지', '수원 물류센터']
    },
    {
      type: 'risk',
      title: '김철수 PM 과부하 위험',
      description: '김철수 PM이 담당하는 프로젝트가 5개로 평균(3.2개)보다 많아 관리 품질 저하 우려',
      impact: 'negative',
      projects: ['강동 오피스텔 A동', '판교 도로', '인천 물류센터']
    },
    {
      type: 'opportunity',
      title: '유사 공법 노하우 활용',
      description: '강동 오피스텔과 송파 상가에서 사용한 신공법을 다른 프로젝트에 적용 시 공기 10% 단축 예상',
      impact: 'positive',
      projects: ['성남 주상복합', '하남 스타필드']
    },
  ];

  // 클러스터 분석
  const clusters = [
    { name: '부동산 개발', projects: 12, avgMargin: 15.2, totalValue: 2850, color: '#00D9FF' },
    { name: '인프라 공사', projects: 8, avgMargin: 14.1, totalValue: 1680, color: '#10B981' },
    { name: '플랜트', projects: 3, avgMargin: 16.8, totalValue: 920, color: '#F59E0B' },
  ];

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-light text-logos">지식 그래프 Knowledge Graph</h1>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-phenomenon border border-essence text-logos rounded-md hover:bg-essence transition-colors">
              <Filter className="w-4 h-4" />
              필터
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-phenomenon border border-essence text-logos rounded-md hover:bg-essence transition-colors">
              <Download className="w-4 h-4" />
              내보내기
            </button>
          </div>
        </div>

        {/* 뷰 모드 선택 */}
        <div className="phenomenal p-1 mb-6 inline-flex rounded-md">
          <button
            onClick={() => setViewMode('network')}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              viewMode === 'network' ? 'bg-thesis text-void' : 'text-pneuma hover:text-logos'
            }`}
          >
            <Network className="w-4 h-4 inline mr-1" />
            네트워크
          </button>
          <button
            onClick={() => setViewMode('hierarchy')}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              viewMode === 'hierarchy' ? 'bg-thesis text-void' : 'text-pneuma hover:text-logos'
            }`}
          >
            <Layers className="w-4 h-4 inline mr-1" />
            계층구조
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              viewMode === 'timeline' ? 'bg-thesis text-void' : 'text-pneuma hover:text-logos'
            }`}
          >
            타임라인
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* 네트워크 시각화 영역 */}
          <div className="col-span-2 phenomenal p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg text-logos">프로젝트 관계망</h2>
              <button className="text-nous hover:text-logos">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* 개선된 네트워크 시각화 (SVG) */}
            <svg className="w-full h-96 bg-phenomenon rounded-lg" viewBox="0 0 800 500">
              <defs>
                {/* 화살표 마커 정의 */}
                <marker
                  id="arrowhead-strong"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#00D9FF" />
                </marker>
                <marker
                  id="arrowhead-medium"
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="#6B7280" />
                </marker>
                <marker
                  id="arrowhead-weak"
                  markerWidth="6"
                  markerHeight="6"
                  refX="4"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 6 3, 0 6" fill="#3A3A3A" />
                </marker>
              </defs>

              {/* 연결선 그리기 */}
              {relationships.map((rel, idx) => {
                const fromNode = nodePositions.find(n => n.id === rel.from);
                const toNode = nodePositions.find(n => n.id === rel.to);
                if (!fromNode || !toNode) return null;

                // 화살표를 위한 선 끝점 조정
                const dx = toNode.x - fromNode.x;
                const dy = toNode.y - fromNode.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const ratio = (distance - toNode.radius - 5) / distance;

                const x2 = fromNode.x + dx * ratio;
                const y2 = fromNode.y + dy * ratio;

                return (
                  <line
                    key={idx}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={x2}
                    y2={y2}
                    stroke={getStrokeColor(rel.strength)}
                    strokeWidth={getStrokeWidth(rel.strength)}
                    markerEnd={`url(#arrowhead-${rel.strength})`}
                    opacity={hoveredNode === null || hoveredNode === rel.from || hoveredNode === rel.to ? 0.8 : 0.2}
                  />
                );
              })}

              {/* 노드 그리기 */}
              {nodePositions.map((node) => (
                <g
                  key={node.id}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer transition-all"
                  opacity={hoveredNode === null || hoveredNode === node.id ? 1 : 0.4}
                >
                  {/* 외곽 원 (글로우 효과) */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + 8}
                    fill={node.color}
                    opacity={hoveredNode === node.id ? 0.4 : 0.2}
                  />
                  {/* 메인 노드 */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill={node.color}
                    stroke={hoveredNode === node.id ? '#FFFFFF' : node.color}
                    strokeWidth={hoveredNode === node.id ? 3 : 1}
                  />
                  {/* 노드 라벨 (외부 배치) */}
                  <text
                    x={node.x}
                    y={node.y + node.radius + 20}
                    textAnchor="middle"
                    fill="#E2E8F0"
                    fontSize="13"
                    fontWeight={hoveredNode === node.id ? 'bold' : 'normal'}
                  >
                    {node.name}
                  </text>
                  {/* 노드 내부 타입 표시 */}
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fill="#0A0A0A"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {node.type === 'project' ? '프로젝트' :
                     node.type === 'company' ? '발주사' :
                     node.type === 'person' ? '담당자' : '협력사'}
                  </text>
                  {/* value 표시 (프로젝트인 경우) */}
                  {node.value > 0 && (
                    <text
                      x={node.x}
                      y={node.y - 8}
                      textAnchor="middle"
                      fill="#0A0A0A"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {node.value}억
                    </text>
                  )}
                </g>
              ))}
            </svg>

            {/* 범례 개선 */}
            <div className="mt-6 border-t border-essence pt-4">
              <div className="text-xs text-nous mb-3 font-medium">노드 타입</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-phenomenon rounded-md">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: NODE_COLORS.project }}></div>
                  <span className="text-sm text-logos">프로젝트</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-phenomenon rounded-md">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: NODE_COLORS.company }}></div>
                  <span className="text-sm text-logos">발주사</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-phenomenon rounded-md">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: NODE_COLORS.person }}></div>
                  <span className="text-sm text-logos">담당자</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-phenomenon rounded-md">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: NODE_COLORS.partner }}></div>
                  <span className="text-sm text-logos">협력사</span>
                </div>
              </div>

              <div className="text-xs text-nous mb-3 mt-4 font-medium">관계 강도</div>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-phenomenon rounded-md">
                  <div className="w-8 h-1 rounded" style={{ backgroundColor: '#00D9FF' }}></div>
                  <span className="text-sm text-logos">강함</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-phenomenon rounded-md">
                  <div className="w-8 h-1 rounded" style={{ backgroundColor: '#6B7280' }}></div>
                  <span className="text-sm text-logos">보통</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-phenomenon rounded-md">
                  <div className="w-8 h-1 rounded" style={{ backgroundColor: '#3A3A3A' }}></div>
                  <span className="text-sm text-logos">약함</span>
                </div>
              </div>
            </div>
          </div>

          {/* 선택된 노드 상세 정보 또는 클러스터 분석 */}
          <div className="phenomenal p-4">
            {selectedNode ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg text-logos">노드 상세 정보</h2>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-sm text-nous hover:text-logos"
                  >
                    닫기 ✕
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-phenomenon rounded">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: selectedNode.color }}
                      ></div>
                      <span className="text-base text-logos font-medium">{selectedNode.name}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-nous">타입</span>
                        <span className="text-pneuma">
                          {selectedNode.type === 'project' ? '프로젝트' :
                           selectedNode.type === 'company' ? '발주사' :
                           selectedNode.type === 'person' ? '담당자' : '협력사'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-nous">연결 수</span>
                        <span className="text-thesis">{selectedNode.connections}개</span>
                      </div>
                      {selectedNode.value > 0 && (
                        <div className="flex justify-between">
                          <span className="text-nous">계약액</span>
                          <span className="text-synthesis">{selectedNode.value}억 원</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-nous">상태</span>
                        <span className="px-2 py-0.5 bg-thesis bg-opacity-20 text-thesis rounded text-xs">
                          {selectedNode.status === 'active' ? '활성' : '비활성'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 관련 관계 */}
                  <div className="p-3 bg-phenomenon rounded">
                    <h3 className="text-sm text-logos font-medium mb-2">관련 관계</h3>
                    <div className="space-y-1 text-xs">
                      {relationships
                        .filter(rel => rel.from === selectedNode.id || rel.to === selectedNode.id)
                        .map((rel, idx) => (
                          <div key={idx} className="text-pneuma flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: rel.strength === 'strong' ? '#00D9FF' :
                                                 rel.strength === 'medium' ? '#6B7280' : '#3A3A3A'
                              }}
                            ></div>
                            <span>
                              {rel.from === selectedNode.id ? `→ ${rel.toName}` : `← ${rel.fromName}`}
                              {' '}({rel.type})
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg text-logos mb-4">클러스터 분석</h2>
                <div className="space-y-3">
                  {clusters.map((cluster, idx) => (
                    <div key={idx} className="p-3 bg-phenomenon rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cluster.color }}></div>
                        <span className="text-sm text-logos font-medium">{cluster.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-nous">프로젝트</div>
                          <div className="text-pneuma">{cluster.projects}개</div>
                        </div>
                        <div>
                          <div className="text-nous">평균 이익률</div>
                          <div className="text-thesis">{cluster.avgMargin}%</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-nous">총 계약액</div>
                          <div className="text-synthesis">{cluster.totalValue}억</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* AI 인사이트 */}
        <div className="phenomenal p-4 mb-6">
          <h2 className="text-lg text-logos mb-4">AI 인사이트 Insights</h2>
          <div className="grid grid-cols-3 gap-4">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.impact === 'positive'
                    ? 'border-thesis bg-thesis bg-opacity-10'
                    : 'border-warning bg-warning bg-opacity-10'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    insight.type === 'pattern' ? 'bg-thesis text-void' :
                    insight.type === 'risk' ? 'bg-warning text-void' :
                    'bg-synthesis text-void'
                  }`}>
                    {insight.type === 'pattern' ? '패턴' : insight.type === 'risk' ? '리스크' : '기회'}
                  </span>
                </div>
                <h3 className="text-sm text-logos font-medium mb-2">{insight.title}</h3>
                <p className="text-xs text-pneuma mb-3">{insight.description}</p>
                <div className="text-xs text-nous">
                  관련: {insight.projects.slice(0, 2).join(', ')}
                  {insight.projects.length > 2 && ` 외 ${insight.projects.length - 2}개`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 관계 목록 (개선된 가독성) */}
        <div className="phenomenal p-6">
          <h2 className="text-lg text-logos mb-5">주요 관계 Relationships</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-essence text-nous text-sm font-medium">
                  <th className="text-left py-4 px-4">출발</th>
                  <th className="text-center py-4 px-4">관계 유형</th>
                  <th className="text-left py-4 px-4">도착</th>
                  <th className="text-center py-4 px-4">연결 강도</th>
                </tr>
              </thead>
              <tbody>
                {relationships.map((rel, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-phenomenon hover:bg-phenomenon transition-all duration-200 group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: nodePositions.find(n => n.id === rel.from)?.color || '#999'
                          }}
                        ></div>
                        <span className="text-sm text-logos font-medium">{rel.fromName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-pneuma bg-phenomenon px-3 py-1 rounded-full group-hover:bg-essence transition-colors">
                          {rel.type}
                        </span>
                        <span className="text-nous">→</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: nodePositions.find(n => n.id === rel.to)?.color || '#999'
                          }}
                        ></div>
                        <span className="text-sm text-logos font-medium">{rel.toName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className="w-16 h-1.5 rounded-full"
                          style={{
                            backgroundColor: getStrokeColor(rel.strength)
                          }}
                        ></div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          rel.strength === 'strong' ? 'bg-thesis bg-opacity-20 text-thesis' :
                          rel.strength === 'medium' ? 'bg-gray-600 bg-opacity-30 text-gray-400' :
                          'bg-gray-700 bg-opacity-30 text-gray-500'
                        }`}>
                          {rel.strength === 'strong' ? '강함' : rel.strength === 'medium' ? '보통' : '약함'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
