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
  subscriptions: Map<string, UserSubscription>;
  progress: Map<string, UserProgress>;
  setStats: (stats: UserStats) => void;
  addSubscription: (subscription: UserSubscription) => void;
  addProgress: (progress: UserProgress) => void;
  hasAccessToCourse: (courseId: string) => boolean;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  stats: null,
  subscriptions: new Map(),
  progress: new Map(),
  setStats: (stats) => set({ stats }),
  addSubscription: (subscription) => {
    const subs = new Map(get().subscriptions);
    subs.set(subscription.course_id, subscription);
    set({ subscriptions: subs });
  },
  addProgress: (progress) => {
    const prg = new Map(get().progress);
    prg.set(progress.lesson_id, progress);
    set({ progress: prg });
  },
  hasAccessToCourse: (courseId) => {
    const sub = get().subscriptions.get(courseId);
    return sub ? sub.is_active : false;
  },
}));
