import { PrismaClient, ProjectType, ProjectStatus, PipelineStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 확장 시드 데이터 생성 중...');

  // 기존 PM 가져오기
  const pm = await prisma.user.findFirst({ where: { role: 'PM' } });
  if (!pm) throw new Error('PM 사용자를 찾을 수 없습니다');

  // 기존 프로젝트 20개 생성
  const existingProjects = [
    { code: 'RE-2024-001', name: '강동 오피스텔 A동', type: ProjectType.REAL_ESTATE, client: '롯데건설', price: 850, period: 14, progress: 95.2, status: ProjectStatus.ACTIVE, startDate: '2024-01-15' },
    { code: 'RE-2024-002', name: '송파 주상복합 B동', type: ProjectType.REAL_ESTATE, client: 'GS건설', price: 1200, period: 18, progress: 88.5, status: ProjectStatus.ACTIVE, startDate: '2024-02-01' },
    { code: 'SC-2024-003', name: '용산 재개발 1차', type: ProjectType.SIMPLE_CONTRACT, client: '대림건설', price: 950, period: 12, progress: 100, status: ProjectStatus.COMPLETED, startDate: '2024-01-10' },
    { code: 'IN-2024-004', name: '경부고속도로 확장', type: ProjectType.INFRA, client: '한국도로공사', price: 1500, period: 24, progress: 78.3, status: ProjectStatus.ACTIVE, startDate: '2024-03-01' },
    { code: 'EN-2024-005', name: '서울 스마트그리드 1구역', type: ProjectType.ENERGY, client: '한국전력공사', price: 680, period: 15, progress: 82.1, status: ProjectStatus.ACTIVE, startDate: '2024-04-15' },
    { code: 'RE-2024-006', name: '성남 분당 상가주택', type: ProjectType.REAL_ESTATE, client: '포스코건설', price: 720, period: 12, progress: 100, status: ProjectStatus.COMPLETED, startDate: '2024-02-20' },
    { code: 'SC-2024-007', name: '인천공항 제2터미널 내장', type: ProjectType.SIMPLE_CONTRACT, client: '인천공항공사', price: 580, period: 10, progress: 92.7, status: ProjectStatus.ACTIVE, startDate: '2024-05-01' },
    { code: 'IN-2024-008', name: '부산 지하철 연장선', type: ProjectType.INFRA, client: '부산교통공사', price: 2100, period: 36, progress: 45.8, status: ProjectStatus.ACTIVE, startDate: '2024-01-01' },
    { code: 'RE-2024-009', name: '광교 신도시 아파트', type: ProjectType.REAL_ESTATE, client: '현대건설', price: 1850, period: 20, progress: 65.3, status: ProjectStatus.ACTIVE, startDate: '2024-06-01' },
    { code: 'SC-2024-010', name: '세종청사 리모델링', type: ProjectType.SIMPLE_CONTRACT, client: '조달청', price: 450, period: 8, progress: 100, status: ProjectStatus.COMPLETED, startDate: '2024-03-15' },
    { code: 'EN-2024-011', name: '제주 풍력발전단지', type: ProjectType.ENERGY, client: '한국남동발전', price: 920, period: 18, progress: 55.2, status: ProjectStatus.ACTIVE, startDate: '2024-07-01' },
    { code: 'RE-2024-012', name: '천안 물류센터', type: ProjectType.REAL_ESTATE, client: 'CJ대한통운', price: 650, period: 12, progress: 73.8, status: ProjectStatus.ACTIVE, startDate: '2024-08-01' },
    { code: 'IN-2024-013', name: '평택항 확장공사', type: ProjectType.INFRA, client: '평택항만공사', price: 1750, period: 30, progress: 38.5, status: ProjectStatus.ACTIVE, startDate: '2024-04-01' },
    { code: 'SC-2024-014', name: '여의도 빌딩 증축', type: ProjectType.SIMPLE_CONTRACT, client: '한화건설', price: 380, period: 9, progress: 87.3, status: ProjectStatus.ACTIVE, startDate: '2024-09-01' },
    { code: 'RE-2024-015', name: '김포 한강신도시', type: ProjectType.REAL_ESTATE, client: '삼성물산', price: 2300, period: 24, progress: 42.1, status: ProjectStatus.ACTIVE, startDate: '2024-05-15' },
    { code: 'EN-2024-016', name: '울산 태양광발전소', type: ProjectType.ENERGY, client: '한국수력원자력', price: 550, period: 12, progress: 68.9, status: ProjectStatus.ACTIVE, startDate: '2024-10-01' },
    { code: 'IN-2024-017', name: 'GTX-A 노선 토목', type: ProjectType.INFRA, client: '국토교통부', price: 3200, period: 48, progress: 28.7, status: ProjectStatus.ACTIVE, startDate: '2024-02-01' },
    { code: 'SC-2024-018', name: '판교 테크노밸리 증축', type: ProjectType.SIMPLE_CONTRACT, client: '경기도시공사', price: 480, period: 10, progress: 100, status: ProjectStatus.COMPLETED, startDate: '2024-06-15' },
    { code: 'RE-2024-019', name: '동탄2 신도시 상업시설', type: ProjectType.REAL_ESTATE, client: '롯데건설', price: 890, period: 16, progress: 58.4, status: ProjectStatus.ACTIVE, startDate: '2024-11-01' },
    { code: 'EN-2024-020', name: '강릉 수소충전소', type: ProjectType.ENERGY, client: '현대자동차', price: 280, period: 6, progress: 95.8, status: ProjectStatus.ACTIVE, startDate: '2024-12-01' },
  ];

  for (const proj of existingProjects) {
    const startDate = new Date(proj.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + proj.period);

    await prisma.project.create({
      data: {
        projectCode: proj.code,
        projectName: proj.name,
        projectType: proj.type,
        client: proj.client,
        contractPrice: proj.price,
        contractDate: new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 착공 1개월 전 계약
        startDate,
        endDate,
        constructionPeriod: proj.period,
        status: proj.status,
        progressRate: proj.progress,
        createdBy: pm.id,
      },
    });

    // 프로젝트 가정 추가
    await prisma.projectAssumption.create({
      data: {
        projectId: (await prisma.project.findUnique({ where: { projectCode: proj.code } }))!.id,
        profitMargin: proj.type === ProjectType.REAL_ESTATE ? 0.15 : proj.type === ProjectType.INFRA ? 0.12 : 0.13,
        costRatio: proj.type === ProjectType.REAL_ESTATE ? 0.85 : proj.type === ProjectType.INFRA ? 0.88 : 0.87,
        periodInvoicing: proj.type === ProjectType.INFRA ? 2 : 3,
        periodReceivable: 2,
        retentionRate: 0.05,
        retentionPeriod: 6,
        payMSubcon: 1,
        payMMaterial: 1,
        curveType: 's_curve_normal',
        effectiveFrom: startDate,
      },
    });
  }

  console.log('✅ 기존 프로젝트 20개 생성 완료');

  // 신규 수주 파이프라인 10개 생성
  const newPipelines = [
    { code: 'PIP-2026-001', name: '하남 스타필드 확장', client: '신세계건설', type: ProjectType.REAL_ESTATE, amount: 1250, period: 16, prob: 80, status: PipelineStatus.BIDDING, bidDate: '2026-01-15', decDate: '2026-02-28' },
    { code: 'PIP-2026-002', name: '인천 청라 커넬워크', type: ProjectType.REAL_ESTATE, client: '대우건설', amount: 980, period: 14, prob: 65, status: PipelineStatus.NEGOTIATING, bidDate: '2026-02-01', decDate: '2026-03-15' },
    { code: 'PIP-2026-003', name: '고속도로 휴게소 증축', client: '한국도로공사', type: ProjectType.SIMPLE_CONTRACT, amount: 320, period: 8, prob: 75, status: PipelineStatus.BIDDING, bidDate: '2026-01-20', decDate: '2026-02-20' },
    { code: 'PIP-2026-004', name: '수원 광교 복합쇼핑몰', client: '롯데건설', type: ProjectType.REAL_ESTATE, amount: 1580, period: 18, prob: 55, status: PipelineStatus.PROSPECTING, bidDate: '2026-03-01', decDate: '2026-04-30' },
    { code: 'PIP-2026-005', name: '김해공항 연결도로', client: '부산시청', type: ProjectType.INFRA, amount: 780, period: 20, prob: 70, status: PipelineStatus.BIDDING, bidDate: '2026-02-10', decDate: '2026-03-25' },
    { code: 'PIP-2026-006', name: '대전 둔산동 재개발', client: '대전도시공사', type: ProjectType.REAL_ESTATE, amount: 1420, period: 22, prob: 60, status: PipelineStatus.NEGOTIATING, bidDate: '2026-01-25', decDate: '2026-03-10' },
    { code: 'PIP-2026-007', name: '서울 지하공동구', client: '서울시청', type: ProjectType.INFRA, amount: 2100, period: 36, prob: 50, status: PipelineStatus.PROSPECTING, bidDate: '2026-04-01', decDate: '2026-06-30' },
    { code: 'PIP-2026-008', name: '제주 신재생에너지단지', client: '제주에너지공사', type: ProjectType.ENERGY, amount: 890, period: 15, prob: 68, status: PipelineStatus.BIDDING, bidDate: '2026-02-15', decDate: '2026-03-31' },
    { code: 'PIP-2026-009', name: '광주 첨단산업단지', client: '광주광역시', type: ProjectType.SIMPLE_CONTRACT, amount: 650, period: 12, prob: 72, status: PipelineStatus.NEGOTIATING, bidDate: '2026-01-30', decDate: '2026-03-05' },
    { code: 'PIP-2026-010', name: '울산 석유화학단지 확장', client: 'SK건설', type: ProjectType.INFRA, amount: 1750, period: 28, prob: 58, status: PipelineStatus.PROSPECTING, bidDate: '2026-03-15', decDate: '2026-05-15' },
  ];

  for (const pip of newPipelines) {
    await prisma.projectPipeline.create({
      data: {
        pipelineCode: pip.code,
        projectName: pip.name,
        client: pip.client,
        projectType: pip.type,
        estimatedAmount: pip.amount,
        constructionPeriod: pip.period,
        biddingDate: new Date(pip.bidDate),
        decisionDate: new Date(pip.decDate),
        winProbability: pip.prob,
        status: pip.status,
      },
    });
  }

  console.log('✅ 신규 수주 파이프라인 10개 생성 완료');
  console.log('🎉 확장 시드 데이터 생성 완료! (기존 프로젝트 20개 + 신규 파이프라인 10개)');
}

main()
  .catch((e) => {
    console.error('❌ 확장 시드 데이터 생성 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
