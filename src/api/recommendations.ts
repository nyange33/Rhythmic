import { request } from './client';

export interface Recommendation {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  audio_url: string;
  artist_id: string;
  reason: string;
}

export async function getRecommendations(userId: string, limit?: number): Promise<Recommendation[]> {
  const limitParam = limit ? `&limit=${limit}` : '';
  return request<Recommendation[]>(`/recommendations?user_id=${userId}${limitParam}`);
}
