/**
 * Ultra-Sophisticated Zen Design System
 * 극도로 철학적이고 정제된 디자인 컴포넌트
 *
 * Philosophy:
 * - 0.1mm 완성도의 미세한 디테일
 * - 복잡성 속의 단순성
 * - 숨쉬는 네거티브 스페이스
 * - 의식적인 마이크로 인터랙션
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { LucideIcon } from 'lucide-react';

// ============================================
// 1. ZenCard - 철학적 카드 컴포넌트
// ============================================

interface ZenCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  border?: 'subtle' | 'medium' | 'strong' | 'none';
  onClick?: () => void;
}

export function ZenCard({
  children,
  className = '',
  hover = true,
  glow = false,
  border = 'subtle',
  onClick
}: ZenCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const borderStyles = {
    subtle: 'border border-essence/20',
    medium: 'border border-essence/40',
    strong: 'border border-thesis/30',
    none: 'border-0',
  };

  return (
    <motion.div
      className={`
        relative overflow-hidden
        bg-gradient-to-br from-phenomenon/30 via-phenomenon/20 to-phenomenon/10
        backdrop-blur-xl
        ${borderStyles[border]}
        rounded-2xl
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={hover ? {
        scale: 1.002,
        y: -2,
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
      } : {}}
      whileTap={onClick ? { scale: 0.998 } : {}}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-thesis/[0.02] via-transparent to-synthesis/[0.02] pointer-events-none" />

      {/* Glow effect */}
      {glow && (
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-thesis/10 via-transparent to-transparent pointer-events-none"
          animate={{
            opacity: isHovered ? 0.3 : 0,
          }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Border glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(0,217,255,0.1) 0%, rgba(139,92,246,0.1) 100%)',
        }}
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Shimmer effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '100%', opacity: [0, 0.3, 0] }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
          }}
        />
      )}
    </motion.div>
  );
}

// ============================================
// 2. ZenMetric - 철학적 메트릭 표시
// ============================================

interface ZenMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  color?: 'thesis' | 'synthesis' | 'logos' | 'nous' | 'pneuma';
  description?: string;
}

export function ZenMetric({
  label,
  value,
  unit,
  change,
  trend,
  icon: Icon,
  color = 'thesis',
  description
}: ZenMetricProps) {
  const [isHovered, setIsHovered] = useState(false);

  const colorClasses = {
    thesis: 'text-thesis',
    synthesis: 'text-synthesis',
    logos: 'text-logos',
    nous: 'text-nous',
    pneuma: 'text-pneuma',
  };

  const trendColor = trend === 'up' ? 'text-synthesis' : trend === 'down' ? 'text-danger' : 'text-nous';

  return (
    <motion.div
      className="relative p-6 group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Icon with subtle animation */}
      {Icon && (
        <motion.div
          className={`absolute top-6 right-6 opacity-10 ${colorClasses[color]}`}
          animate={{
            scale: isHovered ? 1.1 : 1,
            opacity: isHovered ? 0.2 : 0.1,
          }}
          transition={{ duration: 0.3 }}
        >
          <Icon className="w-16 h-16" strokeWidth={0.5} />
        </motion.div>
      )}

      {/* Label */}
      <div className="text-xs font-light tracking-[0.15em] uppercase text-nous/80 mb-3">
        {label}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-2">
        <motion.div
          className={`text-4xl font-extralight tracking-tight ${colorClasses[color]}`}
          animate={{
            scale: isHovered ? 1.02 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {value}
        </motion.div>
        {unit && (
          <div className="text-sm font-light text-pneuma/60">
            {unit}
          </div>
        )}
      </div>

      {/* Change indicator */}
      {change !== undefined && (
        <div className={`text-xs font-light ${trendColor}`}>
          {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {Math.abs(change)}%
        </div>
      )}

      {/* Description on hover */}
      <AnimatePresence>
        {isHovered && description && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="mt-3 text-xs text-pneuma/60 font-light leading-relaxed"
          >
            {description}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// 3. ZenButton - 극도로 정제된 버튼
// ============================================

interface ZenButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function ZenButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
}: ZenButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    primary: 'bg-gradient-to-r from-thesis/20 to-synthesis/20 border border-thesis/30 text-thesis hover:from-thesis/30 hover:to-synthesis/30',
    secondary: 'bg-phenomenon/30 border border-essence/30 text-logos hover:bg-phenomenon/40',
    ghost: 'bg-transparent border border-transparent text-pneuma hover:bg-phenomenon/20 hover:border-essence/20',
    danger: 'bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <motion.button
      className={`
        relative overflow-hidden
        ${variants[variant]}
        ${sizes[size]}
        rounded-xl
        font-light tracking-wide
        transition-all duration-300
        disabled:opacity-40 disabled:cursor-not-allowed
        flex items-center gap-2 justify-center
        ${className}
      `}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Shimmer effect */}
      {isHovered && !disabled && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          }}
        />
      )}

      {/* Icon */}
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className="w-4 h-4" />
      )}

      {/* Loading spinner */}
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Text */}
      <span>{children}</span>

      {/* Icon */}
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className="w-4 h-4" />
      )}
    </motion.button>
  );
}

