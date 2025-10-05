'use client';

import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Zap, Link as LinkIcon } from 'lucide-react';

// Glassmorphism 카드
export const GlassCard = ({ children, className = '', glow = false, onClick }: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ type: 'spring', stiffness: 300 }}
    onClick={onClick}
    className={`
      backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02]
      border border-white/10 rounded-xl p-6
      shadow-2xl hover:shadow-thesis/20
      ${glow ? 'ring-2 ring-thesis/50 shadow-thesis/30' : ''}
      ${onClick ? 'cursor-pointer' : ''}
      ${className}
    `}
  >
    {children}
  </motion.div>
);

// 데이터 연결 시각화 라인
export const DataFlowLine = ({ active = false }: { active?: boolean }) => (
  <motion.div
    className="relative h-px bg-gradient-to-r from-transparent via-thesis to-transparent overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: active ? 1 : 0.3 }}
  >
    {active && (
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-thesis to-synthesis"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    )}
  </motion.div>
);

// 네온 효과 메트릭 카드
export const NeonMetricCard = ({
  label,
  value,
  change,
  color = 'thesis',
  icon: Icon,
  unit = '',
}: {
  label: string;
  value: number | string;
  change?: number;
  color?: string;
  icon?: any;
  unit?: string;
}) => {
  const colorClasses = {
    thesis: 'from-thesis/20 to-thesis/5 border-thesis/30 text-thesis shadow-thesis/50',
    synthesis: 'from-synthesis/20 to-synthesis/5 border-synthesis/30 text-synthesis shadow-synthesis/50',
    warning: 'from-warning/20 to-warning/5 border-warning/30 text-warning shadow-warning/50',
    danger: 'from-danger/20 to-danger/5 border-danger/30 text-danger shadow-danger/50',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`
        relative backdrop-blur-md bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]}
        border rounded-2xl p-6 overflow-hidden group
      `}
    >
      {/* 배경 그라데이션 애니메이션 */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} opacity-0 group-hover:opacity-30`}
        animate={{
          background: [
            'linear-gradient(45deg, transparent, rgba(0,217,255,0.1))',
            'linear-gradient(225deg, transparent, rgba(0,217,255,0.1))',
            'linear-gradient(45deg, transparent, rgba(0,217,255,0.1))',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs text-pneuma uppercase tracking-wider">{label}</span>
          {Icon && (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <motion.span
            className="text-4xl font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {value}
          </motion.span>
          {unit && <span className="text-lg text-pneuma">{unit}</span>}
        </div>

        {change !== undefined && (
          <motion.div
            className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-synthesis' : 'text-danger'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(change)}%</span>
          </motion.div>
        )}
      </div>

      {/* 펄스 효과 */}
      <motion.div
        className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-thesis/50 to-synthesis/50 blur-xl opacity-0 group-hover:opacity-30"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0, 0.3, 0],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
};

// 실시간 활동 표시기
export const LiveActivityIndicator = ({ active = true, pulse = true }: { active?: boolean; pulse?: boolean }) => (
  <div className="flex items-center gap-2">
    <motion.div
      className={`w-2 h-2 rounded-full ${active ? 'bg-synthesis' : 'bg-nous'}`}
      animate={pulse && active ? {
        scale: [1, 1.2, 1],
        opacity: [1, 0.6, 1],
      } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
    <span className="text-xs text-pneuma">{active ? '실시간 동기화 중' : '대기'}</span>
  </div>
);

// 데이터 연결 노드
export const ConnectionNode = ({
  id,
  label,
  type,
  active = false,
  onClick,
}: {
  id: string;
  label: string;
  type: 'project' | 'metric' | 'insight';
  active?: boolean;
  onClick?: () => void;
}) => {
  const typeColors = {
    project: 'bg-thesis',
    metric: 'bg-synthesis',
    insight: 'bg-warning',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative cursor-pointer"
    >
      <motion.div
        className={`
          w-16 h-16 rounded-full ${typeColors[type]}
          flex items-center justify-center
          shadow-lg border-2 ${active ? 'border-white' : 'border-white/20'}
        `}
        animate={active ? {
          boxShadow: [
            '0 0 20px rgba(0,217,255,0.5)',
            '0 0 40px rgba(0,217,255,0.8)',
            '0 0 20px rgba(0,217,255,0.5)',
          ],
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-xs font-medium text-void text-center px-1">{label}</span>
      </motion.div>

      {active && (
        <motion.div
          className={`absolute inset-0 rounded-full ${typeColors[type]} opacity-30`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

// 홀로그래픽 헤더
export const HolographicHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="relative mb-8">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <h1 className="text-5xl font-light bg-gradient-to-r from-thesis via-synthesis to-thesis bg-clip-text text-transparent">
        {title}
      </h1>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-pneuma mt-2"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>

    {/* 홀로그래픽 라인 */}
    <motion.div
      className="absolute -bottom-4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-thesis to-transparent"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
    />
  </div>
);

// 데이터 스트림 배경
export const DataStreamBackground = () => {
  const [streams, setStreams] = useState<number[]>([]);

  useEffect(() => {
    setStreams(Array.from({ length: 20 }, (_, i) => i));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
      {streams.map((i) => (
        <motion.div
          key={i}
          className="absolute w-px bg-gradient-to-b from-transparent via-thesis to-transparent"
          style={{
            left: `${(i * 5) % 100}%`,
            height: '100vh',
          }}
          animate={{
            y: ['-100%', '100%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

// 연결 상태 시각화
export const ConnectionVisualization = ({
  connections,
  onNodeClick,
}: {
  connections: Array<{ from: string; to: string; strength: string }>;
  onNodeClick?: (id: string) => void;
}) => {
  return (
    <svg className="w-full h-64" viewBox="0 0 800 200">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00D9FF" stopOpacity="0" />
          <stop offset="50%" stopColor="#00D9FF" stopOpacity="1" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>

      {connections.map((conn, i) => {
        const x1 = 100 + i * 150;
        const y1 = 100;
        const x2 = x1 + 150;
        const y2 = 100;

        return (
          <motion.g key={i}>
            <motion.path
              d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1 - 50} ${x2} ${y2}`}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth={conn.strength === 'strong' ? 3 : conn.strength === 'medium' ? 2 : 1}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 1, delay: i * 0.2 }}
            />

            {/* 흐르는 점 */}
            <motion.circle
              r="4"
              fill="#00D9FF"
              animate={{
                offsetDistance: ['0%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 0.3,
              }}
              style={{
                offsetPath: `path('M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1 - 50} ${x2} ${y2}')`,
              }}
            />
          </motion.g>
        );
      })}
    </svg>
  );
};

// 인터랙티브 툴팁
export const InteractiveTooltip = ({
  content,
  children,
}: {
  content: ReactNode;
  children: ReactNode;
}) => {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2"
          >
            <div className="backdrop-blur-xl bg-phenomenon/90 border border-essence rounded-lg p-3 shadow-2xl min-w-max">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
