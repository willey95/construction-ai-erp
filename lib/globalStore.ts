import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// 전역 데이터 타입 정의
export interface Project {
  id: string;
  projectCode: string;
  projectName: string;
  projectType: string;
  client: string;
  contractPrice: number;
  progressRate: number;
  status: string;
  startDate: string;
  endDate: string;
  // 관계 데이터
  financialMetrics?: {
    npv: number;
    irr: number;
    roi: number;
    margin: number;
  };
  riskScore?: number;
  aiInsights?: AIInsight[];
}

export interface AIInsight {
  id: string;
  projectId: string;
  type: 'risk' | 'opportunity' | 'pattern';
  severity: 'low' | 'medium' | 'high';
  message: string;
  probability: number;
  impact: number;
  timestamp: string;
}

export interface DataConnection {
  from: string;
  to: string;
  type: string;
  strength: 'weak' | 'medium' | 'strong';
  data?: any;
}

interface GlobalState {
  // 데이터
  projects: Project[];
  aiInsights: AIInsight[];
  dataConnections: DataConnection[];

  // 실시간 지표
  realtimeMetrics: {
    totalRevenue: number;
    totalProfit: number;
    avgMargin: number;
    activeProjects: number;
    riskProjects: number;
    cashFlow: number;
    timestamp: number;
  };

  // 선택된 항목들 (초연결)
  selectedProjectId: string | null;
  selectedInsightId: string | null;
  hoveredProjectId: string | null;

  // 필터
  globalFilters: {
    dateRange?: [string, string];
    projectType?: string;
    status?: string;
    minMargin?: number;
  };

  // 데이터 흐름 추적
  dataFlowHistory: {
    timestamp: number;
    source: string;
    target: string;
    action: string;
    data: any;
  }[];

  // 액션
  setProjects: (projects: Project[]) => void;
  setAIInsights: (insights: AIInsight[]) => void;
  addDataConnection: (connection: DataConnection) => void;
  selectProject: (projectId: string | null) => void;
  selectInsight: (insightId: string | null) => void;
  hoverProject: (projectId: string | null) => void;
  updateRealtimeMetrics: () => void;
  setGlobalFilters: (filters: Partial<GlobalState['globalFilters']>) => void;
  trackDataFlow: (source: string, target: string, action: string, data: any) => void;

  // 관계 분석
  getRelatedProjects: (projectId: string) => Project[];
  getProjectInsights: (projectId: string) => AIInsight[];
  getDataConnections: (entityId: string) => DataConnection[];
}

