/**
 * FinancialForecastEngine
 * 재무전망 시뮬레이션 엔진
 *
 * 두 가지 방법론 지원:
 * 1. 간접법 (Indirect Method): 공사진척률 기반 매출/비용 추정
 * 2. 직접법 (Direct Method): 실제 현금흐름 기반 예측
 */

export type ForecastMethod = 'INDIRECT' | 'DIRECT';
export type CurveType = 'S_CURVE' | 'LINEAR' | 'FRONT_LOADED' | 'BACK_LOADED';

/**
 * 신규 프로젝트 Parameter
 */
export interface NewProjectParams {
  // 기본 정보
  contractPrice: number;          // 계약금액 (억원)
  constructionPeriod: number;     // 공사기간 (개월)
  startDate: Date;

  // 원가 및 수익
  profitMargin: number;           // 이익률 (%)
  costRatio: number;              // 원가율 (%) = 100 - 이익률

  // 공사진척 곡선
  curveType: CurveType;           // 진척곡선 유형
  curveParam?: number;            // 곡선 파라미터 (S-Curve의 경우 기울기)

  // 대금 회수 조건
  invoicingPeriod: number;        // 기성청구 주기 (월)
  receivablePeriod: number;       // 미수금 회수기간 (월)
  retentionRate: number;          // 하자보증금 비율 (%)
  retentionPeriod: number;        // 하자보증금 회수기간 (월)

  // 지급 조건
  paymentTermSubcontractor: number; // 하도급 지급조건 (월)
  paymentTermMaterial: number;      // 자재대 지급조건 (월)
}

/**
 * 진행중 프로젝트 Parameter
 */
export interface OngoingProjectParams extends NewProjectParams {
  // 실적 데이터
  actualProgress: number;         // 실제 진척률 (%)
  actualRevenue: number;          // 실제 매출 (억원)
  actualCost: number;             // 실제 원가 (억원)
  currentCashBalance: number;     // 현재 현금잔액 (억원)

  // 미수/미지급
  accountsReceivable: number;     // 미수금 (억원)
  accountsPayable: number;        // 미지급금 (억원)
}

/**
 * 월별 재무전망 결과
 */
export interface MonthlyForecast {
  month: string;                  // YYYY-MM

  // 간접법 (손익)
  plannedProgress: number;        // 계획 진척률 (%)
  expectedRevenue: number;        // 예상 매출 (억원)
  expectedCost: number;           // 예상 원가 (억원)
  expectedProfit: number;         // 예상 이익 (억원)

  // 직접법 (현금흐름)
  cashInflow: number;             // 현금유입 (억원)
  cashOutflow: number;            // 현금유출 (억원)
  netCashFlow: number;            // 순현금흐름 (억원)
  cumulativeCashFlow: number;     // 누적현금흐름 (억원)

  // 기타
  accountsReceivable: number;     // 미수금 잔액 (억원)
  accountsPayable: number;        // 미지급금 잔액 (억원)
}

/**
 * 재무전망 결과
 */
export interface FinancialForecast {
  method: ForecastMethod;
  parameters: NewProjectParams | OngoingProjectParams;
  monthlyData: MonthlyForecast[];
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    profitMargin: number;
    maxCashOutflow: number;
    finalCashBalance: number;
  };
}

export class FinancialForecastEngine {
  /**
   * 재무전망 생성
   */
  generateForecast(
    method: ForecastMethod,
    params: NewProjectParams | OngoingProjectParams
  ): FinancialForecast {
    if (method === 'INDIRECT') {
      return this.indirectMethodForecast(params);
    } else {
      return this.directMethodForecast(params);
    }
  }

