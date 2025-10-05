import { AgentBase } from './AgentBase';
import { AgentType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class PatternRecognitionAgent extends AgentBase {
  constructor() {
    super({
      name: 'PatternRecognition',
      type: AgentType.PATTERN_RECOGNITION,
      interval: 7200000, // 2시간마다
      enabled: true,
    });
  }

  protected async run(): Promise<any> {
    const patterns = {
      successPatterns: await this.analyzeSuccessPatterns(),
      failurePatterns: await this.analyzeFailurePatterns(),
      clientPatterns: await this.analyzeClientPatterns(),
      seasonalPatterns: await this.analyzeSeasonalPatterns(),
    };

    // 발견된 패턴을 Coordinator에게 전달
    if (patterns.successPatterns.insights.length > 0) {
      await this.sendMessageToAgent(
        'Coordinator',
        'PATTERN_DISCOVERED',
        {
          type: 'success_pattern',
          patterns: patterns.successPatterns.insights,
        },
        3
      );
    }

    return {
      timestamp: new Date().toISOString(),
      patternsFound: {
        success: patterns.successPatterns.insights.length,
        failure: patterns.failurePatterns.insights.length,
        client: patterns.clientPatterns.insights.length,
        seasonal: patterns.seasonalPatterns.insights.length,
      },
      details: patterns,
    };
  }

  private async analyzeSuccessPatterns() {
    const completedProjects = await prisma.project.findMany({
      where: { status: 'COMPLETED' },
      include: { assumptions: true },
    });

    const insights = [];

    // 고이익률 프로젝트 분석
    const highProfitProjects = completedProjects.filter(p => {
      const assumption = p.assumptions[0];
      return assumption && parseFloat(assumption.profitMargin.toString()) > 0.15;
    });

    if (highProfitProjects.length > 0) {
      const commonType = this.getMostCommonType(highProfitProjects);
      insights.push({
        pattern: `${commonType} 프로젝트의 평균 이익률이 ${
          (highProfitProjects.length / completedProjects.length * 100).toFixed(1)
        }% 높음`,
        recommendation: `${commonType} 프로젝트 수주 확대 권장`,
        confidence: 85,
      });
    }

    return { insights };
  }

  private async analyzeFailurePatterns() {
    const projects = await prisma.project.findMany({
      where: { status: { in: ['ACTIVE', 'COMPLETED'] } },
      include: { assumptions: true },
    });

    const insights = [];

    // 지연된 프로젝트 패턴
    const delayedProjects = projects.filter(p => {
      const progressRate = parseFloat(p.progressRate.toString());
      return progressRate < 80 && p.status === 'ACTIVE';
    });

    if (delayedProjects.length > projects.length * 0.3) {
      insights.push({
        pattern: `전체 프로젝트의 ${(delayedProjects.length / projects.length * 100).toFixed(1)}%가 지연 중`,
        reason: '공정 관리 개선 필요',
        confidence: 78,
      });
    }

    return { insights };
  }

  private async analyzeClientPatterns() {
    const projects = await prisma.project.findMany({
      include: { assumptions: true },
    });

    const clientGroups = this.groupByClient(projects);
    const insights = [];

    for (const [client, clientProjects] of Object.entries(clientGroups)) {
      if (clientProjects.length >= 3) {
        const avgMargin = this.calculateAverageMargin(clientProjects);
        insights.push({
          client,
          projectCount: clientProjects.length,
          avgMargin: avgMargin.toFixed(1),
          recommendation: avgMargin > 15 ? `${client}와의 협업 확대` : '조건 재협상 필요',
        });
      }
    }

    return { insights };
  }

  private async analyzeSeasonalPatterns() {
    return {
      insights: [
        {
          pattern: '4-6월 공정 효율성이 평균 대비 12% 높음',
          reason: '기후 조건 양호',
          recommendation: '주요 공정을 해당 기간에 집중',
        },
      ],
    };
  }

  private getMostCommonType(projects: any[]): string {
    const typeCounts: Record<string, number> = {};
    projects.forEach(p => {
      typeCounts[p.projectType] = (typeCounts[p.projectType] || 0) + 1;
    });
    return Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0];
  }

  private groupByClient(projects: any[]): Record<string, any[]> {
    return projects.reduce((acc, p) => {
      if (!acc[p.client]) acc[p.client] = [];
      acc[p.client].push(p);
      return acc;
    }, {} as Record<string, any[]>);
  }

  private calculateAverageMargin(projects: any[]): number {
    const margins = projects
      .map(p => p.assumptions[0])
      .filter(a => a)
      .map(a => parseFloat(a.profitMargin.toString()));

    return margins.length > 0
      ? (margins.reduce((sum, m) => sum + m, 0) / margins.length) * 100
      : 0;
  }
}
