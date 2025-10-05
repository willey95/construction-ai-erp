'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Bot, Activity, Play, Pause, RefreshCw, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ZenCard,
  ZenMetric,
  ZenButton,
  ZenDivider,
  ZenBadge,
  ZenSkeleton,
} from '@/components/ZenDesignSystem';
import {
  ZenSparkline,
  ZenCircularProgress,
  ZenStatusIndicator,
} from '@/components/ZenDataViz';

interface AgentDetails {
  agent: {
    id?: string;
    name: string;
    displayName: string;
    description: string;
    capabilities: string[];
    type: string;
    status: string;
    lastRun?: string;
    successRate: string;
    totalRuns: number;
  };
  details: {
    recentLogs?: Array<{
      id: string | number;
      action?: string;
      status?: string;
      timestamp?: string;
      duration?: number;
      errorMsg?: string;
      [key: string]: unknown;
    }>;
    recentTasks?: Array<{
      id: string | number;
      taskType?: string;
      status?: string;
      priority?: string;
      createdAt?: string;
      [key: string]: unknown;
    }>;
    recentInsights?: Array<{
      id: string | number;
      name?: string;
      description?: string;
      outgoingRelations?: Array<{
        toEntity: { name: string };
        [key: string]: unknown;
      }>;
      [key: string]: unknown;
    }>;
    scheduler?: Record<string, unknown>;
    performance?: {
      successRate: number;
      avgDuration: number;
      totalOperations: number;
    };
    stats?: {
      totalInsights: number;
      totalEntities: number;
      totalRelations: number;
    };
  };
}

