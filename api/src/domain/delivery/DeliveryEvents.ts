import type { DeliveryChanges, DeliveryRecord } from "./Delivery";

/** Eventos de domínio (EDA): fatos imutáveis publicados após a persistência. */
export const DeliveryEventType = {
  CREATED: "DeliveryCreated",
  UPDATED: "DeliveryUpdated",
  DELETED: "DeliveryDeleted",
} as const;

export type DeliveryEventTypeValue = (typeof DeliveryEventType)[keyof typeof DeliveryEventType];

export interface DeliveryEvent {
  readonly type: DeliveryEventTypeValue;
  readonly version: number;
  readonly source: string;
  readonly aggregateId: string;
  readonly occurredAt: string;
  readonly data: Record<string, unknown>;
}

export const EVENT_VERSION = 1;
const SOURCE = "cloudlog/delivery-service";

function buildEvent(type: DeliveryEventTypeValue, aggregateId: unknown, data: unknown, occurredAt: Date): DeliveryEvent {
  return Object.freeze({
    type,
    version: EVENT_VERSION,
    source: SOURCE,
    aggregateId: String(aggregateId),
    occurredAt: occurredAt.toISOString(),
    data: JSON.parse(JSON.stringify(data)) as Record<string, unknown>,
  });
}

export const DeliveryEvents = {
  created: (delivery: DeliveryRecord, now: Date) => buildEvent(DeliveryEventType.CREATED, delivery._id, delivery, now),
  updated: (delivery: DeliveryRecord, changes: DeliveryChanges, now: Date) =>
    buildEvent(DeliveryEventType.UPDATED, delivery._id, { ...delivery, changedFields: Object.keys(changes) }, now),
  deleted: (id: string, now: Date) => buildEvent(DeliveryEventType.DELETED, id, { id }, now),
};
