'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar, DollarSign, TrendingUp, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProjectFinancials } from '@/components/ProjectFinancials';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'forecast'>('overview');

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'forecast') {
      setActiveTab('forecast');
    } else {
      setActiveTab('overview');
    }
  }, [searchParams]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      const data = await res.json();
      setProject(data);
    } catch (error) {
      console.error('프로젝트 조회 실패:', error);
    } finally {
      setLoading(false);
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

  if (!project) {
    return (
      <div className="min-h-screen bg-void p-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-pneuma">프로젝트를 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  const STATUS_LABELS: Record<string, string> = {
    PLANNED: '계획', ACTIVE: '진행중', COMPLETED: '완료', CANCELLED: '취소',
  };

  const TYPE_LABELS: Record<string, string> = {
    REAL_ESTATE: '부동산', SIMPLE_CONTRACT: '도급', INFRA: '인프라', ENERGY: '에너지',
  };

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/projects')}
            className="flex items-center gap-2 text-pneuma hover:text-logos mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">프로젝트 목록으로</span>
          </button>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-light text-logos">{project.projectName}</h1>
                <span className="px-3 py-1 bg-thesis/20 text-thesis rounded text-sm">
                  {STATUS_LABELS[project.status]}
                </span>
              </div>
              <p className="text-sm text-pneuma">{project.projectCode} · {TYPE_LABELS[project.projectType]}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-essence">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-thesis text-thesis'
                : 'border-transparent text-pneuma hover:text-logos'
            }`}
          >
            사업개요 <span className="text-xs">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-4 py-2 text-sm transition-colors border-b-2 ${
              activeTab === 'forecast'
                ? 'border-thesis text-thesis'
                : 'border-transparent text-pneuma hover:text-logos'
            }`}
          >
            재무전망 <span className="text-xs">Forecast</span>
          </button>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* 주요 정보 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="phenomenal p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-thesis" />
              <span className="text-xs text-nous">계약금액</span>
            </div>
            <div className="text-2xl text-logos font-light">{Number(project.contractPrice).toLocaleString()}억</div>
          </div>
          <div className="phenomenal p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-synthesis" />
              <span className="text-xs text-nous">진행률</span>
            </div>
            <div className="text-2xl text-logos font-light">{Number(project.progressRate).toFixed(1)}%</div>
          </div>
          <div className="phenomenal p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-pneuma" />
              <span className="text-xs text-nous">공사기간</span>
            </div>
            <div className="text-2xl text-logos font-light">{project.constructionPeriod}개월</div>
          </div>
          <div className="phenomenal p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-amber" />
              <span className="text-xs text-nous">발주처</span>
            </div>
            <div className="text-base text-logos">{project.client}</div>
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 프로젝트 정보 */}
          <div className="phenomenal p-4">
            <h2 className="text-lg font-light text-logos mb-4">프로젝트 정보 <span className="text-sm text-pneuma">Project Information</span></h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-essence/50">
                <span className="text-sm text-nous">계약일자</span>
                <span className="text-sm text-logos">{new Date(project.contractDate).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-essence/50">
                <span className="text-sm text-nous">착공일</span>
                <span className="text-sm text-logos">{new Date(project.startDate).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-essence/50">
                <span className="text-sm text-nous">준공일</span>
                <span className="text-sm text-logos">{new Date(project.endDate).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-nous">담당 PM</span>
                <span className="text-sm text-logos">{project.creator?.fullName} ({project.creator?.department})</span>
              </div>
            </div>
          </div>

          {/* 재무 가정 */}
          {project.assumptions?.[0] && (
            <div className="phenomenal p-4">
              <h2 className="text-lg font-light text-logos mb-4">재무 가정 <span className="text-sm text-pneuma">Financial Assumptions</span></h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-essence/50">
                  <span className="text-sm text-nous">이익률</span>
                  <span className="text-sm text-thesis">{(Number(project.assumptions[0].profitMargin) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-essence/50">
                  <span className="text-sm text-nous">원가율</span>
                  <span className="text-sm text-logos">{(Number(project.assumptions[0].costRatio) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-essence/50">
                  <span className="text-sm text-nous">청구 주기</span>
                  <span className="text-sm text-logos">{project.assumptions[0].periodInvoicing}개월</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-nous">유보율</span>
                  <span className="text-sm text-logos">{(Number(project.assumptions[0].retentionRate) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 진행률 차트 */}
        {project.progress && project.progress.length > 0 && (
          <div className="phenomenal p-4 mb-6">
            <h2 className="text-lg font-light text-logos mb-4">월별 진행률 <span className="text-sm text-pneuma">Monthly Progress</span></h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={project.progress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="month" stroke="#909090" tick={{ fill: '#909090', fontSize: 12 }} label={{ value: '월', fill: '#909090', position: 'insideBottomRight', offset: -5 }} />
                <YAxis stroke="#909090" tick={{ fill: '#909090', fontSize: 12 }} label={{ value: '%', fill: '#909090', angle: -90, position: 'insideLeft' }} />
                <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A', borderRadius: '4px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="cumulativeRate" name="누적 진행률" stroke="#00D9FF" strokeWidth={2} dot={{ fill: '#00D9FF', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 현금흐름 차트 */}
        {project.cashFlows && project.cashFlows.length > 0 && (
          <div className="phenomenal p-4 mb-6">
            <h2 className="text-lg font-light text-logos mb-4">현금흐름 <span className="text-sm text-pneuma">Cash Flow</span></h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={project.cashFlows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="month" stroke="#909090" tick={{ fill: '#909090', fontSize: 12 }} label={{ value: '월', fill: '#909090', position: 'insideBottomRight', offset: -5 }} />
                <YAxis stroke="#909090" tick={{ fill: '#909090', fontSize: 12 }} label={{ value: '백만원', fill: '#909090', angle: -90, position: 'insideLeft' }} />
                <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A', borderRadius: '4px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="receivedAmount" name="수금" fill="#00D9FF" />
                <Bar dataKey="subcontractPayment" name="하도급 지급" fill="#FF4757" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
          </>
        )}

        {/* Forecast Tab Content */}
        {activeTab === 'forecast' && (
          <div className="mb-6">
            <h2 className="text-xl font-light text-logos mb-4">재무전망 시뮬레이션 <span className="text-sm text-pneuma">Financial Forecast Simulation</span></h2>
            <ProjectFinancials project={project} />
          </div>
        )}
      </div>
    </div>
  );
}
