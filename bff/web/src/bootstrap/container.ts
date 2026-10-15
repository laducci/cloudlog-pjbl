import type { AlertsGateway, DeliveriesGateway } from "../domain/ports";
import { GetDashboardUseCase } from "../features/getDashboard/GetDashboardUseCase";
import { SearchWebDeliveriesUseCase } from "../features/searchDeliveries/SearchWebDeliveriesUseCase";
import { HttpAlertsGateway } from "../infrastructure/http/HttpAlertsGateway";
import { HttpDeliveriesGateway } from "../infrastructure/http/HttpDeliveriesGateway";
import { InMemoryAlertsGateway } from "../infrastructure/memory/InMemoryGateways";
import { SystemClock } from "../infrastructure/time/SystemClock";

export const DEFAULT_DELIVERY_SERVICE_URL = "https://polite-mushroom-0b05fa610.3.azurestaticapps.net";

/** Composition Root do BFF Web: escolhe os clientes HTTP dos microsserviços por configuração. */
export function buildContainer(env: NodeJS.ProcessEnv = process.env, overrides: { deliveries?: DeliveriesGateway; alerts?: AlertsGateway } = {}) {
  const deliveries = overrides.deliveries ?? new HttpDeliveriesGateway({ baseUrl: env.DELIVERY_SERVICE_URL || DEFAULT_DELIVERY_SERVICE_URL });
  const alerts = overrides.alerts ?? (env.ALERTS_SERVICE_URL ? new HttpAlertsGateway({ baseUrl: env.ALERTS_SERVICE_URL }) : new InMemoryAlertsGateway());
  return {
    getDashboard: new GetDashboardUseCase({ deliveries, alerts, clock: new SystemClock() }),
    searchWebDeliveries: new SearchWebDeliveriesUseCase({ deliveries }),
  };
}

export const container = buildContainer();
