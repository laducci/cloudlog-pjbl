import type { DeliverySummary } from "../../src/domain/dashboard/models";

export const FIXED_NOW = new Date("2026-10-15T12:00:00.000Z");
export const fixedClock = { now: () => FIXED_NOW };

export const delivery = (code: string, status: string, progress = 50): DeliverySummary => ({
  id: code, code, customer: "Mercado Aurora", destination: "Curitiba, PR", driver: "Marcos Silva", status, eta: "Hoje", progress,
});

export const sampleDeliveries = () => [
  delivery("CL-1", "Em rota", 40),
  delivery("CL-2", "Atrasada", 70),
  delivery("CL-3", "Entregue", 100),
  delivery("CL-4", "Entregue", 100),
  delivery("CL-5", "Pendente", 0),
];

export const failing = { search: async () => { throw new Error("down"); }, listRecent: async () => { throw new Error("down"); } };
