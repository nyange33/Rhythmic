<div align="center">

# Rhythmic

**Стриминговая платформа для музыки — для слушателей и артистов**

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)](https://tailwindcss.com/)
[![Go](https://img.shields.io/badge/Go-0B3D2E?style=for-the-badge&logo=go&logoColor=white)](https://go.dev/)

</div>



## Rhythmic UI updates

The interface uses a graphite base palette with gold accents. Added frontend pages for Library, Liked Tracks, Notifications, and Playlists / Albums. Collection data and liked track IDs are saved in the browser's localStorage. The upload dialog supports choosing one audio file for a single or multiple files for an album; publishing files to a shared server requires connecting an upload endpoint/backend. Notifications display playback errors and a placeholder for new releases from followed artists; artist subscriptions and server-pushed release notifications require backend support.

Start locally:

```bash
npm install
npm run dev
```

### Source layout

- `src/components/pages/CollectionPages.tsx` — Library, Liked Tracks, Notifications, and Playlists / Albums pages.
- `src/components/dialogs/MusicDialogs.tsx` — create-collection and upload-music dialogs.
- `src/components/MusicComponents.tsx` — shared cover, navigation, waveform, and track-row components.
