import type { HttpRequestLike } from "../../src/shared/http/types";

export const FIXED_NOW = new Date("2026-10-15T12:00:00.000Z");
export const fixedClock = { now: () => FIXED_NOW };
export const sequentialIds = () => { let n = 0; return { next: () => `alert-${++n}` }; };
export const silentLogger = { warn: () => {} };

export const delayedEvent = (overrides: Record<string, unknown> = {}) => ({
  type: "DeliveryUpdated",
  version: 1,
  aggregateId: "6720f1c2a9e4b1d3c0f5a911",
  occurredAt: "2026-10-15T11:59:00.000Z",
  data: { code: "CL-2050", driver: "Marcos Silva", status: "Atrasada" },
  ...overrides,
});

export function fakeRequest(query: Record<string, string> = {}): HttpRequestLike {
  return { params: {}, query: new URLSearchParams(query), json: async () => ({}) };
}
