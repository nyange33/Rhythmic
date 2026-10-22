import { request, requestWithAuth } from './client';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  audio_url: string;
  artist_id: string;
  created_at: string;
}

export interface CreateTrackRequest {
  title: string;
  artist: string;
  album?: string;
  duration: number;
  audio_url: string;
  artist_id: string;
}

export interface UpdateTrackRequest {
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
  audio_url?: string;
  artist_id?: string;
}

export async function getAllTracks(): Promise<Track[]> {
  return request<Track[]>('/tracks');
}

export async function searchTracks(query: string): Promise<Track[]> {
  return request<Track[]>(`/tracks/search?q=${encodeURIComponent(query)}`);
}

export async function getTrack(id: string): Promise<Track> {
  return request<Track>(`/tracks/${id}`);
}

export async function createTrack(data: CreateTrackRequest, token?: string): Promise<Track> {
  if (token) {
    return requestWithAuth<Track>('/tracks', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }
  return request<Track>('/tracks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTrack(id: string, data: UpdateTrackRequest, token?: string): Promise<Track> {
  if (token) {
    return requestWithAuth<Track>(`/tracks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }
  return request<Track>(`/tracks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTrack(id: string, token?: string): Promise<void> {
  if (token) {
    return requestWithAuth<void>(`/tracks/${id}`, {
      method: 'DELETE',
    }, token);
  }
  return request<void>(`/tracks/${id}`, {
    method: 'DELETE',
  });
}

export async function getTracksByArtist(artistId: string): Promise<Track[]> {
  return request<Track[]>(`/tracks/artist/${artistId}`);
}