export default function AgentDetailPage() {
  const params = useParams();
  const agentName = params.agentName as string;

  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAgentDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/agents/${agentName}`);
      if (res.ok) {
        const data = await res.json();
        setAgentDetails(data);
      }
    } catch (error) {
      console.error('Failed to fetch agent details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentDetails();
    const interval = setInterval(fetchAgentDetails, 5000); // 5초마다 업데이트
    return () => clearInterval(interval);
  }, [agentName, fetchAgentDetails]);

  const handleStartStop = async () => {
    if (!agentDetails) return;
    setActionLoading(true);
    try {
      const endpoint = agentDetails.agent.status === 'RUNNING' ? 'stop' : 'start';
      const res = await fetch(`/api/agents/${agentName}/${endpoint}`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchAgentDetails();
      }
    } catch (error) {
      console.error('Failed to control agent:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !agentDetails) {
    return (
      <div className="min-h-screen bg-void p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <ZenSkeleton height="h-32" />
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <ZenSkeleton key={i} height="h-40" />)}
          </div>
        </div>
      </div>
    );
  }

  const { agent, details } = agentDetails;
  const isRunning = agent.status === 'RUNNING' || agent.status === 'ACTIVE';

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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link href="/agents">
            <ZenButton variant="ghost" size="sm" icon={ArrowLeft} className="mb-6">
              Back to Agents
            </ZenButton>
          </Link>

          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              <motion.div
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-thesis/20 to-synthesis/20 flex items-center justify-center border border-thesis/30"
                whileHover={{ scale: 1.05, rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Bot className="w-10 h-10 text-thesis" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-extralight tracking-tight text-logos mb-2">
                  {agent.displayName}
                </h1>
                <p className="text-sm text-pneuma/60 font-light mb-4">
                  {agent.description}
                </p>
                <div className="flex items-center gap-3">
                  <ZenStatusIndicator
                    status={isRunning ? 'success' : 'neutral'}
                    label={agent.status}
                    pulse={isRunning}
                  />
                  <span className="text-xs text-nous/60">• {agent.type}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <ZenButton
                variant="ghost"
                size="sm"
                icon={RefreshCw}
                onClick={fetchAgentDetails}
              >
                Refresh
              </ZenButton>
              <ZenButton
                variant={isRunning ? 'danger' : 'primary'}
                size="sm"
                icon={isRunning ? Pause : Play}
                onClick={handleStartStop}
                disabled={actionLoading}
              >
                {isRunning ? 'Stop' : 'Start'}
              </ZenButton>
            </div>
          </div>

          <ZenDivider />
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="Success Rate"
              value={agent.successRate}
              unit="%"
              icon={CheckCircle}
              color="synthesis"
            />
            <div className="px-6 pb-6 flex justify-center">
              <ZenCircularProgress
                value={parseFloat(agent.successRate)}
                size={80}
                strokeWidth={6}
                color="#10B981"
              />
            </div>
          </ZenCard>

          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="Total Runs"
              value={agent.totalRuns}
              unit="회"
              icon={Activity}
              color="thesis"
            />
            <div className="px-6 pb-6">
              <ZenSparkline
                data={[45, 52, 48, 61, 58, 65, 72, 68, 75, 82, 78, agent.totalRuns]}
                color="#00D9FF"
                height={40}
              />
            </div>
          </ZenCard>

          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="Last Run"
              value={agent.lastRun ? new Date(agent.lastRun).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '—'}
              icon={Clock}
              color="synthesis"
            />
          </ZenCard>

          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="Performance"
              value={details.performance?.avgDuration.toFixed(0) || '—'}
              unit="ms"
              icon={TrendingUp}
              color="thesis"
            />
          </ZenCard>
        </div>

        {/* Capabilities */}
        <ZenCard className="mb-12">
          <h2 className="text-xl font-light text-logos mb-6 px-8 pt-8">Capabilities</h2>
          <div className="flex flex-wrap gap-3 px-8 pb-8">
            {agent.capabilities.map((cap, i) => (
              <ZenBadge key={i} variant="info">
                {cap}
              </ZenBadge>
            ))}
          </div>
        </ZenCard>

        {/* Recent Activity */}
        <div className="grid grid-cols-2 gap-6">
          {/* Recent Logs */}
          {details.recentLogs && (
            <ZenCard>
              <h2 className="text-xl font-light text-logos mb-6 px-8 pt-8">Recent Logs</h2>
              <div className="px-8 pb-8 space-y-2 max-h-96 overflow-y-auto">
                {details.recentLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-lg bg-phenomenon/20 border border-essence/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-logos">{log.action}</span>
                      <ZenBadge
                        variant={
                          log.status === 'SUCCESS' ? 'success' :
                          log.status === 'FAILED' ? 'danger' : 'default'
                        }
                        size="sm"
                      >
                        {log.status}
                      </ZenBadge>
                    </div>
                    <div className="text-xs text-nous/60">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('ko-KR') : '—'}
                      {log.duration && ` • ${log.duration}ms`}
                    </div>
                    {log.errorMsg && (
                      <div className="mt-2 text-xs text-danger">{log.errorMsg}</div>
                    )}
                  </div>
                ))}
              </div>
            </ZenCard>
          )}

          {/* Recent Tasks */}
          {details.recentTasks && (
            <ZenCard>
              <h2 className="text-xl font-light text-logos mb-6 px-8 pt-8">Recent Tasks</h2>
              <div className="px-8 pb-8 space-y-2 max-h-96 overflow-y-auto">
                {details.recentTasks.slice(0, 10).map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg bg-phenomenon/20 border border-essence/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-logos">{task.taskType}</span>
                      <ZenBadge
                        variant={
                          task.status === 'COMPLETED' ? 'success' :
                          task.status === 'FAILED' ? 'danger' :
                          task.status === 'RUNNING' ? 'info' : 'default'
                        }
                        size="sm"
                      >
                        {task.status}
                      </ZenBadge>
                    </div>
                    <div className="text-xs text-nous/60">
                      Priority: {task.priority} • {task.createdAt ? new Date(task.createdAt).toLocaleString('ko-KR') : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </ZenCard>
          )}

          {/* Recent Insights (for AI Insights agent) */}
          {details.recentInsights && (
            <ZenCard className="col-span-2">
              <h2 className="text-xl font-light text-logos mb-6 px-8 pt-8">Recent Insights</h2>
              <div className="px-8 pb-8 space-y-3">
                {details.recentInsights.slice(0, 5).map((insight) => (
                  <div
                    key={insight.id}
                    className="p-4 rounded-lg bg-phenomenon/20 border border-essence/10"
                  >
                    <h3 className="text-sm text-logos mb-2">{insight.name}</h3>
                    <p className="text-xs text-pneuma/80 mb-3">{insight.description}</p>
                    {insight.outgoingRelations && insight.outgoingRelations.length > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-nous/60">Connected to:</span>
                        {insight.outgoingRelations.slice(0, 3).map((rel, i: number) => (
                          <span key={i} className="text-synthesis">
                            {rel.toEntity.name}
                            {insight.outgoingRelations && i < Math.min(insight.outgoingRelations.length, 3) - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ZenCard>
          )}
        </div>
      </div>
    </div>
  );
}
