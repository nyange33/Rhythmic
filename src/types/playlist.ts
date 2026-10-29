export type PlaylistItem = {
  id: number;
  backendId?: string;
  name: string;
  type: "Playlist" | "Album";
  trackIds: number[];
  description?: string;
  coverUrl?: string;
  isPublic?: boolean;
};
