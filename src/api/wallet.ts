import client from './client';
import type { ApiResponse, WalletCardResponse, AddCardRequest, UpdateCardRequest } from '../types';

export async function getWallet(): Promise<WalletCardResponse[]> {
  const res = await client.get<ApiResponse<WalletCardResponse[]>>('/v1/wallet/cards');
  return res.data.data ?? [];
}

export async function addCard(data: AddCardRequest): Promise<WalletCardResponse> {
  const res = await client.post<ApiResponse<WalletCardResponse>>('/v1/wallet/cards', data);
  return res.data.data!;
}

export async function updateCard(id: string, data: UpdateCardRequest): Promise<WalletCardResponse> {
  const res = await client.patch<ApiResponse<WalletCardResponse>>(`/v1/wallet/cards/${id}`, data);
  return res.data.data!;
}

export async function removeCard(id: string): Promise<void> {
  await client.delete(`/v1/wallet/cards/${id}`);
}
