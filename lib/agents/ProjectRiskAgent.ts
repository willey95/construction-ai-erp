/**
 * ProjectRiskAgent - 프로젝트별 종합 리스크 모니터링
 *
 * 담당 업무:
 * - 안전사고 발생률 분석
 * - 자금수지 악화 감지
 * - 미수금 비율 분석
 * - 분양률 모니터링
 * - 공기지연 리스크 평가
 * - PF대출 책임준공 비율 검사
 * - 할인분양 비율 추적
 */

import { PrismaClient } from '@prisma/client';
import { AgentBase } from './AgentBase';

interface AgentExecutionContext {
  projectId?: string;
  [key: string]: any;
}

const prisma = new PrismaClient();

interface RiskMetrics {
  // 안전사고
  safetyIncidentRate: number; // 100일당 사고 건수
  safetyRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  // 자금수지
  cashFlowHealthScore: number; // 0-100
  cumulativeCashFlowRatio: number; // 누적현금흐름 / 계약금액

  // 미수금
  receivableRatio: number; // 미수금 / 기성금
  overdueReceivableRatio: number; // 연체미수 / 전체미수

  // 분양
  salesRate: number; // 분양률 %
  discountSalesRatio: number; // 할인분양 / 전체분양

  // 공기
  scheduleDelayDays: number;
  scheduleDelayRatio: number; // 지연일수 / 전체공기

  // PF대출
  pfLoanRatio: number; // PF대출 / 총사업비
  pfReserveRatio: number; // 책임준공 예치금 / 요구액

  // 종합
  overallRiskScore: number; // 0-100 (높을수록 위험)
  criticalRisks: string[];
}

interface RiskNotification {
  projectId: string;
  severity: 'INFO' | 'WARNING' | 'DANGER' | 'CRITICAL';
  category: string;
  title: string;
  message: string;
  metrics: Record<string, any>;
  actionRequired: boolean;
}

export class ProjectRiskAgent extends AgentBase {
  constructor() {
    super({ name: 'ProjectRiskAgent', type: 'PROJECT_RISK_MONITOR' as any });
  }

  protected async run(): Promise<any> {
    // 전체 프로젝트 리스크 스캔
    return await this.scanAllProjects();
  }

  async execute(context: AgentExecutionContext): Promise<any> {
    const { projectId } = context.params || {};

    if (projectId) {
      // 특정 프로젝트 리스크 분석
      return await this.analyzeProjectRisk(projectId);
    } else {
      // 전체 프로젝트 리스크 스캔
      return await this.run();
    }
  }

  /**
   * 전체 프로젝트 리스크 스캔
   */
  private async scanAllProjects(): Promise<any> {
    const projects = await prisma.project.findMany({
      where: {
        status: { in: ['ACTIVE', 'PLANNED'] },
      },
      include: {
        cashFlows: true,
        progress: true,
      },
    });

    const results = [];
    for (const project of projects) {
      const analysis = await this.analyzeProjectRisk(project.id);
      results.push(analysis);

      // 위험도가 높은 경우 알림 생성
      if (analysis.overallRiskScore >= 70 || analysis.criticalRisks.length > 0) {
        await this.createRiskNotification(project.id, analysis);
      }
    }

    return {
      totalProjects: projects.length,
      highRiskProjects: results.filter(r => r.overallRiskScore >= 70).length,
      criticalProjects: results.filter(r => r.criticalRisks.length > 0).length,
      results,
    };
  }

