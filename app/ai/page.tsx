'use client';

import Link from 'next/link';
import { Bot, Activity, Network } from 'lucide-react';

export default function AIPage() {
  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-light text-logos mb-8">AI 인사이트</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/ai/chatbot">
            <div className="phenomenal p-6 hover:border-thesis transition-all cursor-pointer group">
              <Bot className="w-10 h-10 text-thesis mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg text-logos mb-2">AI 챗봇 Chatbot</h3>
              <p className="text-sm text-pneuma">자연어 기반 데이터 조회 및 분석</p>
            </div>
          </Link>

          <Link href="/ai/monitor">
            <div className="phenomenal p-6 hover:border-synthesis transition-all cursor-pointer group">
              <Activity className="w-10 h-10 text-synthesis mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg text-logos mb-2">AI 모니터 Monitor</h3>
              <p className="text-sm text-pneuma">실시간 리스크 감지 및 경고</p>
            </div>
          </Link>

          <Link href="/ai/knowledge-graph">
            <div className="phenomenal p-6 hover:border-amber transition-all cursor-pointer group">
              <Network className="w-10 h-10 text-amber mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg text-logos mb-2">지식 그래프 Graph</h3>
              <p className="text-sm text-pneuma">프로젝트 간 관계 분석</p>
            </div>
          </Link>
        </div>

        <div className="mt-8 phenomenal p-6">
          <h3 className="text-lg text-logos mb-4">최근 AI 인사이트</h3>
          <div className="space-y-3">
            <div className="p-3 bg-phenomenon rounded">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-thesis"></div>
                <span className="text-sm text-thesis">재무 분석 에이전트</span>
              </div>
              <p className="text-sm text-pneuma">강남 오피스텔 프로젝트의 현금흐름이 3개월 후 부족할 가능성 78%</p>
            </div>
            <div className="p-3 bg-phenomenon rounded">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-synthesis"></div>
                <span className="text-sm text-synthesis">리스크 관리 에이전트</span>
              </div>
              <p className="text-sm text-pneuma">판교 도로 프로젝트의 공사 속도가 계획 대비 5% 초과 달성 중</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
