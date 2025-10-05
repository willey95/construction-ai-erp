'use client';

import { useEffect, useState } from 'react';
import { useAgentStore } from '@/lib/agentStore';
import { Bot, Power, Pause, Play, RefreshCw, Settings, Activity, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ZenCard,
  ZenButton,
  ZenBadge,
  ZenSkeleton,
  ZenDivider,
} from '@/components/ZenDesignSystem';
import {
  ZenStatusIndicator,
  ZenCircularProgress,
} from '@/components/ZenDataViz';

export default function ControlCenterPage() {
  const { agents, fetchAgents, startAgent, stopAgent, stats } = useAgentStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000); // 5초마다
    return () => clearInterval(interval);
  }, [fetchAgents]);

  const handleStartAll = async () => {
    setLoading('all');
    try {
      await fetch('/api/agents', { method: 'POST' });
      await fetchAgents();
    } catch (error) {
      console.error('Failed to start all agents:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleStopAll = async () => {
    setLoading('all');
    try {
      for (const agent of agents.filter(a => a.status === 'RUNNING')) {
        await stopAgent(agent.name);
      }
      await fetchAgents();
    } catch (error) {
      console.error('Failed to stop all agents:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleToggleAgent = async (agentName: string, currentStatus: string) => {
    setLoading(agentName);
    try {
      if (currentStatus === 'RUNNING') {
        await stopAgent(agentName);
      } else {
        await startAgent(agentName);
      }
      await fetchAgents();
    } catch (error) {
      console.error(`Failed to toggle agent ${agentName}:`, error);
    } finally {
      setLoading(null);
    }
  };

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

  const runningAgents = agents.filter(a => a.status === 'RUNNING' || a.status === 'ACTIVE');
  const idleAgents = agents.filter(a => a.status === 'IDLE' || a.status === 'INACTIVE');

  return (
    <div className="min-h-screen bg-void">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-warning/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-danger/5 rounded-full blur-[128px]" />
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
                  <span className="bg-gradient-to-r from-warning via-danger to-warning bg-clip-text text-transparent">
                    Control Center
                  </span>
                </h1>
                <ZenStatusIndicator
                  status={runningAgents.length > 0 ? 'success' : 'neutral'}
                  label={runningAgents.length > 0 ? 'Active' : 'Idle'}
                  pulse={runningAgents.length > 0}
                  size="md"
                />
              </div>
              <p className="text-sm text-pneuma/60 font-light tracking-wide">
                전체 에이전트 제어 · {agents.length}개 에이전트
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ZenButton
                variant="ghost"
                size="sm"
                icon={RefreshCw}
                onClick={() => fetchAgents()}
              >
                Refresh
              </ZenButton>
            </div>
          </div>

          <ZenDivider />
        </motion.div>

        {/* System Controls */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <ZenCard hover glow border="subtle">
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-synthesis/20 to-thesis/20 flex items-center justify-center mx-auto mb-6 border border-synthesis/30">
                <Power className="w-10 h-10 text-synthesis" />
              </div>
              <h3 className="text-xl font-light text-logos mb-2">System Power</h3>
              <p className="text-sm text-pneuma/60 mb-6">전체 에이전트 시스템 제어</p>
              <div className="space-y-3">
                <ZenButton
                  variant="primary"
                  className="w-full"
                  icon={Play}
                  onClick={handleStartAll}
                  disabled={loading === 'all'}
                >
                  Start All Agents
                </ZenButton>
                <ZenButton
                  variant="danger"
                  className="w-full"
                  icon={Pause}
                  onClick={handleStopAll}
                  disabled={loading === 'all'}
                >
                  Stop All Agents
                </ZenButton>
              </div>
            </div>
          </ZenCard>

          <ZenCard hover glow border="subtle">
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-warning/20 to-danger/20 flex items-center justify-center mx-auto mb-6 border border-warning/30">
                <Activity className="w-10 h-10 text-warning" />
              </div>
              <h3 className="text-xl font-light text-logos mb-2">Agent Status</h3>
              <p className="text-sm text-pneuma/60 mb-6">현재 에이전트 활동 상태</p>
              <div className="flex justify-center mb-4">
                <ZenCircularProgress
                  value={(runningAgents.length / agents.length) * 100}
                  size={100}
                  strokeWidth={8}
                  color="#10B981"
                  showValue={false}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl text-synthesis font-light">{runningAgents.length}</div>
                  <div className="text-xs text-nous">Running</div>
                </div>
                <div>
                  <div className="text-2xl text-nous font-light">{idleAgents.length}</div>
                  <div className="text-xs text-nous">Idle</div>
                </div>
              </div>
            </div>
          </ZenCard>

          <ZenCard hover glow border="subtle">
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-thesis/20 to-synthesis/20 flex items-center justify-center mx-auto mb-6 border border-thesis/30">
                <Settings className="w-10 h-10 text-thesis" />
              </div>
              <h3 className="text-xl font-light text-logos mb-2">Operations</h3>
              <p className="text-sm text-pneuma/60 mb-6">시스템 작업 통계</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-nous">Total Ops</span>
                  <span className="text-sm text-logos">{stats.totalOperations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-nous">Success Rate</span>
                  <span className="text-sm text-synthesis">{stats.successRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-nous">Pending Tasks</span>
                  <span className="text-sm text-warning">{stats.pendingTasks}</span>
                </div>
              </div>
            </div>
          </ZenCard>
        </div>

        {/* Agent Controls */}
        <ZenCard>
          <div className="p-8">
            <h2 className="text-2xl font-light text-logos mb-8">Individual Agent Controls</h2>

            <div className="space-y-4">
              {agents.map((agent, idx) => (
                <motion.div
                  key={agent.id || agent.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 rounded-xl bg-phenomenon/20 border border-essence/10 hover:border-thesis/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-thesis/20 to-synthesis/20 flex items-center justify-center border border-thesis/30">
                        <Bot className="w-6 h-6 text-thesis" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-light text-logos">
                            {agent.displayName || agent.name}
                          </h3>
                          <ZenBadge
                            variant={
                              agent.status === 'RUNNING' || agent.status === 'ACTIVE' ? 'success' : 'default'
                            }
                            pulse={agent.status === 'RUNNING'}
                          >
                            {agent.status}
                          </ZenBadge>
                        </div>
                        <div className="flex items-center gap-6 text-xs text-nous">
                          <span>Type: {agent.type}</span>
                          <span>Success: {agent.successRate}%</span>
                          <span>Runs: {agent.totalRuns || 0}</span>
                          {agent.lastRun && (
                            <span>
                              Last: {new Date(agent.lastRun).toLocaleTimeString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <ZenButton
                        variant={agent.status === 'RUNNING' ? 'danger' : 'primary'}
                        size="sm"
                        icon={agent.status === 'RUNNING' ? Pause : Play}
                        onClick={() => handleToggleAgent(agent.name, agent.status)}
                        disabled={loading === agent.name}
                      >
                        {agent.status === 'RUNNING' ? 'Stop' : 'Start'}
                      </ZenButton>
                      <ZenButton
                        variant="ghost"
                        size="sm"
                        icon={Settings}
                        onClick={() => window.location.href = `/agents/${agent.name}`}
                      >
                        Config
                      </ZenButton>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {agents.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-nous/20 mx-auto mb-4" />
                <p className="text-pneuma/60">No agents registered</p>
              </div>
            )}
          </div>
        </ZenCard>
      </div>
    </div>
  );
}
