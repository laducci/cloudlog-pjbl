/**
 * Contratos HTTP mínimos usados pelos handlers. Mantêm os handlers
 * independentes de @azure/functions (o framework fica só nos *.function.ts).
 */
export interface HttpRequestLike {
  params: Record<string, string | undefined>;
  query: { get(name: string): string | null };
  json(): Promise<unknown>;
}

export interface HttpResponseLike {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export interface LoggerLike {
  error?(...args: unknown[]): void;
  log?(...args: unknown[]): void;
}
