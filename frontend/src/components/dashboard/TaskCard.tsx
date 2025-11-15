/**
 * Task Card Component
 * Displays a single task with swipe actions
 */

'use client';

import { Task } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { EnergyBadge } from '@/components/ui/EnergyBadge';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onComplete?: () => void;
}

export function TaskCard({ task, onClick, onComplete }: TaskCardProps) {
  const isCompleted = task.status === 'COMPLETED';

  return (
    <Card
      hover={!isCompleted}
      onClick={onClick}
      className={cn(
        'transition-all',
        isCompleted && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete?.();
          }}
          className={cn(
            'flex-shrink-0 mt-1 w-6 h-6 rounded-full border-2 transition-all',
            'hover:scale-110 active:scale-95',
            isCompleted
              ? 'bg-ios-green border-ios-green'
              : 'border-border dark:border-dark-border hover:border-ios-blue'
          )}
        >
          {isCompleted && (
            <svg
              className="w-full h-full text-white p-1"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              className={cn(
                'font-medium text-text dark:text-dark-text',
                isCompleted && 'line-through'
              )}
            >
              {task.title}
            </h3>
            <EnergyBadge level={task.energyRequired} size="sm" />
          </div>

          {task.firstPhysicalAction && !isCompleted && (
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-2">
              First: {task.firstPhysicalAction}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-text-tertiary dark:text-dark-text-tertiary">
            {task.tangibleTimeRef && (
              <span>⏱️ {task.tangibleTimeRef}</span>
            )}
            {task.isQuickWin && (
              <span className="text-ios-green font-medium">⚡ Quick Win</span>
            )}
            {task.steps.length > 0 && (
              <span>
                {task.steps.filter(s => s.isCompleted).length}/{task.steps.length} steps
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
