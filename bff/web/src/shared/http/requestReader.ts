import type { HttpRequestLike } from "./types";

export class InvalidRequestError extends Error {
  constructor(message = "O corpo da requisição deve ser um JSON válido.") {
    super(message);
    this.name = "InvalidRequestError";
  }
}

export async function readJsonBody<T = Record<string, unknown>>(request: HttpRequestLike): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch (error) {
    if (error instanceof SyntaxError) throw new InvalidRequestError();
    throw error;
  }
}

export function readQuery(request: HttpRequestLike, name: string): string | undefined {
  return request.query?.get(name)?.trim() || undefined;
}
