'use client';

import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ProjectFinancialsProps {
  project: any;
}

export function ProjectFinancials({ project }: ProjectFinancialsProps) {
  const calculateFinancials = () => {
    const contractPrice = Number(project.contractPrice);
    const progressRate = Number(project.progressRate) / 100;

    // P/L 계산
    const totalRevenue = contractPrice * progressRate;
    const costRatio = project.assumptions?.[0]?.costRatio ? Number(project.assumptions[0].costRatio) : 0.85;
    const totalCost = totalRevenue * costRatio;
    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // C/F 계산 (프로젝트의 cashFlows 데이터 사용)
    const cashFlows = project.cashFlows || [];
    const totalInflow = cashFlows.reduce((sum: number, cf: any) => sum + Number(cf.inflow || 0), 0);
    const totalOutflow = cashFlows.reduce((sum: number, cf: any) => sum + Number(cf.outflow || 0), 0);
    const netCashFlow = totalInflow - totalOutflow;

    return {
      pl: {
        totalRevenue,
        totalCost,
        grossProfit,
        profitMargin,
      },
      cf: {
        totalInflow,
        totalOutflow,
        netCashFlow,
        cashFlows,
      },
    };
  };

  const financials = calculateFinancials();

  const downloadExcel = () => {
    const plData = [
      ['손익계산서 (P/L)', ''],
      ['항목', '금액 (억원)'],
      ['매출액', financials.pl.totalRevenue.toFixed(2)],
      ['매출원가', financials.pl.totalCost.toFixed(2)],
      ['매출총이익', financials.pl.grossProfit.toFixed(2)],
      ['이익률', financials.pl.profitMargin.toFixed(2) + '%'],
      [''],
      ['현금흐름표 (C/F)', ''],
      ['항목', '금액 (억원)'],
      ['현금유입', financials.cf.totalInflow.toFixed(2)],
      ['현금유출', financials.cf.totalOutflow.toFixed(2)],
      ['순현금흐름', financials.cf.netCashFlow.toFixed(2)],
    ];

    const cfDetailData = [
      ['월별 현금흐름'],
      ['월', '유입', '유출', '순현금흐름', '누적현금흐름'],
      ...financials.cf.cashFlows.map((cf: any) => [
        cf.month,
        Number(cf.inflow || 0).toFixed(2),
        Number(cf.outflow || 0).toFixed(2),
        Number(cf.netCashFlow || 0).toFixed(2),
        Number(cf.cumulativeCashFlow || 0).toFixed(2),
      ]),
    ];

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet(plData);
    const ws2 = XLSX.utils.aoa_to_sheet(cfDetailData);

    XLSX.utils.book_append_sheet(wb, ws1, 'PL_CF_Summary');
    XLSX.utils.book_append_sheet(wb, ws2, 'Monthly_CashFlow');

    // UTF-8 BOM을 추가하여 Excel에서 한글이 올바르게 표시되도록 함
    XLSX.writeFile(wb, `${project.projectCode}_Financial_Statement.xlsx`, {
      bookType: 'xlsx',
      type: 'binary',
      codepage: 65001, // UTF-8
    });
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    // jsPDF는 기본적으로 한글을 지원하지 않으므로,
    // 텍스트를 ASCII로 변환하거나 이미지로 처리해야 합니다.
    // 여기서는 영문으로 표시하고 데이터는 숫자로 표시합니다.

    // 제목
    doc.setFontSize(16);
    doc.text(`Financial Statement - ${project.projectCode}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Project: ${project.projectName}`, 14, 22);

    // P/L Table
    doc.setFontSize(12);
    doc.text('Profit & Loss Statement', 14, 32);

    autoTable(doc, {
      startY: 36,
      head: [['Item', 'Amount (100M KRW)']],
      body: [
        ['Revenue', financials.pl.totalRevenue.toFixed(2)],
        ['Cost', financials.pl.totalCost.toFixed(2)],
        ['Gross Profit', financials.pl.grossProfit.toFixed(2)],
        ['Profit Margin', financials.pl.profitMargin.toFixed(2) + '%'],
      ],
    });

    // C/F Table
    const finalY = (doc as any).lastAutoTable.finalY || 60;
    doc.setFontSize(12);
    doc.text('Cash Flow Statement', 14, finalY + 10);

    autoTable(doc, {
      startY: finalY + 14,
      head: [['Item', 'Amount (100M KRW)']],
      body: [
        ['Cash Inflow', financials.cf.totalInflow.toFixed(2)],
        ['Cash Outflow', financials.cf.totalOutflow.toFixed(2)],
        ['Net Cash Flow', financials.cf.netCashFlow.toFixed(2)],
      ],
    });

    // Monthly Cash Flow
    if (financials.cf.cashFlows.length > 0) {
      const finalY2 = (doc as any).lastAutoTable.finalY || 80;
      doc.addPage();
      doc.setFontSize(12);
      doc.text('Monthly Cash Flow', 14, 15);

      autoTable(doc, {
        startY: 20,
        head: [['Month', 'Inflow', 'Outflow', 'Net', 'Cumulative']],
        body: financials.cf.cashFlows.map((cf: any) => [
          cf.month.toString(),
          Number(cf.inflow || 0).toFixed(2),
          Number(cf.outflow || 0).toFixed(2),
          Number(cf.netCashFlow || 0).toFixed(2),
          Number(cf.cumulativeCashFlow || 0).toFixed(2),
        ]),
      });
    }

    doc.save(`${project.projectCode}_재무제표.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* 다운로드 버튼 */}
      <div className="flex justify-end gap-2">
        <button
          onClick={downloadExcel}
          className="flex items-center gap-2 px-4 py-2 bg-synthesis/20 hover:bg-synthesis/30 text-synthesis rounded transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Excel 다운로드
        </button>
        <button
          onClick={downloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-thesis/20 hover:bg-thesis/30 text-thesis rounded transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          PDF 다운로드
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* P/L (손익계산서) */}
        <div className="phenomenal p-6">
          <h3 className="text-lg font-medium text-logos mb-4">손익계산서 (P/L)</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-essence">
              <span className="text-sm text-nous">매출액</span>
              <span className="text-sm text-logos">{financials.pl.totalRevenue.toFixed(2)}억원</span>
            </div>
            <div className="flex justify-between py-2 border-b border-essence">
              <span className="text-sm text-nous">매출원가</span>
              <span className="text-sm text-logos">{financials.pl.totalCost.toFixed(2)}억원</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-thesis/30">
              <span className="text-sm font-medium text-logos">매출총이익</span>
              <span className={`text-sm font-medium ${financials.pl.grossProfit >= 0 ? 'text-synthesis' : 'text-danger'}`}>
                {financials.pl.grossProfit.toFixed(2)}억원
              </span>
            </div>
            <div className="flex justify-between py-2 bg-essence/50 px-3 rounded">
              <span className="text-sm font-medium text-logos">이익률</span>
              <span className={`text-sm font-medium ${financials.pl.profitMargin >= 0 ? 'text-synthesis' : 'text-danger'}`}>
                {financials.pl.profitMargin.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* C/F (현금흐름표) */}
        <div className="phenomenal p-6">
          <h3 className="text-lg font-medium text-logos mb-4">현금흐름표 (C/F)</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-essence">
              <span className="text-sm text-nous">현금유입</span>
              <span className="text-sm text-synthesis">{financials.cf.totalInflow.toFixed(2)}억원</span>
            </div>
            <div className="flex justify-between py-2 border-b border-essence">
              <span className="text-sm text-nous">현금유출</span>
              <span className="text-sm text-danger">{financials.cf.totalOutflow.toFixed(2)}억원</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-thesis/30">
              <span className="text-sm font-medium text-logos">순현금흐름</span>
              <span className={`text-sm font-medium ${financials.cf.netCashFlow >= 0 ? 'text-synthesis' : 'text-danger'}`}>
                {financials.cf.netCashFlow.toFixed(2)}억원
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 월별 현금흐름 테이블 */}
      {financials.cf.cashFlows.length > 0 && (
        <div className="phenomenal p-6">
          <h3 className="text-lg font-medium text-logos mb-4">월별 현금흐름</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-essence">
                  <th className="text-left py-2 px-3 text-nous font-medium">월</th>
                  <th className="text-right py-2 px-3 text-nous font-medium">유입</th>
                  <th className="text-right py-2 px-3 text-nous font-medium">유출</th>
                  <th className="text-right py-2 px-3 text-nous font-medium">순현금흐름</th>
                  <th className="text-right py-2 px-3 text-nous font-medium">누적현금흐름</th>
                </tr>
              </thead>
              <tbody>
                {financials.cf.cashFlows.map((cf: any, idx: number) => (
                  <tr key={idx} className="border-b border-essence/50 hover:bg-essence/30 transition-colors">
                    <td className="py-2 px-3 text-pneuma">{cf.month}</td>
                    <td className="py-2 px-3 text-right text-synthesis">{Number(cf.inflow || 0).toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-danger">{Number(cf.outflow || 0).toFixed(2)}</td>
                    <td className={`py-2 px-3 text-right ${Number(cf.netCashFlow) >= 0 ? 'text-synthesis' : 'text-danger'}`}>
                      {Number(cf.netCashFlow || 0).toFixed(2)}
                    </td>
                    <td className={`py-2 px-3 text-right font-medium ${Number(cf.cumulativeCashFlow) >= 0 ? 'text-logos' : 'text-danger'}`}>
                      {Number(cf.cumulativeCashFlow || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
