import { Delivery, DeliveryInput, DeliveryRecord } from "../../domain/delivery/Delivery";
import { DeliveryEvents } from "../../domain/delivery/DeliveryEvents";
import { NotFoundError } from "../../domain/errors";
import type { Clock, DeliveryEventPublisher, DeliveryUpdater } from "../../domain/ports";

/** Caso de uso: alterar parcialmente uma entrega (RF-03) e publicar DeliveryUpdated. */
export class UpdateDeliveryUseCase {
  constructor(private readonly deps: { deliveryUpdater: DeliveryUpdater; eventPublisher: DeliveryEventPublisher; clock: Clock }) {}

  async execute(id: string, input: DeliveryInput): Promise<DeliveryRecord> {
    const now = this.deps.clock.now();
    const changes = Delivery.validateChanges(input, now);
    const updated = await this.deps.deliveryUpdater.update(id, changes);
    if (!updated) throw new NotFoundError();
    await this.deps.eventPublisher.publish(DeliveryEvents.updated(updated, changes, now));
    return updated;
  }
}
