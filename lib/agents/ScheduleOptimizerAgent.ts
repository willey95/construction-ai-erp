import { AgentBase } from './AgentBase';
import { AgentType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class ScheduleOptimizerAgent extends AgentBase {
  constructor() {
    super({
      name: 'ScheduleOptimizer',
      type: AgentType.SCHEDULE_OPTIMIZER,
      interval: 86400000, // 24시간마다
      enabled: true,
    });
  }

  protected async run(): Promise<any> {
    const projects = await prisma.project.findMany({
      where: { status: 'ACTIVE' },
    });

    const optimizations = [];

    for (const project of projects) {
      const analysis = this.analyzeSchedule(project);

      if (analysis.needsOptimization) {
        optimizations.push({
          projectId: project.id,
          projectName: project.projectName,
          currentProgress: analysis.currentProgress,
          targetProgress: analysis.targetProgress,
          recommendation: analysis.recommendation,
          potentialSaving: analysis.potentialSaving,
        });

        // 지연 프로젝트는 PM에게 알림
        if (analysis.isDelayed) {
          await this.sendMessageToAgent(
            'Coordinator',
            'SCHEDULE_ALERT',
            {
              projectId: project.id,
              projectName: project.projectName,
              delayDays: analysis.delayDays,
              suggestion: analysis.recommendation,
            },
            2
          );
        }
      }
    }

    return {
      timestamp: new Date().toISOString(),
      projectsAnalyzed: projects.length,
      optimizationsFound: optimizations.length,
      details: optimizations,
    };
  }

  private analyzeSchedule(project: any) {
    const progressRate = parseFloat(project.progressRate.toString());
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const now = new Date();

    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const expectedProgress = (daysPassed / totalDays) * 100;

    const isDelayed = progressRate < expectedProgress - 5;
    const delayDays = Math.round((expectedProgress - progressRate) / 100 * totalDays);

    return {
      currentProgress: progressRate,
      targetProgress: expectedProgress,
      isDelayed,
      delayDays,
      needsOptimization: isDelayed,
      recommendation: isDelayed
        ? `인력 ${Math.ceil(delayDays / 30)}명 추가 투입 권장`
        : '현재 공정 유지',
      potentialSaving: isDelayed ? delayDays * 1000000 : 0, // 일당 100만원 절감 가정
    };
  }
}
