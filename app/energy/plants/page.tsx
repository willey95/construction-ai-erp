'use client';

import { useEffect, useState } from 'react';
import { Power } from 'lucide-react';

interface PlantData {
  id: string;
  plantName: string;
  plantCode: string;
  plantType: string;
  region: string;
  capacity: number;
  status: string;
}

export default function PlantsPage() {
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlants() {
      try {
        console.log('🔵 Fetching plants data...');
        const response = await fetch('/api/energy/plants');
        console.log('🔵 Response status:', response.status);

        const data = await response.json();
        console.log('🔵 Response data:', data);
        console.log('🔵 data.plants type:', typeof data.plants);
        console.log('🔵 Is array?:', Array.isArray(data.plants));

        if (response.ok && data.plants) {
          const plantsArray = Array.isArray(data.plants) ? data.plants : [];
          console.log('🔵 Setting plants array, length:', plantsArray.length);
          setPlants(plantsArray);
        } else {
          setError(data.error || 'Failed to load');
        }
      } catch (err) {
        console.error('🔴 Error:', err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }

    loadPlants();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">발전소 목록</h1>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-red-500">Error</h1>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log('🔵 Rendering plants, count:', plants?.length || 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Power className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold">발전소 목록</h1>
          <span className="text-gray-400">({plants?.length || 0}개)</span>
        </div>

        {!plants || plants.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">발전소 데이터가 없습니다</p>
            <p className="text-sm text-gray-500">plants 변수: {JSON.stringify(plants)}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map((plant) => (
              <div
                key={plant.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{plant.plantName}</h3>
                    <p className="text-sm text-gray-400">{plant.plantCode}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    plant.status === 'OPERATIONAL' ? 'bg-green-900 text-green-300' :
                    plant.status === 'CONSTRUCTION' ? 'bg-blue-900 text-blue-300' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {plant.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">유형</span>
                    <span className="text-white font-medium">{plant.plantType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">지역</span>
                    <span className="text-white">{plant.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">용량</span>
                    <span className="text-white font-medium">{plant.capacity.toFixed(0)} kW</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
