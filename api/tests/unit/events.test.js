const test = require("node:test");
const assert = require("node:assert/strict");
const { CreateDeliveryUseCase } = require("../../src/features/createDelivery/CreateDeliveryUseCase");
const { UpdateDeliveryUseCase } = require("../../src/features/updateDelivery/UpdateDeliveryUseCase");
const { DeleteDeliveryUseCase } = require("../../src/features/deleteDelivery/DeleteDeliveryUseCase");
const { ProcessDeliveryEventUseCase } = require("../../src/features/processDeliveryEvent/ProcessDeliveryEventUseCase");
const { makeProcessDeliveryEventHandler } = require("../../src/features/processDeliveryEvent/processDeliveryEvent.handler");
const { DeliveryEventType } = require("../../src/domain/delivery/DeliveryEvents");
const { InMemoryDeliveryRepository } = require("../../src/infrastructure/persistence/memory/InMemoryDeliveryRepository");
const { InMemoryEventPublisher } = require("../../src/infrastructure/messaging/InMemoryEventPublisher");
const { ServiceBusDeliveryEventPublisher } = require("../../src/infrastructure/messaging/ServiceBusDeliveryEventPublisher");
const { LogAlertNotifier } = require("../../src/infrastructure/notifications/LogAlertNotifier");
const { ValidationError } = require("../../src/domain/errors");
const { fixedClock, FIXED_NOW, validDelivery } = require("../support/fakes");

const silentLogger = { info() {}, warn() {}, error() {} };

function setup() {
  const repository = new InMemoryDeliveryRepository();
  const eventPublisher = new InMemoryEventPublisher();
  const deps = { eventPublisher, clock: fixedClock };
  return {
    eventPublisher,
    create: new CreateDeliveryUseCase({ deliveryWriter: repository, ...deps }),
    update: new UpdateDeliveryUseCase({ deliveryUpdater: repository, ...deps }),
    remove: new DeleteDeliveryUseCase({ deliveryRemover: repository, ...deps }),
  };
}

test("EDA: criar, alterar e excluir publicam eventos de domínio na ordem", async () => {
  const { create, update, remove, eventPublisher } = setup();
  const created = await create.execute(validDelivery());
  await update.execute(created._id, { status: "Atrasada" });
  await remove.execute(created._id);

  assert.deepEqual(eventPublisher.events.map((e) => e.type),
    [DeliveryEventType.CREATED, DeliveryEventType.UPDATED, DeliveryEventType.DELETED]);
  const [first, second] = eventPublisher.events;
  assert.equal(first.aggregateId, String(created._id));
  assert.equal(first.occurredAt, FIXED_NOW.toISOString());
  assert.deepEqual(second.data.changedFields, ["status", "updatedAt"]);
  assert.equal(first.source, "cloudlog/delivery-service");
});

test("EDA: nenhum evento é publicado quando a operação falha", async () => {
  const { update, remove, eventPublisher } = setup();
  await assert.rejects(update.execute("inexistente", { status: "Entregue" }));
  await assert.rejects(remove.execute("inexistente"));
  assert.equal(eventPublisher.events.length, 0);
});

test("Consumidor gera alerta (RF-05) quando a entrega fica Atrasada", async () => {
  const notifier = new LogAlertNotifier({ logger: silentLogger });
  const consumer = new ProcessDeliveryEventUseCase({ alertNotifier: notifier });
  const { create, update, eventPublisher } = setup();
  const created = await create.execute(validDelivery());
  await update.execute(created._id, { status: "Atrasada" });

  const results = [];
  for (const event of eventPublisher.events) results.push(await consumer.execute(event));
  assert.deepEqual(results.map((r) => r.alerted), [false, true]);
  assert.match(notifier.sent[0].message, /CL-2050 está atrasada/);
});

test("Consumidor rejeita mensagem sem tipo ou agregado", async () => {
  const consumer = new ProcessDeliveryEventUseCase({ alertNotifier: new LogAlertNotifier({ logger: silentLogger }) });
  await assert.rejects(consumer.execute({}), ValidationError);
});

test("Handler da fila aceita mensagem em JSON (string) ou objeto", async () => {
  const consumer = new ProcessDeliveryEventUseCase({ alertNotifier: new LogAlertNotifier({ logger: silentLogger }) });
  const handler = makeProcessDeliveryEventHandler({ processDeliveryEvent: consumer });
  const event = { type: "DeliveryUpdated", aggregateId: "1", data: { status: "Atrasada", code: "CL-9", driver: "Marcos" } };
  assert.equal((await handler(JSON.stringify(event))).alerted, true);
  assert.equal((await handler({ ...event, data: { status: "Entregue" } })).alerted, false);
});

test("Publicador Service Bus envia corpo, subject e propriedades e não derruba a operação em falha", async () => {
  const sent = [];
  const publisher = new ServiceBusDeliveryEventPublisher({ connectionString: "x", queueName: "q", logger: silentLogger });
  publisher.sender = { sendMessages: async (message) => sent.push(message) };
  const event = { type: "DeliveryCreated", version: 1, aggregateId: "1", data: {} };
  await publisher.publish(event);
  assert.equal(sent[0].subject, "DeliveryCreated");
  assert.equal(sent[0].applicationProperties.eventType, "DeliveryCreated");

  publisher.sender = { sendMessages: async () => { throw new Error("rede indisponível"); } };
  await assert.doesNotReject(publisher.publish(event));
});
