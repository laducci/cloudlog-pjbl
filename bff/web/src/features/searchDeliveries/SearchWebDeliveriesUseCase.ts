import type { DeliverySummary } from "../../domain/dashboard/models";
import type { DeliveriesGateway } from "../../domain/ports";

/** BFF: repassa a pesquisa ao Serviço de Entregas e devolve só os campos que a Web usa. */
export class SearchWebDeliveriesUseCase {
  constructor(private readonly deps: { deliveries: DeliveriesGateway }) {}

  async execute(filters: { status?: string; search?: string }): Promise<{ items: DeliverySummary[]; total: number }> {
    const items = await this.deps.deliveries.search(filters);
    return { items, total: items.length };
  }
}
