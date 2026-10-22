import { request, requestWithAuth } from './client';

export interface Artist {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  cover_url: string;
  profile_image_url: string;
  followers_count: number;
  total_plays: number;
  total_likes: number;
  track_ids: string[];
  album_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateArtistRequest {
  user_id: string;
  display_name: string;
  bio?: string;
  cover_url?: string;
  profile_image_url?: string;
}

export interface UpdateArtistRequest {
  display_name?: string;
  bio?: string;
  cover_url?: string;
  profile_image_url?: string;
}

export async function getAllArtists(): Promise<Artist[]> {
  return request<Artist[]>('/artists');
}

export async function getArtist(id: string): Promise<Artist> {
  return request<Artist>(`/artists/${id}`);
}

export async function getArtistByUserId(userId: string): Promise<Artist> {
  return request<Artist>(`/artists/user/${userId}`);
}

export async function createArtist(data: CreateArtistRequest, token?: string): Promise<Artist> {
  if (token) {
    return requestWithAuth<Artist>('/artists', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }
  return request<Artist>('/artists', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateArtist(id: string, data: UpdateArtistRequest, token?: string): Promise<Artist> {
  if (token) {
    return requestWithAuth<Artist>(`/artists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }
  return request<Artist>(`/artists/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteArtist(id: string, token?: string): Promise<void> {
  if (token) {
    return requestWithAuth<void>(`/artists/${id}`, {
      method: 'DELETE',
    }, token);
  }
  return request<void>(`/artists/${id}`, {
    method: 'DELETE',
  });
}