export const useGlobalStore = create<GlobalState>()(
  subscribeWithSelector((set, get) => ({
    // 초기 데이터
    projects: [],
    aiInsights: [],
    dataConnections: [],

    realtimeMetrics: {
      totalRevenue: 0,
      totalProfit: 0,
      avgMargin: 0,
      activeProjects: 0,
      riskProjects: 0,
      cashFlow: 0,
      timestamp: Date.now(),
    },

    selectedProjectId: null,
    selectedInsightId: null,
    hoveredProjectId: null,

    globalFilters: {},

    dataFlowHistory: [],

    // 액션 구현
    setProjects: (projects) => {
      set({ projects });
      get().updateRealtimeMetrics();
      get().trackDataFlow('API', 'Store', 'SET_PROJECTS', { count: projects.length });
    },

    setAIInsights: (insights) => {
      set({ aiInsights: insights });
      get().trackDataFlow('AI_ENGINE', 'Store', 'SET_INSIGHTS', { count: insights.length });
    },

    addDataConnection: (connection) => {
      set((state) => ({
        dataConnections: [...state.dataConnections, connection],
      }));
      get().trackDataFlow(connection.from, connection.to, 'ADD_CONNECTION', connection);
    },

    selectProject: (projectId) => {
      const oldId = get().selectedProjectId;
      set({ selectedProjectId: projectId });

      if (projectId) {
        // 프로젝트 선택 시 관련 인사이트 자동 로드
        const insights = get().getProjectInsights(projectId);
        get().trackDataFlow('UI', 'Store', 'SELECT_PROJECT', { projectId, insightsCount: insights.length });

        // 연결된 프로젝트들 표시
        const related = get().getRelatedProjects(projectId);
        if (related.length > 0) {
          get().trackDataFlow('Store', 'UI', 'SHOW_RELATED', { count: related.length });
        }
      }
    },

    selectInsight: (insightId) => {
      set({ selectedInsightId: insightId });
      if (insightId) {
        const insight = get().aiInsights.find(i => i.id === insightId);
        if (insight) {
          get().trackDataFlow('UI', 'Store', 'SELECT_INSIGHT', insight);
        }
      }
    },

    hoverProject: (projectId) => {
      set({ hoveredProjectId: projectId });
      if (projectId) {
        get().trackDataFlow('UI', 'Store', 'HOVER_PROJECT', { projectId });
      }
    },

    updateRealtimeMetrics: () => {
      const { projects } = get();
      const totalRevenue = projects.reduce((sum, p) => sum + p.contractPrice, 0);
      const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
      const riskProjects = projects.filter(p => (p.riskScore || 0) > 70).length;

      const totalProfit = projects.reduce((sum, p) => {
        const margin = p.financialMetrics?.margin || 0;
        return sum + (p.contractPrice * margin / 100);
      }, 0);

      const avgMargin = projects.length > 0
        ? projects.reduce((sum, p) => sum + (p.financialMetrics?.margin || 0), 0) / projects.length
        : 0;

      set({
        realtimeMetrics: {
          totalRevenue: totalRevenue / 100000000, // 억원
          totalProfit: totalProfit / 100000000,
          avgMargin,
          activeProjects,
          riskProjects,
          cashFlow: totalProfit / 100000000 * 0.3, // 간단한 추정
          timestamp: Date.now(),
        },
      });
    },

    setGlobalFilters: (filters) => {
      set((state) => ({
        globalFilters: { ...state.globalFilters, ...filters },
      }));
      get().trackDataFlow('UI', 'Store', 'UPDATE_FILTERS', filters);
    },

    trackDataFlow: (source, target, action, data) => {
      set((state) => ({
        dataFlowHistory: [
          ...state.dataFlowHistory.slice(-99), // 최근 100개만 유지
          {
            timestamp: Date.now(),
            source,
            target,
            action,
            data,
          },
        ],
      }));
    },

    // 관계 분석 함수
    getRelatedProjects: (projectId) => {
      const { projects, dataConnections } = get();
      const relatedIds = dataConnections
        .filter(conn => conn.from === projectId || conn.to === projectId)
        .map(conn => conn.from === projectId ? conn.to : conn.from);

      return projects.filter(p => relatedIds.includes(p.id));
    },

    getProjectInsights: (projectId) => {
      return get().aiInsights.filter(i => i.projectId === projectId);
    },

    getDataConnections: (entityId) => {
      return get().dataConnections.filter(
        conn => conn.from === entityId || conn.to === entityId
      );
    },
  }))
);

// 실시간 업데이트 훅
export const useRealtimeSync = () => {
  const updateMetrics = useGlobalStore(state => state.updateRealtimeMetrics);

  // 5초마다 메트릭 업데이트
  if (typeof window !== 'undefined') {
    setInterval(() => {
      updateMetrics();
    }, 5000);
  }
};

// 데이터 연결 자동 생성 헬퍼
export const autoConnectData = (projects: Project[]) => {
  const store = useGlobalStore.getState();

  // 같은 발주사 프로젝트 연결
  const clientGroups = projects.reduce((acc, project) => {
    if (!acc[project.client]) acc[project.client] = [];
    acc[project.client].push(project.id);
    return acc;
  }, {} as Record<string, string[]>);

  Object.values(clientGroups).forEach(group => {
    if (group.length > 1) {
      for (let i = 0; i < group.length - 1; i++) {
        store.addDataConnection({
          from: group[i],
          to: group[i + 1],
          type: 'same_client',
          strength: 'strong',
          data: { reason: '동일 발주사' },
        });
      }
    }
  });

  // 유사한 프로젝트 타입 연결
  const typeGroups = projects.reduce((acc, project) => {
    if (!acc[project.projectType]) acc[project.projectType] = [];
    acc[project.projectType].push(project.id);
    return acc;
  }, {} as Record<string, string[]>);

  Object.values(typeGroups).forEach(group => {
    if (group.length > 1) {
      for (let i = 0; i < group.length - 1; i++) {
        store.addDataConnection({
          from: group[i],
          to: group[i + 1],
          type: 'same_type',
          strength: 'medium',
          data: { reason: '유사 공종' },
        });
      }
    }
  });
};
