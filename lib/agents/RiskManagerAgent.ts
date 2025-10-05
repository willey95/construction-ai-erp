import { AgentBase } from './AgentBase';
import { AgentType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class RiskManagerAgent extends AgentBase {
  constructor() {
    super({
      name: 'RiskManager',
      type: AgentType.RISK_MANAGER,
      interval: 1800000, // 30분마다
      enabled: true,
    });
  }

  protected async run(): Promise<any> {
    console.log(`[${this.name}] Analyzing project risks...`);

    const projects = await prisma.project.findMany({
      where: { status: 'ACTIVE' },
      include: { progress: { orderBy: { month: 'desc' }, take: 3 } },
    });

    const riskAssessments = [];

    for (const project of projects) {
      const riskScore = await this.calculateRiskScore(project);

      if (riskScore.score > 70) {
        // 고위험 프로젝트
        await this.sendMessageToAgent(
          'Coordinator',
          'HIGH_RISK_ALERT',
          {
            projectId: project.id,
            projectName: project.projectName,
            riskScore: riskScore.score,
            reasons: riskScore.reasons,
          },
          1
        );
      }

      riskAssessments.push({
        projectId: project.id,
        projectName: project.projectName,
        riskScore: riskScore.score,
        level: this.getRiskLevel(riskScore.score),
        factors: riskScore.reasons,
      });
    }

    return {
      timestamp: new Date().toISOString(),
      totalProjects: projects.length,
      highRisk: riskAssessments.filter(r => r.riskScore > 70).length,
      mediumRisk: riskAssessments.filter(r => r.riskScore >= 40 && r.riskScore <= 70).length,
      lowRisk: riskAssessments.filter(r => r.riskScore < 40).length,
      assessments: riskAssessments,
    };
  }

  private async calculateRiskScore(project: any) {
    let score = 0;
    const reasons = [];

    // 1. 진척률 지연 (30점)
    const progressRate = parseFloat(project.progressRate.toString());
    const monthsPassed = this.getMonthsPassed(project.startDate);
    const expectedProgress = (monthsPassed / project.constructionPeriod) * 100;
    const delayRate = expectedProgress - progressRate;

    if (delayRate > 10) {
      score += 30;
      reasons.push(`공정 지연 ${delayRate.toFixed(1)}%`);
    } else if (delayRate > 5) {
      score += 15;
      reasons.push(`공정 소폭 지연 ${delayRate.toFixed(1)}%`);
    }

    // 2. 계약금액 규모 (20점)
    const contractPrice = parseFloat(project.contractPrice.toString());
    if (contractPrice > 10000000000) {
      score += 20;
      reasons.push('대규모 프로젝트 (100억 이상)');
    }

    // 3. 공기 장기화 (15점)
    if (project.constructionPeriod > 24) {
      score += 15;
      reasons.push('장기 프로젝트 (24개월 이상)');
    }

    // 4. 프로젝트 타입별 위험도 (15점)
    if (project.projectType === 'INFRA') {
      score += 15;
      reasons.push('인프라 프로젝트 (고위험)');
    }

    // 5. 랜덤 요소 (외부 환경 등) (20점)
    const externalRisk = Math.random() * 20;
    if (externalRisk > 15) {
      score += externalRisk;
      reasons.push('외부 환경 요인');
    }

    return {
      score: Math.min(Math.round(score), 100),
      reasons,
    };
  }

  private getRiskLevel(score: number): string {
    if (score >= 70) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  }

  private getMonthsPassed(startDate: Date): number {
    const now = new Date();
    const start = new Date(startDate);
    const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    return Math.max(months, 1);
  }
}
