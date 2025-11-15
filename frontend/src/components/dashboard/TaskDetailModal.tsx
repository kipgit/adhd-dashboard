/**
 * Task Detail Modal
 * Shows task breakdown and micro-steps
 */

'use client';

import { Task } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { EnergyBadge } from '@/components/ui/EnergyBadge';
import { cn } from '@/lib/utils';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onComplete: () => void;
}

export function TaskDetailModal({ task, onClose, onComplete }: TaskDetailModalProps) {
  if (!task) return null;

  const completedSteps = task.steps.filter(s => s.isCompleted).length;
  const progress = task.steps.length > 0 ? (completedSteps / task.steps.length) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface dark:bg-dark-surface rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-ios-lg animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface dark:bg-dark-surface p-6 border-b border-border dark:border-dark-border flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{task.title}</h2>
            {task.description && (
              <p className="text-text-secondary dark:text-dark-text-secondary">
                {task.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-4 text-text-secondary hover:text-text transition-colors"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-background dark:bg-dark-background">
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">
                Energy Required
              </p>
              <EnergyBadge level={task.energyRequired} showLabel />
            </div>
            {task.tangibleTimeRef && (
              <div className="p-4 rounded-2xl bg-background dark:bg-dark-background">
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">
                  Time Needed
                </p>
                <p className="font-medium">⏱️ {task.tangibleTimeRef}</p>
              </div>
            )}
          </div>

          {/* First Action */}
          {task.firstPhysicalAction && (
            <div className="p-4 rounded-2xl bg-ios-blue/10 border border-ios-blue/20">
              <p className="text-sm text-ios-blue font-medium mb-1">
                🎯 First Physical Action
              </p>
              <p className="text-lg">{task.firstPhysicalAction}</p>
            </div>
          )}

          {/* Progress */}
          {task.steps.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Progress</h3>
                <span className="text-sm text-text-secondary">
                  {completedSteps}/{task.steps.length} steps
                </span>
              </div>
              <div className="h-2 bg-background dark:bg-dark-background rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-ios-green transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Steps */}
          {task.steps.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Micro-Steps</h3>
              <div className="space-y-2">
                {task.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-xl transition-all',
                      step.isCompleted
                        ? 'bg-ios-green/10'
                        : 'bg-background dark:bg-dark-background hover:bg-border dark:hover:bg-dark-border'
                    )}
                  >
                    <div
                      className={cn(
                        'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center',
                        step.isCompleted
                          ? 'bg-ios-green border-ios-green'
                          : 'border-border dark:border-dark-border'
                      )}
                    >
                      {step.isCompleted ? (
                        <span className="text-white text-sm">✓</span>
                      ) : (
                        <span className="text-xs text-text-tertiary">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={cn(
                          'font-medium',
                          step.isCompleted && 'line-through text-text-secondary'
                        )}
                      >
                        {step.description}
                      </p>
                      <p className="text-xs text-text-tertiary mt-1">
                        ~{step.estimatedMinutes} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-surface dark:bg-dark-surface p-6 border-t border-border dark:border-dark-border">
          {task.status !== 'COMPLETED' ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={onComplete}
            >
              ✅ Mark as Complete
            </Button>
          ) : (
            <div className="text-center py-4">
              <span className="text-2xl">🎉</span>
              <p className="text-ios-green font-medium mt-2">Completed!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
