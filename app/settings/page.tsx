'use client';

import Link from 'next/link';
import { Users, Database, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-light text-logos mb-8">시스템 설정</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/settings/users">
            <div className="phenomenal p-6 hover:border-thesis transition-all cursor-pointer group">
              <Users className="w-10 h-10 text-thesis mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg text-logos mb-2">사용자 관리 Users</h3>
              <p className="text-sm text-pneuma">사용자 계정 및 권한 관리</p>
            </div>
          </Link>

          <Link href="/settings/system">
            <div className="phenomenal p-6 hover:border-synthesis transition-all cursor-pointer group">
              <SettingsIcon className="w-10 h-10 text-synthesis mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg text-logos mb-2">시스템 설정 System</h3>
              <p className="text-sm text-pneuma">데이터베이스, 백업, 로그 관리</p>
            </div>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">등록된 사용자</div>
            <div className="text-2xl text-logos font-light">3</div>
          </div>
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">DB 크기</div>
            <div className="text-2xl text-logos font-light">125 MB</div>
          </div>
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">마지막 백업</div>
            <div className="text-sm text-logos">2025-10-05</div>
          </div>
        </div>
      </div>
    </div>
  );
}
