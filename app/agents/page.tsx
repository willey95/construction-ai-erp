'use client';

import { useEffect, useState } from 'react';
import { useAgentStore } from '@/lib/agentStore';
import { Bot, Activity, Play, Pause, BarChart3, Zap, TrendingUp, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ZenCard,
  ZenMetric,
  ZenButton,
  ZenDivider,
  ZenBadge,
  ZenProgress,
  ZenSkeleton,
} from '@/components/ZenDesignSystem';
import {
  ZenSparkline,
  ZenCircularProgress,
  ZenStatusIndicator,
} from '@/components/ZenDataViz';

export default function AgentsPage() {
  const { agents, fetchAgents, stats, startAgent, stopAgent } = useAgentStore();
  const [mounted, setMounted] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchAgents();
  }, [fetchAgents]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-void p-6">
        <div className="max-w-[1800px] mx-auto space-y-6">
          <ZenSkeleton height="h-32" />
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <ZenSkeleton key={i} height="h-40" />)}
          </div>
        </div>
      </div>
    );
  }

  const activeAgents = agents.filter(a => a.status === 'RUNNING' || a.status === 'ACTIVE');
  const totalSuccessRate = agents.length > 0
    ? (agents.reduce((sum, a) => sum + parseFloat(String(a.successRate || 0)), 0) / agents.length)
    : 0;

  // Mock sparkline data
  const sparklineData = [65, 72, 68, 75, 82, 78, 85, 88, 92, 87, 90, 95];

  return (
    <div className="min-h-screen bg-void">
      {/* Ambient background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-thesis/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-synthesis/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative max-w-[1800px] mx-auto px-8 py-12">
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
                    AI 에이전트 허브
                  </span>
                </h1>
                <ZenStatusIndicator status="success" label="Online" pulse size="md" />
              </div>
              <p className="text-sm text-pneuma/60 font-light tracking-wide">
                Autonomous Intelligence · 자율 작업 처리 시스템
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ZenButton variant="ghost" size="sm" icon={Clock}>
                Activity
              </ZenButton>
              <ZenButton variant="primary" size="sm" icon={Zap}>
                Start All
              </ZenButton>
            </div>
          </div>

          <ZenDivider />
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="Total Agents"
              value={agents.length}
              unit="개"
              icon={Bot}
              color="thesis"
              description="등록된 전체 AI 에이전트 수"
            />
            <div className="px-6 pb-6">
              <ZenSparkline data={sparklineData} color="#00D9FF" height={40} />
            </div>
          </ZenCard>

          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="Active Agents"
              value={activeAgents.length}
              unit="개"
              change={15.2}
              trend="up"
              icon={Activity}
              color="synthesis"
              description="현재 실행 중인 에이전트"
            />
            <div className="px-6 pb-6">
              <ZenProgress value={activeAgents.length} max={agents.length} color="synthesis" />
            </div>
          </ZenCard>

          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="Success Rate"
              value={totalSuccessRate.toFixed(1)}
              unit="%"
              change={8.3}
              trend="up"
              icon={Target}
              color="synthesis"
              description="평균 작업 성공률"
            />
            <div className="px-6 pb-6 flex justify-center">
              <ZenCircularProgress value={totalSuccessRate} size={80} strokeWidth={6} color="#10B981" showValue={false} />
            </div>
          </ZenCard>

          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="Operations"
              value={stats.totalOperations}
              unit="건"
              change={12.5}
              trend="up"
              icon={TrendingUp}
              color="thesis"
              description="오늘 처리된 작업 수"
            />
            <div className="px-6 pb-6">
              <ZenSparkline data={[45, 52, 48, 61, 58, 65, 72, 68, 75, 82, 78, 85]} color="#8B5CF6" height={40} />
            </div>
          </ZenCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <Link href="/agents/monitor">
            <ZenCard hover border="medium" className="group">
              <div className="p-6 flex items-center gap-6">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-thesis/20 to-synthesis/20 flex items-center justify-center border border-thesis/30 group-hover:border-thesis/60 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <Activity className="w-8 h-8 text-thesis" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-lg font-light text-logos mb-1 tracking-wide">Activity Monitor</h3>
                  <p className="text-xs text-pneuma/60 font-light">실시간 에이전트 활동 추적</p>
                </div>
                <div className="text-thesis/40 group-hover:text-thesis/80 transition-colors">→</div>
              </div>
            </ZenCard>
          </Link>

          <Link href="/agents/logs">
            <ZenCard hover border="medium" className="group">
              <div className="p-6 flex items-center gap-6">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-synthesis/20 to-thesis/20 flex items-center justify-center border border-synthesis/30 group-hover:border-synthesis/60 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <BarChart3 className="w-8 h-8 text-synthesis" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-lg font-light text-logos mb-1 tracking-wide">Log Viewer</h3>
                  <p className="text-xs text-pneuma/60 font-light">상세 작업 로그 조회</p>
                </div>
                <div className="text-synthesis/40 group-hover:text-synthesis/80 transition-colors">→</div>
              </div>
            </ZenCard>
          </Link>

          <Link href="/agents/control">
            <ZenCard hover border="medium" className="group">
              <div className="p-6 flex items-center gap-6">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warning/20 to-danger/20 flex items-center justify-center border border-warning/30 group-hover:border-warning/60 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <Bot className="w-8 h-8 text-warning" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-lg font-light text-logos mb-1 tracking-wide">Control Center</h3>
                  <p className="text-xs text-pneuma/60 font-light">전체 에이전트 제어</p>
                </div>
                <div className="text-warning/40 group-hover:text-warning/80 transition-colors">→</div>
              </div>
            </ZenCard>
          </Link>
        </div>

        <ZenDivider label="Registered Agents" className="mb-8" />

        {/* Agent Cards */}
        <div className="grid grid-cols-2 gap-6">
          {agents.map((agent, idx) => (
            <motion.div
              key={agent.id || agent.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
            >
              <ZenCard
                hover
                glow
                border={selectedAgent === agent.name ? 'strong' : 'subtle'}
                onClick={() => setSelectedAgent(agent.name)}
              >
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <motion.div
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-thesis/20 to-synthesis/20 flex items-center justify-center border border-thesis/30"
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Bot className="w-5 h-5 text-thesis" />
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-light text-logos tracking-wide">
                            {agent.displayName || agent.name}
                          </h3>
                          <p className="text-xs text-nous/60 font-light mt-0.5">
                            {agent.type}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-pneuma/80 font-light leading-relaxed mb-4">
                        {agent.description || '자율 작업 처리 에이전트'}
                      </p>

                      {/* Capabilities */}
                      {agent.capabilities && agent.capabilities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {agent.capabilities.slice(0, 3).map((cap, i) => (
                            <ZenBadge key={i} variant="info" size="sm">
                              {cap}
                            </ZenBadge>
                          ))}
                          {agent.capabilities.length > 3 && (
                            <ZenBadge variant="default" size="sm">
                              +{agent.capabilities.length - 3}
                            </ZenBadge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <ZenBadge
                      variant={
                        agent.status === 'RUNNING' || agent.status === 'ACTIVE' ? 'success' :
                        agent.status === 'ERROR' ? 'danger' :
                        agent.status === 'IDLE' ? 'info' : 'default'
                      }
                      pulse={agent.status === 'RUNNING'}
                    >
                      {agent.status}
                    </ZenBadge>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-phenomenon/20 border border-essence/10">
                      <div className="text-[10px] text-nous/60 uppercase tracking-wider mb-1">Success</div>
                      <div className="text-lg font-light text-synthesis">{agent.successRate}%</div>
                    </div>
                    <div className="p-3 rounded-xl bg-phenomenon/20 border border-essence/10">
                      <div className="text-[10px] text-nous/60 uppercase tracking-wider mb-1">Runs</div>
                      <div className="text-lg font-light text-thesis">{agent.totalRuns || 0}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-phenomenon/20 border border-essence/10">
                      <div className="text-[10px] text-nous/60 uppercase tracking-wider mb-1">Type</div>
                      <div className="text-xs font-light text-pneuma truncate">{agent.type}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-phenomenon/20 border border-essence/10">
                      <div className="text-[10px] text-nous/60 uppercase tracking-wider mb-1">Last Run</div>
                      <div className="text-xs font-light text-pneuma">
                        {agent.lastRun ? new Date(agent.lastRun).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {agent.status === 'RUNNING' ? (
                      <button
                        className="flex-1 px-4 py-2 bg-danger text-void rounded-md hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          stopAgent(agent.name);
                        }}
                      >
                        <Pause className="w-4 h-4" />
                        Stop
                      </button>
                    ) : (
                      <button
                        className="flex-1 px-4 py-2 bg-thesis text-void rounded-md hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          startAgent(agent.name);
                        }}
                      >
                        <Play className="w-4 h-4" />
                        Start
                      </button>
                    )}
                    <Link href={`/agents/${agent.name}`} onClick={(e) => e.stopPropagation()}>
                      <ZenButton variant="ghost" size="sm">
                        Details
                      </ZenButton>
                    </Link>
                  </div>
                </div>
              </ZenCard>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {agents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Bot className="w-16 h-16 text-nous/20 mx-auto mb-4" />
            <h3 className="text-lg text-pneuma/60 font-light mb-2">No agents registered</h3>
            <p className="text-sm text-nous/40 font-light">
              Register agents to start autonomous processing
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
