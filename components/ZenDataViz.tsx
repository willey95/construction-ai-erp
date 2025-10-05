/**
 * Zen Data Visualization Components
 * 극도로 정교한 데이터 시각화
 */

'use client';

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { LucideIcon } from 'lucide-react';

// ============================================
// 1. ZenSparkline - 미니멀 스파크라인
// ============================================

interface ZenSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showGradient?: boolean;
  animated?: boolean;
}

export function ZenSparkline({
  data,
  width = 120,
  height = 32,
  color = '#00D9FF',
  showGradient = true,
  animated = true,
}: ZenSparklineProps) {
  const points = useMemo(() => {
    if (data.length === 0) return '';

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data, width, height]);

  const pathD = useMemo(() => {
    if (!points) return '';
    return `M ${points} L ${width},${height} L 0,${height} Z`;
  }, [points, width, height]);

  const lineD = useMemo(() => {
    if (!points) return '';
    return `M ${points}`;
  }, [points]);

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Gradient fill */}
      {showGradient && (
        <motion.path
          d={pathD}
          fill={`url(#gradient-${color})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: animated ? 1 : 1 }}
          transition={{ duration: 0.8 }}
        />
      )}

      {/* Line */}
      <motion.path
        d={lineD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: animated ? 1.2 : 0, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

// ============================================
// 2. ZenCircularProgress - 원형 프로그레스
// ============================================

interface ZenCircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showValue?: boolean;
  label?: string;
}

export function ZenCircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = '#00D9FF',
  showValue = true,
  label,
}: ZenCircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-phenomenon/20"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Glow effect */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth + 2}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          opacity={0.2}
          filter="blur(4px)"
        />
      </svg>

      {/* Value display */}
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className="text-2xl font-extralight tracking-tight text-logos"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {Math.round(percentage)}%
          </motion.div>
          {label && (
            <div className="text-[10px] text-nous/60 uppercase tracking-wider mt-1">
              {label}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// 3. ZenHeatmap - 미니멀 히트맵
// ============================================

interface ZenHeatmapProps {
  data: number[][];
  cellSize?: number;
  gap?: number;
  colorScale?: [string, string];
  labels?: { x?: string[]; y?: string[] };
}

export function ZenHeatmap({
  data,
  cellSize = 24,
  gap = 2,
  colorScale = ['#1A1A1A', '#00D9FF'],
  labels,
}: ZenHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

  const maxValue = Math.max(...data.flat());
  const minValue = Math.min(...data.flat());
  const range = maxValue - minValue || 1;

  const getColor = (value: number) => {
    const intensity = (value - minValue) / range;
    return `rgba(0, 217, 255, ${intensity * 0.8})`;
  };

  return (
    <div className="inline-block">
      <div className="flex flex-col gap-0.5">
        {data.map((row, y) => (
          <div key={y} className="flex gap-0.5">
            {row.map((value, x) => (
              <motion.div
                key={`${x}-${y}`}
                className="relative rounded-sm cursor-pointer"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: getColor(value),
                }}
                onHoverStart={() => setHoveredCell({ x, y })}
                onHoverEnd={() => setHoveredCell(null)}
                whileHover={{ scale: 1.2, zIndex: 10 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (y * row.length + x) * 0.01 }}
              >
                {hoveredCell?.x === x && hoveredCell?.y === y && (
                  <motion.div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-phenomenon/95 backdrop-blur-xl border border-essence/40 rounded text-[10px] text-logos whitespace-nowrap z-20"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {value.toFixed(1)}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 4. ZenTimeline - 철학적 타임라인
// ============================================

interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  status?: 'completed' | 'active' | 'pending';
}

interface ZenTimelineProps {
  events: TimelineEvent[];
  orientation?: 'vertical' | 'horizontal';
}

export function ZenTimeline({ events, orientation = 'vertical' }: ZenTimelineProps) {
  const statusColors = {
    completed: 'bg-synthesis border-synthesis',
    active: 'bg-thesis border-thesis animate-pulse',
    pending: 'bg-phenomenon/20 border-essence/40',
  };

  if (orientation === 'horizontal') {
    return (
      <div className="flex items-start gap-4 overflow-x-auto pb-4">
        {events.map((event, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center min-w-[200px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`w-3 h-3 rounded-full border-2 ${statusColors[event.status || 'pending']}`} />
            <div className="w-px h-8 bg-gradient-to-b from-essence/40 to-transparent" />
            <div className="text-center">
              <div className="text-xs text-nous/60 mb-1">{event.date}</div>
              <div className="text-sm text-logos font-light">{event.title}</div>
              {event.description && (
                <div className="text-xs text-pneuma/60 mt-1 max-w-[180px]">{event.description}</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => (
        <motion.div
          key={index}
          className="flex gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full border-2 ${statusColors[event.status || 'pending']} flex-shrink-0`} />
            {index < events.length - 1 && (
              <div className="w-px flex-1 bg-gradient-to-b from-essence/40 to-transparent mt-2" />
            )}
          </div>
          <div className="flex-1 pb-6">
            <div className="text-xs text-nous/60 mb-1">{event.date}</div>
            <div className="text-sm text-logos font-light mb-1">{event.title}</div>
            {event.description && (
              <div className="text-xs text-pneuma/60">{event.description}</div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// 5. ZenDataGrid - 섬세한 데이터 그리드
// ============================================

interface ZenDataGridProps {
  columns: { key: string; label: string; width?: string }[];
  data: Record<string, any>[];
  onRowClick?: (row: Record<string, any>) => void;
}

export function ZenDataGrid({ columns, data, onRowClick }: ZenDataGridProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-essence/20">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-light tracking-wider uppercase text-nous/60"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <motion.tr
              key={index}
              className="border-b border-essence/10 cursor-pointer transition-colors"
              style={{
                backgroundColor: hoveredRow === index ? 'rgba(0, 217, 255, 0.03)' : 'transparent',
              }}
              onHoverStart={() => setHoveredRow(index)}
              onHoverEnd={() => setHoveredRow(null)}
              onClick={() => onRowClick?.(row)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-4 text-sm text-pneuma font-light">
                  {row[col.key]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// 6. ZenStatusIndicator - 상태 표시기
// ============================================

interface ZenStatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ZenStatusIndicator({
  status,
  label,
  pulse = false,
  size = 'md',
}: ZenStatusIndicatorProps) {
  const colors = {
    success: 'bg-synthesis',
    warning: 'bg-warning',
    error: 'bg-danger',
    info: 'bg-thesis',
    neutral: 'bg-nous',
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative">
        <div className={`${sizes[size]} ${colors[status]} rounded-full`} />
        {pulse && (
          <motion.div
            className={`absolute inset-0 ${colors[status]} rounded-full`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>
      {label && (
        <span className="text-xs text-pneuma/80 font-light">{label}</span>
      )}
    </div>
  );
}
