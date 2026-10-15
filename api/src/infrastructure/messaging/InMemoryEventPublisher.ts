import type { DeliveryEvent } from "../../domain/delivery/DeliveryEvents";
import type { DeliveryEventPublisher } from "../../domain/ports";

export class InMemoryEventPublisher implements DeliveryEventPublisher {
  readonly events: DeliveryEvent[] = [];

  async publish(event: DeliveryEvent): Promise<void> {
    this.events.push(event);
  }
}
