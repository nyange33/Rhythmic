import { request, requestWithAuth } from './client';

export interface Follow {
  id: string;
  user_id: string;
  artist_id: string;
  created_at: string;
}

export interface CreateFollowRequest {
  user_id: string;
  artist_id: string;
}

export async function getUserFollows(userId: string): Promise<Follow[]> {
  return request<Follow[]>(`/follows?user_id=${userId}`);
}

export async function getArtistFollowers(artistId: string): Promise<Follow[]> {
  return request<Follow[]>(`/follows/artist/${artistId}`);
}

export async function checkFollow(userId: string, artistId: string): Promise<{ is_following: boolean }> {
  return request<{ is_following: boolean }>(`/follows/check?user_id=${userId}&artist_id=${artistId}`);
}

export async function createFollow(data: CreateFollowRequest, token?: string): Promise<Follow> {
  if (token) {
    return requestWithAuth<Follow>('/follows', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }
  return request<Follow>('/follows', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteFollow(id: string, token?: string): Promise<void> {
  if (token) {
    return requestWithAuth<void>(`/follows/${id}`, {
      method: 'DELETE',
    }, token);
  }
  return request<void>(`/follows/${id}`, {
    method: 'DELETE',
  });
}

export async function unfollow(userId: string, artistId: string, token?: string): Promise<void> {
  if (token) {
    return requestWithAuth<void>(`/follows/user/${userId}/artist/${artistId}`, {
      method: 'DELETE',
    }, token);
  }
  return request<void>(`/follows/user/${userId}/artist/${artistId}`, {
    method: 'DELETE',
  });
}
