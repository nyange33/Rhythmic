// Comments API - placeholder for future implementation
// Currently not implemented in backend

export interface Comment {
  id: string;
  user_id: string;
  track_id: string;
  text: string;
  created_at: string;
}

export interface CreateCommentRequest {
  track_id: string;
  text: string;
}

export async function getTrackComments(trackId: string): Promise<Comment[]> {
  // Placeholder - implement when backend is ready
  return [];
}

export async function createComment(data: CreateCommentRequest, token?: string): Promise<Comment> {
  // Placeholder - implement when backend is ready
  return { id: '', user_id: '', track_id: data.track_id, text: data.text, created_at: '' };
}

export async function deleteComment(id: string, token?: string): Promise<void> {
  // Placeholder - implement when backend is ready
}
