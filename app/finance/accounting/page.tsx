'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Filter } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AccountingPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [accountType, setAccountType] = useState<string>('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();

      // 중요: 데이터가 배열인지 확인하는 코드 추가
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        // 배열이 아닐 경우, 콘솔에 에러를 기록하고 빈 배열로 설정하여 에러 방지
        console.error("API 응답이 배열이 아닙니다:", data);
        setProjects([]);
      }
    } catch (error) {
      console.error("프로젝트 데이터를 가져오는 데 실패했습니다:", error);
      setProjects([]); // 네트워크 에러 등이 발생해도 빈 배열로 설정
    }
  };

  // 모의 분개 데이터
  const journalEntries = [
    { id: 1, date: '2025-10-01', account: '공사미수금', debit: 850000000, credit: 0, project: '강동 오피스텔 A동', description: '10월 기성금 청구' },
    { id: 2, date: '2025-10-01', account: '공사수익', debit: 0, credit: 850000000, project: '강동 오피스텔 A동', description: '10월 기성금 청구' },
    { id: 3, date: '2025-10-02', account: '외주비', debit: 320000000, credit: 0, project: '송파 상가', description: '하도급 공사비' },
    { id: 4, date: '2025-10-02', account: '미지급금', debit: 0, credit: 320000000, project: '송파 상가', description: '하도급 공사비' },
    { id: 5, date: '2025-10-03', account: '당좌예금', debit: 650000000, credit: 0, project: '강동 오피스텔 A동', description: '9월 기성금 입금' },
    { id: 6, date: '2025-10-03', account: '공사미수금', debit: 0, credit: 650000000, project: '강동 오피스텔 A동', description: '9월 기성금 입금' },
    { id: 7, date: '2025-10-04', account: '재료비', debit: 180000000, credit: 0, project: '판교 도로', description: '레미콘 구입' },
    { id: 8, date: '2025-10-04', account: '당좌예금', debit: 0, credit: 180000000, project: '판교 도로', description: '레미콘 구입' },
  ];

  // 재무제표 데이터
  const incomeStatement = [
    { category: '공사수익', amount: 258000, percent: 100 },
    { category: '공사원가', amount: -219300, percent: -85 },
    { category: '공사총이익', amount: 38700, percent: 15 },
    { category: '판매관리비', amount: -12900, percent: -5 },
    { category: '영업이익', amount: 25800, percent: 10 },
    { category: '영업외수익', amount: 2580, percent: 1 },
    { category: '영업외비용', amount: -5160, percent: -2 },
    { category: '당기순이익', amount: 23220, percent: 9 },
  ];

  // 원가 집계 데이터
  const costData = [
    { month: '1월', material: 1200, labor: 800, subcontract: 2100, overhead: 450 },
    { month: '2월', material: 1350, labor: 900, subcontract: 2300, overhead: 480 },
    { month: '3월', material: 1280, labor: 850, subcontract: 2200, overhead: 460 },
    { month: '4월', material: 1420, labor: 920, subcontract: 2400, overhead: 500 },
    { month: '5월', material: 1380, labor: 880, subcontract: 2350, overhead: 490 },
    { month: '6월', material: 1450, labor: 950, subcontract: 2500, overhead: 520 },
  ];

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-light text-logos">회계 관리 Accounting</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-thesis text-void rounded-md hover:bg-opacity-90 transition-colors">
            <Download className="w-4 h-4" />
            재무제표 다운로드
          </button>
        </div>

        {/* 필터 */}
        <div className="phenomenal p-4 mb-6 flex gap-4">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="flex-1 px-4 py-2 bg-phenomenon border border-essence rounded-md text-logos"
          >
            <option value="all">전체 프로젝트</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.projectName}</option>
            ))}
          </select>
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="flex-1 px-4 py-2 bg-phenomenon border border-essence rounded-md text-logos"
          >
            <option value="all">전체 계정</option>
            <option value="asset">자산</option>
            <option value="liability">부채</option>
            <option value="revenue">수익</option>
            <option value="expense">비용</option>
          </select>
        </div>

        {/* 분개장 */}
        <div className="phenomenal p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg text-logos">분개장 Journal Entries</h2>
            <button className="text-sm text-thesis hover:underline">전체 보기</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-essence text-nous text-sm">
                  <th className="text-left py-3 px-2">날짜</th>
                  <th className="text-left py-3 px-2">계정과목</th>
                  <th className="text-right py-3 px-2">차변</th>
                  <th className="text-right py-3 px-2">대변</th>
                  <th className="text-left py-3 px-2">프로젝트</th>
                  <th className="text-left py-3 px-2">적요</th>
                </tr>
              </thead>
              <tbody>
                {journalEntries.map(entry => (
                  <tr key={entry.id} className="border-b border-phenomenon hover:bg-phenomenon transition-colors">
                    <td className="py-3 px-2 text-sm text-pneuma">{entry.date}</td>
                    <td className="py-3 px-2 text-sm text-logos">{entry.account}</td>
                    <td className="py-3 px-2 text-sm text-thesis text-right">
                      {entry.debit > 0 ? entry.debit.toLocaleString() : '-'}
                    </td>
                    <td className="py-3 px-2 text-sm text-synthesis text-right">
                      {entry.credit > 0 ? entry.credit.toLocaleString() : '-'}
                    </td>
                    <td className="py-3 px-2 text-sm text-pneuma">{entry.project}</td>
                    <td className="py-3 px-2 text-sm text-pneuma">{entry.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 손익계산서 */}
        <div className="phenomenal p-4 mb-6">
          <h2 className="text-lg text-logos mb-4">손익계산서 Income Statement</h2>
          <div className="space-y-2">
            {incomeStatement.map((item, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center py-2 px-3 rounded ${
                  item.category.includes('이익') ? 'bg-phenomenon font-medium' : ''
                }`}
              >
                <span className="text-sm text-logos">{item.category}</span>
                <div className="flex items-center gap-4">
                  <span className={`text-sm ${item.amount >= 0 ? 'text-thesis' : 'text-danger'}`}>
                    {item.amount >= 0 ? '+' : ''}{item.amount.toLocaleString()}백만
                  </span>
                  <span className="text-sm text-nous w-16 text-right">{item.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 원가 집계 */}
        <div className="phenomenal p-4">
          <h2 className="text-lg text-logos mb-4">월별 원가 집계 Cost Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" stroke="#909090" />
              <YAxis stroke="#909090" />
              <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A' }} />
              <Legend />
              <Bar dataKey="material" name="재료비" fill="#00D9FF" stackId="a" />
              <Bar dataKey="labor" name="노무비" fill="#10B981" stackId="a" />
              <Bar dataKey="subcontract" name="외주비" fill="#F59E0B" stackId="a" />
              <Bar dataKey="overhead" name="경비" fill="#8B5CF6" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