// ============================================
// 4. ZenDivider - 철학적 구분선
// ============================================

interface ZenDividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  label?: string;
}

export function ZenDivider({ orientation = 'horizontal', className = '', label }: ZenDividerProps) {
  if (orientation === 'vertical') {
    return (
      <div className={`w-px bg-gradient-to-b from-transparent via-essence/30 to-transparent ${className}`} />
    );
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-essence/30 to-essence/30" />
      {label && (
        <>
          <span className="px-4 text-xs font-light tracking-wider text-nous/60 uppercase">
            {label}
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-essence/30 to-essence/30" />
        </>
      )}
    </div>
  );
}

// ============================================
// 5. ZenBadge - 미니멀 배지
// ============================================

interface ZenBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export function ZenBadge({ children, variant = 'default', size = 'sm', pulse = false }: ZenBadgeProps) {
  const variants = {
    default: 'bg-phenomenon/40 text-pneuma border-essence/30',
    success: 'bg-synthesis/10 text-synthesis border-synthesis/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    danger: 'bg-danger/10 text-danger border-danger/30',
    info: 'bg-thesis/10 text-thesis border-thesis/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5
      border rounded-full
      font-light tracking-wide uppercase
      ${variants[variant]}
      ${sizes[size]}
    `}>
      {pulse && (
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-current"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      {children}
    </span>
  );
}

// ============================================
// 6. ZenProgress - 철학적 프로그레스
// ============================================

interface ZenProgressProps {
  value: number;
  max?: number;
  color?: 'thesis' | 'synthesis' | 'warning' | 'danger';
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

export function ZenProgress({
  value,
  max = 100,
  color = 'thesis',
  showLabel = false,
  height = 'sm'
}: ZenProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    thesis: 'from-thesis/60 to-thesis',
    synthesis: 'from-synthesis/60 to-synthesis',
    warning: 'from-warning/60 to-warning',
    danger: 'from-danger/60 to-danger',
  };

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="relative">
      {showLabel && (
        <div className="flex justify-between mb-2 text-xs text-pneuma/60 font-light">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
      <div className={`relative ${heights[height]} bg-phenomenon/30 rounded-full overflow-hidden`}>
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors[color]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// 7. ZenTooltip - 섬세한 툴팁
// ============================================

interface ZenTooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function ZenTooltip({ children, content, position = 'top' }: ZenTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`
              absolute ${positions[position]} z-50
              px-3 py-1.5
              bg-phenomenon/95 backdrop-blur-xl
              border border-essence/40
              rounded-lg
              text-xs text-logos font-light
              whitespace-nowrap
              pointer-events-none
            `}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// 8. ZenSkeleton - 로딩 스켈레톤
// ============================================

interface ZenSkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export function ZenSkeleton({ width = 'w-full', height = 'h-4', className = '' }: ZenSkeletonProps) {
  return (
    <div className={`${width} ${height} ${className} relative overflow-hidden bg-phenomenon/20 rounded-lg`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-essence/20 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
