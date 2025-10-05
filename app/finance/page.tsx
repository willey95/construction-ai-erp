'use client';

import Link from 'next/link';
import { DollarSign, TrendingUp, Calculator, FileText } from 'lucide-react';

export default function FinancePage() {
  const menuItems = [
    {
      title: '회계 Accounting',
      description: '분개장, 재무제표, 원가 집계',
      icon: FileText,
      href: '/finance/accounting',
      color: 'thesis',
    },
    {
      title: '재무 전망 Forecast',
      description: '예산 대비 실적, 재무 예측',
      icon: TrendingUp,
      href: '/finance/forecast',
      color: 'synthesis',
    },
    {
      title: '현금흐름 시뮬레이션 Cash Flow Simulation',
      description: 'S-Curve 기반 현금흐름 분석',
      icon: Calculator,
      href: '/finance/simulation',
      color: 'amber',
    },
  ];

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-light text-logos mb-1">재무 관리</h1>
          <p className="text-sm text-pneuma">Financial Management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="phenomenal p-6 hover:border-thesis transition-all cursor-pointer group">
                <item.icon className={`w-10 h-10 text-${item.color} mb-4 group-hover:scale-110 transition-transform`} />
                <h3 className="text-lg text-logos mb-2 group-hover:text-thesis transition-colors">{item.title}</h3>
                <p className="text-sm text-pneuma">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* 요약 통계 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">총 매출</div>
            <div className="text-2xl text-thesis font-light">25,800억</div>
          </div>
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">총 원가</div>
            <div className="text-2xl text-logos font-light">21,930억</div>
          </div>
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">총 이익</div>
            <div className="text-2xl text-synthesis font-light">3,870억</div>
          </div>
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">이익률</div>
            <div className="text-2xl text-logos font-light">15.0%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
