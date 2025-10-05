import { PrismaClient, AgentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🤖 ProjectRiskAgent 등록 중...');

  const agent = {
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
      scanInterval: 3600000,
      notificationEnabled: true,
      criticalAlertThreshold: 70,
    },
  };

  await prisma.agent.upsert({
    where: { name: agent.name },
    update: agent,
    create: agent,
  });

  console.log(`✅ ${agent.displayName} (${agent.name}) 등록 완료`);
}

main()
  .catch((e) => {
    console.error('❌ 에이전트 등록 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
