/**
 * 시스템 전체 초연결(Hyperconnectivity) 네비게이션 유틸리티
 */

export interface NavigationLink {
  path: string;
  label: string;
  description?: string;
}

/**
 * 프로젝트 상세 페이지 네비게이션
 */
export const goToProjectDetail = (projectId: string, view?: 'overview' | 'forecast') => {
  const url = `/projects/${projectId}${view ? `?view=${view}` : ''}`;
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
  return url;
};

/**
 * 프로젝트 재무 시뮬레이션으로 이동
 */
export const goToProjectForecast = (projectId: string) => {
  return goToProjectDetail(projectId, 'forecast');
};

/**
 * KPI 클릭 시 관련 페이지로 이동
 */
export const kpiNavigationMap: Record<string, string> = {
  revenue: '/finance/forecast',
  profit: '/finance/accounting',
  margin: '/analysis/performance',
  risk: '/analysis/simulation',
  cashFlow: '/finance/accounting',
  npv: '/finance/forecast',
  irr: '/finance/forecast',
  roi: '/analysis/performance',
};

export const navigateToKPI = (kpiType: string) => {
  const path = kpiNavigationMap[kpiType] || '/';
  if (typeof window !== 'undefined') {
    window.location.href = path;
  }
  return path;
};

/**
 * 분석 페이지 네비게이션
 */
export const analysisNavigationMap = {
  performance: '/analysis/performance',
  simulation: '/analysis/simulation',
};

/**
 * 재무 페이지 네비게이션
 */
export const financeNavigationMap = {
  accounting: '/finance/accounting',
  forecast: '/finance/forecast',
  simulation: '/finance/simulation',
};

/**
 * AI 시스템 네비게이션
 */
export const aiNavigationMap = {
  chatbot: '/ai/chatbot',
  agents: '/agents',
  monitor: '/agents/monitor',
  knowledgeGraph: '/ai/knowledge-graph',
};

/**
 * 온톨로지 네비게이션
 */
export const ontologyNavigationMap = {
  viewer: '/ontology',
  builder: '/ontology/builder',
  projects: '/ontology/projects',
  datasets: '/ontology/datasets',
  etl: '/ontology/etl',
};

/**
 * 범용 네비게이션 함수
 */
export const navigateTo = (path: string) => {
  if (typeof window !== 'undefined') {
    window.location.href = path;
  }
  return path;
};

/**
 * 뒤로 가기
 */
export const goBack = () => {
  if (typeof window !== 'undefined') {
    window.history.back();
  }
};

/**
 * 프로젝트 이름으로 검색하여 상세 페이지로 이동
 */
export const searchAndNavigateToProject = async (projectName: string, view?: 'overview' | 'forecast') => {
  try {
    const res = await fetch(`/api/projects`);
    const projects = await res.json();
    const matchedProject = projects.find((p: any) =>
      p.projectName.toLowerCase().includes(projectName.toLowerCase())
    );

    if (matchedProject) {
      return goToProjectDetail(matchedProject.id, view);
    }
  } catch (error) {
    console.error('프로젝트 검색 실패:', error);
  }
  return null;
};

/**
 * 차트 클릭 시 상세 페이지로 드릴다운
 */
export const drillDownNavigation = {
  // 매출 차트 클릭 → 재무 전망
  revenueChart: (projectId?: string) => projectId ? goToProjectForecast(projectId) : '/finance/forecast',

  // 비용 차트 클릭 → 회계
  costChart: (projectId?: string) => projectId ? goToProjectDetail(projectId, 'forecast') : '/finance/accounting',

  // 진행률 차트 클릭 → 프로젝트 상세
  progressChart: (projectId: string) => goToProjectDetail(projectId),

  // 현금흐름 차트 클릭 → 프로젝트 재무
  cashFlowChart: (projectId: string) => goToProjectForecast(projectId),

  // 리스크 차트 클릭 → 시뮬레이션
  riskChart: (projectId?: string) => '/analysis/simulation',
};

/**
 * 테이블 행 클릭 핸들러
 */
export const createTableRowClickHandler = (
  type: 'project' | 'transaction' | 'forecast',
  id: string,
  additionalParams?: Record<string, string>
) => {
  return () => {
    let path = '';
    switch (type) {
      case 'project':
        path = goToProjectDetail(id, additionalParams?.view as 'overview' | 'forecast');
        break;
      case 'transaction':
        path = `/finance/accounting?transaction=${id}`;
        break;
      case 'forecast':
        path = `/finance/forecast?project=${id}`;
        break;
    }
    navigateTo(path);
  };
};

/**
 * 버튼 액션 네비게이션
 */
export const buttonNavigationMap = {
  // 시뮬레이션 실행 후 이동
  simulationRun: (projectId?: string) => projectId ? goToProjectForecast(projectId) : '/analysis/simulation',

  // 온톨로지 생성 후 이동
  ontologyGenerate: (projectId: string) => `/ontology?project=${projectId}`,

  // AI 분석 실행 후 이동
  aiAnalyze: (projectId: string) => `/ai/chatbot?project=${projectId}`,

  // 리포트 생성 후 이동
  reportGenerate: (projectId: string) => goToProjectDetail(projectId),
};

/**
 * 알림 클릭 시 관련 페이지로 이동
 */
export const navigateFromNotification = (notification: {
  projectId?: string;
  category?: string;
  severity?: string;
}) => {
  const { projectId, category } = notification;

  if (projectId) {
    if (category === 'FINANCE') {
      return goToProjectForecast(projectId);
    } else if (category === 'RISK') {
      return navigateTo(`/analysis/simulation?project=${projectId}`);
    } else {
      return goToProjectDetail(projectId);
    }
  }

  // 프로젝트 ID가 없는 경우 카테고리별 페이지로
  switch (category) {
    case 'FINANCE':
      return navigateTo('/finance/accounting');
    case 'RISK':
      return navigateTo('/analysis/simulation');
    case 'AI':
      return navigateTo('/ai/chatbot');
    default:
      return navigateTo('/');
  }
};
