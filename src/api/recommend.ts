import client from './client';
import type { ApiResponse, RecommendationRequest, RecommendationResponse } from '../types';

export async function postRecommendation(data: RecommendationRequest): Promise<RecommendationResponse> {
  const res = await client.post<ApiResponse<RecommendationResponse>>('/v1/recommend', data);
  return res.data.data!;
}
