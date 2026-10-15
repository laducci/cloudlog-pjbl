import { UpstreamUnavailableError } from "../../domain/errors";

export type FetchLike = (url: string, init?: { headers?: Record<string, string>; signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

/** GET JSON com timeout; qualquer falha vira UpstreamUnavailableError (erro de domínio do BFF). */
export async function fetchJson(fetchFn: FetchLike, url: string, service: string, timeoutMs = 8000): Promise<unknown> {
  try {
    const response = await fetchFn(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch {
    throw new UpstreamUnavailableError(service);
  }
}
