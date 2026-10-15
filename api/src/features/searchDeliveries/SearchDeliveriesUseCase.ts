import type { DeliveryRecord } from "../../domain/delivery/Delivery";
import type { DeliveryReader } from "../../domain/ports";

export const ALL_STATUSES = "Todos";
export const MAX_RESULTS = 100;

/** Caso de uso: pesquisar entregas por status e texto (RF-03 / SAC). */
export class SearchDeliveriesUseCase {
  constructor(private readonly deps: { deliveryReader: DeliveryReader }) {}

  async execute({ status, search }: { status?: string; search?: string } = {}): Promise<{ items: DeliveryRecord[]; total: number }> {
    const items = await this.deps.deliveryReader.search({
      status: status && status !== ALL_STATUSES ? status : undefined,
      text: search || undefined,
      limit: MAX_RESULTS,
    });
    return { items, total: items.length };
  }
}
