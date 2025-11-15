/**
 * API Client for ADHD Dashboard Backend
 * Handles all communication with the REST API
 */

import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export type EnergyLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'CREATIVE';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type BrainDumpCategory = 'URGENT' | 'IMPORTANT' | 'CREATIVE' | 'LOW_ENERGY' | 'PERSONAL' | 'WORK' | 'IDEAS' | 'LATER';

export interface User {
  id: string;
  email: string;
  name?: string;
  currentEnergyLevel: EnergyLevel;
}

export interface BrainDump {
  id: string;
  content: string;
  category?: BrainDumpCategory;
  suggestedEnergy?: EnergyLevel;
  isUrgent: boolean;
  isImportant: boolean;
  createdAt: string;
  convertedToTask: boolean;
}

export interface TaskStep {
  id: string;
  order: number;
  description: string;
  isCompleted: boolean;
  estimatedMinutes: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  energyRequired: EnergyLevel;
  status: TaskStatus;
  estimatedMinutes?: number;
  tangibleTimeRef?: string;
  firstPhysicalAction?: string;
  isQuickWin: boolean;
  isTopThree: boolean;
  steps: TaskStep[];
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Routine {
  id: string;
  name: string;
  type: 'MORNING' | 'TRANSITION' | 'EVENING' | 'CUSTOM';
  steps: Array<{
    id: string;
    order: number;
    description: string;
    hasTimer: boolean;
    timerMinutes?: number;
  }>;
}

export interface UserPreferences {
  survivalModeEnabled: boolean;
  survivalModeTaskLimit: number;
  reducedMotion: boolean;
  highContrast: 'STANDARD' | 'HIGH' | 'MAXIMUM';
  dyslexicFont: boolean;
  celebrationsEnabled: boolean;
  timeBlindnessMode: boolean;
  pomodoroLength: number;
  pomodoroBreakLength: number;
}

export interface Celebration {
  id: string;
  type: 'STREAK' | 'COMPLETION' | 'COURAGE' | 'SHOWING_UP' | 'MILESTONE';
  message: string;
  createdAt: string;
  acknowledged: boolean;
}

// API Methods
export const api = {
  // Auth
  async register(email: string, password: string, name?: string) {
    const { data } = await apiClient.post('/auth/register', { email, password, name });
    if (data.success && data.data.token) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data.data;
  },

  async login(email: string, password: string) {
    const { data } = await apiClient.post('/auth/login', { email, password });
    if (data.success && data.data.token) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data.data;
  },

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get('/auth/me');
    return data.data.user;
  },

  // Brain Dumps
  async createBrainDump(content: string, audioUrl?: string) {
    const { data } = await apiClient.post('/brain-dump', { content, audioUrl });
    return data.data;
  },

  async getBrainDumps(converted?: boolean): Promise<BrainDump[]> {
    const { data } = await apiClient.get('/brain-dump', {
      params: { converted },
    });
    return data.data.brainDumps;
  },

  async convertBrainDumpToTask(id: string): Promise<Task> {
    const { data } = await apiClient.post(`/brain-dump/${id}/convert`);
    return data.data.task;
  },

  // Tasks
  async getDailyDashboard(energyLevel?: EnergyLevel, survivalMode?: boolean) {
    const { data } = await apiClient.get('/tasks/daily-dashboard', {
      params: { energy_level: energyLevel, survival_mode: survivalMode },
    });
    return data.data;
  },

  async createTask(taskData: {
    title: string;
    description?: string;
    energyRequired?: EnergyLevel;
    dueDate?: string;
    autoBreakdown?: boolean;
  }): Promise<Task> {
    const { data } = await apiClient.post('/tasks', taskData);
    return data.data.task;
  },

  async getTaskBreakdown(title: string, description?: string) {
    const { data } = await apiClient.post('/tasks/task-breakdown', { title, description });
    return data.data;
  },

  async completeTask(taskId: string): Promise<Task> {
    const { data } = await apiClient.patch(`/tasks/${taskId}/complete`);
    return data.data.task;
  },

  async translateTime(minutes: number): Promise<string> {
    const { data } = await apiClient.get('/tasks/time-translator', {
      params: { minutes },
    });
    return data.data.translation;
  },

  // Routines
  async getRoutines(type?: string): Promise<Routine[]> {
    const { data } = await apiClient.get('/routines', {
      params: { type },
    });
    return data.data.routines;
  },

  async startRoutine(routineId: string) {
    const { data } = await apiClient.post('/routines/start', { routineId });
    return data.data;
  },

  // User Preferences
  async getPreferences(): Promise<UserPreferences> {
    const { data } = await apiClient.get('/users/preferences');
    return data.data.preferences;
  },

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const { data } = await apiClient.patch('/users/preferences', preferences);
    return data.data.preferences;
  },

  // Energy Tracking
  async logEnergyLevel(energyLevel: EnergyLevel, notes?: string) {
    const { data } = await apiClient.post('/users/energy', { energyLevel, notes });
    return data.data;
  },

  async getEnergyPatterns() {
    const { data } = await apiClient.get('/users/energy/patterns');
    return data.data;
  },

  // Celebrations
  async getCelebrations(): Promise<Celebration[]> {
    const { data } = await apiClient.get('/users/celebrations');
    return data.data.celebrations;
  },
};

export default api;
