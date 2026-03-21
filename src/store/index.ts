import { create } from 'zustand';
import { UserStats, UserSubscription, UserProgress } from '../types';

interface AuthState {
  user: { id: string; email: string } | null;
  loading: boolean;
  setUser: (user: { id: string; email: string } | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));

interface LearningState {
  stats: UserStats | null;
  subscriptions: Record<string, UserSubscription>;
  progress: Record<string, UserProgress>;
  setStats: (stats: UserStats) => void;
  addSubscription: (subscription: UserSubscription) => void;
  addProgress: (progress: UserProgress) => void;
  hasAccessToCourse: (courseId: string) => boolean;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  stats: null,
  subscriptions: {},
  progress: {},

  setStats: (stats) => set({ stats }),

  addSubscription: (subscription) => {
    set((state) => ({
      subscriptions: {
        ...state.subscriptions,
        [subscription.course_id]: subscription,
      },
    }));
  },

  addProgress: (progress) => {
    set((state) => ({
      progress: {
        ...state.progress,
        [progress.lesson_id]: progress,
      },
    }));
  },

  hasAccessToCourse: (courseId) => {
    return !!get().subscriptions[courseId]?.is_active;
  },
}));
