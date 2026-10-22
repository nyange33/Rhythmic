// Charts API - placeholder for future implementation
// Currently not implemented in backend

export interface Chart {
  id: string;
  title: string;
  tracks: string[];
}

export async function getCharts(): Promise<Chart[]> {
  // Placeholder - implement when backend is ready
  return [];
}

export async function getChart(id: string): Promise<Chart> {
  // Placeholder - implement when backend is ready
  return { id, title: '', tracks: [] };
}
