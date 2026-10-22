import { request, requestWithAuth } from './client';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export async function getUser(id: string): Promise<User> {
  return request<User>(`/users/${id}`);
}

export async function createUser(data: CreateUserRequest, token?: string): Promise<User> {
  if (token) {
    return requestWithAuth<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }
  return request<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string, token?: string): Promise<void> {
  if (token) {
    return requestWithAuth<void>(`/users/${id}`, {
      method: 'DELETE',
    }, token);
  }
  return request<void>(`/users/${id}`, {
    method: 'DELETE',
  });
}
