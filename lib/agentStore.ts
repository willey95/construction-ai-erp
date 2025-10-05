import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface AgentInfo {
  id?: string;
  name: string;
  displayName?: string;
  description?: string;
  capabilities?: string[];
  type: string;
  status: 'RUNNING' | 'IDLE' | 'ERROR' | 'ACTIVE' | 'INACTIVE';
  lastRun?: string;
  successRate?: number | string;
  totalRuns?: number;
  config?: any;
}

export interface AgentLog {
  id: string;
  agentName: string;
  agentType: string;
  action: string;
  status: string;
  timestamp: string;
  duration?: number;
  errorMsg?: string;
}

export interface AgentTask {
  id: string;
  agentName: string;
  agentType: string;
  taskType: string;
  priority: number;
  status: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AgentMessage {
  from: string;
  to: string;
  type: string;
  payload: any;
  timestamp: number;
}

interface AgentState {
  // 에이전트 정보
  agents: AgentInfo[];
  selectedAgent: string | null;

  // 로그 및 작업
  logs: AgentLog[];
  tasks: AgentTask[];

  // 실시간 메시지
  messages: AgentMessage[];

  // 통계
  stats: {
    totalOperations: number;
    successRate: number;
    activeAgents: number;
    pendingTasks: number;
  };

  // 액션
  setAgents: (agents: AgentInfo[]) => void;
  updateAgentStatus: (name: string, status: 'RUNNING' | 'IDLE' | 'ERROR') => void;
  selectAgent: (name: string | null) => void;

  setLogs: (logs: AgentLog[]) => void;
  addLog: (log: AgentLog) => void;

  setTasks: (tasks: AgentTask[]) => void;
  addTask: (task: AgentTask) => void;
  updateTaskStatus: (id: string, status: string) => void;

  addMessage: (message: AgentMessage) => void;
  clearMessages: () => void;

  updateStats: (stats: Partial<AgentState['stats']>) => void;

  // API 호출
  fetchAgents: () => Promise<void>;
  fetchLogs: (limit?: number) => Promise<void>;
  fetchTasks: (status?: string) => Promise<void>;

  startAgent: (name: string) => Promise<void>;
  stopAgent: (name: string) => Promise<void>;
}

export const useAgentStore = create<AgentState>()(
  subscribeWithSelector((set, get) => ({
    // 초기 상태
    agents: [],
    selectedAgent: null,
    logs: [],
    tasks: [],
    messages: [],
    stats: {
      totalOperations: 0,
      successRate: 0,
      activeAgents: 0,
      pendingTasks: 0,
    },

    // 에이전트 관리
    setAgents: (agents) => set({ agents }),

    updateAgentStatus: (name, status) =>
      set((state) => ({
        agents: state.agents.map((agent) =>
          agent.name === name ? { ...agent, status } : agent
        ),
      })),

    selectAgent: (name) => set({ selectedAgent: name }),

    // 로그 관리
    setLogs: (logs) => set({ logs }),

    addLog: (log) =>
      set((state) => ({
        logs: [log, ...state.logs].slice(0, 1000), // 최근 1000개만 유지
      })),

    // 작업 관리
    setTasks: (tasks) => set({ tasks }),

    addTask: (task) =>
      set((state) => ({
        tasks: [task, ...state.tasks],
      })),

    updateTaskStatus: (id, status) =>
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, status } : task
        ),
      })),

    // 메시지 관리
    addMessage: (message) =>
      set((state) => ({
        messages: [...state.messages.slice(-99), message], // 최근 100개
      })),

    clearMessages: () => set({ messages: [] }),

    // 통계 업데이트
    updateStats: (stats) =>
      set((state) => ({
        stats: { ...state.stats, ...stats },
      })),

    // API 호출
    fetchAgents: async () => {
      try {
        const res = await fetch('/api/agents');
        const data = await res.json();
        set({ agents: data.agents || [] });
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      }
    },

    fetchLogs: async (limit = 100) => {
      try {
        const res = await fetch(`/api/agents/logs?limit=${limit}`);
        const data = await res.json();
        set({ logs: data.logs || [] });
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
    },

    fetchTasks: async (status) => {
      try {
        const url = status
          ? `/api/agents/tasks?status=${status}`
          : '/api/agents/tasks';
        const res = await fetch(url);
        const data = await res.json();
        set({ tasks: data.tasks || [] });
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    },

    startAgent: async (name) => {
      try {
        const res = await fetch(`/api/agents/${name}/start`, {
          method: 'POST',
        });
        if (res.ok) {
          get().updateAgentStatus(name, 'RUNNING');
        }
      } catch (error) {
        console.error(`Failed to start agent ${name}:`, error);
      }
    },

    stopAgent: async (name) => {
      try {
        const res = await fetch(`/api/agents/${name}/stop`, {
          method: 'POST',
        });
        if (res.ok) {
          get().updateAgentStatus(name, 'IDLE');
        }
      } catch (error) {
        console.error(`Failed to stop agent ${name}:`, error);
      }
    },
  }))
);

// 실시간 업데이트를 위한 구독
if (typeof window !== 'undefined') {
  setInterval(() => {
    const store = useAgentStore.getState();
    store.fetchAgents();
    store.fetchLogs(50);
    store.fetchTasks('PENDING');
  }, 10000); // 10초마다 업데이트
}
