import { PrismaClient, AgentStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * AI 에이전트 시드 데이터
 * 8개의 자율 AI 에이전트를 데이터베이스에 등록합니다.
 */
async function main() {
  console.log('🤖 AI 에이전트 시드 데이터 생성 중...');

  const agents = [
    {
      name: 'FinancialAnalystAgent',
      displayName: '재무 분석 에이전트',
      description: '프로젝트 재무 상태를 분석하고, 현금흐름을 예측하며, ML 기반 이상 패턴을 감지합니다.',
      capabilities: [
        '프로젝트별 재무 상태 분석',
        '현금흐름 예측 (Linear Regression)',
        '이상 패턴 감지 (Z-Score)',
        '자동 최적화 제안',
        '포트폴리오 최적화',
        '리스크 점수 계산',
      ],
      status: AgentStatus.ACTIVE,
      config: {
        mlEnabled: true,
        predictionHorizon: 6,
        anomalyThreshold: 2.0,
        analysisInterval: 3600000, // 1시간마다
      },
    },
    {
      name: 'RiskManagerAgent',
      displayName: '리스크 관리 에이전트',
      description: '공정 지연, 비용 초과, 품질 이슈 등 프로젝트 리스크를 모니터링하고 경고합니다.',
      capabilities: [
        '공정 지연 리스크 탐지',
        '비용 초과 모니터링',
        '품질 이슈 감지',
        '리스크 점수 산정',
        '완화 전략 제안',
      ],
      status: AgentStatus.ACTIVE,
      config: {
        delayThreshold: 5,
        costOverrunThreshold: 0.1,
        riskScoreAlertLevel: 70,
        analysisInterval: 7200000, // 2시간마다
      },
    },
    {
      name: 'ScheduleOptimizerAgent',
      displayName: '공정 최적화 에이전트',
      description: '프로젝트 공정을 분석하여 Critical Path를 찾고 최적 일정을 제안합니다.',
      capabilities: [
        'Critical Path 분석',
        '공정 최적화 제안',
        '리소스 균형 조정',
        '일정 단축 방안 도출',
      ],
      status: AgentStatus.ACTIVE,
      config: {
        optimizationAlgorithm: 'critical_path_method',
        resourceLevelingEnabled: true,
        analysisInterval: 86400000, // 24시간마다
      },
    },
    {
      name: 'DataCollectorAgent',
      displayName: '데이터 수집 에이전트',
      description: '외부 API, IoT 센서, 문서 등에서 자동으로 데이터를 수집하고 동기화합니다.',
      capabilities: [
        '외부 API 데이터 수집',
        'IoT 센서 데이터 수집',
        '문서 자동 파싱',
        '데이터베이스 동기화',
      ],
      status: AgentStatus.ACTIVE,
      config: {
        sources: ['api', 'iot', 'documents'],
        syncInterval: 1800000, // 30분마다
        maxRetries: 3,
      },
    },
    {
      name: 'PatternRecognitionAgent',
      displayName: '패턴 인식 에이전트',
      description: '과거 프로젝트 데이터를 분석하여 성공/실패 패턴을 학습하고 인사이트를 제공합니다.',
      capabilities: [
        '성공 패턴 분석',
        '실패 요인 도출',
        '유사 프로젝트 매칭',
        '베스트 프랙티스 추천',
      ],
      status: AgentStatus.ACTIVE,
      config: {
        minSampleSize: 10,
        similarityThreshold: 0.75,
        learningEnabled: true,
        analysisInterval: 604800000, // 7일마다
      },
    },
    {
      name: 'CoordinatorAgent',
      displayName: '조정자 에이전트',
      description: '다른 에이전트들을 조율하고, 태스크를 분배하며, 우선순위를 관리합니다.',
      capabilities: [
        '에이전트 간 태스크 분배',
        '우선순위 관리',
        '충돌 해결',
        '워크플로우 조율',
      ],
      status: AgentStatus.ACTIVE,
      config: {
        maxConcurrentTasks: 10,
        taskPrioritization: 'weighted',
        coordinationInterval: 300000, // 5분마다
      },
    },
    {
      name: 'ReportGeneratorAgent',
      displayName: '보고서 생성 에이전트',
      description: '일일/주간/월간 리포트를 자동 생성하고, 임원진을 위한 대시보드 업데이트를 수행합니다.',
      capabilities: [
        '일일 리포트 자동 생성',
        '주간 요약 보고서',
        '월간 경영 리포트',
        'PDF/Excel 내보내기',
        '이메일 자동 발송',
      ],
      status: AgentStatus.ACTIVE,
      config: {
        dailyReportTime: '09:00',
        weeklyReportDay: 'monday',
        monthlyReportDay: 1,
        formats: ['pdf', 'excel', 'html'],
      },
    },
    {
      name: 'OntologyManagerAgent',
      displayName: '온톨로지 관리 에이전트',
      description: 'Neo4j 지식 그래프를 관리하고, ETL 작업을 수행하며, 온톨로지를 최적화합니다.',
      capabilities: [
        '자동 ETL 작업 실행',
        '중복 엔티티 탐지 및 병합',
        '관계 검증',
        'PostgreSQL ↔ Neo4j 동기화',
        '온톨로지 최적화',
      ],
      status: AgentStatus.ACTIVE,
      config: {
        etlSchedule: 'daily',
        duplicateThreshold: 0.9,
        autoMergeEnabled: false,
        syncInterval: 3600000, // 1시간마다
      },
    },
    {
      name: 'ProjectRiskAgent',
      displayName: '프로젝트 리스크 에이전트',
      description: '프로젝트별 종합 리스크를 모니터링하고 분석합니다. 안전사고, 자금수지, 미수금, 분양, 공기지연, PF 책임준공, 할인분양 등 다양한 지표를 비율 기반으로 분석하여 리스크를 감지합니다.',
      capabilities: [
        '안전사고 발생률 분석',
        '자금수지 악화 감지',
        '미수금 비율 모니터링',
        '분양률 추적',
        '공기지연 리스크 평가',
        'PF대출 책임준공 비율 검사',
        '할인분양 비율 분석',
        '종합 리스크 점수 계산',
        '실시간 알림 생성',
      ],
      status: AgentStatus.ACTIVE,
      config: {
        riskThresholds: {
          safetyIncidentRate: 0.5,
          cashFlowHealthScore: 30,
          receivableRatio: 20,
          salesRate: 60,
          scheduleDelayDays: 30,
          pfReserveRatio: 80,
        },
        scanInterval: 3600000, // 1시간마다
        notificationEnabled: true,
        criticalAlertThreshold: 70,
      },
    },
  ];

  for (const agent of agents) {
    await prisma.agent.create({
      data: {
        name: agent.name,
        displayName: agent.displayName,
        description: agent.description,
        capabilities: agent.capabilities,
        status: agent.status,
        config: agent.config,
      },
    });

    console.log(`✅ ${agent.displayName} (${agent.name}) 등록 완료`);
  }

  console.log(`\n🎉 총 ${agents.length}개의 AI 에이전트 등록 완료!`);
}

main()
  .catch((e) => {
    console.error('❌ AI 에이전트 시드 데이터 생성 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
