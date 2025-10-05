import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/lib/prisma';

/**
 * K-IFRS 기준 건설업 재무 전망 엔진
 *
 * K-IFRS 1115호: 고객과의 계약에서 생기는 수익
 * - 진행기준법 (Percentage of Completion Method)
 * - 투입법: 발생원가/총예정원가 기준
 */

export interface ProjectAssumptions {
  // 기본 정보
  contractPrice: number; // 계약금액
  constructionPeriod: number; // 공사기간 (월)
  startDate: Date;

  // 재무 전제
  profitMargin: number; // 이익률 (예: 0.15 = 15%)
  costRatio: number; // 원가율 (예: 0.85 = 85%)

  // 대금 조건
  periodInvoicing: number; // 기성청구 주기 (월)
  periodReceivable: number; // 매출채권 회수기간 (일)
  retentionRate: number; // 유보금률 (예: 0.05 = 5%)
  retentionPeriod: number; // 유보금 회수기간 (월, 준공 후)

  // 지급 조건
  paymentSubcontract: number; // 하도급 대금 지급주기 (월)
  paymentMaterial: number; // 자재대 지급주기 (월)

  // 공정 곡선 (진행률 패턴)
  curveType: 'LINEAR' | 'S_CURVE' | 'FRONT_LOADED' | 'BACK_LOADED';
}

export interface MonthlyForecast {
  month: number; // 1~N
  date: Date;

  // 사업수지 (K-IFRS 수익인식)
  progressRate: number; // 진행률 (%)
  cumulativeProgressRate: number; // 누적 진행률
  revenue: number; // 당월 매출
  cost: number; // 당월 원가
  profit: number; // 당월 이익
  cumulativeRevenue: number;
  cumulativeCost: number;
  cumulativeProfit: number;

  // 자금수지 (현금흐름)
  invoiceAmount: number; // 기성청구액
  receivedAmount: number; // 현금 수령액
  retentionReceived: number; // 유보금 수령
  subcontractPayment: number; // 하도급 지급
  materialPayment: number; // 자재비 지급
  otherPayment: number; // 기타 지급
  netCashFlow: number; // 순현금흐름
  cumulativeCash: number; // 누적 현금
}

export class ForecastEngine {
  private assumptions: ProjectAssumptions;

  constructor(assumptions: ProjectAssumptions) {
    this.assumptions = assumptions;
  }

