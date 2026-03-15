import client from './client';
import type { ApiResponse, AuthResponse, SignupRequest, LoginRequest } from '../types';

export async function signup(data: SignupRequest): Promise<AuthResponse> {
  const res = await client.post<ApiResponse<AuthResponse>>('/v1/auth/signup', data);
  return res.data.data!;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await client.post<ApiResponse<AuthResponse>>('/v1/auth/login', data);
  return res.data.data!;
}

export async function refreshTokens(): Promise<AuthResponse> {
  const res = await client.post<ApiResponse<AuthResponse>>('/v1/auth/refresh');
  return res.data.data!;
}

export async function logout(): Promise<void> {
  await client.post('/v1/auth/logout');
}
