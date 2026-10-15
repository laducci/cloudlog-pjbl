import { DashboardCalculator } from "../../domain/dashboard/DashboardCalculator";
import type { AlertSummary, DashboardView } from "../../domain/dashboard/models";
import type { AlertsGateway, Clock, DeliveriesGateway } from "../../domain/ports";

export const ALERTS_LIMIT = 5;

/**
 * BFF: agrega Serviço de Entregas + Serviço de Alertas numa única resposta para a tela.
 * Alertas são opcionais (degradação graciosa); entregas são obrigatórias.
 */
export class GetDashboardUseCase {
  constructor(private readonly deps: { deliveries: DeliveriesGateway; alerts: AlertsGateway; clock: Clock }) {}

  async execute(): Promise<DashboardView> {
    const [deliveriesResult, alertsResult] = await Promise.allSettled([
      this.deps.deliveries.search({}),
      this.deps.alerts.listRecent(ALERTS_LIMIT),
    ]);
    if (deliveriesResult.status === "rejected") throw deliveriesResult.reason;

    const deliveries = deliveriesResult.value;
    const warnings: string[] = [];
    let alerts: AlertSummary[] = [];
    if (alertsResult.status === "fulfilled") alerts = alertsResult.value;
    else warnings.push("Alertas indisponíveis no momento.");

    return {
      generatedAt: this.deps.clock.now().toISOString(),
      kpis: DashboardCalculator.kpis(deliveries),
      priorities: DashboardCalculator.priorities(deliveries),
      alerts,
      warnings,
    };
  }
}