  /**
   * 전체 재무 전망 생성
   */
  public generateForecast(): MonthlyForecast[] {
    const forecasts: MonthlyForecast[] = [];
    const totalMonths = this.assumptions.constructionPeriod;

    // 진행률 곡선 생성
    const progressCurve = this.generateProgressCurve(totalMonths);

    let cumulativeRevenue = 0;
    let cumulativeCost = 0;
    let cumulativeProfit = 0;
    let cumulativeCash = 0;

    // 유보금 추적
    let totalRetention = 0;

    for (let month = 1; month <= totalMonths; month++) {
      const monthDate = new Date(this.assumptions.startDate);
      monthDate.setMonth(monthDate.getMonth() + month - 1);

      // 1. 사업수지 계산 (K-IFRS 진행기준)
      const progressRate = progressCurve[month - 1];
      const cumulativeProgressRate =
        month === 1 ? progressRate : progressCurve.slice(0, month).reduce((a, b) => a + b, 0);

      // 당월 매출 = 계약금액 × 당월 진행률
      const revenue = this.assumptions.contractPrice * (progressRate / 100);

      // 당월 원가 = 당월 매출 × 원가율
      const cost = revenue * this.assumptions.costRatio;

      // 당월 이익 = 당월 매출 - 당월 원가
      const profit = revenue - cost;

      cumulativeRevenue += revenue;
      cumulativeCost += cost;
      cumulativeProfit += profit;

      // 2. 자금수지 계산
      // 기성청구 (진행기준 매출과 동일하게 가정)
      const invoiceAmount =
        month % this.assumptions.periodInvoicing === 0 ? revenue * this.assumptions.periodInvoicing : 0;

      // 현금 수령 (매출채권 회수기간 고려)
      const receivableMonths = Math.floor(this.assumptions.periodReceivable / 30);
      const receivedAmount =
        month > receivableMonths && month % this.assumptions.periodInvoicing === receivableMonths
          ? invoiceAmount * (1 - this.assumptions.retentionRate)
          : 0;

      // 유보금 누적
      if (invoiceAmount > 0) {
        totalRetention += invoiceAmount * this.assumptions.retentionRate;
      }

      // 유보금 수령 (준공 후 N개월)
      const retentionReceived =
        month === totalMonths + this.assumptions.retentionPeriod ? totalRetention : 0;

      // 하도급 지급 (원가의 60% 가정)
      const subcontractPayment =
        month % this.assumptions.paymentSubcontract === 0
          ? cost * 0.6 * this.assumptions.paymentSubcontract
          : 0;

      // 자재비 지급 (원가의 30% 가정)
      const materialPayment =
        month % this.assumptions.paymentMaterial === 0
          ? cost * 0.3 * this.assumptions.paymentMaterial
          : 0;

      // 기타 지급 (원가의 10%)
      const otherPayment = cost * 0.1;

      // 순현금흐름
      const netCashFlow =
        receivedAmount + retentionReceived - subcontractPayment - materialPayment - otherPayment;

      cumulativeCash += netCashFlow;

      forecasts.push({
        month,
        date: monthDate,
        progressRate,
        cumulativeProgressRate,
        revenue,
        cost,
        profit,
        cumulativeRevenue,
        cumulativeCost,
        cumulativeProfit,
        invoiceAmount,
        receivedAmount,
        retentionReceived,
        subcontractPayment,
        materialPayment,
        otherPayment,
        netCashFlow,
        cumulativeCash,
      });
    }

    return forecasts;
  }

  /**
   * 진행률 곡선 생성
   */
  private generateProgressCurve(totalMonths: number): number[] {
    const curve: number[] = [];

    switch (this.assumptions.curveType) {
      case 'LINEAR':
        // 선형 진행
        const monthlyProgress = 100 / totalMonths;
        for (let i = 0; i < totalMonths; i++) {
          curve.push(monthlyProgress);
        }
        break;

      case 'S_CURVE':
        // S자 곡선 (초기 느림 → 중간 빠름 → 후반 느림)
        for (let i = 0; i < totalMonths; i++) {
          const t = i / (totalMonths - 1); // 0 to 1
          const sigmoid = 1 / (1 + Math.exp(-10 * (t - 0.5))); // Sigmoid function
          const cumulativeProgress = sigmoid * 100;
          const previousCumulative = i === 0 ? 0 : curve.slice(0, i).reduce((a, b) => a + b, 0);
          curve.push(cumulativeProgress - previousCumulative);
        }
        break;

      case 'FRONT_LOADED':
        // 전반기 집중 (초기 많음 → 후반 적음)
        for (let i = 0; i < totalMonths; i++) {
          const t = i / (totalMonths - 1);
          const progress = 100 * (1 - Math.pow(1 - t, 2)); // Quadratic ease-in
          const previousCumulative = i === 0 ? 0 : curve.slice(0, i).reduce((a, b) => a + b, 0);
          curve.push(progress - previousCumulative);
        }
        break;

      case 'BACK_LOADED':
        // 후반기 집중 (초기 적음 → 후반 많음)
        for (let i = 0; i < totalMonths; i++) {
          const t = i / (totalMonths - 1);
          const progress = 100 * Math.pow(t, 2); // Quadratic ease-out
          const previousCumulative = i === 0 ? 0 : curve.slice(0, i).reduce((a, b) => a + b, 0);
          curve.push(progress - previousCumulative);
        }
        break;

      default:
        // 기본값: LINEAR
        const defaultProgress = 100 / totalMonths;
        for (let i = 0; i < totalMonths; i++) {
          curve.push(defaultProgress);
        }
    }

    // 정규화 (합이 정확히 100%가 되도록)
    const total = curve.reduce((a, b) => a + b, 0);
    return curve.map((p) => (p / total) * 100);
  }

