import client from './client';
import type { ApiResponse, CreditCard } from '../types';

export async function getCards(): Promise<CreditCard[]> {
  const res = await client.get<ApiResponse<CreditCard[]>>('/v1/cards');
  return res.data.data ?? [];
}

export async function getCard(cardId: string): Promise<CreditCard> {
  const res = await client.get<ApiResponse<CreditCard>>(`/v1/cards/${cardId}`);
  return res.data.data!;
}
