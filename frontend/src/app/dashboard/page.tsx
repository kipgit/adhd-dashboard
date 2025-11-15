/**
 * Main Dashboard - Today View
 * Shows tasks filtered by energy level and survival mode
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BrainDumpInput } from '@/components/dashboard/BrainDumpInput';
import { EnergySelector } from '@/components/dashboard/EnergySelector';
import { TaskCard } from '@/components/dashboard/TaskCard';
import { api, Task, EnergyLevel } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { getGreeting, getVibeEmoji } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser, currentEnergy, setCurrentEnergy, isSurvivalMode, setSurvivalMode } = useStore();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [quickWins, setQuickWins] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBrainDump, setShowBrainDump] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    loadDashboard();
    loadUser();
  }, [router]);

  const loadUser = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
      setCurrentEnergy(userData.currentEnergyLevel || 'MEDIUM');
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDailyDashboard(currentEnergy, isSurvivalMode);
      setTasks(data.tasks || []);
      setQuickWins(data.quickWins || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnergyChange = async (level: EnergyLevel) => {
    setCurrentEnergy(level);
    await api.logEnergyLevel(level);
    loadDashboard();
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await api.completeTask(taskId);
      loadDashboard(); // Reload to get fresh data
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleLogout = () => {
    api.logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-4">🧠</div>
          <p className="text-text-secondary">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background pb-20">
      <Container size="md" className="py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">
                {getGreeting()}, {user?.name || 'friend'} {getVibeEmoji()}
              </h1>
              <p className="text-text-secondary dark:text-dark-text-secondary mt-1">
                {isSurvivalMode ? "Survival mode: Just the essentials" : "Here's what feels doable today"}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>

          {/* Energy Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-text-secondary dark:text-dark-text-secondary">
              Your energy right now:
            </label>
            <EnergySelector currentLevel={currentEnergy} onChange={handleEnergyChange} />
          </div>

          {/* Survival Mode Toggle */}
          <button
            onClick={() => {
              setSurvivalMode(!isSurvivalMode);
              loadDashboard();
            }}
            className="text-sm text-ios-blue hover:underline"
          >
            {isSurvivalMode ? '← Exit survival mode' : '💚 Turn on survival mode'}
          </button>
        </header>

        {/* Brain Dump Section */}
        <section className="mb-8">
          {showBrainDump ? (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Brain Dump</h2>
                <button
                  onClick={() => setShowBrainDump(false)}
                  className="text-text-secondary hover:text-text"
                >
                  ✕
                </button>
              </div>
              <BrainDumpInput />
            </Card>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              className="w-full justify-start text-left"
              onClick={() => setShowBrainDump(true)}
            >
              <span className="text-2xl mr-3">🧠</span>
              <span className="text-text-secondary">
                What's on your mind? Tap to capture...
              </span>
            </Button>
          )}
        </section>

        {/* Quick Wins */}
        {quickWins.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">⚡ Quick Wins (Under 5 min)</h2>
            <div className="space-y-3">
              {quickWins.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => handleCompleteTask(task.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Today's Tasks */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isSurvivalMode ? 'Your Top 3 for Today' : 'Today\'s Tasks'}
          </h2>

          {tasks.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-lg font-medium mb-2">You're all caught up!</p>
                <p className="text-text-secondary">
                  No tasks right now. Add one above or just enjoy the moment.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => handleCompleteTask(task.id)}
                />
              ))}
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}
