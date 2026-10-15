import { Delivery, DeliveryInput, DeliveryRecord } from "../../domain/delivery/Delivery";
import { DeliveryEvents } from "../../domain/delivery/DeliveryEvents";
import type { Clock, DeliveryEventPublisher, DeliveryWriter } from "../../domain/ports";

/** Caso de uso: inserir entrega (RF-03) e publicar DeliveryCreated (EDA). */
export class CreateDeliveryUseCase {
  constructor(private readonly deps: { deliveryWriter: DeliveryWriter; eventPublisher: DeliveryEventPublisher; clock: Clock }) {}

  async execute(input: DeliveryInput): Promise<DeliveryRecord> {
    const now = this.deps.clock.now();
    const delivery = Delivery.create(input, now);
    const stored = await this.deps.deliveryWriter.insert(delivery.toPrimitives());
    await this.deps.eventPublisher.publish(DeliveryEvents.created(stored, now));
    return stored;
  }
}