  /**
   * DB에 전망 데이터 저장
   */
  public async saveToDB(projectId: string): Promise<void> {
    const forecasts = this.generateForecast();

    // 1. ProjectAssumptions 저장
    await prisma.projectAssumption.create({
      data: {
        projectId,
        profitMargin: this.assumptions.profitMargin,
        costRatio: this.assumptions.costRatio,
        periodInvoicing: this.assumptions.periodInvoicing,
        periodReceivable: this.assumptions.periodReceivable,
        retentionRate: this.assumptions.retentionRate,
        retentionPeriod: this.assumptions.retentionPeriod,
        paymentSubcontract: this.assumptions.paymentSubcontract,
        paymentMaterial: this.assumptions.paymentMaterial,
        curveType: this.assumptions.curveType,
        effectiveFrom: this.assumptions.startDate,
      },
    });

    // 2. ProjectProgress 저장 (사업수지)
    for (const forecast of forecasts) {
      await prisma.projectProgress.create({
        data: {
          projectId,
          month: forecast.month,
          progressDate: forecast.date,
          plannedRate: forecast.progressRate / 100,
          cumulativeRate: forecast.cumulativeProgressRate / 100,
          revenue: forecast.revenue,
          cost: forecast.cost,
          profit: forecast.profit,
          cumulativeRevenue: forecast.cumulativeRevenue,
          cumulativeCost: forecast.cumulativeCost,
          cumulativeProfit: forecast.cumulativeProfit,
        },
      });
    }

    // 3. CashFlow 저장 (자금수지)
    for (const forecast of forecasts) {
      await prisma.cashFlow.create({
        data: {
          projectId,
          month: forecast.month,
          flowDate: forecast.date,
          invoiceAmount: forecast.invoiceAmount,
          receivedAmount: forecast.receivedAmount,
          retentionReceived: forecast.retentionReceived,
          subcontractPayment: forecast.subcontractPayment,
          materialPayment: forecast.materialPayment,
          otherPayment: forecast.otherPayment,
          netCashFlow: forecast.netCashFlow,
          cumulativeCash: forecast.cumulativeCash,
        },
      });
    }
  }

  /**
   * 재무 지표 분석
   */
  public analyzeFinancialMetrics(): {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    profitMargin: number;
    maxCashShortfall: number;
    maxCashShortfallMonth: number;
    irr: number; // Internal Rate of Return (간이 계산)
    npv: number; // Net Present Value
  } {
    const forecasts = this.generateForecast();

    const totalRevenue = forecasts.reduce((sum, f) => sum + f.revenue, 0);
    const totalCost = forecasts.reduce((sum, f) => sum + f.cost, 0);
    const totalProfit = forecasts.reduce((sum, f) => sum + f.profit, 0);
    const profitMargin = (totalProfit / totalRevenue) * 100;

    // 최대 현금 부족액
    const minCash = Math.min(...forecasts.map((f) => f.cumulativeCash));
    const maxCashShortfall = Math.abs(Math.min(minCash, 0));
    const maxCashShortfallMonth =
      forecasts.find((f) => f.cumulativeCash === minCash)?.month || 0;

    // 간이 IRR 계산 (연간 수익률)
    const yearlyReturn = totalProfit / totalCost;
    const years = this.assumptions.constructionPeriod / 12;
    const irr = (Math.pow(1 + yearlyReturn, 1 / years) - 1) * 100;

    // NPV 계산 (할인율 10% 가정)
    const discountRate = 0.1;
    const npv = forecasts.reduce((sum, f, idx) => {
      const months = f.month;
      const discountFactor = Math.pow(1 + discountRate / 12, -months);
      return sum + f.netCashFlow * discountFactor;
    }, 0);

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin,
      maxCashShortfall,
      maxCashShortfallMonth,
      irr,
      npv,
    };
  }
}
