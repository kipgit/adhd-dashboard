/**
 * Energy Level Badge
 * Visual indicator for energy levels
 */

import { EnergyLevel } from '@/lib/api';
import { cn } from '@/lib/utils';

interface EnergyBadgeProps {
  level: EnergyLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const energyConfig = {
  HIGH: {
    color: 'bg-ios-green text-white',
    icon: '🔋🔋🔋',
    label: 'High Energy',
  },
  MEDIUM: {
    color: 'bg-ios-blue text-white',
    icon: '🔋🔋',
    label: 'Medium Energy',
  },
  LOW: {
    color: 'bg-ios-orange text-white',
    icon: '🔋',
    label: 'Low Energy',
  },
  CREATIVE: {
    color: 'bg-ios-purple text-white',
    icon: '✨',
    label: 'Creative Mode',
  },
};

export function EnergyBadge({ level, size = 'md', showLabel = false }: EnergyBadgeProps) {
  const config = energyConfig[level];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.color,
        size === 'sm' && 'px-2 py-1 text-xs',
        size === 'md' && 'px-3 py-1.5 text-sm',
        size === 'lg' && 'px-4 py-2 text-base'
      )}
    >
      <span>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}
