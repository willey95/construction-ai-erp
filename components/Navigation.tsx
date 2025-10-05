'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, DollarSign, BarChart3, Bot, Settings } from 'lucide-react';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  children?: { path: string; label: string }[];
}

const menuItems: MenuItem[] = [
  {
    path: '/',
    label: '홈 Home',
    icon: <Home className="w-4 h-4" />,
  },
  {
    path: '/projects',
    label: '프로젝트 Projects',
    icon: <Building2 className="w-4 h-4" />,
    children: [
      { path: '/projects', label: '전체 프로젝트 All' },
      { path: '/projects/new', label: '신규 등록 New' },
      { path: '/projects/type/real-estate', label: '부동산 Real Estate' },
      { path: '/projects/type/simple-contract', label: '도급 Contract' },
    ],
  },
  {
    path: '/finance',
    label: '재무 Finance',
    icon: <DollarSign className="w-4 h-4" />,
    children: [
      { path: '/finance/accounting', label: '회계 Accounting' },
      { path: '/finance/forecast', label: '전망 Forecast' },
      { path: '/finance/simulation', label: '시뮬레이션 Simulation' },
    ],
  },
  {
    path: '/energy',
    label: '에너지 Energy',
    icon: <BarChart3 className="w-4 h-4" />,
    children: [
      { path: '/energy/operations', label: '운영 대시보드 Operations' },
      { path: '/energy/plants', label: '발전소 관리 Plants' },
      { path: '/energy/production', label: '생산 현황 Production' },
      { path: '/energy/settlement', label: '정산 관리 Settlement' },
    ],
  },
  {
    path: '/analysis',
    label: '분석 Analysis',
    icon: <BarChart3 className="w-4 h-4" />,
    children: [
      { path: '/analysis/performance', label: '성과 Performance' },
      { path: '/analysis/simulation', label: '시뮬레이션 Simulation' },
    ],
  },
  {
    path: '/ai',
    label: 'AI 시스템 AI System',
    icon: <Bot className="w-4 h-4" />,
    children: [
      { path: '/ai/chatbot', label: '챗봇 Chatbot' },
      { path: '/ai/insights', label: 'AI 인사이트 Insights' },
      { path: '/agents', label: '에이전트 허브 Agents Hub' },
      { path: '/agents/monitor', label: '에이전트 모니터 Monitor' },
      { path: '/agents/logs', label: '에이전트 로그 Logs' },
      { path: '/ontology', label: '온톨로지 뷰어 Ontology' },
      { path: '/ontology/builder', label: '온톨로지 생성기 Builder' },
      { path: '/ontology/datasets', label: '데이터셋 Datasets' },
      { path: '/ontology/etl', label: 'ETL 작업 ETL Jobs' },
    ],
  },
  {
    path: '/settings',
    label: '설정 Settings',
    icon: <Settings className="w-4 h-4" />,
    children: [
      { path: '/settings/schema', label: '엔티티 스키마 Schema' },
      { path: '/settings/users', label: '사용자 Users' },
      { path: '/settings/system', label: '시스템 System' },
    ],
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-essence border-b border-essence">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-lg font-medium text-logos tracking-wide">
              건설 ERP
            </div>
          </Link>

          {/* 메뉴 */}
          <div className="flex items-center gap-1">
            {menuItems.map((item) => (
              <div key={item.path} className="relative group">
                <Link
                  href={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all duration-300 text-sm ${
                    pathname === item.path || pathname.startsWith(item.path + '/')
                      ? 'bg-phenomenon text-thesis'
                      : 'text-pneuma hover:text-logos hover:bg-phenomenon/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>

                {/* 드롭다운 */}
                {item.children && (
                  <div className="absolute top-full left-0 hidden group-hover:block z-50">
                    <div className="phenomenal p-2 min-w-[180px] space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          href={child.path}
                          className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                            pathname === child.path
                              ? 'bg-phenomenon text-thesis'
                              : 'text-pneuma hover:text-logos hover:bg-phenomenon/50'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
