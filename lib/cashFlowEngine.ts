import { Project, ProjectAssumptions, CashFlowData, FinancialMetrics, SimulationResult } from '@/types';

/**
 * S-Curve 진행률 계산
 */
function calculateProgressRates(totalPeriod: number, curveType: string = 's_curve_normal'): number[] {
  const rates: number[] = [];

  for (let month = 1; month <= totalPeriod; month++) {
    const t = month / totalPeriod; // 0 ~ 1
    let rate = 0;

    if (curveType === 's_curve_normal') {
      // 정규 S-Curve: 3차 다항식
      rate = 3 * t * t - 2 * t * t * t;
    } else if (curveType === 's_curve_steep') {
      // 급한 S-Curve: 5차 다항식
      rate = 6 * Math.pow(t, 5) - 15 * Math.pow(t, 4) + 10 * Math.pow(t, 3);
    } else {
      // 선형
      rate = t;
    }

    rates.push(rate);
  }

  return rates;
}

/**
 * 현금흐름 계산 메인 함수
 */
export function calculateCashFlow(
  project: Project,
  assumptions: ProjectAssumptions
): CashFlowData[] {
  const {
    contractPrice,
    constructionPeriod: months,
  } = project;

  const {
    profitMargin,
    periodInvoicing,
    periodReceivable,
    retentionRate,
    retentionPeriod,
    payMSubcon,
    payMMaterial,
    curveType,
  } = assumptions;

  const costRatio = 1 - profitMargin;

  // S-Curve 진행률 계산
  const progressRates = calculateProgressRates(months, curveType);

  const results: CashFlowData[] = [];
  let cumRevenue = 0;
  let cumCost = 0;
  let cumProfit = 0;
  let cumCash = 0;
  let cumInvoiced = 0;

  // 월별 계산
  for (let month = 1; month <= months; month++) {
    // 1. 사업수지 계산 (손익 기준)
    const rate = progressRates[month - 1];
    const prevRate = month > 1 ? progressRates[month - 2] : 0;
    const monthlyRate = rate - prevRate;

    const revenue = contractPrice * monthlyRate * 1000000; // 백만원 단위
    const cost = revenue * costRatio;
    const profit = revenue - cost;

    cumRevenue += revenue;
    cumCost += cost;
    cumProfit += profit;

    // 2. 자금수지 계산 (현금 기준)
    let cashIn = 0;
    let cashOut = 0;

    // 청구 및 수금
    let invoiceAmount = 0;
    if (month % periodInvoicing === 0 || month === months) {
      const retention = cumRevenue * retentionRate;
      invoiceAmount = cumRevenue - cumInvoiced - retention;
      cumInvoiced += invoiceAmount;
    }

    // 수금 (청구 후 periodReceivable 개월 후)
    let receivedAmount = 0;
    if (month > periodReceivable) {
      const invoiceMonth = month - periodReceivable;
      if (invoiceMonth % periodInvoicing === 0 || invoiceMonth === months) {
        const retention = (cumRevenue / month) * invoiceMonth * retentionRate;
        receivedAmount = (cumRevenue / month) * invoiceMonth - retention;
      }
    }

    // 유보금 회수 (공사 완료 후 retentionPeriod 개월 후)
    let retentionReceived = 0;
    if (month === months + retentionPeriod) {
      retentionReceived = contractPrice * 1000000 * retentionRate;
    }

    cashIn = receivedAmount + retentionReceived;

    // 하도급 지급 (60% 가정)
    let subcontractPayment = 0;
    if (month > payMSubcon) {
      const payMonth = month - payMSubcon;
      const payCost = contractPrice * (progressRates[payMonth - 1] - (payMonth > 1 ? progressRates[payMonth - 2] : 0)) * 1000000 * costRatio;
      subcontractPayment = payCost * 0.6;
    }

    // 자재 지급 (40% 가정)
    let materialPayment = 0;
    if (month > payMMaterial) {
      const payMonth = month - payMMaterial;
      const payCost = contractPrice * (progressRates[payMonth - 1] - (payMonth > 1 ? progressRates[payMonth - 2] : 0)) * 1000000 * costRatio;
      materialPayment = payCost * 0.4;
    }

    cashOut = subcontractPayment + materialPayment;

    // 순현금흐름
    const netCashFlow = cashIn - cashOut;
    cumCash += netCashFlow;

    results.push({
      month,
      progressRate: monthlyRate,
      cumulativeProgressRate: rate,
      revenue,
      cost,
      profit,
      cumulativeRevenue: cumRevenue,
      cumulativeCost: cumCost,
      cumulativeProfit: cumProfit,
      invoiceAmount,
      receivedAmount,
      retentionReceived,
      subcontractPayment,
      materialPayment,
      otherPayment: 0,
      netCashFlow,
      cumulativeCash: cumCash,
    });
  }

  return results;
}

/**
 * 재무 지표 계산
 */
export function calculateFinancialMetrics(
  cashFlowData: CashFlowData[],
  initialInvestment: number = 0,
  discountRate: number = 0.1
): FinancialMetrics {
  // NPV 계산
  let npv = -initialInvestment;
  cashFlowData.forEach((data, index) => {
    npv += data.netCashFlow / Math.pow(1 + discountRate, index + 1);
  });

  // IRR 계산 (Newton-Raphson Method)
  let irr = 0.1; // 초기 추정값
  for (let i = 0; i < 100; i++) {
    let f = -initialInvestment;
    let df = 0;

    cashFlowData.forEach((data, index) => {
      const t = index + 1;
      f += data.netCashFlow / Math.pow(1 + irr, t);
      df -= (t * data.netCashFlow) / Math.pow(1 + irr, t + 1);
    });

    if (Math.abs(f) < 0.001) break;
    irr = irr - f / df;
  }

  // ROI 계산
  const totalCashIn = cashFlowData.reduce((sum, d) => sum + (d.receivedAmount + d.retentionReceived), 0);
  const totalCashOut = cashFlowData.reduce((sum, d) => sum + (d.subcontractPayment + d.materialPayment + d.otherPayment), 0);
  const roi = ((totalCashIn - totalCashOut - initialInvestment) / (totalCashOut + initialInvestment)) * 100;

  // 총이익률
  const lastData = cashFlowData[cashFlowData.length - 1];
  const grossMargin = (lastData.cumulativeProfit / lastData.cumulativeRevenue) * 100;

  // 회수기간 (Payback Period)
  let paybackPeriod = 0;
  let cumCash = -initialInvestment;
  for (let i = 0; i < cashFlowData.length; i++) {
    cumCash += cashFlowData[i].netCashFlow;
    if (cumCash >= 0) {
      paybackPeriod = i + 1;
      break;
    }
  }

  // 손익분기점 (Break Even Point)
  let breakEvenPoint = 0;
  for (let i = 0; i < cashFlowData.length; i++) {
    if (cashFlowData[i].cumulativeProfit >= 0) {
      breakEvenPoint = i + 1;
      break;
    }
  }

  return {
    npv,
    irr: irr * 100,
    roi,
    grossMargin,
    paybackPeriod,
    breakEvenPoint,
  };
}

/**
 * 통합 시뮬레이션 실행
 */
export function runSimulation(
  project: Project,
  assumptions: ProjectAssumptions,
  initialInvestment: number = 0
): SimulationResult {
  const cashFlowData = calculateCashFlow(project, assumptions);
  const financialMetrics = calculateFinancialMetrics(cashFlowData, initialInvestment);

  return {
    project,
    assumptions,
    cashFlowData,
    financialMetrics,
    risks: [],
    gapAnalysis: [],
  };
}
