'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricProps {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  essence?: 'thesis' | 'antithesis' | 'synthesis';
  unit?: string;
}

export function Metric({ label, value, change, trend, essence = 'synthesis', unit }: MetricProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (typeof value === 'number') {
      const duration = 1200;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [value]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getEssenceColor = () => {
    switch (essence) {
      case 'thesis':
        return 'text-thesis';
      case 'antithesis':
        return 'text-antithesis';
      default:
        return 'text-synthesis';
    }
  };

  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      return val.toLocaleString('ko-KR', { maximumFractionDigits: 1 });
    }
    return val;
  };

  return (
    <div
      className="phenomenal p-4 transition-all duration-300 hover:border-pneuma animate-emerge relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 상단 광채 */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pneuma to-transparent transition-opacity duration-500 ${
          isHovered ? 'opacity-30' : 'opacity-0'
        }`}
      />

      {/* 레이블 */}
      <div className="text-nous text-xs uppercase tracking-wider mb-2">
        {label}
      </div>

      {/* 값 */}
      <div className={`text-3xl font-light numeric-refined ${getEssenceColor()} relative`}>
        <span
          className={`transition-all duration-300 ${
            isHovered ? 'tracking-wide' : 'tracking-normal'
          }`}
        >
          {formatValue(typeof value === 'number' ? displayValue : value)}
        </span>
        {unit && <span className="text-xl ml-1 text-nous">{unit}</span>}

        {/* 값 배경 광채 */}
        {isHovered && (
          <div className="absolute inset-0 bg-radial-gradient from-pneuma/5 to-transparent -z-10" />
        )}
      </div>

      {/* 변화율 */}
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          <div className={`flex items-center ${getEssenceColor()}`}>
            {getTrendIcon()}
          </div>
          <span className="text-sm text-pneuma">
            {change > 0 ? '+' : ''}
            {change.toFixed(1)}%
          </span>

          {/* 진행바 */}
          <div className="flex-1 h-px bg-essence relative overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full ${
                trend === 'up' ? 'bg-thesis' : trend === 'down' ? 'bg-antithesis' : 'bg-synthesis'
              } transition-all duration-1000`}
              style={{ width: `${Math.min(Math.abs(change), 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* 하단 그림자 */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pneuma/20 to-transparent transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
