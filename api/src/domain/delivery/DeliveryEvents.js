/**
 * Eventos de domínio da Entrega (Arquitetura Orientada a Eventos — EDA).
 * São fatos imutáveis publicados após a persistência; consumidores
 * (alertas, BI, rastreamento) reagem sem acoplamento com o CRUD.
 */
const DeliveryEventType = Object.freeze({
  CREATED: "DeliveryCreated",
  UPDATED: "DeliveryUpdated",
  DELETED: "DeliveryDeleted",
});

const EVENT_VERSION = 1;
const SOURCE = "cloudlog/delivery-service";

function buildEvent(type, aggregateId, data, occurredAt) {
  return Object.freeze({
    type,
    version: EVENT_VERSION,
    source: SOURCE,
    aggregateId: String(aggregateId),
    occurredAt: occurredAt.toISOString(),
    data: JSON.parse(JSON.stringify(data)), // payload serializável (ids e datas como texto)
  });
}

const DeliveryEvents = {
  created: (delivery, now) => buildEvent(DeliveryEventType.CREATED, delivery._id, delivery, now),
  updated: (delivery, changes, now) =>
    buildEvent(DeliveryEventType.UPDATED, delivery._id, { ...delivery, changedFields: Object.keys(changes) }, now),
  deleted: (id, now) => buildEvent(DeliveryEventType.DELETED, id, { id: String(id) }, now),
};

module.exports = { DeliveryEventType, DeliveryEvents, EVENT_VERSION };
