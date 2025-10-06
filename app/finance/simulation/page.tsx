'use client';

import { useState, useEffect } from 'react';
import { runSimulation } from '@/lib/cashFlowEngine';
import { sampleAssumptions } from '@/lib/sampleData';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SimulationPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [simulation, setSimulation] = useState<any>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      // Validate that data is an array
      if (Array.isArray(data)) {
        setProjects(data);
        if (data.length > 0) {
          selectProject(data[0]);
        }
      } else {
        console.error('프로젝트 데이터가 배열이 아닙니다:', data);
        setProjects([]);
      }
    } catch (error) {
      console.error('프로젝트 조회 실패:', error);
      setProjects([]);
    }
  };

  const selectProject = (project: any) => {
    setSelectedProject(project);
    const sim = runSimulation(
      {
        id: project.id,
        projectCode: project.projectCode,
        projectName: project.projectName,
        projectType: project.projectType,
        client: project.client,
        contractPrice: Number(project.contractPrice),
        contractDate: new Date(project.contractDate),
        startDate: new Date(project.startDate),
        endDate: new Date(project.endDate),
        constructionPeriod: project.constructionPeriod,
        status: project.status,
        progressRate: Number(project.progressRate),
      },
      sampleAssumptions
    );
    setSimulation(sim);
  };

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-light text-logos mb-6">현금흐름 시뮬레이션</h1>

        <div className="phenomenal p-4 mb-6">
          <select
            onChange={(e) => selectProject(projects.find(p => p.id === e.target.value))}
            className="w-full px-4 py-2 bg-phenomenon border border-essence rounded-md text-logos"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.projectName}</option>
            ))}
          </select>
        </div>

        {simulation && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="phenomenal p-4">
                <div className="text-xs text-nous mb-1">NPV</div>
                <div className="text-xl text-thesis">{simulation.financialMetrics.npv.toFixed(0)}백만</div>
              </div>
              <div className="phenomenal p-4">
                <div className="text-xs text-nous mb-1">IRR</div>
                <div className="text-xl text-synthesis">{simulation.financialMetrics.irr.toFixed(1)}%</div>
              </div>
              <div className="phenomenal p-4">
                <div className="text-xs text-nous mb-1">ROI</div>
                <div className="text-xl text-logos">{simulation.financialMetrics.roi.toFixed(1)}%</div>
              </div>
              <div className="phenomenal p-4">
                <div className="text-xs text-nous mb-1">총이익률</div>
                <div className="text-xl text-logos">{simulation.financialMetrics.grossMargin.toFixed(1)}%</div>
              </div>
            </div>

            <div className="phenomenal p-4 mb-6">
              <h2 className="text-lg text-logos mb-4">누적 현금흐름</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={simulation.cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="month" stroke="#909090" />
                  <YAxis stroke="#909090" />
                  <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A' }} />
                  <Line type="monotone" dataKey="cumulativeCash" name="누적현금" stroke="#00D9FF" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="phenomenal p-4">
              <h2 className="text-lg text-logos mb-4">월별 현금흐름</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={simulation.cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="month" stroke="#909090" />
                  <YAxis stroke="#909090" />
                  <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A' }} />
                  <Bar dataKey="receivedAmount" name="수금" fill="#00D9FF" />
                  <Bar dataKey="subcontractPayment" name="하도급" fill="#FF4757" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
