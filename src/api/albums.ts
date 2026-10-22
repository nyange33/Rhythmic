import { request, requestWithAuth } from './client';

export interface Album {
  id: string;
  title: string;
  artist_id: string;
  artist_name: string;
  cover_url: string;
  release_date: string;
  genre: string;
  track_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateAlbumRequest {
  title: string;
  artist_id: string;
  artist_name: string;
  cover_url?: string;
  release_date: string;
  genre?: string;
  track_ids?: string[];
}

export interface UpdateAlbumRequest {
  title?: string;
  cover_url?: string;
  release_date?: string;
  genre?: string;
}

export async function getAllAlbums(): Promise<Album[]> {
  return request<Album[]>('/albums');
}

export async function getAlbum(id: string): Promise<Album> {
  return request<Album>(`/albums/${id}`);
}

export async function getAlbumsByArtist(artistId: string): Promise<Album[]> {
  return request<Album[]>(`/albums/artist/${artistId}`);
}

export async function createAlbum(data: CreateAlbumRequest, token?: string): Promise<Album> {
  if (token) {
    return requestWithAuth<Album>('/albums', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }
  return request<Album>('/albums', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAlbum(id: string, data: UpdateAlbumRequest, token?: string): Promise<Album> {
  if (token) {
    return requestWithAuth<Album>(`/albums/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }
  return request<Album>(`/albums/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAlbum(id: string, token?: string): Promise<void> {
  if (token) {
    return requestWithAuth<void>(`/albums/${id}`, {
      method: 'DELETE',
    }, token);
  }
  return request<void>(`/albums/${id}`, {
    method: 'DELETE',
  });
}

export async function addTrackToAlbum(albumId: string, trackId: string, token?: string): Promise<void> {
  if (token) {
    return requestWithAuth<void>(`/albums/${albumId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ track_id: trackId }),
    }, token);
  }
  return request<void>(`/albums/${albumId}/tracks`, {
    method: 'POST',
    body: JSON.stringify({ track_id: trackId }),
  });
}

export async function removeTrackFromAlbum(albumId: string, trackId: string, token?: string): Promise<void> {
  if (token) {
    return requestWithAuth<void>(`/albums/${albumId}/tracks/${trackId}`, {
      method: 'DELETE',
    }, token);
  }
  return request<void>(`/albums/${albumId}/tracks/${trackId}`, {
    method: 'DELETE',
  });
}
