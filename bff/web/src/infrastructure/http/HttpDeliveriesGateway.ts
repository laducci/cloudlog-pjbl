import type { DeliverySummary } from "../../domain/dashboard/models";
import type { DeliveriesGateway } from "../../domain/ports";
import { fetchJson, FetchLike } from "./fetchJson";

interface DeliveryDto { _id: string; code: string; customer: string; destination: string; driver: string; status: string; eta: string; progress?: number }

/** Cliente HTTP do Serviço de Entregas (GET /api/deliveries). */
export class HttpDeliveriesGateway implements DeliveriesGateway {
  constructor(private readonly config: { baseUrl: string; fetch?: FetchLike }) {}

  async search(filters: { status?: string; search?: string }): Promise<DeliverySummary[]> {
    const params = new URLSearchParams(Object.entries(filters).filter((e): e is [string, string] => Boolean(e[1])));
    const url = `${this.config.baseUrl.replace(/\/$/, "")}/api/deliveries${params.size ? `?${params}` : ""}`;
    const payload = (await fetchJson(this.config.fetch ?? (fetch as FetchLike), url, "de Entregas")) as { items?: DeliveryDto[] };
    return (payload.items ?? []).map((d) => ({
      id: String(d._id), code: d.code, customer: d.customer, destination: d.destination,
      driver: d.driver, status: d.status, eta: d.eta, progress: Number(d.progress ?? 0),
    }));
  }
}
