import { useMutation } from '@tanstack/react-query';
import { postRecommendation } from '../api/recommend';
import type { RecommendationRequest } from '../types';

export function useRecommend() {
  return useMutation({
    mutationFn: (data: RecommendationRequest) => postRecommendation(data),
  });
}
