'use client';

import { useEffect, useState } from 'react';
import { useAgentStore } from '@/lib/agentStore';
import { FileText, Filter, Download, RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ZenCard,
  ZenButton,
  ZenBadge,
  ZenSkeleton,
} from '@/components/ZenDesignSystem';

export default function AgentLogsPage() {
  const { logs, fetchLogs } = useAgentStore();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');
  const [agentFilter, setAgentFilter] = useState<string>('ALL');

  useEffect(() => {
    setMounted(true);
    fetchLogs(200);
    const interval = setInterval(() => fetchLogs(200), 10000); // 10초마다
    return () => clearInterval(interval);
  }, [fetchLogs]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-void p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <ZenSkeleton height="h-32" />
          <ZenSkeleton height="h-96" />
        </div>
      </div>
    );
  }

  const filteredLogs = logs.filter(log => {
    const statusMatch = filter === 'ALL' || log.status === filter;
    const agentMatch = agentFilter === 'ALL' || log.agentName === agentFilter;
    return statusMatch && agentMatch;
  });

  const uniqueAgents = Array.from(new Set(logs.map(log => log.agentName)));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-synthesis" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-danger" />;
      case 'RUNNING': return <RefreshCw className="w-4 h-4 text-thesis animate-spin" />;
      default: return <AlertTriangle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'success';
      case 'FAILED': return 'danger';
      case 'RUNNING': return 'info';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-void">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-thesis/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-synthesis/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-5xl font-extralight tracking-tight">
                  <span className="bg-gradient-to-r from-thesis via-synthesis to-thesis bg-clip-text text-transparent">
                    Agent Logs
                  </span>
                </h1>
              </div>
              <p className="text-sm text-pneuma/60 font-light tracking-wide">
                에이전트 작업 로그 · {filteredLogs.length}건
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ZenButton
                variant="ghost"
                size="sm"
                icon={RefreshCw}
                onClick={() => fetchLogs(200)}
              >
                Refresh
              </ZenButton>
              <ZenButton variant="ghost" size="sm" icon={Download}>
                Export
              </ZenButton>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <ZenCard className="mb-8">
          <div className="p-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-nous" />
                <span className="text-sm text-pneuma">필터:</span>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                {['ALL', 'SUCCESS', 'FAILED', 'RUNNING'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1 rounded-lg text-xs transition-all ${
                      filter === status
                        ? 'bg-thesis text-void'
                        : 'bg-phenomenon/20 text-pneuma hover:bg-phenomenon/40'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Agent Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setAgentFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs transition-all ${
                    agentFilter === 'ALL'
                      ? 'bg-synthesis text-void'
                      : 'bg-phenomenon/20 text-pneuma hover:bg-phenomenon/40'
                  }`}
                >
                  모든 에이전트
                </button>
                {uniqueAgents.slice(0, 5).map((agent) => (
                  <button
                    key={agent}
                    onClick={() => setAgentFilter(agent)}
                    className={`px-3 py-1 rounded-lg text-xs transition-all ${
                      agentFilter === agent
                        ? 'bg-synthesis text-void'
                        : 'bg-phenomenon/20 text-pneuma hover:bg-phenomenon/40'
                    }`}
                  >
                    {agent}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ZenCard>

        {/* Logs Table */}
        <ZenCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-essence/20">
                  <th className="px-6 py-4 text-left text-xs font-medium text-nous uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-nous uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-nous uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-nous uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-nous uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-nous uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-nous uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-essence/10">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-nous/20 mx-auto mb-3" />
                      <p className="text-pneuma/60">로그가 없습니다</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-phenomenon/10 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <ZenBadge variant={getStatusBadge(log.status) as any} size="sm">
                            {log.status}
                          </ZenBadge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-logos font-medium">{log.agentName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-pneuma">{log.action}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-nous">{log.agentType}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-xs text-pneuma">
                          <Clock className="w-3 h-3" />
                          <span>{log.duration ? `${log.duration}ms` : '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-nous">
                          {new Date(log.timestamp).toLocaleString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-pneuma">
                          {log.errorMsg || log.action}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredLogs.length > 50 && (
            <div className="px-6 py-4 border-t border-essence/10 flex justify-between items-center">
              <span className="text-sm text-nous">
                Showing {Math.min(filteredLogs.length, 50)} of {filteredLogs.length} logs
              </span>
              <div className="flex gap-2">
                <ZenButton variant="ghost" size="sm">Previous</ZenButton>
                <ZenButton variant="ghost" size="sm">Next</ZenButton>
              </div>
            </div>
          )}
        </ZenCard>
      </div>
    </div>
  );
}
