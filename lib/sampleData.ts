import { Project, ProjectAssumptions, KPIData } from '@/types';

export const sampleProjects: Project[] = [
  {
    id: 'proj-001',
    projectCode: 'RE-2025-001',
    projectName: '강남 오피스텔 신축',
    projectType: 'real_estate',
    client: '삼성건설',
    contractPrice: 1000, // 억원
    contractDate: new Date('2025-01-15'),
    startDate: new Date('2025-02-01'),
    endDate: new Date('2026-01-31'),
    constructionPeriod: 12,
    status: 'active',
    progressRate: 35.5,
  },
  {
    id: 'proj-002',
    projectCode: 'SC-2025-002',
    projectName: '서초 주상복합',
    projectType: 'simple_contract',
    client: '현대건설',
    contractPrice: 850, // 억원
    contractDate: new Date('2025-02-01'),
    startDate: new Date('2025-03-01'),
    endDate: new Date('2026-02-28'),
    constructionPeriod: 12,
    status: 'active',
    progressRate: 28.3,
  },
  {
    id: 'proj-003',
    projectCode: 'IN-2025-003',
    projectName: '판교 테크노밸리 도로 확장',
    projectType: 'infra',
    client: '한국도로공사',
    contractPrice: 650, // 억원
    contractDate: new Date('2024-12-01'),
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    constructionPeriod: 12,
    status: 'active',
    progressRate: 45.2,
  },
];

export const sampleAssumptions: ProjectAssumptions = {
  id: 'assume-001',
  projectId: 'proj-001',
  profitMargin: 0.15, // 15%
  costRatio: 0.85, // 85%
  periodInvoicing: 3, // 3개월
  periodReceivable: 2, // 2개월
  retentionRate: 0.05, // 5%
  retentionPeriod: 6, // 6개월
  payMSubcon: 1, // 1개월
  payMMaterial: 1, // 1개월
  curveType: 's_curve_normal',
};

export const dashboardKPIs: KPIData[] = [
  {
    label: 'NPV (순현재가치)',
    value: '1,285',
    change: 12.5,
    trend: 'up',
    essence: 'thesis',
  },
  {
    label: 'IRR (내부수익률)',
    value: '18.4',
    change: -2.3,
    trend: 'down',
    essence: 'antithesis',
  },
  {
    label: 'ROI (투자수익률)',
    value: '156.8',
    change: 8.7,
    trend: 'up',
    essence: 'thesis',
  },
  {
    label: '총 이익률',
    value: '15.0',
    change: 0,
    trend: 'neutral',
    essence: 'synthesis',
  },
];
