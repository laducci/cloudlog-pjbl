import type { HttpRequestLike } from "../../src/shared/http/types";

export const FIXED_NOW = new Date("2026-10-08T12:00:00.000Z");
export const fixedClock = { now: () => FIXED_NOW };

export function fakeRequest({ body, query = {}, params = {}, invalidJson = false }: {
  body?: unknown; query?: Record<string, string>; params?: Record<string, string>; invalidJson?: boolean;
} = {}): HttpRequestLike {
  return {
    params,
    query: new URLSearchParams(query),
    json: async () => {
      if (invalidJson) throw new SyntaxError("Unexpected token");
      return body;
    },
  };
}

export const fakeLogger = () => {
  const errors: unknown[] = [];
  return { errors, error: (e: unknown) => errors.push(e) };
};

export const validDelivery = () => ({
  code: "CL-2050",
  customer: "Mercado Aurora",
  destination: "Curitiba, PR",
  driver: "Marcos Silva",
  status: "Em rota",
  eta: "Hoje, 17:30",
  progress: 35,
});
