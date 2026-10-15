import { buildContainer } from "../../src/bootstrap/container";
import { UpstreamUnavailableError } from "../../src/domain/errors";
import { GetDashboardUseCase } from "../../src/features/getDashboard/GetDashboardUseCase";
import { makeGetDashboardHandler } from "../../src/features/getDashboard/getDashboard.handler";
import { makeSearchDeliveriesHandler } from "../../src/features/searchDeliveries/searchDeliveries.handler";
import { InMemoryAlertsGateway, InMemoryDeliveriesGateway } from "../../src/infrastructure/memory/InMemoryGateways";
import { failing, fixedClock, sampleDeliveries } from "../support/fakes";

const alert = { id: "a1", deliveryCode: "CL-2", message: "Entrega CL-2 está atrasada", severity: "alta", occurredAt: "2026-10-15T11:00:00Z" };

describe("Fatia getDashboard (GET /api/web/dashboard)", () => {
  it("agrega Entregas e Alertas numa única resposta", async () => {
    const useCase = new GetDashboardUseCase({ deliveries: new InMemoryDeliveriesGateway(sampleDeliveries()), alerts: new InMemoryAlertsGateway([alert]), clock: fixedClock });
    const view = await useCase.execute();
    expect(view.kpis.total).toBe(5);
    expect(view.alerts).toEqual([alert]);
    expect(view.warnings).toEqual([]);
    expect(view.generatedAt).toBe("2026-10-15T12:00:00.000Z");
  });

  it("degrada com aviso quando o Serviço de Alertas falha", async () => {
    const useCase = new GetDashboardUseCase({ deliveries: new InMemoryDeliveriesGateway(sampleDeliveries()), alerts: failing, clock: fixedClock });
    const view = await useCase.execute();
    expect(view.alerts).toEqual([]);
    expect(view.warnings).toEqual(["Alertas indisponíveis no momento."]);
  });

  it("responde 502 quando o Serviço de Entregas está fora", async () => {
    const deliveries = { search: async () => { throw new UpstreamUnavailableError("de Entregas"); } };
    const handler = makeGetDashboardHandler(buildContainer({}, { deliveries, alerts: new InMemoryAlertsGateway() }));
    const response = await handler({});
    expect(response.status).toBe(502);
  });
});

describe("Fatia searchDeliveries (GET /api/web/deliveries)", () => {
  it("filtra e devolve só os campos usados pela Web", async () => {
    const handler = makeSearchDeliveriesHandler(buildContainer({}, { deliveries: new InMemoryDeliveriesGateway(sampleDeliveries()), alerts: new InMemoryAlertsGateway() }));
    const response = await handler({ params: {}, query: new URLSearchParams({ status: "Entregue" }), json: async () => ({}) });
    const body = JSON.parse(response.body);
    expect(response.status).toBe(200);
    expect(body.total).toBe(2);
    expect(Object.keys(body.items[0]).sort()).toEqual(["code", "customer", "destination", "driver", "eta", "id", "progress", "status"]);
  });
});
