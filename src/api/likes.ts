import { request } from "./client";

export interface Like {
  id: string;
  user_id: string;
  track_id: string;
  created_at: string;
}

export async function getUserLikes(userId: string): Promise<Like[]> {
  return request<Like[]>(`/likes?user_id=${encodeURIComponent(userId)}`);
}

export async function createLike(userId: string, trackId: string): Promise<Like> {
  return request<Like>("/likes", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, track_id: trackId }),
  });
}

export async function deleteLike(userId: string, trackId: string): Promise<void> {
  await request<void>(`/likes/track/${encodeURIComponent(trackId)}?user_id=${encodeURIComponent(userId)}`, { method: "DELETE" });
}
