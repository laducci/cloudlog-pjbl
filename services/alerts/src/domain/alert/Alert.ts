import { ValidationError } from "../errors";
import { DELAYED_STATUS, DeliveryEventMessage, EVENTS_THAT_CAN_ALERT } from "./DeliveryEventContract";

export const AlertType = { DELAY: "ATRASO", DEVIATION: "DESVIO" } as const;
export type AlertTypeValue = (typeof AlertType)[keyof typeof AlertType];

export interface AlertRecord {
  id: string;
  deliveryId: string;
  deliveryCode: string;
  driver: string;
  type: AlertTypeValue;
  severity: "alta" | "media";
  message: string;
  occurredAt: string;
  createdAt: string;
}

/** Entidade Alerta (RF-05) e a política que decide quando um evento vira alerta. */
export class Alert {
  private constructor(private readonly data: AlertRecord) {}

  static shouldRaiseFor(event: DeliveryEventMessage): boolean {
    return EVENTS_THAT_CAN_ALERT.has(event.type) && event.data?.status === DELAYED_STATUS;
  }

  static fromDelayedDelivery(event: DeliveryEventMessage, id: string, now: Date): Alert {
    if (!event?.type || !event?.aggregateId) throw new ValidationError("Evento de entrega inválido.");
    if (!Alert.shouldRaiseFor(event)) throw new ValidationError("O evento não caracteriza atraso.");
    const code = event.data?.code ?? event.aggregateId;
    const driver = event.data?.driver ?? "não informado";
    return new Alert({
      id,
      deliveryId: event.aggregateId,
      deliveryCode: code,
      driver,
      type: AlertType.DELAY,
      severity: "alta",
      message: `Entrega ${code} está atrasada (motorista: ${driver}).`,
      occurredAt: event.occurredAt ?? now.toISOString(),
      createdAt: now.toISOString(),
    });
  }

  toPrimitives(): AlertRecord {
    return { ...this.data };
  }
}