  /**
   * 간접법: 공사진척률 기반 손익 추정
   */
  private indirectMethodForecast(params: NewProjectParams): FinancialForecast {
    const monthlyData: MonthlyForecast[] = [];
    const startDate = new Date(params.startDate);

    for (let month = 0; month <= params.constructionPeriod; month++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + month);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // 진척률 계산
      const progress = this.calculateProgress(
        month,
        params.constructionPeriod,
        params.curveType,
        params.curveParam
      );

      // 누적 매출 및 원가
      const cumulativeRevenue = params.contractPrice * (progress / 100);
      const cumulativeCost = cumulativeRevenue * (params.costRatio / 100);
      const cumulativeProfit = cumulativeRevenue - cumulativeCost;

      // 월별 증분 계산
      const prevProgress = month > 0 ?
        this.calculateProgress(month - 1, params.constructionPeriod, params.curveType, params.curveParam) : 0;
      const monthlyRevenue = params.contractPrice * ((progress - prevProgress) / 100);
      const monthlyCost = monthlyRevenue * (params.costRatio / 100);
      const monthlyProfit = monthlyRevenue - monthlyCost;

      // 현금흐름 (대금 회수 및 지급 조건 반영)
      const cashInflow = this.calculateCashInflow(
        month,
        monthlyRevenue,
        params.invoicingPeriod,
        params.receivablePeriod,
        params.retentionRate
      );

      const cashOutflow = this.calculateCashOutflow(
        month,
        monthlyCost,
        params.paymentTermSubcontractor,
        params.paymentTermMaterial
      );

      const netCashFlow = cashInflow - cashOutflow;
      const cumulativeCashFlow = month === 0 ? netCashFlow :
        monthlyData[month - 1].cumulativeCashFlow + netCashFlow;

      // 미수금/미지급금
      const accountsReceivable = this.calculateAccountsReceivable(
        month,
        cumulativeRevenue,
        cashInflow,
        params.retentionRate
      );

      const accountsPayable = this.calculateAccountsPayable(
        month,
        cumulativeCost,
        cashOutflow
      );

      monthlyData.push({
        month: monthKey,
        plannedProgress: progress,
        expectedRevenue: monthlyRevenue,
        expectedCost: monthlyCost,
        expectedProfit: monthlyProfit,
        cashInflow,
        cashOutflow,
        netCashFlow,
        cumulativeCashFlow,
        accountsReceivable,
        accountsPayable,
      });
    }

    // 요약 통계
    const totalRevenue = params.contractPrice;
    const totalCost = totalRevenue * (params.costRatio / 100);
    const totalProfit = totalRevenue - totalCost;
    const maxCashOutflow = Math.min(...monthlyData.map(m => m.cumulativeCashFlow));
    const finalCashBalance = monthlyData[monthlyData.length - 1].cumulativeCashFlow;