  /**
   * 프로젝트 리스크 분석
   */
  private async analyzeProjectRisk(projectId: string): Promise<RiskMetrics> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        cashFlows: { orderBy: { month: 'asc' } },
        progress: { orderBy: { month: 'asc' } },
      },
    });

    if (!project) {
      throw new Error(`프로젝트를 찾을 수 없습니다: ${projectId}`);
    }

    // 각 리스크 영역별 분석
    const safetyMetrics = await this.analyzeSafetyRisk(project);
    const cashFlowMetrics = this.analyzeCashFlowRisk(project);
    const receivableMetrics = await this.analyzeReceivableRisk(projectId);
    const salesMetrics = await this.analyzeSalesRisk(projectId);
    const scheduleMetrics = this.analyzeScheduleRisk(project);
    const pfMetrics = await this.analyzePFRisk(projectId);

    // 종합 리스크 점수 계산
    const overallRiskScore = this.calculateOverallRisk({
      safetyMetrics,
      cashFlowMetrics,
      receivableMetrics,
      salesMetrics,
      scheduleMetrics,
      pfMetrics,
    });

    // 임계 리스크 식별
    const criticalRisks = this.identifyCriticalRisks({
      safetyMetrics,
      cashFlowMetrics,
      receivableMetrics,
      salesMetrics,
      scheduleMetrics,
      pfMetrics,
    });

    return {
      ...safetyMetrics,
      ...cashFlowMetrics,
      ...receivableMetrics,
      ...salesMetrics,
      ...scheduleMetrics,
      ...pfMetrics,
      overallRiskScore,
      criticalRisks,
    };
  }

  /**
   * 안전사고 리스크 분석
   */
  private async analyzeSafetyRisk(project: any): Promise<any> {
    // TODO: 안전사고 데이터 테이블에서 조회
    // 현재는 mock 데이터로 계산
    const workingDays = this.calculateWorkingDays(project.startDate, new Date());
    const incidentCount = 0; // await prisma.safetyIncident.count({ where: { projectId } });

    const safetyIncidentRate = workingDays > 0 ? (incidentCount / workingDays) * 100 : 0;

    let safetyRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (safetyIncidentRate >= 1.0) safetyRiskLevel = 'CRITICAL';
    else if (safetyIncidentRate >= 0.5) safetyRiskLevel = 'HIGH';
    else if (safetyIncidentRate >= 0.2) safetyRiskLevel = 'MEDIUM';

    return { safetyIncidentRate, safetyRiskLevel };
  }

  /**
   * 자금수지 리스크 분석
   */
  private analyzeCashFlowRisk(project: any): any {
    const cashFlows = project.cashFlows || [];

    if (cashFlows.length === 0) {
      return {
        cashFlowHealthScore: 50,
        cumulativeCashFlowRatio: 0,
      };
    }

    // 최근 누적 현금흐름
    const latestCashFlow = cashFlows[cashFlows.length - 1];
    const cumulativeCashFlow = Number(latestCashFlow?.cumulativeCashFlow || 0);
    const contractPrice = Number(project.contractPrice || 1);

    const cumulativeCashFlowRatio = (cumulativeCashFlow / contractPrice) * 100;

    // 건강도 점수: 누적 현금흐름이 양수면 좋음
    let cashFlowHealthScore = 50;
    if (cumulativeCashFlow > 0) {
      cashFlowHealthScore = Math.min(100, 50 + (cumulativeCashFlowRatio * 2));
    } else {
      cashFlowHealthScore = Math.max(0, 50 + (cumulativeCashFlowRatio * 2));
    }

    return {
      cashFlowHealthScore,
      cumulativeCashFlowRatio,
    };
  }

  /**
   * 미수금 리스크 분석
   */
  private async analyzeReceivableRisk(projectId: string): Promise<any> {
    // TODO: 미수금 데이터 조회
    // 현재는 mock 데이터
    return {
      receivableRatio: 0,
      overdueReceivableRatio: 0,
    };
  }

  /**
   * 분양 리스크 분석
   */
  private async analyzeSalesRisk(projectId: string): Promise<any> {
    // TODO: 분양 데이터 조회
    // 부동산 프로젝트인 경우만 해당
    return {
      salesRate: 0,
      discountSalesRatio: 0,
    };
  }

  /**
   * 공기지연 리스크 분석
   */
  private analyzeScheduleRisk(project: any): any {
    const now = new Date();
    const endDate = new Date(project.endDate);
    const startDate = new Date(project.startDate);

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const currentProgressRate = Number(project.progressRate || 0);
    const expectedProgressRate = (elapsedDays / totalDays) * 100;

    // 진척률 차이로 지연 계산
    const progressDelay = expectedProgressRate - currentProgressRate;
    const scheduleDelayDays = (progressDelay / 100) * totalDays;
    const scheduleDelayRatio = scheduleDelayDays / totalDays;

    return {
      scheduleDelayDays: Math.max(0, scheduleDelayDays),
      scheduleDelayRatio: Math.max(0, scheduleDelayRatio),
    };
  }

  /**
   * PF대출 리스크 분석
   */
  private async analyzePFRisk(projectId: string): Promise<any> {
    // TODO: PF대출 데이터 조회
    return {
      pfLoanRatio: 0,
      pfReserveRatio: 100, // 책임준공 예치금 비율
    };
  }

  /**
   * 종합 리스크 점수 계산 (0-100, 높을수록 위험)
   */
  private calculateOverallRisk(metrics: any): number {
    let riskScore = 0;

    // 안전사고 (20점)
    const safetyScore = metrics.safetyMetrics.safetyRiskLevel === 'CRITICAL' ? 20 :
                       metrics.safetyMetrics.safetyRiskLevel === 'HIGH' ? 15 :
                       metrics.safetyMetrics.safetyRiskLevel === 'MEDIUM' ? 10 : 5;
    riskScore += safetyScore;

    // 자금수지 (25점)
    const cashFlowScore = 25 - (metrics.cashFlowMetrics.cashFlowHealthScore * 0.25);
    riskScore += Math.max(0, cashFlowScore);

    // 미수금 (15점)
    const receivableScore = metrics.receivableMetrics.receivableRatio * 0.15;
    riskScore += Math.min(15, receivableScore);

    // 분양 (15점) - 분양률이 낮을수록 위험
    const salesScore = metrics.salesMetrics.salesRate > 0
      ? (100 - metrics.salesMetrics.salesRate) * 0.15
      : 0;
    riskScore += salesScore;

    // 공기지연 (15점)
    const scheduleScore = Math.min(15, metrics.scheduleMetrics.scheduleDelayRatio * 100);
    riskScore += scheduleScore;

    // PF대출 (10점)
    const pfScore = metrics.pfMetrics.pfReserveRatio < 100
      ? (100 - metrics.pfMetrics.pfReserveRatio) * 0.1
      : 0;
    riskScore += pfScore;

    return Math.min(100, Math.round(riskScore));
  }

  /**
   * 임계 리스크 식별
   */
  private identifyCriticalRisks(metrics: any): string[] {
    const risks: string[] = [];

    // 안전사고
    if (metrics.safetyMetrics.safetyRiskLevel === 'CRITICAL' ||
        metrics.safetyMetrics.safetyRiskLevel === 'HIGH') {
      risks.push('안전사고 발생률 위험');
    }

    // 자금수지
    if (metrics.cashFlowMetrics.cashFlowHealthScore < 30) {
      risks.push('자금수지 악화');
    }
    if (metrics.cashFlowMetrics.cumulativeCashFlowRatio < -10) {
      risks.push('누적 현금흐름 적자');
    }

    // 미수금
    if (metrics.receivableMetrics.receivableRatio > 20) {
      risks.push('미수금 비율 과다');
    }
    if (metrics.receivableMetrics.overdueReceivableRatio > 30) {
      risks.push('연체미수 비율 높음');
    }

    // 분양
    if (metrics.salesMetrics.salesRate > 0 && metrics.salesMetrics.salesRate < 60) {
      risks.push('분양률 저조');
    }
    if (metrics.salesMetrics.discountSalesRatio > 30) {
      risks.push('할인분양 비율 과다');
    }

    // 공기지연
    if (metrics.scheduleMetrics.scheduleDelayDays > 30) {
      risks.push('공기지연 30일 초과');
    }

    // PF대출
    if (metrics.pfMetrics.pfReserveRatio < 80) {
      risks.push('PF 책임준공 예치금 부족');
    }

    return risks;
  }

  /**
   * 리스크 알림 생성
   */
  private async createRiskNotification(
    projectId: string,
    metrics: RiskMetrics
  ): Promise<void> {
    const severity = (metrics.overallRiskScore >= 85 ? 'CRITICAL' :
                    metrics.overallRiskScore >= 70 ? 'DANGER' :
                    metrics.overallRiskScore >= 50 ? 'WARNING' : 'INFO') as 'CRITICAL' | 'DANGER' | 'WARNING' | 'INFO';

    const notification = {
      projectId,
      severity: severity as any,
      category: '종합 리스크',
      title: `프로젝트 리스크 점수: ${metrics.overallRiskScore}점`,
      message: metrics.criticalRisks.length > 0
        ? `임계 리스크: ${metrics.criticalRisks.join(', ')}`
        : '프로젝트 리스크가 감지되었습니다.',
      metrics: {
        overallRiskScore: metrics.overallRiskScore,
        criticalRisks: metrics.criticalRisks,
        safetyRiskLevel: metrics.safetyRiskLevel,
        cashFlowHealthScore: metrics.cashFlowHealthScore,
        scheduleDelayDays: metrics.scheduleDelayDays,
      },
      actionRequired: severity === 'CRITICAL' || severity === 'DANGER',
      agentName: 'ProjectRiskAgent',
    };

    // 알림 데이터베이스에 저장
    try {
      await prisma.notification.create({ data: notification });
      console.log('🚨 리스크 알림 생성:', notification);
    } catch (error) {
      console.error('알림 생성 실패:', error);
    }
  }

  /**
   * 작업일수 계산
   */
  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // 간단하게 주 5일 근무로 계산 (주말 제외)
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    return (weeks * 5) + Math.min(remainingDays, 5);
  }
}
