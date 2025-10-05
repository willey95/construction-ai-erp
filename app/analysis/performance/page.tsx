'use client';

import { useState } from 'react';
import { TrendingUp, Target, Award } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function PerformancePage() {
  const [period, setPeriod] = useState<string>('quarter');
  const [department, setDepartment] = useState<string>('all');

  // 부문별 성과 데이터
  const departmentPerformance = [
    { name: '주택', revenue: 12800, cost: 10880, profit: 1920, margin: 15.0 },
    { name: '토목', revenue: 8500, cost: 7310, profit: 1190, margin: 14.0 },
    { name: '플랜트', revenue: 6200, cost: 5270, profit: 930, margin: 15.0 },
    { name: '에너지', revenue: 4800, cost: 3984, profit: 816, margin: 17.0 },
  ];

  // 프로젝트별 수익성
  const projectProfitability = [
    { project: '강동 오피스텔 A동', revenue: 8500, profit: 1275, margin: 15.0, status: 'high' },
    { project: '판교 도로', revenue: 6800, profit: 1054, margin: 15.5, status: 'high' },
    { project: '용인 아파트', revenue: 15200, profit: 2464, margin: 16.2, status: 'high' },
    { project: '인천 물류센터', revenue: 9500, profit: 1226, margin: 12.9, status: 'medium' },
    { project: '송파 상가', revenue: 4200, profit: 554, margin: 13.2, status: 'medium' },
    { project: '성남 주상복합', revenue: 7600, profit: 836, margin: 11.0, status: 'low' },
  ];

  // 월별 성과 추이
  const monthlyPerformance = [
    { month: '1월', revenue: 2180, profit: 320, margin: 14.7 },
    { month: '2월', revenue: 2250, profit: 338, margin: 15.0 },
    { month: '3월', revenue: 2280, profit: 342, margin: 15.0 },
    { month: '4월', revenue: 2350, profit: 353, margin: 15.0 },
    { month: '5월', revenue: 2420, profit: 363, margin: 15.0 },
    { month: '6월', revenue: 2480, profit: 372, margin: 15.0 },
    { month: '7월', revenue: 2520, profit: 378, margin: 15.0 },
    { month: '8월', revenue: 2550, profit: 383, margin: 15.0 },
    { month: '9월', revenue: 2600, profit: 390, margin: 15.0 },
  ];

  // KPI 레이더 차트 데이터
  const kpiRadar = [
    { metric: '수익성', value: 85, fullMark: 100 },
    { metric: '안전', value: 92, fullMark: 100 },
    { metric: '품질', value: 88, fullMark: 100 },
    { metric: '공정', value: 78, fullMark: 100 },
    { metric: '고객만족', value: 90, fullMark: 100 },
    { metric: '리스크관리', value: 82, fullMark: 100 },
  ];

  // 프로젝트 유형별 비중
  const projectTypeDistribution = [
    { name: '부동산', value: 12800, percent: 40 },
    { name: '토목/도로', value: 8500, percent: 26 },
    { name: '플랜트', value: 6200, percent: 19 },
    { name: '에너지', value: 4800, percent: 15 },
  ];

  const COLORS = ['#00D9FF', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-light text-logos">전사 성과 분석 Performance</h1>
          <div className="flex gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 bg-phenomenon border border-essence rounded-md text-logos"
            >
              <option value="month">월간</option>
              <option value="quarter">분기</option>
              <option value="year">연간</option>
            </select>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-4 py-2 bg-phenomenon border border-essence rounded-md text-logos"
            >
              <option value="all">전체 부문</option>
              <option value="housing">주택</option>
              <option value="civil">토목</option>
              <option value="plant">플랜트</option>
              <option value="energy">에너지</option>
            </select>
          </div>
        </div>

        {/* 핵심 성과 지표 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">총 매출</div>
            <div className="text-2xl text-thesis font-light">32,300억</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-thesis" />
              <span className="text-xs text-thesis">+15.2%</span>
            </div>
          </div>
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">총 이익</div>
            <div className="text-2xl text-synthesis font-light">4,850억</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-synthesis" />
              <span className="text-xs text-synthesis">+18.5%</span>
            </div>
          </div>
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">평균 이익률</div>
            <div className="text-2xl text-logos font-light">15.0%</div>
            <div className="flex items-center gap-1 mt-1">
              <Target className="w-3 h-3 text-thesis" />
              <span className="text-xs text-pneuma">목표 달성</span>
            </div>
          </div>
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">우수 프로젝트</div>
            <div className="text-2xl text-logos font-light">18개</div>
            <div className="flex items-center gap-1 mt-1">
              <Award className="w-3 h-3 text-thesis" />
              <span className="text-xs text-pneuma">78%</span>
            </div>
          </div>
        </div>

        {/* 부문별 성과 */}
        <div className="phenomenal p-4 mb-6">
          <h2 className="text-lg text-logos mb-4">부문별 성과 Department Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="name" stroke="#909090" />
              <YAxis stroke="#909090" />
              <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A' }} />
              <Legend />
              <Bar dataKey="revenue" name="매출" fill="#00D9FF" />
              <Bar dataKey="profit" name="이익" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 월별 성과 추이 & 프로젝트 유형별 비중 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="phenomenal p-4">
            <h2 className="text-lg text-logos mb-4">월별 성과 추이 Monthly Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="month" stroke="#909090" />
                <YAxis yAxisId="left" stroke="#909090" />
                <YAxis yAxisId="right" orientation="right" stroke="#909090" />
                <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="매출" stroke="#00D9FF" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="margin" name="이익률(%)" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="phenomenal p-4">
            <h2 className="text-lg text-logos mb-4">프로젝트 유형별 비중 Project Types</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI 레이더 차트 */}
        <div className="phenomenal p-4 mb-6">
          <h2 className="text-lg text-logos mb-4">핵심 성과 지표 KPI Radar</h2>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={kpiRadar}>
              <PolarGrid stroke="#3A3A3A" />
              <PolarAngleAxis dataKey="metric" stroke="#909090" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#909090" />
              <Radar name="실적" dataKey="value" stroke="#00D9FF" fill="#00D9FF" fillOpacity={0.6} />
              <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A' }} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 프로젝트별 수익성 */}
        <div className="phenomenal p-4">
          <h2 className="text-lg text-logos mb-4">프로젝트별 수익성 Project Profitability</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-essence text-nous text-sm">
                  <th className="text-left py-3 px-2">프로젝트</th>
                  <th className="text-right py-3 px-2">매출</th>
                  <th className="text-right py-3 px-2">이익</th>
                  <th className="text-right py-3 px-2">이익률</th>
                  <th className="text-left py-3 px-2">등급</th>
                </tr>
              </thead>
              <tbody>
                {projectProfitability.map((item, idx) => (
                  <tr key={idx} className="border-b border-phenomenon hover:bg-phenomenon transition-colors">
                    <td className="py-3 px-2 text-sm text-logos">{item.project}</td>
                    <td className="py-3 px-2 text-sm text-pneuma text-right">{item.revenue.toLocaleString()}백만</td>
                    <td className="py-3 px-2 text-sm text-thesis text-right">{item.profit.toLocaleString()}백만</td>
                    <td className="py-3 px-2 text-sm text-synthesis text-right">{item.margin}%</td>
                    <td className="py-3 px-2 text-sm">
                      {item.status === 'high' && (
                        <span className="px-2 py-1 bg-thesis bg-opacity-20 text-thesis rounded text-xs">우수</span>
                      )}
                      {item.status === 'medium' && (
                        <span className="px-2 py-1 bg-synthesis bg-opacity-20 text-synthesis rounded text-xs">양호</span>
                      )}
                      {item.status === 'low' && (
                        <span className="px-2 py-1 bg-warning bg-opacity-20 text-warning rounded text-xs">개선필요</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
