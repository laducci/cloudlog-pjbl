import type { HttpResponseLike } from "./types";

export function json(status: number, body: unknown): HttpResponseLike {
  return { status, headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(body) };
}

export const ok = (body: unknown) => json(200, body);
export const created = (body: unknown) => json(201, body);