    return {
      method: 'INDIRECT',
      parameters: params,
      monthlyData,
      summary: {
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin: params.profitMargin,
        maxCashOutflow,
        finalCashBalance,
      },
    };
  }

  /**
   * 직접법: 실제 현금흐름 기반 예측
   */
  private directMethodForecast(params: NewProjectParams | OngoingProjectParams): FinancialForecast {
    // 진행중 프로젝트인 경우 실적 반영
    const isOngoing = 'actualProgress' in params;

    // 간접법과 유사하지만 실제 데이터를 우선 사용
    const monthlyData: MonthlyForecast[] = [];
    const startDate = new Date(params.startDate);

    let cumulativeCash = isOngoing ? (params as OngoingProjectParams).currentCashBalance : 0;

    for (let month = 0; month <= params.constructionPeriod; month++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + month);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // 진행중 프로젝트의 경우 실제 데이터 우선 사용
      let progress, revenue, cost, profit, cashIn, cashOut;

      if (isOngoing && month <= Math.floor((params as OngoingProjectParams).actualProgress / 100 * params.constructionPeriod)) {
        // 실제 데이터 구간
        progress = (params as OngoingProjectParams).actualProgress;
        revenue = (params as OngoingProjectParams).actualRevenue / params.constructionPeriod; // 간단히 월평균
        cost = (params as OngoingProjectParams).actualCost / params.constructionPeriod;
        profit = revenue - cost;
        cashIn = revenue; // 실제 데이터에서 가져와야 함
        cashOut = cost;
      } else {
        // 예측 구간
        progress = this.calculateProgress(month, params.constructionPeriod, params.curveType, params.curveParam);
        const prevProgress = month > 0 ?
          this.calculateProgress(month - 1, params.constructionPeriod, params.curveType, params.curveParam) : 0;

        revenue = params.contractPrice * ((progress - prevProgress) / 100);
        cost = revenue * (params.costRatio / 100);
        profit = revenue - cost;

        cashIn = this.calculateCashInflow(month, revenue, params.invoicingPeriod, params.receivablePeriod, params.retentionRate);
        cashOut = this.calculateCashOutflow(month, cost, params.paymentTermSubcontractor, params.paymentTermMaterial);
      }

      const netCashFlow = cashIn - cashOut;
      cumulativeCash += netCashFlow;

      monthlyData.push({
        month: monthKey,
        plannedProgress: progress,
        expectedRevenue: revenue,
        expectedCost: cost,
        expectedProfit: profit,
        cashInflow: cashIn,
        cashOutflow: cashOut,
        netCashFlow,
        cumulativeCashFlow: cumulativeCash,
        accountsReceivable: 0, // TODO: 계산
        accountsPayable: 0,
      });
    }

    return {
      method: 'DIRECT',
      parameters: params,
      monthlyData,
      summary: {
        totalRevenue: monthlyData.reduce((sum, m) => sum + m.expectedRevenue, 0),
        totalCost: monthlyData.reduce((sum, m) => sum + m.expectedCost, 0),
        totalProfit: monthlyData.reduce((sum, m) => sum + m.expectedProfit, 0),
        profitMargin: params.profitMargin,
        maxCashOutflow: Math.min(...monthlyData.map(m => m.cumulativeCashFlow)),
        finalCashBalance: cumulativeCash,
      },
    };
  }

  /**
   * 공사진척률 계산 (곡선 유형에 따라)
   */
  private calculateProgress(
    month: number,
    totalMonths: number,
    curveType: CurveType,
    curveParam: number = 2.0
  ): number {
    const t = month / totalMonths; // 0~1

    switch (curveType) {
      case 'LINEAR':
        return t * 100;

      case 'S_CURVE':
        // Logistic curve: P(t) = 100 / (1 + e^(-k*(t-0.5)))
        const k = curveParam; // 기울기 파라미터 (default: 2.0)
        return 100 / (1 + Math.exp(-k * (t - 0.5)));

      case 'FRONT_LOADED':
        // 초기에 빠르게 진행
        return 100 * Math.sqrt(t);

      case 'BACK_LOADED':
        // 후반에 빠르게 진행
        return 100 * (t * t);

      default:
        return t * 100;
    }
  }

  /**
   * 현금유입 계산 (기성청구 및 미수금 회수 반영)
   */
  private calculateCashInflow(
    month: number,
    revenue: number,
    invoicingPeriod: number,
    receivablePeriod: number,
    retentionRate: number
  ): number {
    // 간단히 모델링: 기성청구 주기와 미수금 회수기간을 고려
    // 실제로는 월별 기성청구 스케줄을 만들어야 함

    if (month < receivablePeriod) {
      return 0; // 초기에는 입금 없음
    }

    // 하자보증금 제외하고 입금
    const inflowRate = 1 - (retentionRate / 100);
    return revenue * inflowRate;
  }

  /**
   * 현금유출 계산 (하도급/자재대 지급조건 반영)
   */
  private calculateCashOutflow(
    month: number,
    cost: number,
    paymentTermSubcontractor: number,
    paymentTermMaterial: number
  ): number {
    // 간단히 모델링: 평균 지급조건 적용
    const avgPaymentTerm = (paymentTermSubcontractor + paymentTermMaterial) / 2;

    if (month < avgPaymentTerm) {
      return 0; // 초기에는 지급 없음
    }

    return cost;
  }

  /**
   * 미수금 계산
   */
  private calculateAccountsReceivable(
    month: number,
    cumulativeRevenue: number,
    cashInflow: number,
    retentionRate: number
  ): number {
    // 누적매출 - 누적입금
    const retention = cumulativeRevenue * (retentionRate / 100);
    return cumulativeRevenue - cashInflow - retention;
  }

  /**
   * 미지급금 계산
   */
  private calculateAccountsPayable(
    month: number,
    cumulativeCost: number,
    cashOutflow: number
  ): number {
    // 누적원가 - 누적지급
    return cumulativeCost - cashOutflow;
  }

  /**
   * Parameter 기본값 생성 (신규 프로젝트용)
   */
  static getDefaultNewProjectParams(contractPrice: number, constructionPeriod: number): NewProjectParams {
    return {
      contractPrice,
      constructionPeriod,
      startDate: new Date(),
      profitMargin: 15, // 15%
      costRatio: 85,
      curveType: 'S_CURVE',
      curveParam: 2.0,
      invoicingPeriod: 1, // 월 1회
      receivablePeriod: 2, // 2개월 후 회수
      retentionRate: 5, // 5%
      retentionPeriod: 12, // 준공 후 12개월
      paymentTermSubcontractor: 1, // 1개월 후 지급
      paymentTermMaterial: 1, // 1개월 후 지급
    };
  }
}
