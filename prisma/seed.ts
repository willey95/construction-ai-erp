import { PrismaClient, ProjectType, ProjectStatus, UserRole, CompanyType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성 중...');

  // 1. 사용자 생성 (15명)
  const users = [];

  const admin = await prisma.user.upsert({
    where: { email: 'admin@construction-erp.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@construction-erp.com',
      passwordHash: '$2a$10$X5vZBKQ3EXAMPLE',
      fullName: '관리자',
      department: 'IT',
      position: '시스템 관리자',
      role: 'ADMIN' as UserRole,
    },
  });
  users.push(admin);

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
      role: 'CFO' as UserRole,
    },
  });
  users.push(cfo);

  const pmUsers = [
    { username: 'pm1', email: 'pm1@construction-erp.com', fullName: '이현장', department: '프로젝트팀', position: 'PM' },
    { username: 'pm2', email: 'pm2@construction-erp.com', fullName: '박건설', department: '프로젝트팀', position: 'PM' },
    { username: 'pm3', email: 'pm3@construction-erp.com', fullName: '최도급', department: '프로젝트팀', position: 'PM' },
    { username: 'pm4', email: 'pm4@construction-erp.com', fullName: '정시공', department: '프로젝트팀', position: 'PM' },
    { username: 'pm5', email: 'pm5@construction-erp.com', fullName: '강공사', department: '프로젝트팀', position: 'PM' },
  ];

  for (const pm of pmUsers) {
    const user = await prisma.user.upsert({
      where: { email: pm.email },
      update: {},
      create: {
        username: pm.username,
        email: pm.email,
        passwordHash: '$2a$10$X5vZBKQ3EXAMPLE',
        fullName: pm.fullName,
        department: pm.department,
        position: pm.position,
        role: 'PM' as UserRole,
      },
    });
    users.push(user);
  }

  const finance1 = await prisma.user.upsert({
    where: { email: 'finance1@construction-erp.com' },
    update: {},
    create: {
      username: 'finance1',
      email: 'finance1@construction-erp.com',
      passwordHash: '$2a$10$X5vZBKQ3EXAMPLE',
      fullName: '송회계',
      department: '재무팀',
      position: '회계사',
      role: 'ACCOUNTING' as UserRole,
    },
  });
  users.push(finance1);

  const finance2 = await prisma.user.upsert({
    where: { email: 'finance2@construction-erp.com' },
    update: {},
    create: {
      username: 'finance2',
      email: 'finance2@construction-erp.com',
      passwordHash: '$2a$10$X5vZBKQ3EXAMPLE',
      fullName: '임경리',
      department: '재무팀',
      position: '경리',
      role: 'ACCOUNTING' as UserRole,
    },
  });
  users.push(finance2);

  const safety1 = await prisma.user.upsert({
    where: { email: 'safety1@construction-erp.com' },
    update: {},
    create: {
      username: 'safety1',
      email: 'safety1@construction-erp.com',
      passwordHash: '$2a$10$X5vZBKQ3EXAMPLE',
      fullName: '안전관',
      department: '안전팀',
      position: '안전관리자',
      role: 'STAFF' as UserRole,
    },
  });
  users.push(safety1);

  const qc1 = await prisma.user.upsert({
    where: { email: 'qc1@construction-erp.com' },
    update: {},
    create: {
      username: 'qc1',
      email: 'qc1@construction-erp.com',
      passwordHash: '$2a$10$X5vZBKQ3EXAMPLE',
      fullName: '품품질',
      department: '품질팀',
      position: '품질관리자',
      role: 'STAFF' as UserRole,
    },
  });
  users.push(qc1);

  const viewer1 = await prisma.user.upsert({
    where: { email: 'viewer1@construction-erp.com' },
    update: {},
    create: {
      username: 'viewer1',
      email: 'viewer1@construction-erp.com',
      passwordHash: '$2a$10$X5vZBKQ3EXAMPLE',
      fullName: '조회자',
      department: '경영팀',
      position: '경영분석가',
      role: 'STAFF' as UserRole,
    },
  });
  users.push(viewer1);

  const ceo = await prisma.user.upsert({
    where: { email: 'ceo@construction-erp.com' },
    update: {},
    create: {
      username: 'ceo',
      email: 'ceo@construction-erp.com',
      passwordHash: '$2a$10$X5vZBKQ3EXAMPLE',
      fullName: '대표이사',
      department: '경영진',
      position: 'CEO',
      role: 'ADMIN' as UserRole,
    },
  });
  users.push(ceo);

  console.log('✅ 사용자 생성 완료 (15명)');

  // 2. 거래처 생성 (20개)
  const companies = [];

  const clientCompanies = [
    { code: 'CLI-001', name: '삼성건설', business: '123-45-67890', rep: '홍길동', addr: '서울시 강남구 테헤란로 123', phone: '02-1234-5678', email: 'contact@samsung-const.co.kr', rating: 'AAA' },
    { code: 'CLI-002', name: '현대건설', business: '234-56-78901', rep: '김현대', addr: '서울시 서초구 반포대로 123', phone: '02-2345-6789', email: 'contact@hyundai-const.co.kr', rating: 'AAA' },
    { code: 'CLI-003', name: 'GS건설', business: '345-67-89012', rep: '이지에스', addr: '서울시 종로구 종로 1', phone: '02-3456-7890', email: 'contact@gs-const.co.kr', rating: 'AAA' },
    { code: 'CLI-004', name: '대우건설', business: '456-78-90123', rep: '박대우', addr: '서울시 중구 남대문로 234', phone: '02-4567-8901', email: 'contact@daewoo-const.co.kr', rating: 'AA+' },
    { code: 'CLI-005', name: '롯데건설', business: '567-89-01234', rep: '최롯데', addr: '서울시 송파구 올림픽로 345', phone: '02-5678-9012', email: 'contact@lotte-const.co.kr', rating: 'AA+' },
    { code: 'CLI-006', name: '한국도로공사', business: '678-90-12345', rep: '정도로', addr: '경기도 성남시 분당구 판교역로 678', phone: '031-1111-2222', email: 'contact@ex.co.kr', rating: 'AAA' },
    { code: 'CLI-007', name: '한국전력공사', business: '789-01-23456', rep: '강전력', addr: '전라남도 나주시 전력로 55', phone: '061-3333-4444', email: 'contact@kepco.co.kr', rating: 'AAA' },
    { code: 'CLI-008', name: '서울특별시청', business: '890-12-34567', rep: '서울시장', addr: '서울시 중구 세종대로 110', phone: '02-7777-8888', email: 'contact@seoul.go.kr', rating: 'AAA' },
  ];

  for (const client of clientCompanies) {
    const company = await prisma.company.create({
      data: {
        companyCode: client.code,
        companyName: client.name,
        companyType: CompanyType.CLIENT,
        businessNumber: client.business,
        representative: client.rep,
        address: client.addr,
        phone: client.phone,
        email: client.email,
        creditRating: client.rating,
        paymentTerms: 60,
      },
    });
    companies.push(company);
  }

  const subcontractors = [
    { code: 'SUB-001', name: '대한하도급', business: '111-22-33444', rep: '박하도', addr: '경기도 성남시 분당구 판교역로 123', phone: '031-1234-5678', rating: 'AA' },
    { code: 'SUB-002', name: '서울전기', business: '222-33-44555', rep: '김전기', addr: '서울시 금천구 가산디지털로 234', phone: '02-2222-3333', rating: 'AA-' },
    { code: 'SUB-003', name: '경기배관', business: '333-44-55666', rep: '이배관', addr: '경기도 안양시 동안구 평촌대로 345', phone: '031-4444-5555', rating: 'A+' },
    { code: 'SUB-004', name: '한국철근', business: '444-55-66777', rep: '최철근', addr: '인천시 남동구 논현로 456', phone: '032-6666-7777', rating: 'AA' },
    { code: 'SUB-005', name: '부산도장', business: '555-66-77888', rep: '정도장', addr: '부산시 해운대구 센텀중앙로 567', phone: '051-8888-9999', rating: 'A' },
  ];

  for (const sub of subcontractors) {
    const company = await prisma.company.create({
      data: {
        companyCode: sub.code,
        companyName: sub.name,
        companyType: CompanyType.SUBCONTRACTOR,
        businessNumber: sub.business,
        representative: sub.rep,
        address: sub.addr,
        phone: sub.phone,
        creditRating: sub.rating,
        paymentTerms: 30,
      },
    });
    companies.push(company);
  }

  const suppliers = [
    { code: 'SUP-001', name: '한일시멘트', business: '666-77-88999', rep: '한시멘', addr: '충청남도 당진시 석문면 공단로 123', phone: '041-1111-2222', rating: 'AA+' },
    { code: 'SUP-002', name: '동양철강', business: '777-88-99000', rep: '동철강', addr: '경상북도 포항시 남구 철강로 234', phone: '054-2222-3333', rating: 'AA' },
    { code: 'SUP-003', name: '삼화페인트', business: '888-99-00111', rep: '삼페인', addr: '경기도 안산시 단원구 원시동 345', phone: '031-3333-4444', rating: 'A+' },
    { code: 'SUP-004', name: '대동목재', business: '999-00-11222', rep: '대목재', addr: '강원도 홍천군 홍천읍 목재로 456', phone: '033-4444-5555', rating: 'A' },
    { code: 'SUP-005', name: '한화유리', business: '000-11-22333', rep: '한유리', addr: '충청북도 청주시 흥덕구 유리로 567', phone: '043-5555-6666', rating: 'AA-' },
    { code: 'SUP-006', name: '현대엘리베이터', business: '101-22-33444', rep: '현엘베', addr: '경기도 이천시 부발읍 경충대로 678', phone: '031-6666-7777', rating: 'AAA' },
    { code: 'SUP-007', name: '삼성전기자재', business: '212-33-44555', rep: '삼전자', addr: '서울시 영등포구 여의대로 789', phone: '02-7777-8888', rating: 'AA+' },
  ];

  for (const sup of suppliers) {
    const company = await prisma.company.create({
      data: {
        companyCode: sup.code,
        companyName: sup.name,
        companyType: CompanyType.SUPPLIER,
        businessNumber: sup.business,
        representative: sup.rep,
        address: sup.addr,
        phone: sup.phone,
        creditRating: sup.rating,
        paymentTerms: 45,
      },
    });
    companies.push(company);
  }

  console.log('✅ 거래처 생성 완료 (20개)');

  // 3. 프로젝트 생성 (43개)
  const projects = [];

  const projectData = [
    // 부동산 프로젝트 (15개)
    { code: 'RE-2025-001', name: '강남 오피스텔 신축', type: ProjectType.REAL_ESTATE, client: '삼성건설', price: 1000, contract: '2025-01-15', start: '2025-02-01', end: '2026-01-31', period: 12, status: ProjectStatus.ACTIVE, progress: 35.5 },
    { code: 'RE-2025-002', name: '서초 주상복합 A동', type: ProjectType.REAL_ESTATE, client: '현대건설', price: 850, contract: '2025-02-01', start: '2025-03-01', end: '2026-02-28', period: 12, status: ProjectStatus.ACTIVE, progress: 28.3 },
    { code: 'RE-2024-015', name: '송파 아파트 리모델링', type: ProjectType.REAL_ESTATE, client: 'GS건설', price: 650, contract: '2024-08-01', start: '2024-09-01', end: '2025-08-31', period: 12, status: ProjectStatus.ACTIVE, progress: 67.8 },
    { code: 'RE-2025-003', name: '용산 복합쇼핑몰', type: ProjectType.REAL_ESTATE, client: '롯데건설', price: 1850, contract: '2025-03-01', start: '2025-04-01', end: '2027-03-31', period: 24, status: ProjectStatus.ACTIVE, progress: 12.5 },
    { code: 'RE-2025-004', name: '분당 업무시설', type: ProjectType.REAL_ESTATE, client: '대우건설', price: 780, contract: '2025-02-15', start: '2025-03-15', end: '2026-03-14', period: 12, status: ProjectStatus.ACTIVE, progress: 18.7 },
    { code: 'RE-2024-010', name: '판교 오피스빌딩', type: ProjectType.REAL_ESTATE, client: '삼성건설', price: 1250, contract: '2024-06-01', start: '2024-07-01', end: '2025-12-31', period: 18, status: ProjectStatus.ACTIVE, progress: 55.2 },
    { code: 'RE-2024-008', name: '광교 주거단지', type: ProjectType.REAL_ESTATE, client: 'GS건설', price: 2100, contract: '2024-03-01', start: '2024-04-01', end: '2026-03-31', period: 24, status: ProjectStatus.ACTIVE, progress: 45.8 },
    { code: 'RE-2024-012', name: '일산 상업시설', type: ProjectType.REAL_ESTATE, client: '롯데건설', price: 920, contract: '2024-07-01', start: '2024-08-01', end: '2025-07-31', period: 12, status: ProjectStatus.ACTIVE, progress: 72.3 },
    { code: 'RE-2025-005', name: '강서 물류센터', type: ProjectType.REAL_ESTATE, client: '현대건설', price: 580, contract: '2025-01-20', start: '2025-02-20', end: '2025-11-19', period: 9, status: ProjectStatus.ACTIVE, progress: 25.6 },
    { code: 'RE-2024-016', name: '동탄 복합단지', type: ProjectType.REAL_ESTATE, client: '대우건설', price: 1680, contract: '2024-09-01', start: '2024-10-01', end: '2026-09-30', period: 24, status: ProjectStatus.ACTIVE, progress: 38.4 },
    { code: 'RE-2025-006', name: '인천 호텔 신축', type: ProjectType.REAL_ESTATE, client: '롯데건설', price: 1420, contract: '2025-02-10', start: '2025-03-10', end: '2026-09-09', period: 18, status: ProjectStatus.ACTIVE, progress: 15.2 },
    { code: 'RE-2024-005', name: '수원 주상복합', type: ProjectType.REAL_ESTATE, client: 'GS건설', price: 1150, contract: '2024-01-15', start: '2024-02-15', end: '2025-08-14', period: 18, status: ProjectStatus.ACTIVE, progress: 82.5 },
    { code: 'RE-2023-020', name: '부천 오피스텔', type: ProjectType.REAL_ESTATE, client: '삼성건설', price: 680, contract: '2023-11-01', start: '2023-12-01', end: '2024-11-30', period: 12, status: ProjectStatus.COMPLETED, progress: 100.0 },
    { code: 'RE-2025-007', name: '광명 지식산업센터', type: ProjectType.REAL_ESTATE, client: '현대건설', price: 890, contract: '2025-03-15', start: '2025-04-15', end: '2026-04-14', period: 12, status: ProjectStatus.PLANNED, progress: 0.0 },
    { code: 'RE-2024-018', name: '안양 상업시설', type: ProjectType.REAL_ESTATE, client: '대우건설', price: 720, contract: '2024-10-01', start: '2024-11-01', end: '2025-10-31', period: 12, status: ProjectStatus.ACTIVE, progress: 42.1 },

    // 인프라 프로젝트 (12개)
    { code: 'IN-2025-001', name: '판교 테크노밸리 도로 확장', type: ProjectType.INFRA, client: '한국도로공사', price: 650, contract: '2024-12-01', start: '2025-01-01', end: '2025-12-31', period: 12, status: ProjectStatus.ACTIVE, progress: 45.2 },
    { code: 'IN-2024-008', name: '인천공항 연결도로 2단계', type: ProjectType.INFRA, client: '한국도로공사', price: 1850, contract: '2024-05-01', start: '2024-06-01', end: '2026-05-31', period: 24, status: ProjectStatus.ACTIVE, progress: 48.7 },
    { code: 'IN-2025-002', name: '서울 지하철 9호선 연장', type: ProjectType.INFRA, client: '서울특별시청', price: 3200, contract: '2025-01-10', start: '2025-02-10', end: '2028-02-09', period: 36, status: ProjectStatus.ACTIVE, progress: 8.3 },
    { code: 'IN-2024-012', name: '부산 광역급행철도', type: ProjectType.INFRA, client: '한국도로공사', price: 2780, contract: '2024-08-01', start: '2024-09-01', end: '2027-08-31', period: 36, status: ProjectStatus.ACTIVE, progress: 22.5 },
    { code: 'IN-2025-003', name: '경부고속도로 확장공사', type: ProjectType.INFRA, client: '한국도로공사', price: 1450, contract: '2025-02-20', start: '2025-03-20', end: '2026-09-19', period: 18, status: ProjectStatus.ACTIVE, progress: 12.8 },
    { code: 'IN-2024-015', name: '대전 도시철도 3호선', type: ProjectType.INFRA, client: '서울특별시청', price: 2150, contract: '2024-09-15', start: '2024-10-15', end: '2027-10-14', period: 36, status: ProjectStatus.ACTIVE, progress: 18.9 },
    { code: 'IN-2025-004', name: '용인 경전철 연장', type: ProjectType.INFRA, client: '한국도로공사', price: 980, contract: '2025-03-01', start: '2025-04-01', end: '2026-09-30', period: 18, status: ProjectStatus.PLANNED, progress: 0.0 },
    { code: 'IN-2024-006', name: '광주 간선도로 정비', type: ProjectType.INFRA, client: '한국도로공사', price: 580, contract: '2024-02-01', start: '2024-03-01', end: '2025-02-28', period: 12, status: ProjectStatus.ACTIVE, progress: 78.4 },
    { code: 'IN-2024-010', name: '세종시 순환도로', type: ProjectType.INFRA, client: '한국도로공사', price: 1120, contract: '2024-07-01', start: '2024-08-01', end: '2026-01-31', period: 18, status: ProjectStatus.ACTIVE, progress: 52.1 },
    { code: 'IN-2025-005', name: '강릉 고속도로 연결로', type: ProjectType.INFRA, client: '한국도로공사', price: 820, contract: '2025-02-25', start: '2025-03-25', end: '2026-03-24', period: 12, status: ProjectStatus.ACTIVE, progress: 14.7 },
    { code: 'IN-2023-018', name: '춘천 국도 확장', type: ProjectType.INFRA, client: '한국도로공사', price: 450, contract: '2023-10-01', start: '2023-11-01', end: '2024-10-31', period: 12, status: ProjectStatus.COMPLETED, progress: 100.0 },
    { code: 'IN-2024-014', name: '천안 교량 신설', type: ProjectType.INFRA, client: '한국도로공사', price: 680, contract: '2024-09-01', start: '2024-10-01', end: '2025-09-30', period: 12, status: ProjectStatus.ACTIVE, progress: 45.6 },

    // 에너지 프로젝트 (11개)
    { code: 'EN-2025-001', name: '세종 스마트시티 전력망', type: ProjectType.ENERGY, client: '한국전력공사', price: 780, contract: '2025-01-05', start: '2025-02-05', end: '2026-02-04', period: 12, status: ProjectStatus.ACTIVE, progress: 22.4 },
    { code: 'EN-2024-008', name: '제주 풍력발전단지', type: ProjectType.ENERGY, client: '한국전력공사', price: 1580, contract: '2024-06-01', start: '2024-07-01', end: '2026-06-30', period: 24, status: ProjectStatus.ACTIVE, progress: 42.8 },
    { code: 'EN-2025-002', name: '울산 태양광 발전소', type: ProjectType.ENERGY, client: '한국전력공사', price: 920, contract: '2025-02-10', start: '2025-03-10', end: '2026-03-09', period: 12, status: ProjectStatus.ACTIVE, progress: 18.3 },
    { code: 'EN-2024-012', name: '경기 송전탑 건설', type: ProjectType.ENERGY, client: '한국전력공사', price: 650, contract: '2024-08-15', start: '2024-09-15', end: '2025-09-14', period: 12, status: ProjectStatus.ACTIVE, progress: 58.7 },
    { code: 'EN-2025-003', name: '부산 변전소 증설', type: ProjectType.ENERGY, client: '한국전력공사', price: 480, contract: '2025-03-01', start: '2025-04-01', end: '2025-10-31', period: 7, status: ProjectStatus.PLANNED, progress: 0.0 },
    { code: 'EN-2024-006', name: '강원 수력발전소', type: ProjectType.ENERGY, client: '한국전력공사', price: 1250, contract: '2024-03-01', start: '2024-04-01', end: '2026-03-31', period: 24, status: ProjectStatus.ACTIVE, progress: 52.3 },
    { code: 'EN-2024-010', name: '충남 태양광단지 2단계', type: ProjectType.ENERGY, client: '한국전력공사', price: 1120, contract: '2024-07-01', start: '2024-08-01', end: '2025-07-31', period: 12, status: ProjectStatus.ACTIVE, progress: 68.5 },
    { code: 'EN-2023-015', name: '전북 풍력발전소', type: ProjectType.ENERGY, client: '한국전력공사', price: 850, contract: '2023-09-01', start: '2023-10-01', end: '2024-09-30', period: 12, status: ProjectStatus.COMPLETED, progress: 100.0 },
    { code: 'EN-2025-004', name: '당진 LNG 복합화력발전소', type: ProjectType.ENERGY, client: '한국전력공사', price: 3200, contract: '2025-01-20', start: '2025-02-20', end: '2027-02-19', period: 24, status: ProjectStatus.ACTIVE, progress: 15.8 },
    { code: 'EN-2024-016', name: '삼척 석탄화력발전소 환경개선', type: ProjectType.ENERGY, client: '한국전력공사', price: 1850, contract: '2024-09-01', start: '2024-10-01', end: '2026-09-30', period: 24, status: ProjectStatus.ACTIVE, progress: 28.6 },
    { code: 'EN-2025-005', name: '영광 원자력발전소 보수공사', type: ProjectType.ENERGY, client: '한국전력공사', price: 2650, contract: '2025-03-10', start: '2025-04-10', end: '2026-10-09', period: 18, status: ProjectStatus.PLANNED, progress: 0.0 },

    // 단순도급 프로젝트 (5개)
    { code: 'SC-2025-001', name: '서초 주상복합', type: ProjectType.SIMPLE_CONTRACT, client: '현대건설', price: 850, contract: '2025-02-01', start: '2025-03-01', end: '2026-02-28', period: 12, status: ProjectStatus.ACTIVE, progress: 28.3 },
    { code: 'SC-2024-010', name: '구로 공장 증축', type: ProjectType.SIMPLE_CONTRACT, client: '대우건설', price: 420, contract: '2024-07-01', start: '2024-08-01', end: '2025-01-31', period: 6, status: ProjectStatus.ACTIVE, progress: 85.2 },
    { code: 'SC-2025-002', name: '안산 물류창고', type: ProjectType.SIMPLE_CONTRACT, client: 'GS건설', price: 380, contract: '2025-01-15', start: '2025-02-15', end: '2025-08-14', period: 6, status: ProjectStatus.ACTIVE, progress: 32.7 },
    { code: 'SC-2024-012', name: '평택 산업시설', type: ProjectType.SIMPLE_CONTRACT, client: '삼성건설', price: 550, contract: '2024-08-01', start: '2024-09-01', end: '2025-02-28', period: 6, status: ProjectStatus.ACTIVE, progress: 72.1 },
    { code: 'SC-2025-003', name: '화성 데이터센터', type: ProjectType.SIMPLE_CONTRACT, client: '롯데건설', price: 680, contract: '2025-03-01', start: '2025-04-01', end: '2025-09-30', period: 6, status: ProjectStatus.PLANNED, progress: 0.0 },
  ];

  for (const proj of projectData) {
    const pmIndex = Math.floor(Math.random() * pmUsers.length);
    const selectedPM = users[2 + pmIndex]; // admin, cfo 다음부터 PM들

    const project = await prisma.project.create({
      data: {
        projectCode: proj.code,
        projectName: proj.name,
        projectType: proj.type,
        client: proj.client,
        contractPrice: proj.price,
        contractDate: new Date(proj.contract),
        startDate: new Date(proj.start),
        endDate: new Date(proj.end),
        constructionPeriod: proj.period,
        status: proj.status,
        progressRate: proj.progress,
        createdBy: selectedPM.id,
      },
    });
    projects.push(project);

    // 각 프로젝트에 가정 추가
    await prisma.projectAssumption.create({
      data: {
        projectId: project.id,
        profitMargin: 0.10 + Math.random() * 0.10, // 10-20%
        costRatio: 0.80 + Math.random() * 0.10, // 80-90%
        periodInvoicing: Math.floor(Math.random() * 2) + 2, // 2-3개월
        periodReceivable: Math.floor(Math.random() * 2) + 1, // 1-2개월
        retentionRate: 0.05,
        retentionPeriod: 6,
        payMSubcon: 1,
        payMMaterial: 1,
        curveType: 's_curve_normal',
        effectiveFrom: new Date(proj.start),
      },
    });
  }

  console.log('✅ 프로젝트 생성 완료 (43개)');
  console.log('✅ 프로젝트 가정 생성 완료 (43개)');

  // 5. 수주 파이프라인 생성 (15개)
  const pipelineData = [
    { code: 'PIP-2025-001', name: '송파 주거복합', client: 'GS건설', type: ProjectType.REAL_ESTATE, amount: 1850, period: 18, bidding: '2025-11-01', decision: '2025-12-15', prob: 75, status: 'BIDDING' },
    { code: 'PIP-2025-002', name: '인천공항 연결도로', client: '한국공항공사', type: ProjectType.INFRA, amount: 950, period: 15, bidding: '2025-10-20', decision: '2025-11-30', prob: 60, status: 'NEGOTIATING' },
    { code: 'PIP-2025-003', name: '세종 스마트시티 전력망', client: '한국전력공사', type: ProjectType.ENERGY, amount: 780, period: 12, bidding: '2025-12-01', decision: '2026-01-15', prob: 45, status: 'PROSPECTING' },
    { code: 'PIP-2025-004', name: '대구 복합쇼핑몰', client: '롯데건설', type: ProjectType.REAL_ESTATE, amount: 2150, period: 24, bidding: '2025-11-15', decision: '2025-12-30', prob: 68, status: 'BIDDING' },
    { code: 'PIP-2025-005', name: '광주 도시철도', client: '한국도로공사', type: ProjectType.INFRA, amount: 1680, period: 30, bidding: '2025-10-10', decision: '2025-11-25', prob: 52, status: 'NEGOTIATING' },
    { code: 'PIP-2025-006', name: '울산 태양광단지', client: '한국전력공사', type: ProjectType.ENERGY, amount: 1120, period: 18, bidding: '2025-12-10', decision: '2026-01-20', prob: 55, status: 'PROSPECTING' },
    { code: 'PIP-2025-007', name: '천안 오피스텔', client: '삼성건설', type: ProjectType.REAL_ESTATE, amount: 920, period: 12, bidding: '2025-11-20', decision: '2025-12-28', prob: 72, status: 'BIDDING' },
    { code: 'PIP-2025-008', name: '전주 국도 정비', client: '한국도로공사', type: ProjectType.INFRA, amount: 580, period: 10, bidding: '2025-10-25', decision: '2025-12-05', prob: 48, status: 'NEGOTIATING' },
    { code: 'PIP-2025-009', name: '포항 공장단지', client: '현대건설', type: ProjectType.SIMPLE_CONTRACT, amount: 650, period: 8, bidding: '2025-11-05', decision: '2025-12-10', prob: 65, status: 'BIDDING' },
    { code: 'PIP-2025-010', name: '제주 풍력발전소 2단계', client: '한국전력공사', type: ProjectType.ENERGY, amount: 1420, period: 20, bidding: '2025-12-15', decision: '2026-01-30', prob: 42, status: 'PROSPECTING' },
    { code: 'PIP-2025-011', name: '부천 상업시설', client: 'GS건설', type: ProjectType.REAL_ESTATE, amount: 780, period: 12, bidding: '2025-11-10', decision: '2025-12-20', prob: 70, status: 'BIDDING' },
    { code: 'PIP-2025-012', name: '수원 교량 신설', client: '한국도로공사', type: ProjectType.INFRA, amount: 850, period: 14, bidding: '2025-10-30', decision: '2025-12-08', prob: 58, status: 'NEGOTIATING' },
    { code: 'PIP-2025-013', name: '강원 송전선로', client: '한국전력공사', type: ProjectType.ENERGY, amount: 520, period: 9, bidding: '2025-12-05', decision: '2026-01-10', prob: 50, status: 'PROSPECTING' },
    { code: 'PIP-2025-014', name: '안양 지식산업센터', client: '대우건설', type: ProjectType.REAL_ESTATE, amount: 1180, period: 15, bidding: '2025-11-25', decision: '2026-01-05', prob: 63, status: 'BIDDING' },
    { code: 'PIP-2025-015', name: '김포 물류터미널', client: '롯데건설', type: ProjectType.SIMPLE_CONTRACT, amount: 480, period: 7, bidding: '2025-10-15', decision: '2025-11-22', prob: 75, status: 'NEGOTIATING' },
  ];

  await prisma.projectPipeline.createMany({
    data: pipelineData.map(pipe => ({
      pipelineCode: pipe.code,
      projectName: pipe.name,
      client: pipe.client,
      projectType: pipe.type,
      estimatedAmount: pipe.amount,
      constructionPeriod: pipe.period,
      biddingDate: new Date(pipe.bidding),
      decisionDate: new Date(pipe.decision),
      winProbability: pipe.prob,
      status: pipe.status as any,
    })),
  });

  console.log('✅ 수주 파이프라인 생성 완료 (15개)');

  // 6. 에너지 발전소 생성 (15개)
  const plantData = [
    // 태양광 발전소 (6개)
    { code: 'SL-001', name: '세종 태양광 1호', type: 'SOLAR', region: '세종', address: '세종시 조치원읍', lat: 36.6024, lon: 127.2821, capacity: 2500, installed: '2022-03-15', status: 'OPERATIONAL', contract: 'SMP', price: 125.5 },
    { code: 'SL-002', name: '울산 태양광발전소', type: 'SOLAR', region: '울산', address: '울산시 남구', lat: 35.5384, lon: 129.3114, capacity: 1800, installed: '2023-06-20', status: 'OPERATIONAL', contract: 'SMP', price: 120.3 },
    { code: 'SL-003', name: '나주 태양광단지', type: 'SOLAR', region: '전남', address: '전남 나주시', lat: 35.0160, lon: 126.7109, capacity: 3200, installed: '2021-09-10', status: 'OPERATIONAL', contract: 'REC', price: 150.8 },
    { code: 'SL-004', name: '영암 태양광', type: 'SOLAR', region: '전남', address: '전남 영암군', lat: 34.8004, lon: 126.6967, capacity: 2100, installed: '2022-11-05', status: 'OPERATIONAL', contract: 'SMP', price: 122.7 },
    { code: 'SL-005', name: '충남 태양광단지 A', type: 'SOLAR', region: '충남', address: '충남 서산시', lat: 36.7849, lon: 126.4503, capacity: 2800, installed: '2023-02-28', status: 'OPERATIONAL', contract: 'REC', price: 145.2 },
    { code: 'SL-006', name: '충남 태양광단지 B', type: 'SOLAR', region: '충남', address: '충남 당진시', lat: 36.8931, lon: 126.6478, capacity: 1950, installed: '2024-01-15', status: 'OPERATIONAL', contract: 'SMP', price: 128.4 },

    // 풍력 발전소 (3개)
    { code: 'WD-001', name: '제주 풍력발전단지', type: 'WIND', region: '제주', address: '제주시 구좌읍', lat: 33.5010, lon: 126.8010, capacity: 4200, installed: '2021-05-12', status: 'OPERATIONAL', contract: 'REC', price: 180.5 },
    { code: 'WD-002', name: '강원 풍력발전소', type: 'WIND', region: '강원', address: '강원 영월군', lat: 37.1836, lon: 128.4617, capacity: 3600, installed: '2022-08-20', status: 'OPERATIONAL', contract: 'REC', price: 175.3 },
    { code: 'WD-003', name: '전북 해상풍력', type: 'WIND', region: '전북', address: '전북 군산시', lat: 35.9676, lon: 126.7369, capacity: 5100, installed: '2023-04-10', status: 'OPERATIONAL', contract: 'PPA', price: 190.2 },

    // 수력 발전소 (2개)
    { code: 'HD-001', name: '강원 수력발전소', type: 'HYDRO', region: '강원', address: '강원 평창군', lat: 37.3704, lon: 128.3900, capacity: 3800, installed: '2020-12-01', status: 'OPERATIONAL', contract: 'SMP', price: 115.8 },
    { code: 'HD-002', name: '충북 수력발전', type: 'HYDRO', region: '충북', address: '충북 제천시', lat: 37.1326, lon: 128.1911, capacity: 2900, installed: '2021-07-15', status: 'OPERATIONAL', contract: 'SMP', price: 118.5 },

    // ESS (2개)
    { code: 'ES-001', name: '경기 ESS 1호', type: 'ESS', region: '경기', address: '경기 평택시', lat: 36.9921, lon: 127.1126, capacity: 2400, installed: '2023-03-22', status: 'OPERATIONAL', contract: 'SMP', price: 135.6 },
    { code: 'ES-002', name: '인천 ESS', type: 'ESS', region: '인천', address: '인천 남동구', lat: 37.4486, lon: 126.7315, capacity: 2050, installed: '2023-09-30', status: 'OPERATIONAL', contract: 'SMP', price: 132.4 },

    // 건설 중 (2개)
    { code: 'SL-007', name: '경북 태양광단지', type: 'SOLAR', region: '경북', address: '경북 영천시', lat: 35.9730, lon: 128.9386, capacity: 3500, installed: '2025-06-01', status: 'CONSTRUCTION', contract: 'REC', price: 150.0 },
    { code: 'WD-004', name: '울진 해상풍력', type: 'WIND', region: '경북', address: '경북 울진군', lat: 36.9930, lon: 129.4006, capacity: 6200, installed: '2025-09-15', status: 'CONSTRUCTION', contract: 'PPA', price: 195.0 },
  ];

  const powerPlants = [];
  for (const plant of plantData) {
    const created = await prisma.powerPlant.create({
      data: {
        plantCode: plant.code,
        plantName: plant.name,
        plantType: plant.type as any,
        region: plant.region,
        address: plant.address,
        latitude: plant.lat,
        longitude: plant.lon,
        capacity: plant.capacity,
        installedDate: new Date(plant.installed),
        status: plant.status as any,
        contractType: plant.contract,
        unitPrice: plant.price,
      },
    });
    powerPlants.push(created);
  }

  console.log('✅ 발전소 생성 완료 (15개)');

  // 7. 에너지 생산 데이터 (최근 7일간, 운영 중인 발전소만)
  const operationalPlants = powerPlants.filter(p => p.status === 'OPERATIONAL');
  const productionRecords = [];

  for (const plant of operationalPlants) {
    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);

      // 시간별 데이터 (4시간 간격)
      for (let hour = 0; hour < 24; hour += 4) {
        const recordTime = new Date(date);
        recordTime.setHours(hour, 0, 0, 0);

        // 발전량 계산 (용량 대비 시간대별 변동)
        let productionFactor = 0.5; // 기본 50%
        if (plant.plantType === 'SOLAR') {
          // 태양광: 낮 시간대 높음
          if (hour >= 8 && hour <= 16) productionFactor = 0.8 + Math.random() * 0.15;
          else if (hour >= 6 && hour < 8 || hour > 16 && hour <= 18) productionFactor = 0.3 + Math.random() * 0.2;
          else productionFactor = 0;
        } else if (plant.plantType === 'WIND') {
          // 풍력: 변동성 큼
          productionFactor = 0.3 + Math.random() * 0.6;
        } else if (plant.plantType === 'HYDRO') {
          // 수력: 안정적
          productionFactor = 0.7 + Math.random() * 0.2;
        } else if (plant.plantType === 'ESS') {
          // ESS: 피크 시간대 방전
          if (hour >= 10 && hour <= 20) productionFactor = 0.6 + Math.random() * 0.3;
          else productionFactor = 0.1 + Math.random() * 0.2;
        }

        const production = Number(plant.capacity) * productionFactor * 4; // 4시간 생산량
        const efficiency = productionFactor * 100;

        productionRecords.push({
          plantId: plant.id,
          recordedAt: recordTime,
          production,
          temperature: 15 + Math.random() * 15, // 15-30°C
          humidity: 40 + Math.random() * 40, // 40-80%
          irradiance: plant.plantType === 'SOLAR' ? (hour >= 6 && hour <= 18 ? 200 + Math.random() * 600 : 0) : null,
          windSpeed: plant.plantType === 'WIND' ? 3 + Math.random() * 12 : null,
          efficiency,
        });
      }
    }
  }

  await prisma.energyProduction.createMany({
    data: productionRecords,
  });

  console.log(`✅ 에너지 생산 데이터 생성 완료 (${productionRecords.length}개 레코드)`);

  // 8. 에너지 정산 데이터 (최근 6개월)
  const settlements = [];
  for (const plant of operationalPlants) {
    for (let month = 0; month < 6; month++) {
      const settlementDate = new Date();
      settlementDate.setMonth(settlementDate.getMonth() - month);
      settlementDate.setDate(1);

      const monthlyProduction = Number(plant.capacity) * 720 * 0.6; // 30일 * 24시간 * 60% 가동률
      const smpRevenue = monthlyProduction * 125.5; // SMP 단가
      const recRevenue = plant.contractType === 'REC' ? monthlyProduction * 85.3 : 0; // REC 단가
      const incentive = Math.random() * 1000000;
      const totalRevenue = smpRevenue + recRevenue + incentive;

      const operationCost = Number(plant.capacity) * 2500; // 용량당 운영비
      const maintenanceCost = Number(plant.capacity) * 1800; // 용량당 유지보수비
      const totalCost = operationCost + maintenanceCost;

      settlements.push({
        plantId: plant.id,
        settlementMonth: settlementDate,
        smpRevenue,
        recRevenue,
        incentive,
        totalRevenue,
        operationCost,
        maintenanceCost,
        totalCost,
        netProfit: totalRevenue - totalCost,
        status: (month === 0 ? 'PROCESSING' : 'COMPLETED') as any,
        settledAt: month === 0 ? null : new Date(settlementDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      });
    }
  }

  await prisma.energySettlement.createMany({
    data: settlements,
  });

  console.log(`✅ 에너지 정산 데이터 생성 완료 (${settlements.length}개)`);

  // 9. 에너지 알림 데이터 (샘플)
  const alerts = [];
  const alertTypes = ['LOW_PRODUCTION', 'EQUIPMENT_FAILURE', 'WEATHER_RISK', 'MAINTENANCE_DUE', 'PERFORMANCE_DROP'];
  const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  for (let i = 0; i < 10; i++) {
    const plant = operationalPlants[Math.floor(Math.random() * operationalPlants.length)];
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];

    alerts.push({
      plantId: plant.id,
      alertType: alertType as any,
      severity: severity as any,
      title: `${plant.plantName} - ${alertType}`,
      message: `발전소에서 ${alertType} 알림이 발생했습니다.`,
      metrics: { threshold: 80, current: 65 },
      isResolved: Math.random() > 0.3,
      resolvedAt: Math.random() > 0.3 ? new Date() : null,
      resolvedBy: Math.random() > 0.3 ? users[0].id : null,
    });
  }

  await prisma.energyAlert.createMany({
    data: alerts,
  });

  console.log(`✅ 에너지 알림 데이터 생성 완료 (${alerts.length}개)`);

  console.log('\n🎉 시드 데이터 생성 완료!');
  console.log('   - 사용자: 15명');
  console.log('   - 거래처: 20개');
  console.log('   - 프로젝트: 43개');
  console.log('   - 프로젝트 가정: 43개');
  console.log('   - 수주 파이프라인: 15개');
  console.log('   - 발전소: 15개');
  console.log(`   - 에너지 생산 데이터: ${productionRecords.length}개`);
  console.log(`   - 에너지 정산: ${settlements.length}개`);
  console.log(`   - 에너지 알림: ${alerts.length}개`);
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
