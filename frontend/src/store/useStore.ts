/**
 * Global State Management with Zustand
 * Simple, fast, and works great with React
 */

import { create } from 'zustand';
import { User, Task, BrainDump, UserPreferences, EnergyLevel } from '@/lib/api';

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Preferences
  preferences: UserPreferences | null;
  setPreferences: (preferences: UserPreferences) => void;

  // Current energy level
  currentEnergy: EnergyLevel;
  setCurrentEnergy: (energy: EnergyLevel) => void;

  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;

  // Brain dumps
  brainDumps: BrainDump[];
  setBrainDumps: (dumps: BrainDump[]) => void;
  addBrainDump: (dump: BrainDump) => void;

  // UI State
  isSurvivalMode: boolean;
  setSurvivalMode: (enabled: boolean) => void;

  // Toast notifications
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),

  // Preferences
  preferences: null,
  setPreferences: (preferences) => set({ preferences }),

  // Energy
  currentEnergy: 'MEDIUM',
  setCurrentEnergy: (energy) => set({ currentEnergy: energy }),

  // Tasks
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    })),

  // Brain dumps
  brainDumps: [],
  setBrainDumps: (dumps) => set({ brainDumps: dumps }),
  addBrainDump: (dump) => set((state) => ({ brainDumps: [dump, ...state.brainDumps] })),

  // UI
  isSurvivalMode: false,
  setSurvivalMode: (enabled) => set({ isSurvivalMode: enabled }),

  // Toasts
  toasts: [],
  addToast: (message, type = 'info') =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now().toString(), message, type }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
