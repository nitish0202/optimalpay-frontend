import client from './client';
import type { ApiResponse } from '../types';

export interface Merchant {
  merchantId: string;
  merchantName: string;
  categoryId?: string;
  categoryName?: string;
}

export interface Category {
  categoryId: string;
  categoryName: string;
}

export async function searchMerchants(q: string): Promise<Merchant[]> {
  if (!q.trim()) return [];
  const res = await client.get<ApiResponse<Merchant[]>>('/v1/merchants', { params: { q } });
  return res.data.data ?? [];
}

export async function getCategories(): Promise<Category[]> {
  const res = await client.get<ApiResponse<Category[]>>('/v1/categories');
  return res.data.data ?? [];
}
