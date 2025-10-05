'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, TrendingUp, DollarSign, Settings, LineChart } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ZenCard,
  ZenButton,
  ZenDivider,
  ZenBadge,
} from '@/components/ZenDesignSystem';
import {
  FinancialForecastEngine,
  type ForecastMethod,
  type CurveType,
  type NewProjectParams,
  type FinancialForecast,
} from '@/lib/finance/FinancialForecastEngine';
import {
  LineChart as RechartsLine,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'forecast'>('basic');

  // 기본 프로젝트 정보
  const [formData, setFormData] = useState({
    projectCode: '',
    projectName: '',
    projectType: 'REAL_ESTATE',
    client: '',
    contractPrice: '',
    contractDate: new Date().toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    constructionPeriod: '12',
    status: 'PLANNED',
    location: '',
    description: '',
  });

  // 재무전망 방식 및 파라미터
  const [forecastMethod, setForecastMethod] = useState<ForecastMethod>('INDIRECT');
  const [forecastParams, setForecastParams] = useState<Partial<NewProjectParams>>({
    profitMargin: 15,
    costRatio: 85,
    curveType: 'S_CURVE',
    curveParam: 2.0,
    invoicingPeriod: 1,
    receivablePeriod: 2,
    retentionRate: 5,
    retentionPeriod: 12,
    paymentTermSubcontractor: 1,
    paymentTermMaterial: 1,
  });

  const [forecast, setForecast] = useState<FinancialForecast | null>(null);

  // 재무전망 시뮬레이션 실행
  useEffect(() => {
    if (formData.contractPrice && formData.constructionPeriod && formData.startDate) {
      const engine = new FinancialForecastEngine();
      const params: NewProjectParams = {
        contractPrice: parseFloat(formData.contractPrice),
        constructionPeriod: parseInt(formData.constructionPeriod),
        startDate: new Date(formData.startDate),
        profitMargin: forecastParams.profitMargin!,
        costRatio: forecastParams.costRatio!,
        curveType: forecastParams.curveType!,
        curveParam: forecastParams.curveParam,
        invoicingPeriod: forecastParams.invoicingPeriod!,
        receivablePeriod: forecastParams.receivablePeriod!,
        retentionRate: forecastParams.retentionRate!,
        retentionPeriod: forecastParams.retentionPeriod!,
        paymentTermSubcontractor: forecastParams.paymentTermSubcontractor!,
        paymentTermMaterial: forecastParams.paymentTermMaterial!,
      };

      const result = engine.generateForecast(forecastMethod, params);
      setForecast(result);
    }
  }, [formData, forecastMethod, forecastParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          contractPrice: parseFloat(formData.contractPrice),
          constructionPeriod: parseInt(formData.constructionPeriod),
          assumptions: {
            profitMargin: forecastParams.profitMargin! / 100,
            costRatio: forecastParams.costRatio! / 100,
            periodInvoicing: forecastParams.invoicingPeriod,
            periodReceivable: forecastParams.receivablePeriod,
            retentionRate: forecastParams.retentionRate! / 100,
            retentionPeriod: forecastParams.retentionPeriod,
            payMSubcon: forecastParams.paymentTermSubcontractor,
            payMMaterial: forecastParams.paymentTermMaterial,
            curveType: forecastParams.curveType,
          },
        }),
      });

      if (res.ok) {
        const project = await res.json();
        router.push(`/projects/${project.id}`);
      } else {
        alert('프로젝트 생성 실패');
      }
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      alert('프로젝트 생성 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleParamChange = (key: string, value: any) => {
    setForecastParams({ ...forecastParams, [key]: value });
  };

  return (
    <div className="min-h-screen bg-void">
      {/* Ambient gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-thesis/[0.03] rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-synthesis/[0.03] rounded-full blur-[128px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <button
          onClick={() => router.push('/projects')}
          className="flex items-center gap-2 text-pneuma/60 hover:text-logos mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-light">프로젝트 목록으로</span>
        </button>

        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-5xl font-extralight tracking-tight">
                  <span className="bg-gradient-to-r from-thesis via-synthesis to-thesis bg-clip-text text-transparent">
                    신규 프로젝트
                  </span>
                </h1>
                <ZenBadge variant="info" size="md">
                  New Project
                </ZenBadge>
              </div>
              <p className="text-sm text-pneuma/60 font-light tracking-wide">
                프로젝트 기본정보 및 재무전망 시뮬레이션
              </p>
            </div>
          </div>

          <ZenDivider />
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-3 rounded-xl font-light transition-all ${
              activeTab === 'basic'
                ? 'bg-thesis/20 border border-thesis/40 text-thesis'
                : 'bg-phenomenon/20 border border-essence/20 text-pneuma/60 hover:border-essence/40'
            }`}
          >
            기본 정보
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-6 py-3 rounded-xl font-light transition-all ${
              activeTab === 'forecast'
                ? 'bg-synthesis/20 border border-synthesis/40 text-synthesis'
                : 'bg-phenomenon/20 border border-essence/20 text-pneuma/60 hover:border-essence/40'
            }`}
          >
            재무전망
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <ZenCard border="medium" className="mb-8">
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-nous/80 mb-2 font-light">프로젝트 코드 *</label>
                      <input
                        type="text"
                        name="projectCode"
                        value={formData.projectCode}
                        onChange={handleChange}
                        required
                        placeholder="예: RE-2026-001"
                        className="w-full px-4 py-3 bg-phenomenon/30 backdrop-blur-sm border border-essence/20 rounded-xl text-sm text-logos font-light placeholder:text-nous/40 focus:outline-none focus:border-thesis/40 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-nous/80 mb-2 font-light">프로젝트명 *</label>
                      <input
                        type="text"
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleChange}
                        required
                        placeholder="예: 강남 오피스텔 신축"
                        className="w-full px-4 py-3 bg-phenomenon/30 backdrop-blur-sm border border-essence/20 rounded-xl text-sm text-logos font-light placeholder:text-nous/40 focus:outline-none focus:border-thesis/40 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-nous/80 mb-2 font-light">프로젝트 유형 *</label>
                      <select
                        name="projectType"
                        value={formData.projectType}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-phenomenon/30 backdrop-blur-sm border border-essence/20 rounded-xl text-sm text-logos font-light focus:outline-none focus:border-thesis/40 transition-colors"
                      >
                        <option value="REAL_ESTATE">부동산 개발</option>
                        <option value="SIMPLE_CONTRACT">단순 도급</option>
                        <option value="INFRA">인프라</option>
                        <option value="ENERGY">에너지</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-nous/80 mb-2 font-light">발주처 *</label>
                      <input
                        type="text"
                        name="client"
                        value={formData.client}
                        onChange={handleChange}
                        required
                        placeholder="예: 삼성건설"
                        className="w-full px-4 py-3 bg-phenomenon/30 backdrop-blur-sm border border-essence/20 rounded-xl text-sm text-logos font-light placeholder:text-nous/40 focus:outline-none focus:border-thesis/40 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-nous/80 mb-2 font-light">계약금액 (억원) *</label>
                      <input
                        type="number"
                        name="contractPrice"
                        value={formData.contractPrice}
                        onChange={handleChange}
                        required
                        step="0.01"
                        placeholder="예: 1000"
                        className="w-full px-4 py-3 bg-phenomenon/30 backdrop-blur-sm border border-essence/20 rounded-xl text-sm text-logos font-light placeholder:text-nous/40 focus:outline-none focus:border-thesis/40 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-nous/80 mb-2 font-light">공사기간 (개월) *</label>
                      <input
                        type="number"
                        name="constructionPeriod"
                        value={formData.constructionPeriod}
                        onChange={handleChange}
                        required
                        placeholder="예: 12"
                        className="w-full px-4 py-3 bg-phenomenon/30 backdrop-blur-sm border border-essence/20 rounded-xl text-sm text-logos font-light placeholder:text-nous/40 focus:outline-none focus:border-thesis/40 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-nous/80 mb-2 font-light">계약일자 *</label>
                      <input
                        type="date"
                        name="contractDate"
                        value={formData.contractDate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-phenomenon/30 backdrop-blur-sm border border-essence/20 rounded-xl text-sm text-logos font-light focus:outline-none focus:border-thesis/40 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-nous/80 mb-2 font-light">착공일 *</label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-phenomenon/30 backdrop-blur-sm border border-essence/20 rounded-xl text-sm text-logos font-light focus:outline-none focus:border-thesis/40 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-nous/80 mb-2 font-light">준공일 *</label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-phenomenon/30 backdrop-blur-sm border border-essence/20 rounded-xl text-sm text-logos font-light focus:outline-none focus:border-thesis/40 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-nous/80 mb-2 font-light">상태 *</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-phenomenon/30 backdrop-blur-sm border border-essence/20 rounded-xl text-sm text-logos font-light focus:outline-none focus:border-thesis/40 transition-colors"
                      >
                        <option value="PLANNED">계획</option>
                        <option value="ACTIVE">진행중</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm text-nous/80 mb-2 font-light">프로젝트 위치</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="예: 서울특별시 강남구 테헤란로 123"
                        className="w-full px-4 py-3 bg-phenomenon/30 backdrop-blur-sm border border-essence/20 rounded-xl text-sm text-logos font-light placeholder:text-nous/40 focus:outline-none focus:border-thesis/40 transition-colors"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm text-nous/80 mb-2 font-light">프로젝트 설명</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        placeholder="프로젝트에 대한 간단한 설명을 입력하세요..."
                        className="w-full px-4 py-3 bg-phenomenon/30 backdrop-blur-sm border border-essence/20 rounded-xl text-sm text-logos font-light placeholder:text-nous/40 focus:outline-none focus:border-thesis/40 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>
              </ZenCard>

              <div className="flex justify-between">
                <ZenButton
                  variant="ghost"
                  onClick={() => router.push('/projects')}
                  type="button"
                >
                  취소
                </ZenButton>
                <ZenButton
                  variant="primary"
                  onClick={() => setActiveTab('forecast')}
                  type="button"
                  icon={TrendingUp}
                >
                  재무전망으로
                </ZenButton>
              </div>
            </motion.div>
          )}

          {/* Forecast Tab */}
          {activeTab === 'forecast' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Method Selection */}
              <ZenCard border="medium">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Settings className="w-5 h-5 text-thesis" />
                    <h2 className="text-xl font-light text-logos">전망 방식 선택</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setForecastMethod('INDIRECT')}
                      className={`p-6 rounded-xl border transition-all ${
                        forecastMethod === 'INDIRECT'
                          ? 'bg-thesis/10 border-thesis/40 ring-2 ring-thesis/20'
                          : 'bg-phenomenon/20 border-essence/20 hover:border-essence/40'
                      }`}
                    >
                      <h3 className="text-lg font-light text-logos mb-2">간접법</h3>
                      <p className="text-xs text-pneuma/60 font-light leading-relaxed">
                        공사진척률 기반으로 매출과 비용을 추정합니다. 신규 프로젝트에 적합합니다.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForecastMethod('DIRECT')}
                      className={`p-6 rounded-xl border transition-all ${
                        forecastMethod === 'DIRECT'
                          ? 'bg-synthesis/10 border-synthesis/40 ring-2 ring-synthesis/20'
                          : 'bg-phenomenon/20 border-essence/20 hover:border-essence/40'
                      }`}
                    >
                      <h3 className="text-lg font-light text-logos mb-2">직접법</h3>
                      <p className="text-xs text-pneuma/60 font-light leading-relaxed">
                        실제 현금흐름 기반으로 예측합니다. 진행중 프로젝트에 적합합니다.
                      </p>
                    </button>
                  </div>
                </div>
              </ZenCard>

              {/* Parameters */}
              <ZenCard border="medium">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <DollarSign className="w-5 h-5 text-synthesis" />
                    <h2 className="text-xl font-light text-logos">재무 파라미터</h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {/* 이익률 */}
                    <div>
                      <label className="block text-sm text-nous/80 mb-2 font-light flex items-center justify-between">
                        <span>이익률 (%)</span>
                        <span className="text-synthesis">{forecastParams.profitMargin}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="0.5"
                        value={forecastParams.profitMargin}
                        onChange={(e) => {
                          const profit = parseFloat(e.target.value);
                          handleParamChange('profitMargin', profit);
                          handleParamChange('costRatio', 100 - profit);
                        }}
                        className="w-full"
                      />
                    </div>

                    {/* 진척곡선 */}
                    <div>
                      <label className="block text-sm text-nous/80 mb-2 font-light">진척곡선</label>
                      <select
                        value={forecastParams.curveType}
                        onChange={(e) => handleParamChange('curveType', e.target.value as CurveType)}
                        className="w-full px-3 py-2 bg-phenomenon/30 border border-essence/20 rounded-lg text-sm text-logos"
                      >
                        <option value="S_CURVE">S-Curve</option>
                        <option value="LINEAR">직선</option>
                        <option value="FRONT_LOADED">초기집중</option>
                        <option value="BACK_LOADED">후반집중</option>
                      </select>
                    </div>

                    {/* 기성청구 주기 */}
                    <div>
                      <label className="block text-sm text-nous/80 mb-2 font-light">기성청구 주기 (월)</label>
                      <input
                        type="number"
                        min="1"
                        max="3"
                        value={forecastParams.invoicingPeriod}
                        onChange={(e) => handleParamChange('invoicingPeriod', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-phenomenon/30 border border-essence/20 rounded-lg text-sm text-logos"
                      />
                    </div>

                    {/* 미수금 회수기간 */}
                    <div>
                      <label className="block text-sm text-nous/80 mb-2 font-light">미수금 회수 (월)</label>
                      <input
                        type="number"
                        min="0"
                        max="6"
                        value={forecastParams.receivablePeriod}
                        onChange={(e) => handleParamChange('receivablePeriod', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-phenomenon/30 border border-essence/20 rounded-lg text-sm text-logos"
                      />
                    </div>

                    {/* 하자보증금 비율 */}
                    <div>
                      <label className="block text-sm text-nous/80 mb-2 font-light">하자보증금 (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={forecastParams.retentionRate}
                        onChange={(e) => handleParamChange('retentionRate', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-phenomenon/30 border border-essence/20 rounded-lg text-sm text-logos"
                      />
                    </div>

                    {/* 하도급 지급조건 */}
                    <div>
                      <label className="block text-sm text-nous/80 mb-2 font-light">하도급 지급 (월)</label>
                      <input
                        type="number"
                        min="0"
                        max="3"
                        value={forecastParams.paymentTermSubcontractor}
                        onChange={(e) => handleParamChange('paymentTermSubcontractor', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-phenomenon/30 border border-essence/20 rounded-lg text-sm text-logos"
                      />
                    </div>
                  </div>
                </div>
              </ZenCard>

              {/* Forecast Results */}
              {forecast && (
                <>
                  {/* Summary */}
                  <div className="grid grid-cols-4 gap-4">
                    <ZenCard border="subtle">
                      <div className="p-4">
                        <div className="text-xs text-nous/60 mb-1">총 매출</div>
                        <div className="text-lg font-light text-thesis">
                          {forecast.summary.totalRevenue.toFixed(1)}억
                        </div>
                      </div>
                    </ZenCard>

                    <ZenCard border="subtle">
                      <div className="p-4">
                        <div className="text-xs text-nous/60 mb-1">총 원가</div>
                        <div className="text-lg font-light text-warning">
                          {forecast.summary.totalCost.toFixed(1)}억
                        </div>
                      </div>
                    </ZenCard>

                    <ZenCard border="subtle">
                      <div className="p-4">
                        <div className="text-xs text-nous/60 mb-1">총 이익</div>
                        <div className="text-lg font-light text-synthesis">
                          {forecast.summary.totalProfit.toFixed(1)}억
                        </div>
                      </div>
                    </ZenCard>

                    <ZenCard border="subtle">
                      <div className="p-4">
                        <div className="text-xs text-nous/60 mb-1">최대 마이너스</div>
                        <div className="text-lg font-light text-danger">
                          {forecast.summary.maxCashOutflow.toFixed(1)}억
                        </div>
                      </div>
                    </ZenCard>
                  </div>

                  {/* Charts */}
                  <ZenCard border="medium">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <LineChart className="w-5 h-5 text-thesis" />
                        <h2 className="text-xl font-light text-logos">현금흐름 전망</h2>
                      </div>

                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsLine data={forecast.monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                          <XAxis dataKey="month" stroke="#A0AEC0" style={{ fontSize: 12 }} />
                          <YAxis stroke="#A0AEC0" style={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1A202C',
                              border: '1px solid #4A5568',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="cashInflow" stroke="#10B981" name="유입" />
                          <Line type="monotone" dataKey="cashOutflow" stroke="#F59E0B" name="유출" />
                          <Line type="monotone" dataKey="cumulativeCashFlow" stroke="#00D9FF" name="누적" strokeWidth={2} />
                        </RechartsLine>
                      </ResponsiveContainer>
                    </div>
                  </ZenCard>

                  <ZenCard border="medium">
                    <div className="p-6">
                      <h2 className="text-xl font-light text-logos mb-6">손익 전망</h2>

                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={forecast.monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                          <XAxis dataKey="month" stroke="#A0AEC0" style={{ fontSize: 12 }} />
                          <YAxis stroke="#A0AEC0" style={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1A202C',
                              border: '1px solid #4A5568',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend />
                          <Bar dataKey="expectedRevenue" fill="#00D9FF" name="매출" />
                          <Bar dataKey="expectedCost" fill="#F59E0B" name="원가" />
                          <Bar dataKey="expectedProfit" fill="#10B981" name="이익" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ZenCard>
                </>
              )}

              <div className="flex justify-between">
                <ZenButton
                  variant="ghost"
                  onClick={() => setActiveTab('basic')}
                  type="button"
                >
                  이전
                </ZenButton>
                <ZenButton
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  icon={Save}
                >
                  {loading ? '저장 중...' : '프로젝트 등록'}
                </ZenButton>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
}
