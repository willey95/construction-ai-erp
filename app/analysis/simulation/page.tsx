'use client';

import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function SimulationPage() {
  const [scenario, setScenario] = useState<string>('base');
  const [bidWinRate, setBidWinRate] = useState<number>(70);
  const [costInflation, setCostInflation] = useState<number>(3);
  const [revenueGrowth, setRevenueGrowth] = useState<number>(10);
  const [simulatedResults, setSimulatedResults] = useState<{
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  } | null>(null);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // 시나리오별 결과 데이터
  const scenarioResults = {
    base: { revenue: 32000, cost: 27200, profit: 4800, margin: 15.0, risk: 'low' },
    optimistic: { revenue: 38400, cost: 30720, profit: 7680, margin: 20.0, risk: 'medium' },
    pessimistic: { revenue: 25600, cost: 24320, profit: 1280, margin: 5.0, risk: 'high' },
  };

  // 시뮬레이션 결과 추이
  const simulationTrend = [
    { month: '10월', base: 2650, optimistic: 3180, pessimistic: 2120 },
    { month: '11월', base: 2720, optimistic: 3264, pessimistic: 2176 },
    { month: '12월', base: 2800, optimistic: 3360, pessimistic: 2240 },
    { month: '1월', base: 2650, optimistic: 3180, pessimistic: 2120 },
    { month: '2월', base: 2850, optimistic: 3420, pessimistic: 2280 },
    { month: '3월', base: 2950, optimistic: 3540, pessimistic: 2360 },
    { month: '4월', base: 3100, optimistic: 3720, pessimistic: 2480 },
    { month: '5월', base: 3200, optimistic: 3840, pessimistic: 2560 },
    { month: '6월', base: 3280, optimistic: 3936, pessimistic: 2624 },
  ];

  // 민감도 분석 데이터
  const sensitivityAnalysis = [
    { factor: '입찰 낙찰률', change: '-10%', impact: -1200, percent: -25 },
    { factor: '입찰 낙찰률', change: '+10%', impact: 1200, percent: 25 },
    { factor: '원가 상승률', change: '+5%', impact: -1360, percent: -28 },
    { factor: '원가 상승률', change: '-5%', impact: 1360, percent: 28 },
    { factor: '매출 성장률', change: '+15%', impact: 1600, percent: 33 },
    { factor: '매출 성장률', change: '-15%', impact: -1600, percent: -33 },
  ];

  // 리스크 시나리오
  const riskScenarios = [
    {
      scenario: '원자재 가격 급등',
      probability: 35,
      impact: -2400,
      mitigation: '장기 공급계약 체결, 헤지 전략'
    },
    {
      scenario: '수주 부진',
      probability: 25,
      impact: -1800,
      mitigation: '신규 시장 개척, 입찰 전략 다각화'
    },
    {
      scenario: '공사 지연',
      probability: 40,
      impact: -1200,
      mitigation: '공정 관리 강화, 예비 인력 확보'
    },
    {
      scenario: '금리 인상',
      probability: 60,
      impact: -800,
      mitigation: '고정금리 전환, 차입 구조 개선'
    },
  ];

  // 의사결정 시나리오
  const decisionScenarios = [
    {
      decision: '신규 플랜트 사업 진출',
      investment: 5000,
      expectedReturn: 8500,
      roi: 70,
      payback: 2.5,
      recommendation: 'positive'
    },
    {
      decision: '해외 시장 확대',
      investment: 8000,
      expectedReturn: 14400,
      roi: 80,
      payback: 3.2,
      recommendation: 'positive'
    },
    {
      decision: '자동화 설비 투자',
      investment: 3000,
      expectedReturn: 4500,
      roi: 50,
      payback: 4.0,
      recommendation: 'neutral'
    },
  ];

  const currentScenario = scenarioResults[scenario as keyof typeof scenarioResults];

  const runSimulation = () => {
    setIsRunning(true);

    // 시뮬레이션 계산 - 기본값 대비 파라미터 변화 반영
    setTimeout(() => {
      const baseRevenue = 32000;
      const bidWinFactor = bidWinRate / 70; // 70%가 기준
      const revenueGrowthFactor = 1 + revenueGrowth / 100;
      const costInflationFactor = 1 + costInflation / 100;

      const adjustedRevenue = baseRevenue * bidWinFactor * revenueGrowthFactor;
      const baseCostRatio = 0.85;
      const adjustedCost = adjustedRevenue * baseCostRatio * costInflationFactor;
      const adjustedProfit = adjustedRevenue - adjustedCost;
      const adjustedMargin = adjustedRevenue > 0 ? (adjustedProfit / adjustedRevenue) * 100 : 0;

      setSimulatedResults({
        revenue: adjustedRevenue,
        cost: adjustedCost,
        profit: adjustedProfit,
        margin: adjustedMargin,
      });

      setIsSimulated(true);
      setIsRunning(false);
    }, 800); // 시뮬레이션 실행 느낌을 주기 위한 짧은 딜레이
  };

  const resetSimulation = () => {
    setBidWinRate(70);
    setCostInflation(3);
    setRevenueGrowth(10);
    setScenario('base');
    setSimulatedResults(null);
    setIsSimulated(false);
  };

  // 표시할 결과 선택: 시뮬레이션 결과가 있으면 그것을, 없으면 기본 시나리오
  const displayResults = isSimulated && simulatedResults ? simulatedResults : currentScenario;

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-light text-logos">시뮬레이션 분석 Simulation</h1>
          <div className="flex gap-2">
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-2 bg-thesis text-void rounded-md hover:bg-opacity-90 transition-colors ${
                isRunning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? '실행 중...' : '실행'}
            </button>
            <button
              onClick={resetSimulation}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-phenomenon border border-essence text-logos rounded-md hover:bg-essence transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              초기화
            </button>
          </div>
        </div>

        {/* 시나리오 선택 & 파라미터 조정 */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="phenomenal p-4">
            <h3 className="text-sm text-nous mb-3">시나리오 선택</h3>
            <div className="space-y-2">
              {['base', 'optimistic', 'pessimistic'].map((s) => (
                <button
                  key={s}
                  onClick={() => setScenario(s)}
                  className={`w-full px-3 py-2 rounded text-sm transition-colors ${
                    scenario === s
                      ? 'bg-thesis text-void'
                      : 'bg-phenomenon text-pneuma hover:bg-essence'
                  }`}
                >
                  {s === 'base' && '기본 시나리오'}
                  {s === 'optimistic' && '낙관적 시나리오'}
                  {s === 'pessimistic' && '비관적 시나리오'}
                </button>
              ))}
            </div>
          </div>

          <div className="phenomenal p-4">
            <h3 className="text-sm text-nous mb-3">입찰 낙찰률 (%)</h3>
            <input
              type="range"
              min="30"
              max="100"
              value={bidWinRate}
              onChange={(e) => setBidWinRate(Number(e.target.value))}
              className="w-full mb-2"
            />
            <div className="text-2xl text-thesis font-light text-center">{bidWinRate}%</div>
          </div>

          <div className="phenomenal p-4">
            <h3 className="text-sm text-nous mb-3">원가 상승률 (%)</h3>
            <input
              type="range"
              min="0"
              max="15"
              value={costInflation}
              onChange={(e) => setCostInflation(Number(e.target.value))}
              className="w-full mb-2"
            />
            <div className="text-2xl text-warning font-light text-center">{costInflation}%</div>
          </div>
        </div>

        {/* 시뮬레이션 결과 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className={`phenomenal p-4 ${isSimulated ? 'ring-2 ring-thesis' : ''}`}>
            <div className="text-xs text-nous mb-1">예상 매출 {isSimulated && <span className="text-thesis">●</span>}</div>
            <div className="text-2xl text-thesis font-light">{displayResults.revenue.toLocaleString()}억</div>
          </div>
          <div className={`phenomenal p-4 ${isSimulated ? 'ring-2 ring-thesis' : ''}`}>
            <div className="text-xs text-nous mb-1">예상 원가 {isSimulated && <span className="text-thesis">●</span>}</div>
            <div className="text-2xl text-warning font-light">{displayResults.cost.toLocaleString()}억</div>
          </div>
          <div className={`phenomenal p-4 ${isSimulated ? 'ring-2 ring-thesis' : ''}`}>
            <div className="text-xs text-nous mb-1">예상 이익 {isSimulated && <span className="text-thesis">●</span>}</div>
            <div className="text-2xl text-synthesis font-light">{displayResults.profit.toLocaleString()}억</div>
          </div>
          <div className={`phenomenal p-4 ${isSimulated ? 'ring-2 ring-thesis' : ''}`}>
            <div className="text-xs text-nous mb-1">예상 이익률 {isSimulated && <span className="text-thesis">●</span>}</div>
            <div className="text-2xl text-logos font-light">{displayResults.margin.toFixed(1)}%</div>
          </div>
        </div>

        {/* 시나리오별 추이 */}
        <div className="phenomenal p-4 mb-6">
          <h2 className="text-lg text-logos mb-4">시나리오별 매출 추이 Scenario Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={simulationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" stroke="#909090" />
              <YAxis stroke="#909090" />
              <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A' }} />
              <Legend />
              <Line type="monotone" dataKey="optimistic" name="낙관" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="base" name="기본" stroke="#00D9FF" strokeWidth={2} />
              <Line type="monotone" dataKey="pessimistic" name="비관" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 민감도 분석 */}
        <div className="phenomenal p-4 mb-6">
          <h2 className="text-lg text-logos mb-4">민감도 분석 Sensitivity Analysis</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sensitivityAnalysis} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis type="number" stroke="#909090" />
              <YAxis dataKey="factor" type="category" width={120} stroke="#909090" />
              <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A' }} />
              <Legend />
              <Bar dataKey="impact" name="영향 (백만)" fill="#00D9FF">
                {sensitivityAnalysis.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.impact > 0 ? '#10B981' : '#F59E0B'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 리스크 시나리오 */}
        <div className="phenomenal p-4 mb-6">
          <h2 className="text-lg text-logos mb-4">리스크 시나리오 Risk Scenarios</h2>
          <div className="space-y-3">
            {riskScenarios.map((risk, idx) => (
              <div key={idx} className="p-3 bg-phenomenon rounded">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm text-logos font-medium">{risk.scenario}</h3>
                    <p className="text-xs text-pneuma mt-1">대응방안: {risk.mitigation}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-nous">발생확률</div>
                    <div className="text-lg text-warning">{risk.probability}%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-essence rounded-full h-2">
                    <div
                      className="bg-warning rounded-full h-2"
                      style={{ width: `${risk.probability}%` }}
                    />
                  </div>
                  <span className="text-sm text-danger">{risk.impact.toLocaleString()}백만</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 의사결정 시나리오 */}
        <div className="phenomenal p-4">
          <h2 className="text-lg text-logos mb-4">의사결정 시나리오 Decision Support</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-essence text-nous text-sm">
                  <th className="text-left py-3 px-2">의사결정</th>
                  <th className="text-right py-3 px-2">투자금액</th>
                  <th className="text-right py-3 px-2">예상 수익</th>
                  <th className="text-right py-3 px-2">ROI</th>
                  <th className="text-right py-3 px-2">회수기간</th>
                  <th className="text-left py-3 px-2">권고</th>
                </tr>
              </thead>
              <tbody>
                {decisionScenarios.map((decision, idx) => (
                  <tr key={idx} className="border-b border-phenomenon hover:bg-phenomenon transition-colors">
                    <td className="py-3 px-2 text-sm text-logos">{decision.decision}</td>
                    <td className="py-3 px-2 text-sm text-warning text-right">{decision.investment.toLocaleString()}백만</td>
                    <td className="py-3 px-2 text-sm text-thesis text-right">{decision.expectedReturn.toLocaleString()}백만</td>
                    <td className="py-3 px-2 text-sm text-synthesis text-right">{decision.roi}%</td>
                    <td className="py-3 px-2 text-sm text-pneuma text-right">{decision.payback}년</td>
                    <td className="py-3 px-2 text-sm">
                      {decision.recommendation === 'positive' && (
                        <span className="px-2 py-1 bg-thesis bg-opacity-20 text-thesis rounded text-xs">적극 추진</span>
                      )}
                      {decision.recommendation === 'neutral' && (
                        <span className="px-2 py-1 bg-synthesis bg-opacity-20 text-synthesis rounded text-xs">검토 필요</span>
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
