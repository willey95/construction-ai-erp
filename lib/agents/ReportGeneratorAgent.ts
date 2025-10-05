import { AgentBase } from './AgentBase';
import { AgentType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class ReportGeneratorAgent extends AgentBase {
  constructor() {
    super({
      name: 'ReportGenerator',
      type: AgentType.REPORT_GENERATOR,
      interval: 3600000, // 1시간마다
      enabled: true,
    });
  }

  protected async run(): Promise<any> {
    const reports = {
      hourly: await this.generateHourlyReport(),
      daily: await this.shouldGenerateDailyReport() ? await this.generateDailyReport() : null,
      weekly: await this.shouldGenerateWeeklyReport() ? await this.generateWeeklyReport() : null,
    };

    return {
      timestamp: new Date().toISOString(),
      reportsGenerated: Object.values(reports).filter(r => r !== null).length,
      details: reports,
    };
  }

  private async generateHourlyReport() {
    const recentLogs = await prisma.agentLog.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 3600000),
        },
      },
    });

    const tasks = await prisma.agentTask.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 3600000),
        },
      },
    });

    return {
      type: 'hourly',
      period: '최근 1시간',
      agentActivities: recentLogs.length,
      tasksCreated: tasks.length,
      tasksCompleted: tasks.filter(t => t.status === 'COMPLETED').length,
      tasksFailed: tasks.filter(t => t.status === 'FAILED').length,
      summary: `${recentLogs.length}건의 에이전트 활동, ${tasks.length}건의 작업 생성`,
    };
  }

  private async generateDailyReport() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const logs = await prisma.agentLog.findMany({
      where: {
        timestamp: { gte: startOfDay },
      },
    });

    const projects = await prisma.project.findMany({
      where: { status: 'ACTIVE' },
    });

    const insights = this.analyzeDailyInsights(logs);

    return {
      type: 'daily',
      date: startOfDay.toISOString(),
      totalAgentRuns: logs.length,
      successRate: ((logs.filter(l => l.status === 'SUCCESS').length / logs.length) * 100).toFixed(1),
      activeProjects: projects.length,
      keyInsights: insights,
      summary: `일일 에이전트 성공률: ${((logs.filter(l => l.status === 'SUCCESS').length / logs.length) * 100).toFixed(1)}%`,
    };
  }

  private async generateWeeklyReport() {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const logs = await prisma.agentLog.findMany({
      where: {
        timestamp: { gte: startOfWeek },
      },
    });

    const agentPerformance = this.calculateAgentPerformance(logs);

    return {
      type: 'weekly',
      weekStart: startOfWeek.toISOString(),
      totalOperations: logs.length,
      agentPerformance,
      topPerformer: Object.entries(agentPerformance)
        .sort((a, b) => parseFloat(b[1].successRate) - parseFloat(a[1].successRate))[0]?.[0],
      summary: '주간 에이전트 성능 리포트',
    };
  }

  private shouldGenerateDailyReport(): boolean {
    const now = new Date();
    return now.getHours() === 0; // 매일 자정
  }

  private shouldGenerateWeeklyReport(): boolean {
    const now = new Date();
    return now.getDay() === 1 && now.getHours() === 0; // 매주 월요일 자정
  }

  private analyzeDailyInsights(logs: any[]) {
    const insights = [];

    const failedLogs = logs.filter(l => l.status === 'FAILED');
    if (failedLogs.length > logs.length * 0.1) {
      insights.push({
        type: 'alert',
        message: `에이전트 실패율이 ${((failedLogs.length / logs.length) * 100).toFixed(1)}%로 높음`,
        action: '에이전트 상태 점검 필요',
      });
    }

    const agentCounts = logs.reduce((acc, log) => {
      acc[log.agentName] = (acc[log.agentName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostActive = Object.entries(agentCounts).sort((a, b) => b[1] - a[1])[0];
    if (mostActive) {
      insights.push({
        type: 'info',
        message: `${mostActive[0]} 에이전트가 ${mostActive[1]}회로 가장 활발히 활동`,
      });
    }

    return insights;
  }

  private calculateAgentPerformance(logs: any[]) {
    const agentGroups = logs.reduce((acc, log) => {
      if (!acc[log.agentName]) acc[log.agentName] = [];
      acc[log.agentName].push(log);
      return acc;
    }, {} as Record<string, any[]>);

    const performance: Record<string, any> = {};

    for (const [agentName, agentLogs] of Object.entries(agentGroups)) {
      const successCount = agentLogs.filter(l => l.status === 'SUCCESS').length;
      const totalRuns = agentLogs.length;
      const avgDuration = agentLogs
        .filter(l => l.duration)
        .reduce((sum, l) => sum + l.duration, 0) / agentLogs.length;

      performance[agentName] = {
        runs: totalRuns,
        successRate: ((successCount / totalRuns) * 100).toFixed(1),
        avgDuration: Math.round(avgDuration),
        errorCount: totalRuns - successCount,
      };
    }

    return performance;
  }
}
