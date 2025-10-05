'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, PlayCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface ETLJob {
  id: string;
  datasetId: string;
  jobType: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsFailed: number;
  createdAt: string;
  dataset?: {
    name: string;
  };
}

export default function ETLJobsPage() {
  const [jobs, setJobs] = useState<ETLJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/ontology/etl');
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Failed to fetch ETL jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-synthesis" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-danger" />;
      case 'RUNNING':
        return <RefreshCw className="w-4 h-4 text-thesis animate-spin" />;
      case 'QUEUED':
        return <Clock className="w-4 h-4 text-nous" />;
      case 'CANCELLED':
        return <AlertCircle className="w-4 h-4 text-pneuma" />;
      default:
        return <Clock className="w-4 h-4 text-nous" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-synthesis';
      case 'FAILED':
        return 'text-danger';
      case 'RUNNING':
        return 'text-thesis';
      case 'QUEUED':
        return 'text-nous';
      case 'CANCELLED':
        return 'text-pneuma';
      default:
        return 'text-pneuma';
    }
  };

  const getJobTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FULL_SYNC: '전체 동기화',
      INCREMENTAL_SYNC: '증분 동기화',
      VALIDATION: '검증',
      TRANSFORMATION: '변환',
    };
    return labels[type] || type;
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}시간 ${minutes % 60}분`;
    if (minutes > 0) return `${minutes}분 ${seconds % 60}초`;
    return `${seconds}초`;
  };

  const filteredJobs = filter === 'ALL'
    ? jobs
    : jobs.filter(job => job.status === filter);

  const stats = {
    total: jobs.length,
    success: jobs.filter(j => j.status === 'SUCCESS').length,
    failed: jobs.filter(j => j.status === 'FAILED').length,
    running: jobs.filter(j => j.status === 'RUNNING').length,
    queued: jobs.filter(j => j.status === 'QUEUED').length,
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
            <h1 className="text-2xl font-light text-logos mb-2">ETL 작업 모니터링</h1>
            <p className="text-sm text-nous">데이터 추출, 변환, 로드 작업 현황</p>
          </div>
          <button
            onClick={fetchJobs}
            className="flex items-center gap-2 px-4 py-2 bg-thesis/20 hover:bg-thesis/30 text-thesis rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">새로고침</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="phenomenal p-4">
            <div className="flex items-center gap-2 mb-2">
              <PlayCircle className="w-4 h-4 text-logos" />
              <span className="text-xs text-nous">전체 작업</span>
            </div>
            <div className="text-2xl text-logos font-light">{stats.total}</div>
          </div>
          <div className="phenomenal p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-synthesis" />
              <span className="text-xs text-nous">성공</span>
            </div>
            <div className="text-2xl text-synthesis font-light">{stats.success}</div>
          </div>
          <div className="phenomenal p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-thesis" />
              <span className="text-xs text-nous">실행 중</span>
            </div>
            <div className="text-2xl text-thesis font-light">{stats.running}</div>
          </div>
          <div className="phenomenal p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-nous" />
              <span className="text-xs text-nous">대기 중</span>
            </div>
            <div className="text-2xl text-nous font-light">{stats.queued}</div>
          </div>
          <div className="phenomenal p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-danger" />
              <span className="text-xs text-nous">실패</span>
            </div>
            <div className="text-2xl text-danger font-light">{stats.failed}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {['ALL', 'SUCCESS', 'RUNNING', 'QUEUED', 'FAILED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                filter === status
                  ? 'bg-thesis text-essence'
                  : 'bg-essence/50 text-pneuma hover:bg-essence'
              }`}
            >
              {status === 'ALL' ? '전체' : status}
            </button>
          ))}
        </div>

        {/* Jobs Table */}
        <div className="phenomenal p-6">
          <h2 className="text-lg font-light text-logos mb-4">작업 목록</h2>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-nous mx-auto mb-3" />
              <p className="text-pneuma mb-2">ETL 작업이 없습니다</p>
              <p className="text-sm text-nous">데이터셋 동기화를 시작하면 작업이 생성됩니다</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-essence">
                    <th className="text-left py-3 px-4 text-nous font-medium">데이터셋</th>
                    <th className="text-left py-3 px-4 text-nous font-medium">작업 유형</th>
                    <th className="text-left py-3 px-4 text-nous font-medium">상태</th>
                    <th className="text-right py-3 px-4 text-nous font-medium">처리</th>
                    <th className="text-right py-3 px-4 text-nous font-medium">성공</th>
                    <th className="text-right py-3 px-4 text-nous font-medium">실패</th>
                    <th className="text-left py-3 px-4 text-nous font-medium">소요시간</th>
                    <th className="text-left py-3 px-4 text-nous font-medium">시작 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-essence/50 hover:bg-essence/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="text-logos font-medium">
                          {job.dataset?.name || `Dataset ${job.datasetId.slice(0, 8)}`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 bg-essence rounded text-pneuma">
                          {getJobTypeLabel(job.jobType)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className={`text-xs ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-logos">
                        {job.recordsProcessed.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-synthesis">
                        {job.recordsSuccess.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-danger">
                        {job.recordsFailed.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-pneuma">
                        {formatDuration(job.duration)}
                      </td>
                      <td className="py-3 px-4 text-pneuma text-xs">
                        {job.startedAt
                          ? new Date(job.startedAt).toLocaleString('ko-KR')
                          : '시작 대기'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Success Rate */}
        {jobs.length > 0 && (
          <div className="phenomenal p-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-synthesis" />
              <h2 className="text-lg font-light text-logos">성공률</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-2 bg-essence rounded-full overflow-hidden">
                  <div
                    className="h-full bg-synthesis transition-all duration-500"
                    style={{
                      width: `${stats.total > 0 ? (stats.success / stats.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-xl font-light text-synthesis">
                {stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
