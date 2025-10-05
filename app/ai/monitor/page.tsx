'use client';

import { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

export default function MonitorPage() {
  const [activeTab, setActiveTab] = useState<'realtime' | 'risk' | 'alert'>('realtime');

  // 실시간 모니터링 데이터
  const realtimeData = [
    { time: '09:00', cash: 1250, risk: 12, alert: 2 },
    { time: '10:00', cash: 1280, risk: 15, alert: 3 },
    { time: '11:00', cash: 1310, risk: 18, alert: 4 },
    { time: '12:00', cash: 1290, risk: 14, alert: 2 },
    { time: '13:00', cash: 1350, risk: 22, alert: 5 },
    { time: '14:00', cash: 1380, risk: 25, alert: 6 },
    { time: '15:00', cash: 1420, risk: 28, alert: 7 },
    { time: '16:00', cash: 1450, risk: 31, alert: 8 },
  ];

  // 리스크 감지 데이터
  const riskDetection = [
    {
      id: 1,
      project: '강동 오피스텔 A동',
      type: 'cash_flow',
      severity: 'high',
      message: '3개월 후 현금흐름 부족 예상 (확률 78%)',
      probability: 78,
      impact: -850,
      timestamp: '2025-10-05 15:30',
    },
    {
      id: 2,
      project: '송파 상가',
      type: 'delay',
      severity: 'medium',
      message: '공정 지연 가능성 감지 (15일 지연 예상)',
      probability: 65,
      impact: -120,
      timestamp: '2025-10-05 14:20',
    },
    {
      id: 3,
      project: '판교 도로',
      type: 'cost',
      severity: 'low',
      message: '자재비 8% 상승으로 원가 증가 예상',
      probability: 55,
      impact: -340,
      timestamp: '2025-10-05 13:15',
    },
  ];

  // 알림 히스토리
  const alertHistory = [
    { id: 1, type: 'critical', title: '현금흐름 부족 임박', project: '강동 오피스텔', time: '15:30', status: 'active' },
    { id: 2, type: 'warning', title: '공정 지연 5% 초과', project: '송파 상가', time: '14:20', status: 'active' },
    { id: 3, type: 'info', title: '안전 점검 완료', project: '판교 도로', time: '13:15', status: 'resolved' },
    { id: 4, type: 'warning', title: '자재비 상승 감지', project: '인천 물류센터', time: '12:40', status: 'resolved' },
    { id: 5, type: 'info', title: '기성금 수금 완료', project: '용인 아파트', time: '11:25', status: 'resolved' },
  ];

  // 리스크 분포 (scatter plot)
  const riskDistribution = [
    { impact: -850, probability: 78, name: '강동 오피스텔', severity: 'high' },
    { impact: -120, probability: 65, name: '송파 상가', severity: 'medium' },
    { impact: -340, probability: 55, name: '판교 도로', severity: 'low' },
    { impact: -520, probability: 48, name: '인천 물류센터', severity: 'medium' },
    { impact: -280, probability: 42, name: '용인 아파트', severity: 'low' },
  ];

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-light text-logos">AI 모니터 Monitor</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-thesis animate-pulse"></div>
            <span className="text-sm text-pneuma">실시간 모니터링 중</span>
          </div>
        </div>

        {/* 실시간 통계 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="phenomenal p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs text-nous">모니터링 프로젝트</div>
              <Activity className="w-4 h-4 text-thesis" />
            </div>
            <div className="text-2xl text-thesis font-light">23개</div>
            <div className="text-xs text-pneuma mt-1">전체 활성</div>
          </div>
          <div className="phenomenal p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs text-nous">감지된 리스크</div>
              <AlertTriangle className="w-4 h-4 text-warning" />
            </div>
            <div className="text-2xl text-warning font-light">8건</div>
            <div className="text-xs text-warning mt-1">+3 (지난 시간 대비)</div>
          </div>
          <div className="phenomenal p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs text-nous">활성 알림</div>
              <XCircle className="w-4 h-4 text-danger" />
            </div>
            <div className="text-2xl text-danger font-light">2건</div>
            <div className="text-xs text-pneuma mt-1">즉시 조치 필요</div>
          </div>
          <div className="phenomenal p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs text-nous">정상 프로젝트</div>
              <CheckCircle className="w-4 h-4 text-synthesis" />
            </div>
            <div className="text-2xl text-synthesis font-light">15개</div>
            <div className="text-xs text-synthesis mt-1">65% 정상</div>
          </div>
        </div>

        {/* 탭 */}
        <div className="phenomenal p-1 mb-6 inline-flex rounded-md">
          <button
            onClick={() => setActiveTab('realtime')}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              activeTab === 'realtime' ? 'bg-thesis text-void' : 'text-pneuma hover:text-logos'
            }`}
          >
            실시간 모니터링
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              activeTab === 'risk' ? 'bg-thesis text-void' : 'text-pneuma hover:text-logos'
            }`}
          >
            리스크 감지
          </button>
          <button
            onClick={() => setActiveTab('alert')}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              activeTab === 'alert' ? 'bg-thesis text-void' : 'text-pneuma hover:text-logos'
            }`}
          >
            알림 히스토리
          </button>
        </div>

        {/* 실시간 모니터링 */}
        {activeTab === 'realtime' && (
          <>
            <div className="phenomenal p-4 mb-6">
              <h2 className="text-lg text-logos mb-4">실시간 지표 Real-time Metrics</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={realtimeData}>
                  <defs>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00D9FF" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="time" stroke="#909090" />
                  <YAxis stroke="#909090" />
                  <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A' }} />
                  <Legend />
                  <Area type="monotone" dataKey="cash" name="현금보유" stroke="#00D9FF" fillOpacity={1} fill="url(#colorCash)" />
                  <Area type="monotone" dataKey="risk" name="리스크점수" stroke="#F59E0B" fillOpacity={1} fill="url(#colorRisk)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="phenomenal p-4">
              <h2 className="text-lg text-logos mb-4">리스크 분포도 Risk Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis type="number" dataKey="probability" name="발생확률" unit="%" stroke="#909090" />
                  <YAxis type="number" dataKey="impact" name="영향도" stroke="#909090" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A' }} />
                  <Scatter name="프로젝트" data={riskDistribution} fill="#00D9FF">
                    {riskDistribution.map((entry, index) => (
                      <circle key={`dot-${index}`} r={8} fill={
                        entry.severity === 'high' ? '#F87171' :
                        entry.severity === 'medium' ? '#FBBF24' : '#34D399'
                      } />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* 리스크 감지 */}
        {activeTab === 'risk' && (
          <div className="phenomenal p-4">
            <h2 className="text-lg text-logos mb-4">AI 리스크 감지 Risk Detection</h2>
            <div className="space-y-3">
              {riskDetection.map((risk) => (
                <div
                  key={risk.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    risk.severity === 'high' ? 'border-danger bg-danger bg-opacity-10' :
                    risk.severity === 'medium' ? 'border-warning bg-warning bg-opacity-10' :
                    'border-synthesis bg-synthesis bg-opacity-10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className={`w-4 h-4 ${
                          risk.severity === 'high' ? 'text-danger' :
                          risk.severity === 'medium' ? 'text-warning' : 'text-synthesis'
                        }`} />
                        <span className="text-sm text-logos font-medium">{risk.project}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          risk.severity === 'high' ? 'bg-danger text-void' :
                          risk.severity === 'medium' ? 'bg-warning text-void' :
                          'bg-synthesis text-void'
                        }`}>
                          {risk.severity === 'high' ? '높음' : risk.severity === 'medium' ? '중간' : '낮음'}
                        </span>
                      </div>
                      <p className="text-sm text-pneuma">{risk.message}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-nous">발생확률</div>
                      <div className={`text-lg font-medium ${
                        risk.severity === 'high' ? 'text-danger' :
                        risk.severity === 'medium' ? 'text-warning' : 'text-synthesis'
                      }`}>{risk.probability}%</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs text-nous">예상 손실: </span>
                        <span className="text-sm text-danger">{risk.impact.toLocaleString()}백만</span>
                      </div>
                      <div>
                        <span className="text-xs text-nous">감지 시간: </span>
                        <span className="text-sm text-pneuma">{risk.timestamp}</span>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-thesis text-void rounded text-xs hover:bg-opacity-90 transition-colors">
                      대응방안 보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 알림 히스토리 */}
        {activeTab === 'alert' && (
          <div className="phenomenal p-4">
            <h2 className="text-lg text-logos mb-4">알림 히스토리 Alert History</h2>
            <div className="space-y-2">
              {alertHistory.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 rounded hover:bg-phenomenon transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {alert.type === 'critical' && <XCircle className="w-5 h-5 text-danger" />}
                    {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-warning" />}
                    {alert.type === 'info' && <CheckCircle className="w-5 h-5 text-synthesis" />}
                    <div>
                      <div className="text-sm text-logos">{alert.title}</div>
                      <div className="text-xs text-pneuma">{alert.project}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-nous">
                      <Clock className="w-3 h-3" />
                      {alert.time}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      alert.status === 'active'
                        ? 'bg-warning bg-opacity-20 text-warning'
                        : 'bg-synthesis bg-opacity-20 text-synthesis'
                    }`}>
                      {alert.status === 'active' ? '활성' : '해결'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
