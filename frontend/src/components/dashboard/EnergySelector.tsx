/**
 * Energy Level Selector
 * Quick way to set current energy level
 */

'use client';

import { EnergyLevel } from '@/lib/api';
import { cn } from '@/lib/utils';

interface EnergySelectorProps {
  currentLevel: EnergyLevel;
  onChange: (level: EnergyLevel) => void;
}

const energyOptions: Array<{ level: EnergyLevel; icon: string; label: string; color: string }> = [
  { level: 'LOW', icon: '🔋', label: 'Low', color: 'bg-ios-orange hover:bg-ios-orange/90' },
  { level: 'MEDIUM', icon: '🔋🔋', label: 'Medium', color: 'bg-ios-blue hover:bg-ios-blue/90' },
  { level: 'HIGH', icon: '🔋🔋🔋', label: 'High', color: 'bg-ios-green hover:bg-ios-green/90' },
  { level: 'CREATIVE', icon: '✨', label: 'Creative', color: 'bg-ios-purple hover:bg-ios-purple/90' },
];

export function EnergySelector({ currentLevel, onChange }: EnergySelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {energyOptions.map(({ level, icon, label, color }) => (
        <button
          key={level}
          onClick={() => onChange(level)}
          className={cn(
            'px-4 py-2 rounded-xl text-white font-medium transition-all',
            'active:scale-95',
            currentLevel === level
              ? color
              : 'bg-surface-secondary dark:bg-dark-surface-secondary text-text dark:text-dark-text hover:bg-border dark:hover:bg-dark-border'
          )}
        >
          <span className="mr-1.5">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
