import { prisma } from '@/lib/prisma';
import { AgentType, AgentStatus, TaskStatus } from '@prisma/client';

export interface AgentConfig {
  name: string;
  type: AgentType;
  interval?: number; // milliseconds
  enabled?: boolean;
}

export interface AgentTask {
  id?: string;
  taskType: string;
  priority?: number;
  projectId?: string;
  payload: any;
}

export abstract class AgentBase {
  protected name: string;
  protected type: AgentType;
  protected interval: number;
  protected enabled: boolean;
  protected isRunning: boolean = false;
  protected intervalId?: NodeJS.Timeout;

  constructor(config: AgentConfig) {
    this.name = config.name;
    this.type = config.type;
    this.interval = config.interval || 60000; // default 1 minute
    this.enabled = config.enabled !== false;
  }

  // 에이전트 시작
  async start() {
    if (!this.enabled || this.isRunning) return;

    this.isRunning = true;
    console.log(`[${this.name}] Agent started`);

    // 즉시 첫 실행
    await this.executeTask();

    // 주기적 실행
    this.intervalId = setInterval(async () => {
      await this.executeTask();
    }, this.interval);
  }

  // 에이전트 중지
  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    console.log(`[${this.name}] Agent stopped`);
  }

  // 작업 실행 (템플릿 메서드)
  private async executeTask() {
    const startTime = Date.now();
    let status: AgentStatus = AgentStatus.SUCCESS;
    let output: any = null;
    let errorMsg: string | undefined;

    try {
      // 하위 클래스에서 구현
      output = await this.run();
      status = AgentStatus.SUCCESS;
    } catch (error: any) {
      status = AgentStatus.FAILED;
      errorMsg = error.message;
      console.error(`[${this.name}] Error:`, error);
    } finally {
      const duration = Date.now() - startTime;

      // 로그 저장
      await this.log({
        action: 'run',
        status,
        output,
        duration,
        errorMsg,
      });
    }
  }

  // 추상 메서드: 하위 클래스에서 구현 필요
  protected abstract run(): Promise<any>;

  // 로그 기록
  protected async log(data: {
    action: string;
    status: AgentStatus;
    input?: any;
    output?: any;
    duration?: number;
    errorMsg?: string;
  }) {
    try {
      await prisma.agentLog.create({
        data: {
          agentName: this.name,
          agentType: this.type,
          action: data.action,
          status: data.status,
          input: data.input || null,
          output: data.output || null,
          duration: data.duration,
          errorMsg: data.errorMsg,
        },
      });
    } catch (error) {
      console.error(`[${this.name}] Failed to log:`, error);
    }
  }

  // 작업 생성
  protected async createTask(task: AgentTask) {
    return await prisma.agentTask.create({
      data: {
        agentName: this.name,
        agentType: this.type,
        taskType: task.taskType,
        priority: task.priority || 5,
        status: TaskStatus.PENDING,
        projectId: task.projectId,
        payload: task.payload,
      },
    });
  }

  // 대기 중인 작업 가져오기
  protected async getPendingTasks(limit: number = 10) {
    return await prisma.agentTask.findMany({
      where: {
        agentName: this.name,
        status: TaskStatus.PENDING,
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'asc' },
      ],
      take: limit,
    });
  }

  // 작업 상태 업데이트
  protected async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    result?: any
  ) {
    const updateData: any = { status };

    if (status === TaskStatus.RUNNING) {
      updateData.startedAt = new Date();
    } else if (status === TaskStatus.COMPLETED || status === TaskStatus.FAILED) {
      updateData.completedAt = new Date();
      if (result) {
        updateData.result = result;
      }
    }

    return await prisma.agentTask.update({
      where: { id: taskId },
      data: updateData,
    });
  }

  // 다른 에이전트에게 메시지 전송
  protected async sendMessageToAgent(
    targetAgentName: string,
    taskType: string,
    payload: any,
    priority: number = 5
  ) {
    // 타겟 에이전트의 타입을 추론 (실제로는 레지스트리에서 가져와야 함)
    const agentTypeMap: Record<string, AgentType> = {
      'FinancialAnalyst': AgentType.FINANCIAL_ANALYST,
      'RiskManager': AgentType.RISK_MANAGER,
      'ScheduleOptimizer': AgentType.SCHEDULE_OPTIMIZER,
      'DataCollector': AgentType.DATA_COLLECTOR,
      'PatternRecognition': AgentType.PATTERN_RECOGNITION,
      'Coordinator': AgentType.COORDINATOR,
      'ReportGenerator': AgentType.REPORT_GENERATOR,
    };

    const targetType = agentTypeMap[targetAgentName] || AgentType.COORDINATOR;

    return await prisma.agentTask.create({
      data: {
        agentName: targetAgentName,
        agentType: targetType,
        taskType,
        priority,
        status: TaskStatus.PENDING,
        payload,
      },
    });
  }

  // Getter
  getName() {
    return this.name;
  }

  getType() {
    return this.type;
  }

  getStatus() {
    return this.isRunning ? AgentStatus.RUNNING : AgentStatus.IDLE;
  }
}
