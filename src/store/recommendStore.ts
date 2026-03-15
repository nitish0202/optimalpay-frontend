import { create } from 'zustand';
import type { RecommendationResponse } from '../types';

interface RecommendState {
  lastResult: RecommendationResponse | null;
  setResult: (r: RecommendationResponse) => void;
  clearResult: () => void;
}

export const useRecommendStore = create<RecommendState>((set) => ({
  lastResult: null,
  setResult: (r) => set({ lastResult: r }),
  clearResult: () => set({ lastResult: null }),
}));
