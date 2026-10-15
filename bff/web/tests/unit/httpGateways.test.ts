import { UpstreamUnavailableError } from "../../src/domain/errors";
import { HttpAlertsGateway } from "../../src/infrastructure/http/HttpAlertsGateway";
import { HttpDeliveriesGateway } from "../../src/infrastructure/http/HttpDeliveriesGateway";

const respond = (body: unknown, ok = true, status = 200) => async () => ({ ok, status, json: async () => body });

describe("Clientes HTTP dos microsserviços", () => {
  it("Entregas: monta a URL com filtros e mapeia o DTO", async () => {
    const calls: string[] = [];
    const fetch = async (url: string) => { calls.push(url); return respond({ items: [{ _id: "1", code: "CL-1", customer: "A", destination: "B", driver: "M", status: "Em rota", eta: "Hoje", createdAt: "x" }] })(); };
    const items = await new HttpDeliveriesGateway({ baseUrl: "https://svc/", fetch }).search({ status: "Em rota", search: "" });
    expect(calls[0]).toBe("https://svc/api/deliveries?status=Em+rota");
    expect(items[0]).toEqual({ id: "1", code: "CL-1", customer: "A", destination: "B", driver: "M", status: "Em rota", eta: "Hoje", progress: 0 });
  });

  it("Alertas: chama /api/alerts com limite", async () => {
    const calls: string[] = [];
    const fetch = async (url: string) => { calls.push(url); return respond({ items: [] })(); };
    await new HttpAlertsGateway({ baseUrl: "https://alerts", fetch }).listRecent(5);
    expect(calls[0]).toBe("https://alerts/api/alerts?limit=5");
  });

  it("HTTP 500 ou falha de rede viram UpstreamUnavailableError", async () => {
    await expect(new HttpDeliveriesGateway({ baseUrl: "https://svc", fetch: respond({}, false, 500) }).search({})).rejects.toBeInstanceOf(UpstreamUnavailableError);
    await expect(new HttpAlertsGateway({ baseUrl: "https://a", fetch: async () => { throw new Error("rede"); } }).listRecent(1)).rejects.toBeInstanceOf(UpstreamUnavailableError);
  });
});
