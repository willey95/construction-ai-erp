import { FinancialAnalystAgent } from './FinancialAnalystAgent';
import { RiskManagerAgent } from './RiskManagerAgent';
import { ScheduleOptimizerAgent } from './ScheduleOptimizerAgent';
import { DataCollectorAgent } from './DataCollectorAgent';
import { PatternRecognitionAgent } from './PatternRecognitionAgent';
import { CoordinatorAgent } from './CoordinatorAgent';
import { ReportGeneratorAgent } from './ReportGeneratorAgent';
import { OntologyManagerAgent } from './OntologyManagerAgent';
import { AgentBase } from './AgentBase';

export class AgentEngine {
  private agents: Map<string, AgentBase> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.registerAgents();
  }

  private registerAgents() {
    // 8개의 에이전트 등록 (온톨로지 에이전트 추가)
    const agents = [
      new FinancialAnalystAgent(),
      new RiskManagerAgent(),
      new ScheduleOptimizerAgent(),
      new DataCollectorAgent(),
      new PatternRecognitionAgent(),
      new CoordinatorAgent(),
      new ReportGeneratorAgent(),
      new OntologyManagerAgent(),
    ];

    agents.forEach(agent => {
      this.agents.set(agent.getName(), agent);
    });

    console.log(`[AgentEngine] Registered ${this.agents.size} agents`);
  }

  // 모든 에이전트 시작
  async startAll() {
    if (this.isInitialized) {
      console.log('[AgentEngine] Already initialized');
      return;
    }

    console.log('[AgentEngine] Starting all agents...');

    // Coordinator를 가장 먼저 시작
    const coordinator = this.agents.get('Coordinator');
    if (coordinator) {
      await coordinator.start();
      console.log('[AgentEngine] Coordinator started');
    }

    // 나머지 에이전트들 시작 (순서대로)
    const startOrder = [
      'DataCollector',       // 데이터 수집이 가장 먼저
      'OntologyManager',     // 온톨로지 관리 (데이터 수집 직후)
      'FinancialAnalyst',    // 재무 분석
      'RiskManager',         // 리스크 분석
      'ScheduleOptimizer',   // 공정 최적화
      'PatternRecognition',  // 패턴 인식
      'ReportGenerator',     // 보고서는 마지막
    ];

    for (const agentName of startOrder) {
      const agent = this.agents.get(agentName);
      if (agent) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 간격
        await agent.start();
        console.log(`[AgentEngine] ${agentName} started`);
      }
    }

    this.isInitialized = true;
    console.log('[AgentEngine] All agents started successfully');
  }

  // 모든 에이전트 중지
  stopAll() {
    console.log('[AgentEngine] Stopping all agents...');
    this.agents.forEach((agent, name) => {
      agent.stop();
      console.log(`[AgentEngine] ${name} stopped`);
    });
    this.isInitialized = false;
  }

  // 특정 에이전트 시작
  async startAgent(agentName: string) {
    const agent = this.agents.get(agentName);
    if (agent) {
      await agent.start();
      console.log(`[AgentEngine] ${agentName} started`);
      return true;
    }
    return false;
  }

  // 특정 에이전트 중지
  stopAgent(agentName: string) {
    const agent = this.agents.get(agentName);
    if (agent) {
      agent.stop();
      console.log(`[AgentEngine] ${agentName} stopped`);
      return true;
    }
    return false;
  }

  // 에이전트 상태 조회
  getAgentStatus(agentName: string) {
    const agent = this.agents.get(agentName);
    if (agent) {
      return {
        name: agent.getName(),
        type: agent.getType(),
        status: agent.getStatus(),
      };
    }
    return null;
  }

  // 모든 에이전트 상태 조회
  getAllAgentStatuses() {
    const statuses: any[] = [];
    this.agents.forEach(agent => {
      statuses.push({
        name: agent.getName(),
        type: agent.getType(),
        status: agent.getStatus(),
      });
    });
    return statuses;
  }

  // 등록된 에이전트 목록
  getAgentList() {
    return Array.from(this.agents.keys());
  }

  // 에이전트 가져오기
  getAgent(agentName: string) {
    return this.agents.get(agentName);
  }
}

// 싱글톤 인스턴스
let agentEngineInstance: AgentEngine | null = null;

export function getAgentEngine(): AgentEngine {
  if (!agentEngineInstance) {
    agentEngineInstance = new AgentEngine();
  }
  return agentEngineInstance;
}

// 서버 시작 시 에이전트 자동 시작 (선택적)
export async function initializeAgents() {
  if (typeof window === 'undefined') { // 서버 사이드에서만 실행
    const engine = getAgentEngine();
    await engine.startAll();
  }
}
