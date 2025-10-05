import { AgentBase } from './AgentBase';
import { AgentType, TaskStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class CoordinatorAgent extends AgentBase {
  constructor() {
    super({
      name: 'Coordinator',
      type: AgentType.COORDINATOR,
      interval: 60000, // 1분마다 (가장 빈번)
      enabled: true,
    });
  }

  protected async run(): Promise<any> {
    // 1. 대기 중인 작업들 확인
    const pendingTasks = await this.getAllPendingTasks();

    // 2. 우선순위 재조정
    const prioritized = this.prioritizeTasks(pendingTasks);

    // 3. 작업 분배
    const distributions = await this.distributeTasks(prioritized);

    // 4. 에이전트 상태 확인
    const agentStatuses = await this.checkAgentStatuses();

    // 5. 이슈 발생 시 대응
    const criticalIssues = await this.handleCriticalIssues();

    return {
      timestamp: new Date().toISOString(),
      tasksProcessed: distributions.length,
      agentStatuses,
      criticalIssues,
      summary: {
        highPriority: prioritized.filter(t => t.priority <= 2).length,
        mediumPriority: prioritized.filter(t => t.priority >= 3 && t.priority <= 5).length,
        lowPriority: prioritized.filter(t => t.priority > 5).length,
      },
    };
  }

  private async getAllPendingTasks() {
    return await prisma.agentTask.findMany({
      where: {
        status: TaskStatus.PENDING,
        agentName: { not: this.name }, // 자신의 작업은 제외
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  private prioritizeTasks(tasks: any[]) {
    // 작업 유형별 우선순위 재조정
    return tasks.map(task => {
      let adjustedPriority = task.priority;

      // 긴급 알림은 우선순위 상향
      if (task.taskType.includes('ALERT') || task.taskType.includes('WARNING')) {
        adjustedPriority = Math.max(1, task.priority - 2);
      }

      // 오래된 작업은 우선순위 상향
      const hoursOld = (Date.now() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursOld > 24) {
        adjustedPriority = Math.max(1, adjustedPriority - 1);
      }

      return { ...task, adjustedPriority };
    }).sort((a, b) => a.adjustedPriority - b.adjustedPriority);
  }

  private async distributeTasks(tasks: any[]) {
    const distributions = [];

    for (const task of tasks.slice(0, 10)) { // 한 번에 최대 10개 처리
      // 작업 우선순위 업데이트
      await prisma.agentTask.update({
        where: { id: task.id },
        data: { priority: task.adjustedPriority },
      });

      distributions.push({
        taskId: task.id,
        agentName: task.agentName,
        taskType: task.taskType,
        priority: task.adjustedPriority,
      });
    }

    return distributions;
  }

  private async checkAgentStatuses() {
    const recentLogs = await prisma.agentLog.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 3600000), // 최근 1시간
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    const agentGroups = this.groupByAgent(recentLogs);
    const statuses: Record<string, any> = {};

    for (const [agentName, logs] of Object.entries(agentGroups)) {
      const failCount = logs.filter(l => l.status === 'FAILED').length;
      const successCount = logs.filter(l => l.status === 'SUCCESS').length;
      const successRate = (successCount / logs.length) * 100;

      statuses[agentName] = {
        totalRuns: logs.length,
        successRate: successRate.toFixed(1),
        lastRun: logs[0]?.timestamp,
        status: successRate > 80 ? 'healthy' : successRate > 50 ? 'warning' : 'critical',
      };
    }

    return statuses;
  }

  private async handleCriticalIssues() {
    const criticalTasks = await prisma.agentTask.findMany({
      where: {
        priority: 1,
        status: TaskStatus.PENDING,
        createdAt: {
          lte: new Date(Date.now() - 1800000), // 30분 이상 대기
        },
      },
    });

    const issues = [];
    for (const task of criticalTasks) {
      issues.push({
        taskId: task.id,
        agentName: task.agentName,
        taskType: task.taskType,
        waitingTime: Math.round((Date.now() - new Date(task.createdAt).getTime()) / 60000),
        action: 'escalated',
      });

      // 보고서 생성 에이전트에게 알림
      await this.sendMessageToAgent(
        'ReportGenerator',
        'CRITICAL_ISSUE',
        {
          task,
          waitingTime: Math.round((Date.now() - new Date(task.createdAt).getTime()) / 60000),
        },
        1
      );
    }

    return issues;
  }

  private groupByAgent(logs: any[]): Record<string, any[]> {
    return logs.reduce((acc, log) => {
      if (!acc[log.agentName]) acc[log.agentName] = [];
      acc[log.agentName].push(log);
      return acc;
    }, {} as Record<string, any[]>);
  }
}
