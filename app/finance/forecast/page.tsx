'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function ForecastPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [forecastPeriod, setForecastPeriod] = useState<string>('12');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data);
  };

  // 예산 대비 실적 데이터
  const budgetVsActual = [
    { month: '1월', budget: 2150, actual: 2180, variance: 30 },
    { month: '2월', budget: 2300, actual: 2250, variance: -50 },
    { month: '3월', budget: 2200, actual: 2280, variance: 80 },
    { month: '4월', budget: 2400, actual: 2350, variance: -50 },
    { month: '5월', budget: 2350, actual: 2420, variance: 70 },
    { month: '6월', budget: 2500, actual: 2480, variance: -20 },
    { month: '7월', budget: 2450, actual: 2520, variance: 70 },
    { month: '8월', budget: 2600, actual: 2550, variance: -50 },
    { month: '9월', budget: 2550, actual: 2600, variance: 50 },
  ];

  // 재무 예측 데이터
  const forecast = [
    { month: '10월', type: 'actual', revenue: 2650, cost: 2250, profit: 400 },
    { month: '11월', type: 'forecast', revenue: 2720, cost: 2310, profit: 410 },
    { month: '12월', type: 'forecast', revenue: 2800, cost: 2380, profit: 420 },
    { month: '1월', type: 'forecast', revenue: 2650, cost: 2250, profit: 400 },
    { month: '2월', type: 'forecast', revenue: 2850, cost: 2420, profit: 430 },
    { month: '3월', type: 'forecast', revenue: 2950, cost: 2505, profit: 445 },
  ];

  // 현금흐름 예측
  const cashFlowForecast = [
    { month: '10월', operating: 380, investing: -120, financing: 50, net: 310 },
    { month: '11월', operating: 420, investing: -80, financing: 30, net: 370 },
    { month: '12월', operating: 450, investing: -150, financing: 80, net: 380 },
    { month: '1월', operating: 390, investing: -100, financing: 40, net: 330 },
    { month: '2월', operating: 460, investing: -90, financing: 60, net: 430 },
    { month: '3월', operating: 480, investing: -120, financing: 50, net: 410 },
  ];

  // 프로젝트별 수익성 예측
  const projectProfitability = [
    { project: '강동 오피스텔 A동', budget: 8500, forecast: 8720, variance: 220, margin: 14.8 },
    { project: '송파 상가', budget: 4200, forecast: 4180, variance: -20, margin: 13.2 },
    { project: '판교 도로', budget: 6800, forecast: 6950, variance: 150, margin: 15.5 },
    { project: '인천 물류센터', budget: 9500, forecast: 9380, variance: -120, margin: 12.9 },
    { project: '용인 아파트', budget: 15200, forecast: 15480, variance: 280, margin: 16.2 },
  ];

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-light text-logos">재무 전망 Forecast</h1>
          <div className="flex gap-2">
            <select
              value={forecastPeriod}
              onChange={(e) => setForecastPeriod(e.target.value)}
              className="px-4 py-2 bg-phenomenon border border-essence rounded-md text-logos"
            >
              <option value="6">6개월</option>
              <option value="12">12개월</option>
              <option value="24">24개월</option>
            </select>
          </div>
        </div>

        {/* 핵심 지표 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="phenomenal p-4 cursor-pointer hover:ring-2 hover:ring-thesis transition-all" onClick={() => window.location.href = '/finance/accounting'}>
            <div className="text-xs text-nous mb-1">예상 매출 (12개월)</div>
            <div className="text-2xl text-thesis font-light">32,420억</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-thesis" />
              <span className="text-xs text-thesis">+8.2%</span>
            </div>
          </div>
          <div className="phenomenal p-4 cursor-pointer hover:ring-2 hover:ring-synthesis transition-all" onClick={() => window.location.href = '/finance/accounting'}>
            <div className="text-xs text-nous mb-1">예상 이익</div>
            <div className="text-2xl text-synthesis font-light">5,120억</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-synthesis" />
              <span className="text-xs text-synthesis">+12.5%</span>
            </div>
          </div>
          <div className="phenomenal p-4 cursor-pointer hover:ring-2 hover:ring-thesis transition-all" onClick={() => window.location.href = '/analysis/performance'}>
            <div className="text-xs text-nous mb-1">예상 이익률</div>
            <div className="text-2xl text-logos font-light">15.8%</div>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle className="w-3 h-3 text-thesis" />
              <span className="text-xs text-pneuma">목표 달성</span>
            </div>
          </div>
          <div className="phenomenal p-4 cursor-pointer hover:ring-2 hover:ring-warning transition-all" onClick={() => window.location.href = '/analysis/simulation'}>
            <div className="text-xs text-nous mb-1">리스크 프로젝트</div>
            <div className="text-2xl text-warning font-light">2개</div>
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3 text-warning" />
              <span className="text-xs text-warning">주의 필요</span>
            </div>
          </div>
        </div>

        {/* 예산 대비 실적 */}
        <div className="phenomenal p-4 mb-6">
          <h2 className="text-lg text-logos mb-4">예산 대비 실적 Budget vs Actual</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetVsActual}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" stroke="#909090" />
              <YAxis stroke="#909090" />
              <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A' }} />
              <Legend />
              <Bar dataKey="budget" name="예산" fill="#8B5CF6" />
              <Bar dataKey="actual" name="실적" fill="#00D9FF" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 수익/비용 예측 */}
        <div className="phenomenal p-4 mb-6">
          <h2 className="text-lg text-logos mb-4">수익/비용 예측 Revenue & Cost Forecast</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={forecast}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00D9FF" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" stroke="#909090" />
              <YAxis stroke="#909090" />
              <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A' }} />
              <Legend />
              <Area type="monotone" dataKey="revenue" name="매출" stroke="#00D9FF" fillOpacity={1} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="cost" name="원가" stroke="#F59E0B" fillOpacity={1} fill="url(#colorCost)" />
              <Area type="monotone" dataKey="profit" name="이익" stroke="#10B981" fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 현금흐름 예측 */}
        <div className="phenomenal p-4 mb-6">
          <h2 className="text-lg text-logos mb-4">현금흐름 예측 Cash Flow Forecast</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cashFlowForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" stroke="#909090" />
              <YAxis stroke="#909090" />
              <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A' }} />
              <Legend />
              <Bar dataKey="operating" name="영업활동" fill="#00D9FF" />
              <Bar dataKey="investing" name="투자활동" fill="#F59E0B" />
              <Bar dataKey="financing" name="재무활동" fill="#8B5CF6" />
              <Bar dataKey="net" name="순현금흐름" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 프로젝트별 수익성 예측 */}
        <div className="phenomenal p-4">
          <h2 className="text-lg text-logos mb-4">프로젝트별 수익성 예측 Project Profitability</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-essence text-nous text-sm">
                  <th className="text-left py-3 px-2">프로젝트</th>
                  <th className="text-right py-3 px-2">예산</th>
                  <th className="text-right py-3 px-2">예측</th>
                  <th className="text-right py-3 px-2">차이</th>
                  <th className="text-right py-3 px-2">이익률</th>
                  <th className="text-left py-3 px-2">상태</th>
                </tr>
              </thead>
              <tbody>
                {projectProfitability.map((item, idx) => {
                  // 프로젝트 이름으로 실제 프로젝트 ID 찾기
                  const matchedProject = projects.find(p => p.projectName === item.project);

                  return (
                  <tr
                    key={idx}
                    className="border-b border-phenomenon hover:bg-phenomenon transition-colors cursor-pointer"
                    onClick={() => matchedProject && (window.location.href = `/projects/${matchedProject.id}?view=forecast`)}
                  >
                    <td className="py-3 px-2 text-sm text-logos hover:text-thesis transition-colors">{item.project}</td>
                    <td className="py-3 px-2 text-sm text-pneuma text-right">{item.budget.toLocaleString()}백만</td>
                    <td className="py-3 px-2 text-sm text-thesis text-right">{item.forecast.toLocaleString()}백만</td>
                    <td className={`py-3 px-2 text-sm text-right ${item.variance >= 0 ? 'text-thesis' : 'text-warning'}`}>
                      {item.variance >= 0 ? '+' : ''}{item.variance.toLocaleString()}백만
                    </td>
                    <td className="py-3 px-2 text-sm text-synthesis text-right">{item.margin}%</td>
                    <td className="py-3 px-2 text-sm">
                      {item.variance >= 0 ? (
                        <span className="px-2 py-1 bg-thesis bg-opacity-20 text-thesis rounded text-xs">양호</span>
                      ) : (
                        <span className="px-2 py-1 bg-warning bg-opacity-20 text-warning rounded text-xs">주의</span>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
