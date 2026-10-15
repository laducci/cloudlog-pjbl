import type { AlertSummary, DeliverySummary } from "../../domain/dashboard/models";
import type { AlertsGateway, DeliveriesGateway } from "../../domain/ports";

/** Implementações em memória das portas (testes e execução local sem os microsserviços). */
export class InMemoryDeliveriesGateway implements DeliveriesGateway {
  constructor(public items: DeliverySummary[] = []) {}

  async search({ status, search }: { status?: string; search?: string }): Promise<DeliverySummary[]> {
    const needle = search?.toLowerCase();
    return this.items
      .filter((d) => !status || status === "Todos" || d.status === status)
      .filter((d) => !needle || [d.code, d.customer, d.destination, d.driver].some((v) => v.toLowerCase().includes(needle)));
  }
}

export class InMemoryAlertsGateway implements AlertsGateway {
  constructor(public items: AlertSummary[] = []) {}

  async listRecent(limit: number): Promise<AlertSummary[]> {
    return this.items.slice(0, limit);
  }
}
