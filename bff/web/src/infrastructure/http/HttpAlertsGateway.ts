import type { AlertSummary } from "../../domain/dashboard/models";
import type { AlertsGateway } from "../../domain/ports";
import { fetchJson, FetchLike } from "./fetchJson";

interface AlertDto { id: string; deliveryCode: string; message: string; severity: string; occurredAt: string }

/** Cliente HTTP do Serviço de Alertas (GET /api/alerts). */
export class HttpAlertsGateway implements AlertsGateway {
  constructor(private readonly config: { baseUrl: string; fetch?: FetchLike }) {}

  async listRecent(limit: number): Promise<AlertSummary[]> {
    const url = `${this.config.baseUrl.replace(/\/$/, "")}/api/alerts?limit=${limit}`;
    const payload = (await fetchJson(this.config.fetch ?? (fetch as FetchLike), url, "de Alertas")) as { items?: AlertDto[] };
    return (payload.items ?? []).map(({ id, deliveryCode, message, severity, occurredAt }) => ({ id, deliveryCode, message, severity, occurredAt }));
  }
}
