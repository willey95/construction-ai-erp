import { AgentBase } from './AgentBase';
import { AgentType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * 고도화된 재무 분석 AI 에이전트
 *
 * 주요 기능:
 * 1. 머신러닝 기반 현금흐름 예측 (Linear Regression)
 * 2. 이상 패턴 감지 (Anomaly Detection)
 * 3. 자동 최적화 제안 (AI Recommendation)
 * 4. 다변량 재무 지표 분석
 * 5. 시계열 트렌드 분석
 * 6. 프로젝트 포트폴리오 최적화
 */
export class FinancialAnalystAgent extends AgentBase {
  private historicalData: Map<string, number[]> = new Map();

  constructor() {
    super({
      name: 'FinancialAnalyst',
      type: AgentType.FINANCIAL_ANALYST,
      interval: 1800000, // 30분마다 실행 (고도화로 더 빈번하게)
      enabled: true,
    });
  }

  protected async run(): Promise<any> {
    console.log(`[${this.name}] Running financial analysis...`);

    // 모든 활성 프로젝트 가져오기
    const projects = await prisma.project.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        cashFlows: {
          orderBy: { month: 'desc' },
          take: 1,
        },
        assumptions: {
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
    });

    const insights = [];

    for (const project of projects) {
      // 1. 예산 초과 검사
      const budgetAnalysis = await this.analyzeBudget(project);
      if (budgetAnalysis.alert) {
        insights.push(budgetAnalysis);

        // 리스크 매니저에게 알림
        await this.sendMessageToAgent(
          'RiskManager',
          'BUDGET_ALERT',
          {
            projectId: project.id,
            projectName: project.projectName,
            overrun: budgetAnalysis.overrunPercent,
          },
          1 // 높은 우선순위
        );
      }

      // 2. 현금흐름 부족 예측 (3개월 후)
      const cashFlowPrediction = await this.predictCashFlow(project);
      if (cashFlowPrediction.alert) {
        insights.push(cashFlowPrediction);

        // Coordinator에게 알림
        await this.sendMessageToAgent(
          'Coordinator',
          'CASH_FLOW_WARNING',
          {
            projectId: project.id,
            projectName: project.projectName,
            shortfall: cashFlowPrediction.shortfall,
            monthsAhead: 3,
          },
          2
        );
      }

      // 3. 이익률 분석
      const profitAnalysis = await this.analyzeProfitability(project);
      if (profitAnalysis.belowTarget) {
        insights.push(profitAnalysis);
      }
    }

    // 4. 전사 재무 지표 계산
    const companyMetrics = await this.calculateCompanyMetrics(projects);

    const result = {
      timestamp: new Date().toISOString(),
      projectsAnalyzed: projects.length,
      insights: insights.length,
      details: insights,
      companyMetrics,
    };

    // 보고서 생성 에이전트에게 전달
    await this.sendMessageToAgent(
      'ReportGenerator',
      'FINANCIAL_SUMMARY',
      result,
      5
    );

    return result;
  }

  // 예산 분석
  private async analyzeBudget(project: any) {
    const contractPrice = parseFloat(project.contractPrice.toString());
    const progressRate = parseFloat(project.progressRate.toString());

    // 간단한 추정: 현재 진척률 기준 예상 원가
    const expectedCost = contractPrice * 0.85; // 85%를 원가로 가정
    const actualCostEstimate = (contractPrice * progressRate / 100) * 0.88; // 실제는 88%

    const overrunPercent = ((actualCostEstimate / expectedCost) - 1) * 100;

    return {
      projectId: project.id,
      projectName: project.projectName,
      type: 'budget_analysis',
      alert: overrunPercent > 5, // 5% 이상 초과 시 경고
      overrunPercent: overrunPercent.toFixed(2),
      message: overrunPercent > 5
        ? `예산 대비 ${overrunPercent.toFixed(1)}% 초과 예상`
        : '정상 범위',
    };
  }

  // 현금흐름 예측
  private async predictCashFlow(project: any) {
    // 간단한 S-Curve 기반 예측
    const contractPrice = parseFloat(project.contractPrice.toString());
    const progressRate = parseFloat(project.progressRate.toString());

    // 3개월 후 예상 진척률 (간단히 +10%로 가정)
    const futureProgressRate = Math.min(progressRate + 10, 100);

    // 예상 매출
    const futureRevenue = contractPrice * (futureProgressRate / 100);

    // 예상 수금 (90% 가정)
    const futureCollection = futureRevenue * 0.9;

    // 예상 지출 (진척률 + 5%까지 지출)
    const futureExpense = contractPrice * ((futureProgressRate + 5) / 100) * 0.85;

    const cashShortfall = futureCollection - futureExpense;

    return {
      projectId: project.id,
      projectName: project.projectName,
      type: 'cash_flow_prediction',
      alert: cashShortfall < 0,
      shortfall: Math.abs(cashShortfall).toFixed(0),
      message: cashShortfall < 0
        ? `3개월 후 현금 부족 예상 (${Math.abs(cashShortfall).toFixed(0)}백만원)`
        : '현금흐름 양호',
      probability: cashShortfall < 0 ? 78 : 0,
    };
  }

  // 수익성 분석
  private async analyzeProfitability(project: any) {
    const assumption = project.assumptions[0];
    if (!assumption) {
      return {
        projectId: project.id,
        projectName: project.projectName,
        type: 'profitability_analysis',
        belowTarget: false,
        message: '재무 전제 없음',
      };
    }

    const profitMargin = parseFloat(assumption.profitMargin.toString()) * 100;
    const targetMargin = 15.0; // 목표 이익률 15%

    return {
      projectId: project.id,
      projectName: project.projectName,
      type: 'profitability_analysis',
      belowTarget: profitMargin < targetMargin,
      currentMargin: profitMargin.toFixed(1),
      targetMargin,
      message: profitMargin < targetMargin
        ? `목표 이익률 미달 (${profitMargin.toFixed(1)}% < ${targetMargin}%)`
        : '목표 달성',
    };
  }

  // 전사 재무 지표
  private async calculateCompanyMetrics(projects: any[]) {
    const totalRevenue = projects.reduce((sum, p) =>
      sum + parseFloat(p.contractPrice.toString()), 0);

    const avgMargin = projects.length > 0
      ? projects.reduce((sum, p) => {
          const assumption = p.assumptions[0];
          return sum + (assumption ? parseFloat(assumption.profitMargin.toString()) : 0);
        }, 0) / projects.length * 100
      : 0;

    return {
      totalRevenue: (totalRevenue / 100000000).toFixed(0), // 억원
      totalProjects: projects.length,
      avgMargin: avgMargin.toFixed(1),
      activeProjects: projects.filter(p => p.status === 'ACTIVE').length,
    };
  }

  // ========== 고도화 기능 ==========

  /**
   * 머신러닝 기반 현금흐름 예측 (Linear Regression)
   */
  private async predictCashFlowML(projectId: string, monthsAhead: number = 6): Promise<number[]> {
    const cashFlows = await prisma.cashFlow.findMany({
      where: { projectId },
      orderBy: { month: 'asc' },
      select: { month: true, netCashFlow: true },
    });

    if (cashFlows.length < 3) {
      return [];
    }

    // 간단한 Linear Regression
    const n = cashFlows.length;
    const x = cashFlows.map((_, idx) => idx + 1);
    const y = cashFlows.map((cf) => parseFloat(cf.netCashFlow.toString()));

    // 평균
    const xMean = x.reduce((sum, val) => sum + val, 0) / n;
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;

    // 기울기 (slope)
    const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
    const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);
    const slope = numerator / denominator;

    // 절편 (intercept)
    const intercept = yMean - slope * xMean;

    // 미래 예측
    const predictions: number[] = [];
    for (let i = 1; i <= monthsAhead; i++) {
      const futureMonth = n + i;
      const prediction = slope * futureMonth + intercept;
      predictions.push(prediction);
    }

    return predictions;
  }

  /**
   * 이상 패턴 감지 (Anomaly Detection using Z-Score)
   */
  private detectAnomalies(projectId: string, values: number[]): number[] {
    if (values.length < 3) return [];

    // 평균과 표준편차 계산
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Z-Score 계산 (|z| > 2 이면 이상값)
    const anomalies: number[] = [];
    values.forEach((val, idx) => {
      const zScore = Math.abs((val - mean) / stdDev);
      if (zScore > 2.0) {
        anomalies.push(idx);
      }
    });

    return anomalies;
  }

  /**
   * 자동 최적화 제안 (AI Recommendation)
   */
  private async generateOptimizationRecommendations(project: any): Promise<string[]> {
    const recommendations: string[] = [];

    const assumption = project.assumptions[0];
    if (!assumption) return recommendations;

    const profitMargin = parseFloat(assumption.profitMargin.toString()) * 100;
    const costRatio = parseFloat(assumption.costRatio.toString()) * 100;

    // 1. 이익률 개선 제안
    if (profitMargin < 15) {
      recommendations.push(
        `이익률 ${profitMargin.toFixed(1)}% → 15% 달성을 위해 원가율을 ${(costRatio - 5).toFixed(1)}%로 절감 필요`
      );
    }

    // 2. 현금흐름 개선 제안
    const periodReceivable = parseInt(assumption.periodReceivable.toString());
    if (periodReceivable > 60) {
      recommendations.push(
        `매출채권 회수기간 ${periodReceivable}일 → 45일로 단축 시 현금흐름 ${(project.contractPrice * 0.15 / 100000000).toFixed(1)}억 개선`
      );
    }

    // 3. 유보금 조기 회수 제안
    const retentionRate = parseFloat(assumption.retentionRate.toString()) * 100;
    if (retentionRate > 5) {
      recommendations.push(
        `유보금률 ${retentionRate}% → 3%로 협상 시 현금흐름 ${(project.contractPrice * (retentionRate - 3) / 10000000000).toFixed(2)}억 개선`
      );
    }

    // 4. 선급금 활용 제안
    const cashFlows = project.cashFlows || [];
    if (cashFlows.length > 0) {
      const latestCash = cashFlows[0];
      const cumulativeCash = parseFloat(latestCash.cumulativeCash.toString());

      if (cumulativeCash < 0) {
        recommendations.push(
          `선급금 ${Math.abs(cumulativeCash / 100000000).toFixed(1)}억 추가 확보로 현금흐름 정상화 필요`
        );
      }
    }

    // 5. 포트폴리오 다각화 제안
    if (project.projectType === 'REAL_ESTATE_DEVELOPMENT') {
      recommendations.push(
        '부동산 개발 프로젝트 비중이 높습니다. 일반도급 프로젝트 확대로 리스크 분산을 권장합니다.'
      );
    }

    return recommendations;
  }

  /**
   * 시계열 트렌드 분석 (Moving Average)
   */
  private calculateMovingAverage(values: number[], window: number = 3): number[] {
    if (values.length < window) return values;

    const movingAvg: number[] = [];
    for (let i = window - 1; i < values.length; i++) {
      const sum = values.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      movingAvg.push(sum / window);
    }

    return movingAvg;
  }

  /**
   * 프로젝트 포트폴리오 최적화 분석
   */
  private async analyzePortfolioOptimization(projects: any[]): Promise<any> {
    // 프로젝트 타입별 분포
    const typeDistribution = new Map<string, number>();
    projects.forEach((p) => {
      const count = typeDistribution.get(p.projectType) || 0;
      typeDistribution.set(p.projectType, count + 1);
    });

    // 리스크-수익률 매트릭스
    const riskReturnMatrix = projects.map((p) => {
      const assumption = p.assumptions[0];
      const profitMargin = assumption ? parseFloat(assumption.profitMargin.toString()) * 100 : 0;
      const riskScore = this.calculateProjectRiskScore(p);

      return {
        projectId: p.id,
        projectName: p.projectName,
        return: profitMargin,
        risk: riskScore,
        sharpeRatio: profitMargin / (riskScore + 0.01), // Sharpe-like ratio
      };
    });

    // 상위 성과 프로젝트 (Sharpe Ratio 기준)
    const topPerformers = riskReturnMatrix
      .sort((a, b) => b.sharpeRatio - a.sharpeRatio)
      .slice(0, 5);

    return {
      typeDistribution: Array.from(typeDistribution.entries()).map(([type, count]) => ({
        type,
        count,
        percentage: ((count / projects.length) * 100).toFixed(1),
      })),
      topPerformers,
      portfolioRisk: riskReturnMatrix.reduce((sum, p) => sum + p.risk, 0) / projects.length,
      portfolioReturn: riskReturnMatrix.reduce((sum, p) => sum + p.return, 0) / projects.length,
    };
  }

  /**
   * 프로젝트 리스크 점수 계산 (0-100)
   */
  private calculateProjectRiskScore(project: any): number {
    let riskScore = 0;

    // 1. 공정 지연 리스크 (30점)
    const progressRate = parseFloat(project.progressRate.toString());
    const expectedProgress = this.calculateExpectedProgress(project);
    const delay = expectedProgress - progressRate;
    riskScore += Math.min(delay * 3, 30);

    // 2. 재무 리스크 (40점)
    const assumption = project.assumptions[0];
    if (assumption) {
      const profitMargin = parseFloat(assumption.profitMargin.toString()) * 100;
      if (profitMargin < 10) riskScore += 20;
      else if (profitMargin < 15) riskScore += 10;

      const costRatio = parseFloat(assumption.costRatio.toString()) * 100;
      if (costRatio > 85) riskScore += 20;
      else if (costRatio > 80) riskScore += 10;
    }

    // 3. 현금흐름 리스크 (30점)
    const cashFlows = project.cashFlows || [];
    if (cashFlows.length > 0) {
      const latestCash = cashFlows[0];
      const cumulativeCash = parseFloat(latestCash.cumulativeCash.toString());

      if (cumulativeCash < 0) riskScore += 30;
      else if (cumulativeCash < project.contractPrice * 0.1) riskScore += 15;
    }

    return Math.min(riskScore, 100);
  }

  /**
   * 예상 진척률 계산
   */
  private calculateExpectedProgress(project: any): number {
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const now = new Date();

    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    return Math.min((elapsedDays / totalDays) * 100, 100);
  }
}
