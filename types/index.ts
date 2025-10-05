// 프로젝트 타입
export type ProjectType = 'real_estate' | 'simple_contract' | 'infra' | 'energy';
export type ProjectStatus = 'planned' | 'active' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  projectCode: string;
  projectName: string;
  projectType: ProjectType;
  client: string;
  contractPrice: number;
  contractDate: Date;
  startDate: Date;
  endDate: Date;
  constructionPeriod: number; // 개월
  status: ProjectStatus;
  progressRate: number; // 0-100
}

// 프로젝트 가정 (Assumptions)
export interface ProjectAssumptions {
  id: string;
  projectId: string;
  profitMargin: number; // 이익률 (0.15 = 15%)
  costRatio: number; // 원가율 (0.85 = 85%)
  periodInvoicing: number; // 청구 주기 (월)
  periodReceivable: number; // 수금 주기 (월)
  retentionRate: number; // 유보율 (0.05 = 5%)
  retentionPeriod: number; // 유보 회수 기간 (월)
  payMSubcon: number; // 하도급 지급 주기 (월)
  payMMaterial: number; // 자재 지급 주기 (월)
  curveType: 's_curve_normal' | 's_curve_steep' | 'linear';
}

// 현금흐름 데이터
export interface CashFlowData {
  month: number;
  progressRate: number;
  cumulativeProgressRate: number;

  // 사업수지 (Business Balance)
  revenue: number; // 매출
  cost: number; // 원가
  profit: number; // 손익
  cumulativeRevenue: number;
  cumulativeCost: number;
  cumulativeProfit: number;

  // 자금수지 (Cash Flow)
  invoiceAmount: number; // 청구액
  receivedAmount: number; // 수금액
  retentionReceived: number; // 유보금 회수
  subcontractPayment: number; // 하도급 지급
  materialPayment: number; // 자재 지급
  otherPayment: number; // 기타 지급
  netCashFlow: number; // 순현금흐름
  cumulativeCash: number; // 누적 현금
}

// 재무 지표
export interface FinancialMetrics {
  npv: number; // 순현재가치
  irr: number; // 내부수익률 (%)
  roi: number; // 투자수익률 (%)
  grossMargin: number; // 총이익률 (%)
  paybackPeriod: number; // 회수기간 (월)
  breakEvenPoint: number; // 손익분기점 (월)
}

// AI 에이전트 타입
export type AgentType =
  | 'finance' // 재무 분석
  | 'cost' // 원가 관리
  | 'risk' // 리스크 분석
  | 'tax' // 세무 최적화
  | 'optimization'; // 통합 최적화

export interface AgentResult {
  agentType: AgentType;
  analysis: string;
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
  confidence: number; // 0-1
  timestamp: Date;
}

export interface IntegratedAnalysis {
  summary: string;
  insights: AgentResult[];
  consolidatedRecommendations: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: string;
    resources: string[];
  }[];
}

// 리스크 타입
export type RiskCategory = 'financial' | 'operational' | 'safety' | 'regulatory';
export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Risk {
  id: string;
  projectId: string;
  category: RiskCategory;
  description: string;
  severity: RiskSeverity;
  probability: number; // 0-1
  impact: number; // 0-1
  mitigation: string;
  status: 'identified' | 'monitoring' | 'mitigating' | 'resolved';
}

// 수주 파이프라인
export interface ProjectPipeline {
  id: string;
  pipelineCode: string;
  projectName: string;
  client: string;
  projectType: ProjectType;
  estimatedAmount: number; // 억원
  constructionPeriod: number;
  biddingDate?: Date;
  decisionDate?: Date;
  winProbability: number; // 0-100
  status: 'prospecting' | 'bidding' | 'negotiating' | 'won' | 'lost';
}

// KPI 데이터
export interface KPIData {
  label: string;
  value: number | string;
  change?: number; // 변화율 (%)
  trend?: 'up' | 'down' | 'neutral';
  essence?: 'thesis' | 'antithesis' | 'synthesis';
}

// 필터
export interface GlobalFilters {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  status: ProjectStatus[];
  manager: string[];
  projectType: ProjectType[];
}

// 드릴다운 데이터
export interface DrillDownData {
  projectId: string;
  month: string;
  dailyBreakdown: {
    date: string;
    category: string;
    amount: number;
    description: string;
    approvalStatus: 'approved' | 'pending' | 'rejected';
  }[];
}

// Gap 분석
export interface GapAnalysis {
  month: number;
  businessProfit: number; // 사업수지 (손익)
  cashFlow: number; // 자금수지 (현금)
  gap: number; // Gap = 손익 - 현금
  causes: {
    receivableGap: number; // 미수채권
    prepaymentGap: number; // 선급 지급
    retentionAmount: number; // 유보금
  };
  catchupPlan: {
    action: string;
    expectedImpact: number;
    priority: 'high' | 'medium' | 'low';
  }[];
}

// 시뮬레이션 결과
export interface SimulationResult {
  project: Project;
  assumptions: ProjectAssumptions;
  cashFlowData: CashFlowData[];
  financialMetrics: FinancialMetrics;
  risks: Risk[];
  gapAnalysis: GapAnalysis[];
}
