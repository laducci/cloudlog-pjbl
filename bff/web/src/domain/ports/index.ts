import type { AlertSummary, DeliverySummary } from "../dashboard/models";

/** Portas para os microsserviços consumidos pelo BFF (DIP): HTTP fica na infraestrutura. */
export interface DeliveriesGateway {
  search(filters: { status?: string; search?: string }): Promise<DeliverySummary[]>;
}

export interface AlertsGateway {
  listRecent(limit: number): Promise<AlertSummary[]>;
}

export interface Clock {
  now(): Date;
}
