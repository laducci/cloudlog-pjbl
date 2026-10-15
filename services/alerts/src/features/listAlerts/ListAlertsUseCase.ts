import type { AlertRecord } from "../../domain/alert/Alert";
import type { AlertReader } from "../../domain/ports";

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/** Caso de uso: listar alertas recentes (consumido pelo BFF Web). */
export class ListAlertsUseCase {
  constructor(private readonly deps: { alertReader: AlertReader }) {}

  async execute({ limit }: { limit?: number } = {}): Promise<{ items: AlertRecord[]; total: number }> {
    const safeLimit = Math.min(Math.max(Number(limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const items = await this.deps.alertReader.listRecent(safeLimit);
    return { items, total: items.length };
  }
}
