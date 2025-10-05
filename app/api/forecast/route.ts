import { NextRequest, NextResponse } from 'next/server';
import { ForecastEngine, ProjectAssumptions } from '@/lib/forecast/ForecastEngine';

/**
 * POST /api/forecast
 * 프로젝트 재무 전망 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const assumptions: ProjectAssumptions = {
      contractPrice: body.contractPrice,
      constructionPeriod: body.constructionPeriod,
      startDate: new Date(body.startDate),
      profitMargin: body.profitMargin || 0.15,
      costRatio: body.costRatio || 0.85,
      periodInvoicing: body.periodInvoicing || 1,
      periodReceivable: body.periodReceivable || 60,
      retentionRate: body.retentionRate || 0.05,
      retentionPeriod: body.retentionPeriod || 12,
      paymentSubcontract: body.paymentSubcontract || 1,
      paymentMaterial: body.paymentMaterial || 1,
      curveType: body.curveType || 'S_CURVE',
    };

    const engine = new ForecastEngine(assumptions);

    // 1. 전망 데이터 생성
    const forecasts = engine.generateForecast();

    // 2. 재무 지표 분석
    const metrics = engine.analyzeFinancialMetrics();

    // 3. DB 저장 (projectId가 있는 경우)
    if (body.projectId) {
      await engine.saveToDB(body.projectId);
    }

    return NextResponse.json({
      success: true,
      forecasts,
      metrics,
      message: `${forecasts.length}개월 전망 생성 완료`,
    });
  } catch (error: any) {
    console.error('Forecast generation failed:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
