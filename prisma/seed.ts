import { PrismaClient, ProjectType, ProjectStatus, UserRole, CompanyType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성 중...');

  // 1. 사용자 생성
  const admin = await prisma.user.upsert({
    where: { email: 'admin@construction-erp.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@construction-erp.com',
      passwordHash: '$2a$10$X5vZBKQ3EXAMPLE', // 실제로는 bcrypt 해시
      fullName: '관리자',
      department: 'IT',
      position: '시스템 관리자',
      role: UserRole.ADMIN,
    },
  });

  const cfo = await prisma.user.upsert({
    where: { email: 'cfo@construction-erp.com' },
    update: {},
    create: {
      username: 'cfo',
      email: 'cfo@construction-erp.com',
      passwordHash: '$2a$10$X5vZBKQ3EXAMPLE',
      fullName: '김재무',
      department: '재무팀',
      position: 'CFO',
      role: UserRole.CFO,
    },
  });

  const pm = await prisma.user.upsert({
    where: { email: 'pm@construction-erp.com' },
    update: {},
    create: {
      username: 'pm1',
      email: 'pm@construction-erp.com',
      passwordHash: '$2a$10$X5vZBKQ3EXAMPLE',
      fullName: '이현장',
      department: '프로젝트팀',
      position: 'PM',
      role: UserRole.PM,
    },
  });

  console.log('✅ 사용자 생성 완료');

  // 2. 거래처 생성
  const client1 = await prisma.company.create({
    data: {
      companyCode: 'CLI-001',
      companyName: '삼성건설',
      companyType: CompanyType.CLIENT,
      businessNumber: '123-45-67890',
      representative: '홍길동',
      address: '서울시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      email: 'contact@samsung-const.co.kr',
      creditRating: 'AAA',
      paymentTerms: 60,
    },
  });

  const client2 = await prisma.company.create({
    data: {
      companyCode: 'CLI-002',
      companyName: '현대건설',
      companyType: CompanyType.CLIENT,
      businessNumber: '234-56-78901',
      representative: '김현대',
      address: '서울시 서초구 반포대로 123',
      phone: '02-2345-6789',
      email: 'contact@hyundai-const.co.kr',
      creditRating: 'AAA',
      paymentTerms: 60,
    },
  });

  const subcontractor1 = await prisma.company.create({
    data: {
      companyCode: 'SUB-001',
      companyName: '대한하도급',
      companyType: CompanyType.SUBCONTRACTOR,
      businessNumber: '345-67-89012',
      representative: '박하도',
      address: '경기도 성남시 분당구 판교역로 123',
      phone: '031-1234-5678',
      creditRating: 'AA',
      paymentTerms: 30,
    },
  });

  console.log('✅ 거래처 생성 완료');

  // 3. 프로젝트 생성
  const project1 = await prisma.project.create({
    data: {
      projectCode: 'RE-2025-001',
      projectName: '강남 오피스텔 신축',
      projectType: ProjectType.REAL_ESTATE,
      client: '삼성건설',
      contractPrice: 1000,
      contractDate: new Date('2025-01-15'),
      startDate: new Date('2025-02-01'),
      endDate: new Date('2026-01-31'),
      constructionPeriod: 12,
      status: ProjectStatus.ACTIVE,
      progressRate: 35.5,
      createdBy: pm.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      projectCode: 'SC-2025-002',
      projectName: '서초 주상복합',
      projectType: ProjectType.SIMPLE_CONTRACT,
      client: '현대건설',
      contractPrice: 850,
      contractDate: new Date('2025-02-01'),
      startDate: new Date('2025-03-01'),
      endDate: new Date('2026-02-28'),
      constructionPeriod: 12,
      status: ProjectStatus.ACTIVE,
      progressRate: 28.3,
      createdBy: pm.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      projectCode: 'IN-2025-003',
      projectName: '판교 테크노밸리 도로 확장',
      projectType: ProjectType.INFRA,
      client: '한국도로공사',
      contractPrice: 650,
      contractDate: new Date('2024-12-01'),
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      constructionPeriod: 12,
      status: ProjectStatus.ACTIVE,
      progressRate: 45.2,
      createdBy: pm.id,
    },
  });

  console.log('✅ 프로젝트 생성 완료');

  // 4. 프로젝트 가정 생성
  await prisma.projectAssumption.create({
    data: {
      projectId: project1.id,
      profitMargin: 0.15,
      costRatio: 0.85,
      periodInvoicing: 3,
      periodReceivable: 2,
      retentionRate: 0.05,
      retentionPeriod: 6,
      payMSubcon: 1,
      payMMaterial: 1,
      curveType: 's_curve_normal',
      effectiveFrom: new Date('2025-02-01'),
    },
  });

  await prisma.projectAssumption.create({
    data: {
      projectId: project2.id,
      profitMargin: 0.15,
      costRatio: 0.85,
      periodInvoicing: 3,
      periodReceivable: 2,
      retentionRate: 0.05,
      retentionPeriod: 6,
      payMSubcon: 1,
      payMMaterial: 1,
      curveType: 's_curve_normal',
      effectiveFrom: new Date('2025-03-01'),
    },
  });

  await prisma.projectAssumption.create({
    data: {
      projectId: project3.id,
      profitMargin: 0.12,
      costRatio: 0.88,
      periodInvoicing: 2,
      periodReceivable: 1,
      retentionRate: 0.05,
      retentionPeriod: 6,
      payMSubcon: 1,
      payMMaterial: 1,
      curveType: 's_curve_normal',
      effectiveFrom: new Date('2025-01-01'),
    },
  });

  console.log('✅ 프로젝트 가정 생성 완료');

  // 5. 수주 파이프라인 생성
  await prisma.projectPipeline.createMany({
    data: [
      {
        pipelineCode: 'PIP-2025-001',
        projectName: '송파 주거복합',
        client: 'GS건설',
        projectType: ProjectType.REAL_ESTATE,
        estimatedAmount: 1850,
        constructionPeriod: 18,
        biddingDate: new Date('2025-11-01'),
        decisionDate: new Date('2025-12-15'),
        winProbability: 75,
        status: 'BIDDING' as any,
      },
      {
        pipelineCode: 'PIP-2025-002',
        projectName: '인천공항 연결도로',
        client: '한국공항공사',
        projectType: ProjectType.INFRA,
        estimatedAmount: 950,
        constructionPeriod: 15,
        biddingDate: new Date('2025-10-20'),
        decisionDate: new Date('2025-11-30'),
        winProbability: 60,
        status: 'NEGOTIATING' as any,
      },
      {
        pipelineCode: 'PIP-2025-003',
        projectName: '세종 스마트시티 전력망',
        client: '한국전력공사',
        projectType: ProjectType.ENERGY,
        estimatedAmount: 780,
        constructionPeriod: 12,
        biddingDate: new Date('2025-12-01'),
        decisionDate: new Date('2026-01-15'),
        winProbability: 45,
        status: 'PROSPECTING' as any,
      },
    ],
  });

  console.log('✅ 수주 파이프라인 생성 완료');

  console.log('🎉 시드 데이터 생성 완료!');
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
