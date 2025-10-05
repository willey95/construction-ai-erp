'use client';

import { useState } from 'react';
import { Database, HardDrive, Download, Upload, RefreshCw, Settings, Bell, Lock } from 'lucide-react';

export default function SystemPage() {
  const [backupSchedule, setBackupSchedule] = useState('daily');
  const [logRetention, setLogRetention] = useState('30');

  // 데이터베이스 정보
  const dbInfo = {
    type: 'PostgreSQL',
    version: '16.0',
    size: '2.4 GB',
    tables: 14,
    records: 3420,
    lastBackup: '2025-10-05 03:00',
  };

  // 백업 히스토리
  const backupHistory = [
    { id: 1, date: '2025-10-05 03:00', size: '2.4 GB', status: 'success', type: 'auto' },
    { id: 2, date: '2025-10-04 03:00', size: '2.3 GB', status: 'success', type: 'auto' },
    { id: 3, date: '2025-10-03 15:30', size: '2.3 GB', status: 'success', type: 'manual' },
    { id: 4, date: '2025-10-03 03:00', size: '2.2 GB', status: 'success', type: 'auto' },
    { id: 5, date: '2025-10-02 03:00', size: '2.2 GB', status: 'failed', type: 'auto' },
  ];

  // 시스템 로그
  const systemLogs = [
    { id: 1, time: '2025-10-05 15:45', level: 'info', message: '사용자 로그인: admin@company.com', module: 'Auth' },
    { id: 2, time: '2025-10-05 15:30', level: 'warning', message: 'API 응답 시간 2초 초과', module: 'API' },
    { id: 3, time: '2025-10-05 14:20', level: 'error', message: '데이터베이스 연결 실패 (재시도 성공)', module: 'Database' },
    { id: 4, time: '2025-10-05 13:10', level: 'info', message: '프로젝트 생성: 하남 스타필드', module: 'Project' },
    { id: 5, time: '2025-10-05 12:30', level: 'info', message: '백업 스케줄 업데이트', module: 'System' },
  ];

  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <span className="px-2 py-0.5 bg-danger bg-opacity-20 text-danger rounded text-xs">ERROR</span>;
      case 'warning':
        return <span className="px-2 py-0.5 bg-warning bg-opacity-20 text-warning rounded text-xs">WARN</span>;
      case 'info':
        return <span className="px-2 py-0.5 bg-synthesis bg-opacity-20 text-synthesis rounded text-xs">INFO</span>;
      default:
        return <span className="px-2 py-0.5 bg-nous bg-opacity-20 text-nous rounded text-xs">{level}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-light text-logos mb-6">시스템 설정 System</h1>

        {/* 데이터베이스 정보 */}
        <div className="phenomenal p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg text-logos flex items-center gap-2">
              <Database className="w-5 h-5" />
              데이터베이스 정보
            </h2>
            <button className="flex items-center gap-2 px-3 py-2 bg-thesis text-void rounded-md hover:bg-opacity-90 transition-colors text-sm">
              <RefreshCw className="w-4 h-4" />
              연결 테스트
            </button>
          </div>
          <div className="grid grid-cols-6 gap-4">
            <div className="p-3 bg-phenomenon rounded">
              <div className="text-xs text-nous mb-1">DB 종류</div>
              <div className="text-sm text-thesis">{dbInfo.type}</div>
            </div>
            <div className="p-3 bg-phenomenon rounded">
              <div className="text-xs text-nous mb-1">버전</div>
              <div className="text-sm text-logos">{dbInfo.version}</div>
            </div>
            <div className="p-3 bg-phenomenon rounded">
              <div className="text-xs text-nous mb-1">DB 크기</div>
              <div className="text-sm text-synthesis">{dbInfo.size}</div>
            </div>
            <div className="p-3 bg-phenomenon rounded">
              <div className="text-xs text-nous mb-1">테이블 수</div>
              <div className="text-sm text-logos">{dbInfo.tables}개</div>
            </div>
            <div className="p-3 bg-phenomenon rounded">
              <div className="text-xs text-nous mb-1">레코드 수</div>
              <div className="text-sm text-logos">{dbInfo.records.toLocaleString()}개</div>
            </div>
            <div className="p-3 bg-phenomenon rounded">
              <div className="text-xs text-nous mb-1">마지막 백업</div>
              <div className="text-xs text-pneuma">{dbInfo.lastBackup}</div>
            </div>
          </div>
        </div>

        {/* 백업 설정 */}
        <div className="phenomenal p-4 mb-6">
          <h2 className="text-lg text-logos mb-4 flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            백업 설정
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-nous mb-2 block">자동 백업 주기</label>
              <select
                value={backupSchedule}
                onChange={(e) => setBackupSchedule(e.target.value)}
                className="w-full px-4 py-2 bg-phenomenon border border-essence rounded-md text-logos"
              >
                <option value="hourly">매시간</option>
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-nous mb-2 block">백업 보관 기간 (일)</label>
              <input
                type="number"
                value={logRetention}
                onChange={(e) => setLogRetention(e.target.value)}
                className="w-full px-4 py-2 bg-phenomenon border border-essence rounded-md text-logos"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-thesis text-void rounded-md hover:bg-opacity-90 transition-colors">
              <Download className="w-4 h-4" />
              백업 생성
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-phenomenon border border-essence text-logos rounded-md hover:bg-essence transition-colors">
              <Upload className="w-4 h-4" />
              백업 복원
            </button>
          </div>
        </div>

        {/* 백업 히스토리 */}
        <div className="phenomenal p-4 mb-6">
          <h2 className="text-lg text-logos mb-4">백업 히스토리</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-essence text-nous text-sm">
                  <th className="text-left py-3 px-2">날짜/시간</th>
                  <th className="text-left py-3 px-2">크기</th>
                  <th className="text-left py-3 px-2">유형</th>
                  <th className="text-left py-3 px-2">상태</th>
                  <th className="text-left py-3 px-2">작업</th>
                </tr>
              </thead>
              <tbody>
                {backupHistory.map((backup) => (
                  <tr key={backup.id} className="border-b border-phenomenon hover:bg-phenomenon transition-colors">
                    <td className="py-3 px-2 text-sm text-logos">{backup.date}</td>
                    <td className="py-3 px-2 text-sm text-pneuma">{backup.size}</td>
                    <td className="py-3 px-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        backup.type === 'auto'
                          ? 'bg-thesis bg-opacity-20 text-thesis'
                          : 'bg-synthesis bg-opacity-20 text-synthesis'
                      }`}>
                        {backup.type === 'auto' ? '자동' : '수동'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        backup.status === 'success'
                          ? 'bg-synthesis bg-opacity-20 text-synthesis'
                          : 'bg-danger bg-opacity-20 text-danger'
                      }`}>
                        {backup.status === 'success' ? '성공' : '실패'}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <button className="text-thesis hover:underline text-sm">다운로드</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 시스템 로그 */}
        <div className="phenomenal p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg text-logos">시스템 로그</h2>
            <button className="text-sm text-thesis hover:underline">전체 로그 다운로드</button>
          </div>
          <div className="space-y-2">
            {systemLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-2 rounded hover:bg-phenomenon transition-colors">
                <div className="text-xs text-nous w-32">{log.time}</div>
                <div className="w-16">{getLogLevelBadge(log.level)}</div>
                <div className="flex-1 text-sm text-pneuma">{log.message}</div>
                <div className="text-xs text-nous">{log.module}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 기타 설정 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="phenomenal p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-thesis" />
              <h3 className="text-sm text-logos">알림 설정</h3>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-pneuma cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                이메일 알림
              </label>
              <label className="flex items-center gap-2 text-sm text-pneuma cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                SMS 알림
              </label>
              <label className="flex items-center gap-2 text-sm text-pneuma cursor-pointer">
                <input type="checkbox" className="rounded" />
                슬랙 연동
              </label>
            </div>
          </div>

          <div className="phenomenal p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-thesis" />
              <h3 className="text-sm text-logos">보안 설정</h3>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-pneuma cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                2단계 인증
              </label>
              <label className="flex items-center gap-2 text-sm text-pneuma cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                세션 타임아웃 (30분)
              </label>
              <label className="flex items-center gap-2 text-sm text-pneuma cursor-pointer">
                <input type="checkbox" className="rounded" />
                IP 화이트리스트
              </label>
            </div>
          </div>

          <div className="phenomenal p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-5 h-5 text-thesis" />
              <h3 className="text-sm text-logos">고급 설정</h3>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-pneuma cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                API 로깅
              </label>
              <label className="flex items-center gap-2 text-sm text-pneuma cursor-pointer">
                <input type="checkbox" className="rounded" />
                디버그 모드
              </label>
              <label className="flex items-center gap-2 text-sm text-pneuma cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                성능 모니터링
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
