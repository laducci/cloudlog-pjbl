import type { DeliveryEvent } from "../../domain/delivery/DeliveryEvents";
import type { DeliveryEventPublisher } from "../../domain/ports";

/** Usado quando o Service Bus não está configurado: apenas registra o evento. */
export class LoggingEventPublisher implements DeliveryEventPublisher {
  constructor(private readonly logger: Pick<Console, "info"> = console) {}

  async publish(event: DeliveryEvent): Promise<void> {
    this.logger.info(`[EventPublisher] ${event.type} ${event.aggregateId}`);
  }
}
