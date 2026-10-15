import { ListAlertsUseCase } from "../../src/features/listAlerts/ListAlertsUseCase";
import { makeListAlertsHandler } from "../../src/features/listAlerts/listAlerts.handler";
import { ProcessDeliveryEventUseCase } from "../../src/features/processDeliveryEvent/ProcessDeliveryEventUseCase";
import { makeProcessDeliveryEventHandler } from "../../src/features/processDeliveryEvent/processDeliveryEvent.handler";
import { LogAlertNotifier } from "../../src/infrastructure/notifications/LogAlertNotifier";
import { InMemoryAlertRepository } from "../../src/infrastructure/persistence/memory/InMemoryAlertRepository";
import { ValidationError } from "../../src/domain/errors";
import { delayedEvent, fakeRequest, fixedClock, sequentialIds, silentLogger } from "../support/fakes";

function setup() {
  const repository = new InMemoryAlertRepository();
  const notifier = new LogAlertNotifier(silentLogger);
  return {
    repository, notifier,
    process: new ProcessDeliveryEventUseCase({ alertWriter: repository, alertNotifier: notifier, clock: fixedClock, ids: sequentialIds() }),
    list: new ListAlertsUseCase({ alertReader: repository }),
  };
}

describe("Fatia processDeliveryEvent (consumidor da fila)", () => {
  it("entrega atrasada: salva e notifica o alerta", async () => {
    const { process, repository, notifier } = setup();
    const result = await process.execute(delayedEvent());
    expect(result.alerted).toBe(true);
    expect(repository.items).toHaveLength(1);
    expect(notifier.sent[0].id).toBe("alert-1");
  });

  it("outros eventos não geram alerta", async () => {
    const { process, repository } = setup();
    expect((await process.execute(delayedEvent({ data: { status: "Em rota" } }))).alerted).toBe(false);
    expect(repository.items).toHaveLength(0);
  });

  it("mensagem inválida é rejeitada (vai para dead-letter após as tentativas)", async () => {
    await expect(setup().process.execute({} as never)).rejects.toBeInstanceOf(ValidationError);
  });

  it("handler aceita a mensagem como JSON (string) ou objeto", async () => {
    const handler = makeProcessDeliveryEventHandler({ processDeliveryEvent: setup().process });
    expect((await handler(JSON.stringify(delayedEvent()))).alerted).toBe(true);
    expect((await handler(delayedEvent({ data: { status: "Entregue" } }))).alerted).toBe(false);
  });
});

describe("Fatia listAlerts (HTTP GET /api/alerts)", () => {
  it("lista os alertas mais recentes e respeita o limite", async () => {
    const { process, list } = setup();
    for (let i = 0; i < 3; i++) await process.execute(delayedEvent({ aggregateId: `d${i}` }));
    expect((await list.execute({ limit: 2 })).total).toBe(2);
    expect((await list.execute({ limit: 999 })).total).toBe(3);
  });

  it("handler responde 200 com JSON", async () => {
    const response = await makeListAlertsHandler({ listAlerts: setup().list })(fakeRequest({ limit: "5" }));
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ items: [], total: 0 });
  });
});
