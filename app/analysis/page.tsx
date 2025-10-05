'use client';

import Link from 'next/link';
import { BarChart3, Target } from 'lucide-react';

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-light text-logos mb-8">경영 분석</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/analysis/performance">
            <div className="phenomenal p-6 hover:border-thesis transition-all cursor-pointer group">
              <BarChart3 className="w-10 h-10 text-thesis mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg text-logos mb-2">전사 성과 Performance</h3>
              <p className="text-sm text-pneuma">부문별, 프로젝트별 수익성 분석</p>
            </div>
          </Link>

          <Link href="/analysis/simulation">
            <div className="phenomenal p-6 hover:border-synthesis transition-all cursor-pointer group">
              <Target className="w-10 h-10 text-synthesis mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg text-logos mb-2">시뮬레이션 Simulation</h3>
              <p className="text-sm text-pneuma">시나리오 분석 및 의사결정 지원</p>
            </div>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">전체 프로젝트</div>
            <div className="text-2xl text-logos font-light">23</div>
          </div>
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">평균 이익률</div>
            <div className="text-2xl text-thesis font-light">14.2%</div>
          </div>
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">평균 진척률</div>
            <div className="text-2xl text-synthesis font-light">68.5%</div>
          </div>
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">완료 프로젝트</div>
            <div className="text-2xl text-logos font-light">4</div>
          </div>
        </div>
      </div>
    </div>
  );
}
