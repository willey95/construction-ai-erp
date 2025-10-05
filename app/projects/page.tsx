'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Plus, Filter, Search, TrendingUp, CheckCircle2, Clock, DollarSign, MoreVertical, Bell, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ZenDataGrid,
  ZenStatusIndicator,
} from '@/components/ZenDataViz';

interface Project {
  id: string;
  projectCode: string;
  projectName: string;
  projectType: string;
  client: string;
  contractPrice: number;
  startDate: string;
  endDate: string;
  status: string;
  progressRate: number;
  creator?: {
    fullName: string;
    department: string;
  };
}

interface Notification {
  id: string;
  projectId: string;
  severity: 'INFO' | 'WARNING' | 'DANGER' | 'CRITICAL';
  category: string;
  title: string;
  message: string;
  metrics?: any;
  isRead: boolean;
  actionRequired: boolean;
  createdAt: string;
  project?: {
    projectCode: string;
    projectName: string;
  };
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  REAL_ESTATE: '부동산',
  SIMPLE_CONTRACT: '도급',
  INFRA: '인프라',
  ENERGY: '에너지',
};

const STATUS_LABELS: Record<string, string> = {
  PLANNED: '계획',
  ACTIVE: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNotifications, setShowNotifications] = useState(true);

  useEffect(() => {
    fetchProjects();
    fetchNotifications();
  }, [typeFilter, statusFilter]);

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/projects?${params}`);
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error('프로젝트 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=20');
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error('알림 조회 실패:', error);
    }
  };

  const dismissNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('알림 처리 실패:', error);
    }
  };

  const filteredProjects = projects.filter(p =>
    p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeProjects = projects.filter(p => p.status === 'ACTIVE');
  const completedProjects = projects.filter(p => p.status === 'COMPLETED');
  const totalContract = projects.reduce((sum, p) => sum + Number(p.contractPrice), 0);
  const avgProgress = projects.length > 0
    ? projects.reduce((sum, p) => sum + p.progressRate, 0) / projects.length
    : 0;

  // Mock sparkline data
  const contractTrend = [8500, 9200, 8800, 10500, 11200, 10800, 12500, 13200, 12800, 14500, 15200, totalContract];

  if (loading) {
    return (
      <div className="min-h-screen bg-void p-8">
        <div className="max-w-[1800px] mx-auto space-y-6">
          <ZenSkeleton height="h-32" />
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <ZenSkeleton key={i} height="h-40" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Ambient gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-thesis/[0.03] rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-synthesis/[0.03] rounded-full blur-[128px]" />
      </div>

      <div className="relative max-w-[1800px] mx-auto px-8 py-12">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-5xl font-extralight tracking-tight">
                  <span className="bg-gradient-to-r from-thesis via-synthesis to-thesis bg-clip-text text-transparent">
                    프로젝트
                  </span>
                </h1>
                <ZenBadge variant="info" size="md">
                  {projects.length}개 진행
                </ZenBadge>
              </div>
              <p className="text-sm text-pneuma/60 font-light tracking-wide">
                Project Portfolio Management
              </p>
            </div>

            <Link href="/projects/new">
              <ZenButton variant="primary" icon={Plus} size="md">
                New Project
              </ZenButton>
            </Link>
          </div>

          <ZenDivider />
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="Total Projects"
              value={projects.length}
              unit="개"
              icon={Building2}
              color="thesis"
              description="등록된 전체 프로젝트 수"
            />
            <div className="px-6 pb-6">
              <ZenSparkline data={[15, 18, 17, 20, 23, 22, 25, 28, 27, 30, 32, projects.length]} color="#00D9FF" height={40} />
            </div>
          </ZenCard>

          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="In Progress"
              value={activeProjects.length}
              unit="개"
              change={12.5}
              trend="up"
              icon={TrendingUp}
              color="synthesis"
              description="현재 진행 중인 프로젝트"
            />
            <div className="px-6 pb-6">
              <ZenProgress value={activeProjects.length} max={projects.length} color="synthesis" height="md" />
            </div>
          </ZenCard>

          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="Completed"
              value={completedProjects.length}
              unit="개"
              change={8.3}
              trend="up"
              icon={CheckCircle2}
              color="synthesis"
              description="완료된 프로젝트"
            />
            <div className="px-6 pb-6 flex justify-center">
              <ZenCircularProgress
                value={(completedProjects.length / projects.length) * 100}
                size={80}
                strokeWidth={6}
                color="#10B981"
                showValue={false}
              />
            </div>
          </ZenCard>

          <ZenCard hover glow border="subtle">
            <ZenMetric
              label="Contract Value"
              value={Math.round(totalContract).toLocaleString()}
              unit="억"
              change={15.8}
              trend="up"
              icon={DollarSign}
              color="thesis"
              description="총 계약 금액"
            />
            <div className="px-6 pb-6">
              <ZenSparkline data={contractTrend} color="#8B5CF6" height={40} />
            </div>
          </ZenCard>
        </div>

        {/* Risk Notifications */}
        {showNotifications && notifications.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-thesis" />
                <h2 className="text-xl font-light text-logos tracking-wide">
                  리스크 알림
                </h2>
                <ZenBadge variant="danger" size="sm">
                  {notifications.filter(n => !n.isRead).length}
                </ZenBadge>
              </div>
              <ZenButton
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                숨기기
              </ZenButton>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <AnimatePresence>
                {notifications.slice(0, 4).map((notification, idx) => {
                  const severityConfig = {
                    CRITICAL: { color: 'danger', icon: AlertCircle, bg: 'from-danger/10 to-danger/5' },
                    DANGER: { color: 'warning', icon: AlertTriangle, bg: 'from-warning/10 to-warning/5' },
                    WARNING: { color: 'thesis', icon: AlertTriangle, bg: 'from-thesis/10 to-thesis/5' },
                    INFO: { color: 'synthesis', icon: Info, bg: 'from-synthesis/10 to-synthesis/5' },
                  };

                  const config = severityConfig[notification.severity];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <ZenCard hover border="subtle" className="relative group">
                        <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} opacity-50 rounded-2xl`} />
                        <div className="relative p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <motion.div
                                className={`w-10 h-10 rounded-xl bg-${config.color}/20 border border-${config.color}/40 flex items-center justify-center`}
                                whileHover={{ scale: 1.1 }}
                              >
                                <Icon className={`w-5 h-5 text-${config.color}`} />
                              </motion.div>
                              <div>
                                <div className="text-xs text-nous/60 mb-1">{notification.category}</div>
                                <h4 className="text-sm font-light text-logos">{notification.title}</h4>
                              </div>
                            </div>
                            <button
                              onClick={() => dismissNotification(notification.id)}
                              className="p-1 hover:bg-phenomenon/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-4 h-4 text-nous/60" />
                            </button>
                          </div>

                          {/* Message */}
                          <p className="text-xs text-pneuma/80 font-light mb-4 leading-relaxed">
                            {notification.message}
                          </p>

                          {/* Metrics */}
                          {notification.metrics && (
                            <div className="grid grid-cols-2 gap-2">
                              {notification.metrics.overallRiskScore !== undefined && (
                                <div className="px-3 py-2 rounded-lg bg-phenomenon/20 border border-essence/10">
                                  <div className="text-[10px] text-nous/60 uppercase tracking-wider mb-0.5">
                                    리스크 점수
                                  </div>
                                  <div className={`text-sm font-light text-${config.color}`}>
                                    {notification.metrics.overallRiskScore}점
                                  </div>
                                </div>
                              )}
                              {notification.metrics.scheduleDelayDays !== undefined && notification.metrics.scheduleDelayDays > 0 && (
                                <div className="px-3 py-2 rounded-lg bg-phenomenon/20 border border-essence/10">
                                  <div className="text-[10px] text-nous/60 uppercase tracking-wider mb-0.5">
                                    공기지연
                                  </div>
                                  <div className="text-sm font-light text-pneuma">
                                    {Math.round(notification.metrics.scheduleDelayDays)}일
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Required Badge */}
                          {notification.actionRequired && (
                            <div className="mt-4 pt-4 border-t border-essence/10">
                              <ZenBadge variant="danger" size="sm" pulse>
                                조치 필요
                              </ZenBadge>
                            </div>
                          )}
                        </div>
                      </ZenCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {notifications.length > 4 && (
              <div className="text-center mt-6">
                <ZenButton variant="ghost" size="sm">
                  {notifications.length - 4}개 알림 더 보기
                </ZenButton>
              </div>
            )}
          </div>
        )}

        {/* Filter & Search */}
        <ZenCard border="medium" className="mb-8">
          <div className="p-6">
            <div className="grid grid-cols-12 gap-4">
              {/* Search */}
              <div className="col-span-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nous/40" />
                  <input
                    type="text"
                    placeholder="Search projects, codes, clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="
                      w-full pl-12 pr-4 py-3
                      bg-phenomenon/30 backdrop-blur-sm
                      border border-essence/20
                      rounded-xl
                      text-sm text-logos font-light
                      placeholder:text-nous/40
                      focus:outline-none focus:border-thesis/40
                      transition-colors
                    "
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="col-span-3">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="
                    w-full px-4 py-3
                    bg-phenomenon/30 backdrop-blur-sm
                    border border-essence/20
                    rounded-xl
                    text-sm text-logos font-light
                    focus:outline-none focus:border-thesis/40
                    transition-colors
                  "
                >
                  <option value="">All Types</option>
                  {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="
                    w-full px-4 py-3
                    bg-phenomenon/30 backdrop-blur-sm
                    border border-essence/20
                    rounded-xl
                    text-sm text-logos font-light
                    focus:outline-none focus:border-thesis/40
                    transition-colors
                  "
                >
                  <option value="">All Status</option>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </ZenCard>

        {/* Projects Grid */}
        <div className="grid grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.4 }}
            >
              <Link href={`/projects/${project.id}`}>
                <ZenCard hover glow border="subtle" className="h-full group">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <motion.div
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-thesis/20 to-synthesis/20 flex items-center justify-center border border-thesis/30"
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            transition={{ duration: 0.6 }}
                          >
                            <Building2 className="w-5 h-5 text-thesis" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-nous/60 uppercase tracking-wider mb-0.5">
                              {project.projectCode}
                            </div>
                            <h3 className="text-base font-light text-logos truncate group-hover:text-thesis transition-colors">
                              {project.projectName}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <ZenBadge
                        variant={
                          project.status === 'ACTIVE' ? 'success' :
                          project.status === 'COMPLETED' ? 'info' :
                          project.status === 'PLANNED' ? 'warning' : 'default'
                        }
                        size="sm"
                      >
                        {STATUS_LABELS[project.status]}
                      </ZenBadge>
                    </div>

                    {/* Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-nous/60 font-light">Type</span>
                        <span className="text-pneuma font-light">{PROJECT_TYPE_LABELS[project.projectType]}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-nous/60 font-light">Client</span>
                        <span className="text-pneuma font-light truncate max-w-[150px]">{project.client}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-nous/60 font-light">Contract</span>
                        <span className="text-thesis font-light">{Number(project.contractPrice).toLocaleString()}억</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2 text-xs">
                        <span className="text-nous/60 font-light">Progress</span>
                        <span className="text-logos font-light">{project.progressRate.toFixed(1)}%</span>
                      </div>
                      <ZenProgress value={project.progressRate} max={100} color="thesis" height="md" />
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-essence/10 flex items-center justify-between">
                      <div className="text-[10px] text-nous/60">
                        {project.creator?.fullName || '—'}
                      </div>
                      <div className="text-thesis/40 group-hover:text-thesis/80 transition-colors">
                        →
                      </div>
                    </div>
                  </div>
                </ZenCard>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Building2 className="w-16 h-16 text-nous/20 mx-auto mb-4" />
            <h3 className="text-lg text-pneuma/60 font-light mb-2">No projects found</h3>
            <p className="text-sm text-nous/40 font-light mb-6">
              {searchTerm || typeFilter || statusFilter
                ? 'Try adjusting your filters'
                : 'Create your first project to get started'}
            </p>
            {!searchTerm && !typeFilter && !statusFilter && (
              <Link href="/projects/new">
                <ZenButton variant="primary" icon={Plus}>
                  Create Project
                </ZenButton>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
