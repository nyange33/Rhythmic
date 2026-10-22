import { request, requestWithAuth } from './client';

export interface Playlist {
  id: string;
  name: string;
  description: string;
  user_id: string;
  track_ids: string[];
  cover_url: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePlaylistRequest {
  name: string;
  description?: string;
  cover_url?: string;
  is_public?: boolean;
  track_ids?: string[];
}

export interface UpdatePlaylistRequest {
  name?: string;
  description?: string;
  cover_url?: string;
  is_public?: boolean;
}

export async function getUserPlaylists(userId: string): Promise<Playlist[]> {
  return request<Playlist[]>(`/playlists?user_id=${userId}`);
}

export async function getPlaylist(id: string): Promise<Playlist> {
  return request<Playlist>(`/playlists/${id}`);
}

export async function createPlaylist(data: CreatePlaylistRequest, userId: string, token?: string): Promise<Playlist> {
  const endpoint = `/playlists?user_id=${userId}`;
  if (token) {
    return requestWithAuth<Playlist>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }
  return request<Playlist>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePlaylist(id: string, data: UpdatePlaylistRequest, token?: string): Promise<Playlist> {
  if (token) {
    return requestWithAuth<Playlist>(`/playlists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }
  return request<Playlist>(`/playlists/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePlaylist(id: string, token?: string): Promise<void> {
  if (token) {
    return requestWithAuth<void>(`/playlists/${id}`, {
      method: 'DELETE',
    }, token);
  }
  return request<void>(`/playlists/${id}`, {
    method: 'DELETE',
  });
}

export async function addTrackToPlaylist(playlistId: string, trackId: string, token?: string): Promise<void> {
  if (token) {
    return requestWithAuth<void>(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ track_id: trackId }),
    }, token);
  }
  return request<void>(`/playlists/${playlistId}/tracks`, {
    method: 'POST',
    body: JSON.stringify({ track_id: trackId }),
  });
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string, token?: string): Promise<void> {
  if (token) {
    return requestWithAuth<void>(`/playlists/${playlistId}/tracks/${trackId}`, {
      method: 'DELETE',
    }, token);
  }
  return request<void>(`/playlists/${playlistId}/tracks/${trackId}`, {
    method: 'DELETE',
  });
}
