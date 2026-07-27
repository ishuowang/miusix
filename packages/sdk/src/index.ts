import {
  catalogSchema,
  trackSchema,
  type ApiHealth,
  type Catalog,
  type Track,
} from "@miusix/contracts";

export function createMiusixClient(baseUrl: string) {
  const apiBase = baseUrl.replace(/\/$/, "");

  async function request<T>(path: string, parse: (input: unknown) => T): Promise<T> {
    const response = await fetch(`${apiBase}${path}`);
    if (!response.ok) {
      throw new Error(`Miusix API request failed: ${response.status}`);
    }
    return parse(await response.json());
  }

  return {
    health: () => request<ApiHealth>("/health", (value) => value as ApiHealth),
    catalog: (): Promise<Catalog> =>
      request("/v1/catalog", (value) => catalogSchema.parse(value)),
    tracks: (): Promise<Track[]> =>
      request("/v1/tracks", (value) => trackSchema.array().parse(value)),
    track: (id: string): Promise<Track> =>
      request(`/v1/tracks/${encodeURIComponent(id)}`, (value) => trackSchema.parse(value)),
  };
}
