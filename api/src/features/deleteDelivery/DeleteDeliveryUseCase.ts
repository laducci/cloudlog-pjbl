import { DeliveryEvents } from "../../domain/delivery/DeliveryEvents";
import { NotFoundError } from "../../domain/errors";
import type { Clock, DeliveryEventPublisher, DeliveryRemover } from "../../domain/ports";

/** Caso de uso: excluir entrega (RF-03) e publicar DeliveryDeleted. */
export class DeleteDeliveryUseCase {
  constructor(private readonly deps: { deliveryRemover: DeliveryRemover; eventPublisher: DeliveryEventPublisher; clock: Clock }) {}

  async execute(id: string): Promise<{ deleted: true; id: string }> {
    const removed = await this.deps.deliveryRemover.remove(id);
    if (!removed) throw new NotFoundError();
    await this.deps.eventPublisher.publish(DeliveryEvents.deleted(id, this.deps.clock.now()));
    return { deleted: true, id };
  }
}
